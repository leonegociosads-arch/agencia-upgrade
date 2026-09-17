import { describe, expect, it } from "vitest";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, isValidLeadStatus } from "./leadStatus";

describe("leadStatus", () => {
  it("tem exatamente os 6 status esperados, sem 'qualified'", () => {
    expect(LEAD_STATUSES).toEqual(["new", "contacted", "meeting", "proposal", "won", "lost"]);
  });

  it("cada status tem um label em português", () => {
    for (const status of LEAD_STATUSES) {
      expect(LEAD_STATUS_LABELS[status]).toBeTruthy();
    }
  });

  it("isValidLeadStatus aceita só os status conhecidos", () => {
    expect(isValidLeadStatus("new")).toBe(true);
    expect(isValidLeadStatus("won")).toBe(true);
    expect(isValidLeadStatus("qualified")).toBe(false);
    expect(isValidLeadStatus("")).toBe(false);
    expect(isValidLeadStatus("NEW")).toBe(false);
  });
});
