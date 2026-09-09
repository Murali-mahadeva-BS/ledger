import type { LedgerData } from "./types";

export const STORAGE_KEY = "ledger-v2";

export const defaultData = (): LedgerData => ({
  accounts: [
    { id: "bank", name: "Main bank", type: "Bank" },
    { id: "cash", name: "Cash", type: "Cash" },
  ],
  categories: [
    "Salary",
    "Freelance",
    "Rent",
    "Groceries",
    "Food",
    "Transport",
    "Utilities",
    "Shopping",
    "Health",
    "Other",
  ],
  entries: [],
  recurring: [],
  lending: [],
  loans: [],
});

export function loadData(): LedgerData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultData();
  try {
    const parsed = JSON.parse(raw) as Partial<LedgerData>;
    return { ...defaultData(), ...parsed, loans: parsed.loans ?? [] };
  } catch {
    return defaultData();
  }
}

export function saveData(data: LedgerData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
