import { createFileRoute } from "@tanstack/react-router";
import { nanoid } from "nanoid";
import { generateDailyTrivia } from "@heroquest/ai";
import { schema } from "@heroquest/db";
import { db } from "@/server/db";
import { getEnv } from "@/lib/env";
import { localDateString } from "@/lib/dates";

/**
 * Cron-triggered (wrangler.jsonc `crons: ["5 17 * * *"]`, 00:05 UTC+7).
 * Generates 5 trivia questions per locale via Claude, inserts them into
 * D1 with `date_pool = today`, warms KV with the first question id per
 * locale for sub-ms lookup by the runtime.
 *
 * Also reachable via GET with a header `x-cron-secret` matching the
 * BETTER_AUTH_SECRET prefix — that lets us manually trigger from CLI
 * during dev.
 */
export const Route = createFileRoute("/api/cron/generate-trivia")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const env = getEnv();
        const secret = request.headers.get("x-cron-secret") ?? "";
        if (secret !== (env.BETTER_AUTH_SECRET ?? "").slice(0, 16)) {
          return new Response("Forbidden", { status: 403 });
        }
        await runGeneration(env);
        return new Response("ok", { status: 200 });
      },
    },
  },
});

export async function runGeneration(env: CloudflareEnv): Promise<void> {
  const today = localDateString(new Date(), "th");
  const database = db();

  for (const locale of ["en", "th"] as const) {
    const items = await generateDailyTrivia(env, { locale, count: 5 });
    const inserted: string[] = [];
    for (const item of items) {
      const id = nanoid();
      try {
        await database.insert(schema.triviaQuestion).values({
          id,
          locale,
          datePool: today,
          question: item.question,
          options: item.options,
          correctIndex: item.correctIndex,
          explanation: item.explanation,
          difficulty: item.difficulty,
          topic: item.topic,
        });
        inserted.push(id);
      } catch {
        /* duplicate safety — keep going */
      }
    }
    if (inserted[0]) {
      await env.TRIVIA_KV.put(`trivia:today:${locale}`, inserted[0], {
        expirationTtl: 60 * 60 * 36,
      });
    }
  }
}
