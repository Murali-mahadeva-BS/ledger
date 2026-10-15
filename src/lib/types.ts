export type AccountType = "Bank" | "Wallet" | "Cash";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
}

export type EntryKind = "income" | "expense" | "investment" | "transfer";
export type EntryStatus = "posted" | "pending";

export interface Entry {
  id: string;
  kind: EntryKind;
  title?: string;
  description?: string;
  amount: number;
  date: string;
  status: EntryStatus;
  accountId?: string;
  fromAccount?: string;
  toAccount?: string;
  category?: string;
  note?: string;
  manual?: boolean;
  recurringId?: string;
  period?: string;
}

export interface RecurringSchedule {
  id: string;
  kind: Exclude<EntryKind, "transfer">;
  title?: string;
  description?: string;
  amount: number;
  day: number;
  startMonth?: string;
  months?: number;
  accountId: string;
  category?: string;
  note?: string;
  manual: boolean;
}

export interface LendBorrowRecord {
  id: string;
  person: string;
  amount: number;
  originalAmount?: number;
  date: string;
  returnDate: string;
  settled: boolean;
}

// One record per action taken on an entry (created/edited/posted/etc.), kept
// forever so a detail page can show a full history for that entry.
export interface AuditLogEntry {
  id: string;
  entryId: string;
  timestamp: string;
  action: string;
  detail?: string;
}

export interface LedgerData {
  accounts: Account[];
  categories: string[];
  entries: Entry[];
  recurring: RecurringSchedule[];
  lending: LendBorrowRecord[];
  loans: LendBorrowRecord[];
  auditLog: AuditLogEntry[];
}
