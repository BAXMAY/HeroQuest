import { nanoid } from "nanoid";
import { presignS3Url } from "./s3-presign";

/**
 * R2 access patterns:
 *
 * - Uploads: client requests a presigned PUT URL and uploads directly to R2.
 *   The Worker never proxies the bytes — saves Worker CPU and bandwidth.
 * - Reads: served via an auth-gated Worker route that streams from R2 after
 *   verifying the caller is the photo owner or an admin. We don't make the
 *   bucket public because the photos contain children.
 *
 * Uses the hand-rolled SigV4 signer in ./s3-presign rather than the AWS SDK
 * (saved ~700 KB off the Worker bundle and removed a Node-y dependency from
 * the workerd build).
 */

const UPLOAD_TTL_SECONDS = 60 * 5; // 5 min
const READ_TTL_SECONDS = 60 * 5; // 5 min (used by AI image fetches)

const QUEST_BUCKET = "heroquest-quest-photos";

export function makeQuestPhotoKey(userId: string, questId: string, ext = "jpg"): string {
  return `quests/${userId}/${questId}/${nanoid(12)}.${ext}`;
}

export type PresignedUpload = {
  uploadUrl: string;
  key: string;
  expiresAt: number;
};

export async function presignQuestUpload(
  env: CloudflareEnv,
  userId: string,
  questId: string,
  contentType: string,
): Promise<PresignedUpload> {
  const ext = contentType.split("/")[1]?.toLowerCase() ?? "jpg";
  const key = makeQuestPhotoKey(userId, questId, ext);
  const uploadUrl = await presignS3Url({
    method: "PUT",
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucket: QUEST_BUCKET,
    key,
    contentType,
    expiresInSeconds: UPLOAD_TTL_SECONDS,
  });
  return {
    uploadUrl,
    key,
    expiresAt: Date.now() + UPLOAD_TTL_SECONDS * 1000,
  };
}

/** Used right before sending a quest photo to Claude for evaluation. */
export async function presignQuestRead(env: CloudflareEnv, key: string): Promise<string> {
  return presignS3Url({
    method: "GET",
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucket: QUEST_BUCKET,
    key,
    expiresInSeconds: READ_TTL_SECONDS,
  });
}

/**
 * Generic presigned-PUT for any R2 bucket (used by brand-asset uploads).
 * Key shape: `{keyPrefix}-{nanoid}.{ext}` so callers control the prefix
 * (e.g. `tenants/default/logo`) and we tack on a collision-safe suffix.
 */
export async function presignR2Upload(args: {
  bucket: string;
  env: CloudflareEnv;
  keyPrefix: string;
  contentType: string;
}): Promise<PresignedUpload> {
  const { bucket, env, keyPrefix, contentType } = args;
  const subtype = contentType.split("/")[1]?.toLowerCase() ?? "bin";
  const ext = subtype === "svg+xml" ? "svg" : subtype === "jpeg" ? "jpg" : subtype;
  const key = `${keyPrefix}-${nanoid(10)}.${ext}`;
  const uploadUrl = await presignS3Url({
    method: "PUT",
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucket,
    key,
    contentType,
    expiresInSeconds: UPLOAD_TTL_SECONDS,
  });
  return { uploadUrl, key, expiresAt: Date.now() + UPLOAD_TTL_SECONDS * 1000 };
}
