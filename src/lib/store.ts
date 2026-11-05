import { makeId } from "./id";
import { accountName, entryTitle } from "./selectors";
import { cash } from "./format";
import { reconcileRecurring } from "./recurring";
import { defaultData, loadData, saveData } from "./storage";
import { createStore } from "zustand/vanilla";
import type {
  Account,
  AccountType,
  Entry,
  EntryKind,
  LedgerData,
  LendBorrowRecord,
} from "./types";

export const data = createStore<LedgerData>(() => loadData());

function persist() {
  saveData(data.getState());
}

// Mutates the current data object in place, then publishes a new snapshot to
// Zustand subscribers and persists it. Validate inputs first so errors do not
// leave a partial mutation applied.
function mutate(fn: (d: LedgerData) => void) {
  const current = data.getState();
  fn(current);
  data.setState({ ...current });
  persist();
}

// Records a step in an entry's history for the detail page's audit log.
function logAudit(
  d: LedgerData,
  entryId: string,
  action: string,
  detail?: string,
) {
  d.auditLog.push({
    id: makeId(),
    entryId,
    action,
    detail,
    timestamp: new Date().toISOString(),
  });
}

function formatAuditValue(label: string, v: unknown): string {
  if (label === "Amount") return cash(Number(v) || 0);
  if (label === "Manual approval") return v ? "Yes" : "No";
  if (v === undefined || v === null || v === "") return "(empty)";
  return String(v);
}

// Builds a "Field: before -> after" summary listing only the fields that
// actually changed, so the audit log shows exactly what an edit did.
function describeEntryChanges(
  d: LedgerData,
  before: Entry,
  after: OneTimeEntryInput,
): string {
  const rows: Array<[string, unknown, unknown]> = [
    ["Title", before.title, after.title],
    ["Amount", before.amount, after.amount],
    ["Date", before.date, after.date],
    [
      "Account",
      before.accountId ? accountName(d, before.accountId) : undefined,
      accountName(d, after.accountId),
    ],
    ["Category", before.category, after.category],
    ["Note", before.note, after.note],
    ["Manual approval", before.manual, after.manual],
  ];
  return rows
    .filter(([, b, a]) => b !== a)
    .map(
      ([label, b, a]) =>
        `${label}: ${formatAuditValue(label, b)} \u2192 ${formatAuditValue(label, a)}`,
    )
    .join("; ");
}

if (reconcileRecurring(data.getState())) {
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
    const id = makeId();
    d.entries.push({
      id,
      ...input,
      status: input.manual ? "pending" : "posted",
    });
    logAudit(d, id, "Created", `${input.title} · ₹${input.amount}`);
  });
}

export function updateOneTimeEntry(entryId: string, input: OneTimeEntryInput) {
  mutate((d) => {
    const idx = d.entries.findIndex((e) => e.id === entryId);
    if (idx > -1) {
      const before = d.entries[idx];
      d.entries[idx] = { ...before, ...input };
      const detail = describeEntryChanges(d, before, input);
      if (detail) logAudit(d, entryId, "Edited", detail);
    }
  });
}

export interface RecurringEntryInput {
  kind: Exclude<EntryKind, "transfer">;
  title: string;
  amount: number;
  day: number;
  startMonth: string;
  months?: number;
  accountId: string;
  category?: string;
  note?: string;
  manual: boolean;
}

export function addRecurringSchedule(input: RecurringEntryInput) {
  mutate((d) => {
    d.recurring.push({ id: makeId(), ...input });
    reconcileRecurring(d);
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
    reconcileRecurring(d);
  });
}

export function postEntry(entryId: string) {
  mutate((d) => {
    const entry = d.entries.find((e) => e.id === entryId);
    if (entry) {
      entry.status = "posted";
      logAudit(d, entryId, "Posted");
    }
  });
}

export function unpostEntry(entryId: string) {
  mutate((d) => {
    const entry = d.entries.find((e) => e.id === entryId);
    if (entry) {
      entry.status = "pending";
      logAudit(d, entryId, "Reverted to pending");
    }
  });
}

export function deleteEntry(entryId: string) {
  mutate((d) => {
    const existed = d.entries.some((e) => e.id === entryId);
    d.entries = d.entries.filter((e) => e.id !== entryId);
    if (existed) logAudit(d, entryId, "Deleted");
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
  const orig = data.getState().entries.find((e) => e.id === entryId);
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
    const remainderId = makeId();
    d.entries[idx] = { ...current, amount: amountNow, status: "posted" };
    d.entries.push({
      id: remainderId,
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
    logAudit(
      d,
      entryId,
      "Partially settled",
      `₹${amountNow} now, ₹${remainder} left as a new pending entry`,
    );
    logAudit(
      d,
      remainderId,
      "Created",
      `Remaining ₹${remainder} from a partial settlement`,
    );
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
  const item = data.getState()[list].find((l) => l.id === id);
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
  if (data.getState().accounts.length <= 1) {
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
  if (!trimmed || data.getState().categories.includes(trimmed)) return;
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
  return JSON.stringify(data.getState(), null, 2);
}

export function resetData() {
  data.setState(defaultData(), true);
  persist();
}

export function importBackup(json: string) {
  const parsed = JSON.parse(json) as Partial<LedgerData>;
  if (!parsed.accounts || !parsed.entries) {
    throw new Error("Invalid backup");
  }
  if (!parsed.loans) parsed.loans = [];
  data.setState(parsed as LedgerData, true);
  persist();
}

export type { Account, Entry };
