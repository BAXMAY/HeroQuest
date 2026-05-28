import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

/**
 * R2 access patterns:
 *
 * - Uploads: client requests a presigned PUT URL and uploads directly to R2.
 *   The Worker never proxies the bytes — saves Worker CPU and bandwidth.
 * - Reads: served via an auth-gated Worker route that streams from R2 after
 *   verifying the caller is the photo owner or an admin. We don't make the
 *   bucket public because the photos contain children.
 */

const UPLOAD_TTL_SECONDS = 60 * 5; // 5 min
const READ_TTL_SECONDS = 60 * 5; // 5 min (used by AI image fetches)

function buildR2S3(env: CloudflareEnv): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}

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
  const s3 = buildR2S3(env);
  const ext = contentType.split("/")[1]?.toLowerCase() ?? "jpg";
  const key = makeQuestPhotoKey(userId, questId, ext);
  const cmd = new PutObjectCommand({
    Bucket: "heroquest-quest-photos",
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: UPLOAD_TTL_SECONDS });
  return {
    uploadUrl,
    key,
    expiresAt: Date.now() + UPLOAD_TTL_SECONDS * 1000,
  };
}

/** Used right before sending a quest photo to Claude for evaluation. */
export async function presignQuestRead(
  env: CloudflareEnv,
  key: string,
): Promise<string> {
  const s3 = buildR2S3(env);
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: "heroquest-quest-photos", Key: key }), {
    expiresIn: READ_TTL_SECONDS,
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
  const s3 = buildR2S3(env);
  const subtype = contentType.split("/")[1]?.toLowerCase() ?? "bin";
  const ext = subtype === "svg+xml" ? "svg" : subtype === "jpeg" ? "jpg" : subtype;
  const key = `${keyPrefix}-${nanoid(10)}.${ext}`;
  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
    { expiresIn: UPLOAD_TTL_SECONDS },
  );
  return { uploadUrl, key, expiresAt: Date.now() + UPLOAD_TTL_SECONDS * 1000 };
}
