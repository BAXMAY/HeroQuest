import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { schema } from "@heroquest/db";
import { db } from "@/server/db";
import { getEnv } from "@/lib/env";
import { getSessionContext } from "@/server/middleware";

/**
 * Auth-gated R2 proxy for quest photos.
 *
 * - Owner of the quest, or an admin, can read.
 * - Stream the R2 object body straight through with a private cache header
 *   so the browser caches per-user but no shared cache can.
 * - Reject anything outside the `quests/` prefix.
 */
export const Route = createFileRoute("/api/r2/$key")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const ctx = await getSessionContext(request);
        if (!ctx.user || !ctx.profile) return new Response("Unauthorized", { status: 401 });

        const key = (params as { key: string }).key;
        if (!key.startsWith("quests/")) {
          return new Response("Not found", { status: 404 });
        }

        // Key format: quests/{ownerId}/{questId}/{nanoid}.{ext}
        const parts = key.split("/");
        const ownerId = parts[1];
        if (!ownerId) return new Response("Bad key", { status: 400 });

        const isOwner = ownerId === ctx.user.id;
        const isAdmin = ctx.profile.role === "admin";
        let isParentOfOwner = false;
        if (!isOwner && !isAdmin && ctx.profile.role === "parent" && ctx.profile.familyId) {
          const owner = await db()
            .select({ familyId: schema.userProfile.familyId })
            .from(schema.userProfile)
            .where(eq(schema.userProfile.userId, ownerId))
            .limit(1)
            .then((r) => r[0]);
          isParentOfOwner = owner?.familyId === ctx.profile.familyId;
        }

        if (!isOwner && !isAdmin && !isParentOfOwner) {
          return new Response("Forbidden", { status: 403 });
        }

        const env = getEnv();
        const obj = await env.QUEST_PHOTOS.get(key);
        if (!obj) return new Response("Not found", { status: 404 });

        const headers = new Headers();
        obj.writeHttpMetadata(headers);
        headers.set("etag", obj.httpEtag);
        headers.set("cache-control", "private, max-age=86400");
        return new Response(obj.body, { headers });
      },
    },
  },
});
