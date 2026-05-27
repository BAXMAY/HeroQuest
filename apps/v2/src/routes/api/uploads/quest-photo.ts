import { createFileRoute } from "@tanstack/react-router";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getEnv } from "@/lib/env";
import { presignQuestUpload } from "@/server/r2";
import { getSessionContext } from "@/server/middleware";

const requestSchema = z.object({
  contentType: z
    .string()
    .regex(/^image\/(jpeg|png|webp)$/, "Only image/jpeg, image/png, or image/webp"),
});

/**
 * Returns a presigned PUT URL for the client to upload a quest photo
 * directly to R2. The server pre-allocates the questId so the client
 * receives a stable key it will later submit via `submitQuest`.
 */
export const Route = createFileRoute("/api/uploads/quest-photo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ctx = await getSessionContext(request);
        if (!ctx.user) return new Response("Unauthorized", { status: 401 });

        const body = (await request.json().catch(() => null)) ?? {};
        const parsed = requestSchema.safeParse(body);
        if (!parsed.success) {
          return new Response(JSON.stringify({ error: parsed.error.message }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const questId = nanoid();
        const { uploadUrl, key, expiresAt } = await presignQuestUpload(
          getEnv(),
          ctx.user.id,
          questId,
          parsed.data.contentType,
        );

        return new Response(JSON.stringify({ uploadUrl, key, questId, expiresAt }), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
