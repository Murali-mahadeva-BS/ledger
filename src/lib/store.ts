import { signal } from "@preact/signals";
import { makeId } from "./id";
import { entryTitle } from "./selectors";
import { reconcileRecurring } from "./recurring";
import { loadData, saveData } from "./storage";
import type {
  Account,
  AccountType,
  Entry,
  EntryKind,
  LedgerData,
  LendBorrowRecord,
} from "./types";

export const data = signal<LedgerData>(loadData());

function persist() {
  saveData(data.value);
}

// Mutates the current data object in place, then reassigns to trigger signal
// subscribers and persist to storage. Validate inputs before calling this so
// a thrown error never leaves a partial mutation applied.
function mutate(fn: (d: LedgerData) => void) {
  fn(data.value);
  data.value = { ...data.value };
  persist();
}

if (reconcileRecurring(data.value)) {
  persist();
}

// --- Entries (income / expense / investment) ---

export interface OneTimeEntryInput {
  kind: Exclude<EntryKind, "transfer">;
  title: string;
  amount: number;
  date: string;
  accountId: string;
  category?: string;
  note?: string;
  manual: boolean;
}

export function addOneTimeEntry(input: OneTimeEntryInput) {
  mutate((d) => {
    d.entries.push({
      id: makeId(),
      ...input,
      status: input.manual ? "pending" : "posted",
    });
  });
}

export function updateOneTimeEntry(entryId: string, input: OneTimeEntryInput) {
  mutate((d) => {
    const idx = d.entries.findIndex((e) => e.id === entryId);
    if (idx > -1) d.entries[idx] = { ...d.entries[idx], ...input };
  });
}

export interface RecurringEntryInput {
  kind: Exclude<EntryKind, "transfer">;
  title: string;
  amount: number;
  day: number;
  startMonth: string;
  accountId: string;
  category?: string;
  note?: string;
  manual: boolean;
}

export function addRecurringSchedule(input: RecurringEntryInput) {
  mutate((d) => {
    d.recurring.push({ id: makeId(), ...input });
  });
}

// Converts an existing one-time entry into a recurring schedule, dropping the
// single entry in favor of the new schedule.
export function convertEntryToRecurring(
  entryId: string,
  input: RecurringEntryInput,
) {
  mutate((d) => {
    d.recurring.push({ id: makeId(), ...input });
    d.entries = d.entries.filter((e) => e.id !== entryId);
  });
}

export function postEntry(entryId: string) {
  mutate((d) => {
    const entry = d.entries.find((e) => e.id === entryId);
    if (entry) entry.status = "posted";
  });
}

export function unpostEntry(entryId: string) {
  mutate((d) => {
    const entry = d.entries.find((e) => e.id === entryId);
    if (entry) entry.status = "pending";
  });
}

export function deleteEntry(entryId: string) {
  mutate((d) => {
    d.entries = d.entries.filter((e) => e.id !== entryId);
  });
}

// Deletes a recurring schedule and every entry it ever materialized.
export function deleteRecurringSchedule(scheduleId: string) {
  mutate((d) => {
    d.recurring = d.recurring.filter((s) => s.id !== scheduleId);
    d.entries = d.entries.filter((e) => e.recurringId !== scheduleId);
  });
}

export function partialSettleEntry(entryId: string, amountNow: number) {
  const orig = data.value.entries.find((e) => e.id === entryId);
  if (!orig) return;
  if (!(amountNow > 0) || amountNow >= orig.amount) {
    throw new Error(
      "Enter an amount greater than 0 and less than the total due.",
    );
  }
  mutate((d) => {
    const idx = d.entries.findIndex((e) => e.id === entryId);
    const current = d.entries[idx];
    const remainder = current.amount - amountNow;
    d.entries[idx] = { ...current, amount: amountNow, status: "posted" };
    d.entries.push({
      id: makeId(),
      kind: current.kind,
      title: entryTitle(current) + " (remaining)",
      amount: remainder,
      date: current.date,
      accountId: current.accountId,
      category: current.category,
      note: current.note,
      manual: true,
      status: "pending",
    });
  });
}

// --- Transfers ---

export interface TransferInput {
  amount: number;
  fromAccount: string;
  toAccount: string;
  date: string;
}

export function addTransfer(input: TransferInput) {
  if (input.fromAccount === input.toAccount) {
    throw new Error("Choose different accounts.");
  }
  mutate((d) => {
    d.entries.push({
      id: makeId(),
      kind: "transfer",
      status: "posted",
      ...input,
    });
  });
}

// --- Lending / loans ---

export type LendBorrowList = "lending" | "loans";

export interface LendBorrowInput {
  person: string;
  amount: number;
  date: string;
  returnDate: string;
}

export function addLendBorrow(list: LendBorrowList, input: LendBorrowInput) {
  mutate((d) => {
    d[list].push({ id: makeId(), settled: false, ...input });
  });
}

export function settleLendBorrow(list: LendBorrowList, id: string) {
  mutate((d) => {
    const item = d[list].find((l) => l.id === id);
    if (item) item.settled = true;
  });
}

export function partialSettleLendBorrow(
  list: LendBorrowList,
  id: string,
  amountNow: number,
) {
  const item = data.value[list].find((l) => l.id === id);
  if (!item) return;
  if (!(amountNow > 0) || amountNow > item.amount) {
    throw new Error(
      "Enter an amount greater than 0 and up to the outstanding balance.",
    );
  }
  mutate((d) => {
    const target = d[list].find((l) => l.id === id) as LendBorrowRecord;
    if (!target.originalAmount) target.originalAmount = target.amount;
    target.amount -= amountNow;
    if (target.amount <= 0) {
      target.amount = 0;
      target.settled = true;
    }
  });
}

export function deleteLendBorrow(list: LendBorrowList, id: string) {
  mutate((d) => {
    d[list] = d[list].filter((l) => l.id !== id);
  });
}

// --- Accounts ---

export interface AccountInput {
  name: string;
  type: AccountType;
}

export function addAccount(input: AccountInput) {
  mutate((d) => {
    d.accounts.push({ id: makeId(), ...input });
  });
}

export function updateAccount(accountId: string, input: AccountInput) {
  mutate((d) => {
    const acct = d.accounts.find((a) => a.id === accountId);
    if (acct) Object.assign(acct, input);
  });
}

export function deleteAccount(accountId: string) {
  if (data.value.accounts.length <= 1) {
    throw new Error("Keep at least one account.");
  }
  mutate((d) => {
    d.entries = d.entries.filter(
      (e) =>
        e.accountId !== accountId &&
        e.fromAccount !== accountId &&
        e.toAccount !== accountId,
    );
    d.recurring = d.recurring.filter((r) => r.accountId !== accountId);
    d.accounts = d.accounts.filter((a) => a.id !== accountId);
  });
}

// --- Categories ---

export function addCategory(name: string) {
  const trimmed = name.trim();
  if (!trimmed || data.value.categories.includes(trimmed)) return;
  mutate((d) => {
    d.categories.push(trimmed);
  });
}

export function deleteCategory(name: string) {
  mutate((d) => {
    d.categories = d.categories.filter((c) => c !== name);
  });
}

// --- Import / export ---

export function exportBackup(): string {
  return JSON.stringify(data.value, null, 2);
}

export function importBackup(json: string) {
  const parsed = JSON.parse(json) as Partial<LedgerData>;
  if (!parsed.accounts || !parsed.entries) {
    throw new Error("Invalid backup");
  }
  if (!parsed.loans) parsed.loans = [];
  data.value = parsed as LedgerData;
  persist();
}

export type { Account, Entry };
