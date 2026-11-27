import { describe, it, expect } from "vitest";
import { truncateMiddle } from "@/lib/truncate-middle";
describe("truncateMiddle", () => {
  it("keeps the extension visible", () => {
    const r = truncateMiddle("rapport-financier-annuel-2026-version-finale.pdf", 24);
    expect(r.endsWith(".pdf")).toBe(true);
    expect(r.length).toBe(24);
  });
  it("leaves short names unchanged", () => expect(truncateMiddle("a.png")).toBe("a.png"));
});
