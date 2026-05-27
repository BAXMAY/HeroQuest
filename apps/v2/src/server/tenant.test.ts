import { describe, expect, it } from "vitest";
import { DEFAULT_TENANT_ID, resolveTenantId } from "./tenant";

describe("resolveTenantId", () => {
  it("returns the default tenant id today", () => {
    expect(resolveTenantId()).toBe(DEFAULT_TENANT_ID);
    expect(DEFAULT_TENANT_ID).toBe("default");
  });

  it("ignores the request argument (single-tenant phase)", () => {
    const fakeReq = new Request("https://acme.example/dashboard");
    expect(resolveTenantId(fakeReq)).toBe(DEFAULT_TENANT_ID);
  });
});
