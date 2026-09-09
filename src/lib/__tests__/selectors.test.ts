import { describe, expect, it } from "vitest";
import { accountBalance, signedAmount, totalBalance } from "../selectors";
import type { Entry, LedgerData } from "../types";
import { defaultData } from "../storage";

function makeData(entries: Entry[]): LedgerData {
  return { ...defaultData(), entries };
}

describe("signedAmount", () => {
  it("is positive for income, negative for expense/investment, zero for transfer", () => {
    expect(signedAmount({ kind: "income", amount: 100 } as Entry)).toBe(100);
    expect(signedAmount({ kind: "expense", amount: 100 } as Entry)).toBe(-100);
    expect(signedAmount({ kind: "investment", amount: 100 } as Entry)).toBe(
      -100,
    );
    expect(signedAmount({ kind: "transfer", amount: 100 } as Entry)).toBe(0);
  });
});

describe("accountBalance / totalBalance", () => {
  it("only counts posted entries", () => {
    const data = makeData([
      {
        id: "1",
        kind: "income",
        amount: 500,
        date: "2026-01-01",
        status: "posted",
        accountId: "bank",
      },
      {
        id: "2",
        kind: "expense",
        amount: 200,
        date: "2026-01-02",
        status: "pending",
        accountId: "bank",
      },
    ]);
    expect(accountBalance(data, "bank")).toBe(500);
  });

  it("moves money between accounts on transfer", () => {
    const data = makeData([
      {
        id: "1",
        kind: "income",
        amount: 1000,
        date: "2026-01-01",
        status: "posted",
        accountId: "bank",
      },
      {
        id: "2",
        kind: "transfer",
        amount: 300,
        date: "2026-01-02",
        status: "posted",
        fromAccount: "bank",
        toAccount: "cash",
      },
    ]);
    expect(accountBalance(data, "bank")).toBe(700);
    expect(accountBalance(data, "cash")).toBe(300);
    expect(totalBalance(data)).toBe(1000);
  });
});
