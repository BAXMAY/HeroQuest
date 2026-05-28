import { describe, expect, it } from "vitest";
import { presignS3Url } from "./s3-presign";

/**
 * Property-based smoke tests. We don't try to reproduce a byte-perfect AWS
 * test vector here (those use the public S3 hostname, not the R2 endpoint);
 * instead we assert the shape, header presence, and stability invariants
 * that matter for our usage.
 */

const baseArgs = {
  accountId: "1234567890abcdef",
  accessKeyId: "AKIAIOSFODNN7EXAMPLE",
  secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  bucket: "test-bucket",
  key: "photos/u1/q1/abc.jpg",
  expiresInSeconds: 300,
  now: new Date("2026-05-28T14:30:00Z"),
} as const;

describe("presignS3Url", () => {
  it("builds an https URL against the R2 endpoint", async () => {
    const url = await presignS3Url({ method: "GET", ...baseArgs });
    expect(url).toMatch(/^https:\/\/1234567890abcdef\.r2\.cloudflarestorage\.com\//);
    expect(url).toContain("/test-bucket/photos/u1/q1/abc.jpg");
  });

  it("includes the 5 required SigV4 query params + signature", async () => {
    const url = await presignS3Url({ method: "PUT", contentType: "image/jpeg", ...baseArgs });
    const u = new URL(url);
    expect(u.searchParams.get("X-Amz-Algorithm")).toBe("AWS4-HMAC-SHA256");
    expect(u.searchParams.get("X-Amz-Credential")).toContain("AKIAIOSFODNN7EXAMPLE/");
    expect(u.searchParams.get("X-Amz-Date")).toMatch(/^\d{8}T\d{6}Z$/);
    expect(u.searchParams.get("X-Amz-Expires")).toBe("300");
    expect(u.searchParams.get("X-Amz-SignedHeaders")).toBe("content-type;host");
    expect(u.searchParams.get("X-Amz-Signature")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("uses host-only SignedHeaders when no contentType is given", async () => {
    const url = await presignS3Url({ method: "GET", ...baseArgs });
    expect(new URL(url).searchParams.get("X-Amz-SignedHeaders")).toBe("host");
  });

  it("is deterministic for the same `now`", async () => {
    const a = await presignS3Url({ method: "PUT", contentType: "image/png", ...baseArgs });
    const b = await presignS3Url({ method: "PUT", contentType: "image/png", ...baseArgs });
    expect(a).toBe(b);
  });

  it("produces different signatures when the content-type changes", async () => {
    const jpeg = await presignS3Url({ method: "PUT", contentType: "image/jpeg", ...baseArgs });
    const png = await presignS3Url({ method: "PUT", contentType: "image/png", ...baseArgs });
    expect(jpeg).not.toBe(png);
  });

  it("produces different signatures when the key changes", async () => {
    const a = await presignS3Url({ method: "PUT", contentType: "image/jpeg", ...baseArgs });
    const b = await presignS3Url({
      method: "PUT",
      contentType: "image/jpeg",
      ...baseArgs,
      key: "photos/u1/q1/different.jpg",
    });
    expect(a).not.toBe(b);
  });

  it("encodes path segments per RFC3986 (space, plus, parens)", async () => {
    const url = await presignS3Url({
      method: "GET",
      ...baseArgs,
      key: "weird (name)/file with spaces+plus.jpg",
    });
    expect(url).toContain("weird%20%28name%29");
    expect(url).toContain("file%20with%20spaces%2Bplus.jpg");
  });

  it("keeps `/` as path separator, not encoded", async () => {
    const url = await presignS3Url({ method: "GET", ...baseArgs });
    // The bucket+key path should contain literal slashes between segments
    const path = new URL(url).pathname;
    expect(path.split("/").length).toBeGreaterThan(4);
  });

  it("expires param is honored", async () => {
    const url = await presignS3Url({
      method: "GET",
      ...baseArgs,
      expiresInSeconds: 3600,
    });
    expect(new URL(url).searchParams.get("X-Amz-Expires")).toBe("3600");
  });
});
