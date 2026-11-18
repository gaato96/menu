import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({}) }));

import { mapStatus } from "@/lib/payments/mercadopago";

describe("mapStatus", () => {
  it("only approved counts as paid", () => {
    expect(mapStatus("approved")).toBe("paid");
    expect(mapStatus("in_process")).toBe("pending");
    expect(mapStatus("pending")).toBe("pending");
    expect(mapStatus("authorized")).toBe("pending");
  });

  it("treats rejections and reversals as failed", () => {
    for (const s of ["rejected", "cancelled", "refunded", "charged_back"]) expect(mapStatus(s)).toBe("failed");
  });
});
