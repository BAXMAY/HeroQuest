import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { schema } from "@heroquest/db";
import { db } from "@/server/db";
import { getSessionContext } from "@/server/middleware";
import { getRequest } from "@tanstack/react-start/server";

const LIST_LIMIT = 30;

export const listMyNotifications = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getSessionContext(getRequest());
  if (!ctx.user) throw new Error("UNAUTHORIZED");
  return db()
    .select()
    .from(schema.notification)
    .where(eq(schema.notification.userId, ctx.user.id))
    .orderBy(desc(schema.notification.createdAt))
    .limit(LIST_LIMIT);
});

export const markRead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ ids: z.array(z.string()).min(1).max(50) }).parse(data),
  )
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user) throw new Error("UNAUTHORIZED");
    await db()
      .update(schema.notification)
      .set({ isRead: true })
      .where(
        and(
          eq(schema.notification.userId, ctx.user.id),
          inArray(schema.notification.id, data.ids),
        ),
      );
    return { ok: true };
  });
