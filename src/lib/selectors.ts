import { today } from "./format";
import type { Entry, LedgerData } from "./types";

export const isPosted = (e: Entry) => e.status === "posted";

export const entryTitle = (e: Entry) => e.title || e.description || "Untitled";

export const signedAmount = (e: Entry): number =>
  e.kind === "income" ? e.amount : e.kind === "transfer" ? 0 : -e.amount;

export const accountName = (data: LedgerData, accountId: string) =>
  data.accounts.find((a) => a.id === accountId)?.name ?? "Unknown";

export function accountBalance(data: LedgerData, accountId: string): number {
  return data.entries.filter(isPosted).reduce((total, e) => {
    if (e.kind === "transfer") {
      if (e.fromAccount === accountId) return total - e.amount;
      if (e.toAccount === accountId) return total + e.amount;
      return total;
    }
    return e.accountId === accountId ? total + signedAmount(e) : total;
  }, 0);
}

export function totalBalance(data: LedgerData): number {
  return data.accounts.reduce((n, a) => n + accountBalance(data, a.id), 0);
}

// Months that have at least one entry, plus the current month, newest first.
export function monthsWithEntries(data: LedgerData): string[] {
  const months = new Set<string>([today().slice(0, 7)]);
  data.entries.forEach((e) => {
    if (e.date) months.add(e.date.slice(0, 7));
  });
  return [...months].sort().reverse();
}

// periodValue is formatted "month:YYYY-MM".
export function inSelectedPeriod(entry: Entry, periodValue: string): boolean {
  const selected = periodValue.split(":")[1];
  return !!entry.date && entry.date.startsWith(selected);
}
