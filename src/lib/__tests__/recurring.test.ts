import { describe, expect, it, vi } from "vitest";
import { reconcileRecurring } from "../recurring";
import { defaultData } from "../storage";
import type { LedgerData } from "../types";

describe("reconcileRecurring", () => {
  it("auto-posts a schedule only once its due date has passed", () => {
    vi.setSystemTime(new Date("2026-03-15T12:00:00Z"));
    const data: LedgerData = {
      ...defaultData(),
      recurring: [
        {
          id: "sch1",
          kind: "expense",
          title: "Rent",
          amount: 1000,
          day: 10,
          startMonth: "2026-03",
          accountId: "bank",
          manual: false,
        },
      ],
    };
    reconcileRecurring(data);
    expect(data.entries).toHaveLength(1);
    expect(data.entries[0].status).toBe("posted");
    expect(data.entries[0].date).toBe("2026-03-10");
    vi.useRealTimers();
  });

  it("does not materialize an auto-posted schedule before its due date", () => {
    vi.setSystemTime(new Date("2026-03-05T12:00:00Z"));
    const data: LedgerData = {
      ...defaultData(),
      recurring: [
        {
          id: "sch1",
          kind: "expense",
          title: "Rent",
          amount: 1000,
          day: 10,
          startMonth: "2026-03",
          accountId: "bank",
          manual: false,
        },
      ],
    };
    reconcileRecurring(data);
    expect(data.entries).toHaveLength(0);
    vi.useRealTimers();
  });

  it("materializes manual schedules as soon as their month starts", () => {
    vi.setSystemTime(new Date("2026-03-01T12:00:00Z"));
    const data: LedgerData = {
      ...defaultData(),
      recurring: [
        {
          id: "sch1",
          kind: "investment",
          title: "SIP",
          amount: 5000,
          day: 28,
          startMonth: "2026-03",
          accountId: "bank",
          manual: true,
        },
      ],
    };
    reconcileRecurring(data);
    expect(data.entries).toHaveLength(1);
    expect(data.entries[0].status).toBe("pending");
    vi.useRealTimers();
  });

  it("is idempotent — running twice does not duplicate entries", () => {
    vi.setSystemTime(new Date("2026-03-15T12:00:00Z"));
    const data: LedgerData = {
      ...defaultData(),
      recurring: [
        {
          id: "sch1",
          kind: "expense",
          title: "Rent",
          amount: 1000,
          day: 10,
          startMonth: "2026-01",
          accountId: "bank",
          manual: false,
        },
      ],
    };
    reconcileRecurring(data);
    reconcileRecurring(data);
    expect(data.entries).toHaveLength(3);
    vi.useRealTimers();
  });
});
