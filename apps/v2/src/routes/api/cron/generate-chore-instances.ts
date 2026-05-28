import { createFileRoute } from "@tanstack/react-router";
import { and, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { isChoreDueOn, schema } from "@heroquest/db";
import { db } from "@/server/db";
import { getEnv } from "@/lib/env";
import { localDateString } from "@/lib/dates";

/**
 * Cron-triggered at 00:10 UTC+7 (wrangler `crons: ["10 17 * * *"]`).
 * Generates today's chore_instance rows for every active recurring_chore
 * whose schedule matches today. Per-family generation; idempotent via the
 * (recurring_chore_id, user_id, due_date) UNIQUE index.
 */
export const Route = createFileRoute("/api/cron/generate-chore-instances")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const env = getEnv();
        const secret = request.headers.get("x-cron-secret") ?? "";
        if (secret !== (env.BETTER_AUTH_SECRET ?? "").slice(0, 16)) {
          return new Response("Forbidden", { status: 403 });
        }
        const summary = await runChoreGeneration();
        return new Response(JSON.stringify(summary), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});

export async function runChoreGeneration(): Promise<{ inserted: number }> {
  const database = db();
  const today = localDateString(new Date(), "th");
  const todayDate = new Date(`${today}T12:00:00Z`); // noon avoids tz day-bleed

  const chores = await database
    .select()
    .from(schema.recurringChore)
    .where(eq(schema.recurringChore.active, true));

  const dueChores = chores.filter((c) =>
    isChoreDueOn({ frequency: c.frequency, daysOfWeek: c.daysOfWeek, active: c.active }, todayDate),
  );

  // For each chore: if assignedUserId is set, create one instance for that
  // child. If null, create one per child in the family (familyRole='child').
  let inserted = 0;
  for (const chore of dueChores) {
    let targetUserIds: string[] = [];
    if (chore.assignedUserId) {
      targetUserIds = [chore.assignedUserId];
    } else {
      const kids = await database
        .select({ userId: schema.userProfile.userId })
        .from(schema.userProfile)
        .where(
          and(
            eq(schema.userProfile.familyId, chore.familyId),
            eq(schema.userProfile.familyRole, "child"),
          ),
        );
      targetUserIds = kids.map((k) => k.userId);
    }

    for (const userId of targetUserIds) {
      try {
        await database.insert(schema.choreInstance).values({
          id: nanoid(),
          recurringChoreId: chore.id,
          userId,
          dueDate: today,
          status: "open",
          createdAt: new Date(),
        });
        inserted++;
      } catch {
        // UNIQUE conflict — already exists for today. Idempotent.
      }
    }
  }

  void inArray;
  return { inserted };
}
