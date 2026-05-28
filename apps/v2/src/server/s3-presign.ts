/**
 * Minimal AWS Signature V4 query-string presigner for Cloudflare R2.
 *
 * Implements the subset we need: PUT and GET presigned URLs against the
 * R2 S3-compatible endpoint, with `UNSIGNED-PAYLOAD`. No streaming, no
 * chunked uploads, no STS.
 *
 * Uses only the Web Crypto API — works in Workers, browsers, and Node 20+.
 *
 * Reference: https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-query-string-auth.html
 */

const ALGORITHM = "AWS4-HMAC-SHA256";
const PAYLOAD = "UNSIGNED-PAYLOAD";

export type PresignArgs = {
  method: "GET" | "PUT" | "HEAD" | "DELETE";
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  key: string;
  /** Required for PUT presigns — bound into the canonical headers. */
  contentType?: string;
  /** Seconds until the URL expires (max 7 days per S3 spec). */
  expiresInSeconds: number;
  /** Override clock for deterministic tests. Defaults to `new Date()`. */
  now?: Date;
  /** Service region — R2 always uses "auto". */
  region?: string;
};

export async function presignS3Url(args: PresignArgs): Promise<string> {
  const {
    method,
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    key,
    contentType,
    expiresInSeconds,
    now = new Date(),
    region = "auto",
  } = args;

  const host = `${accountId}.r2.cloudflarestorage.com`;
  const service = "s3";

  // ISO8601 basic format e.g. 20260528T141500Z
  const amzDate = now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const credential = `${accessKeyId}/${credentialScope}`;

  // Canonical URI — path-encode each segment (/ stays as separator)
  const encodedKey = key.split("/").map(rfc3986).join("/");
  const canonicalUri = `/${bucket}/${encodedKey}`;

  // Headers we sign. For PUT we include content-type so callers can't
  // be tricked into uploading a different MIME than they presigned for.
  const signedHeadersList = contentType ? ["content-type", "host"] : ["host"];
  const signedHeaders = signedHeadersList.join(";");
  const canonicalHeaders = contentType
    ? `content-type:${contentType}\nhost:${host}\n`
    : `host:${host}\n`;

  // Query — alphabetical, RFC3986 encoded.
  const queryEntries: [string, string][] = [
    ["X-Amz-Algorithm", ALGORITHM],
    ["X-Amz-Credential", credential],
    ["X-Amz-Date", amzDate],
    ["X-Amz-Expires", String(expiresInSeconds)],
    ["X-Amz-SignedHeaders", signedHeaders],
  ];
  queryEntries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const canonicalQuery = queryEntries
    .map(([k, v]) => `${rfc3986(k)}=${rfc3986(v)}`)
    .join("&");

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    PAYLOAD,
  ].join("\n");

  const canonicalRequestHash = await sha256Hex(canonicalRequest);
  const stringToSign = [ALGORITHM, amzDate, credentialScope, canonicalRequestHash].join("\n");

  const signingKey = await deriveSigningKey(secretAccessKey, dateStamp, region, service);
  const signature = toHex(await hmac(signingKey, stringToSign));

  return `https://${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

// ---------- crypto helpers ----------

async function hmac(key: ArrayBuffer | Uint8Array | string, message: string): Promise<ArrayBuffer> {
  const keyBytes =
    typeof key === "string"
      ? new TextEncoder().encode(key)
      : key instanceof Uint8Array
        ? key
        : new Uint8Array(key);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
}

async function sha256Hex(message: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(message));
  return toHex(hash);
}

function toHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i]!.toString(16).padStart(2, "0");
  }
  return out;
}

async function deriveSigningKey(
  secret: string,
  date: string,
  region: string,
  service: string,
): Promise<ArrayBuffer> {
  const kDate = await hmac(`AWS4${secret}`, date);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

/**
 * RFC 3986 percent-encoding — encodeURIComponent leaves `!*'()` alone but
 * S3 wants them encoded. Also explicitly preserve the unreserved set.
 */
function rfc3986(input: string): string {
  return encodeURIComponent(input).replace(
    /[!'()*]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase(),
  );
}
