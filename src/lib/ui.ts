import { signal } from "@preact/signals";
import type { ComponentChildren } from "preact";
import { today } from "./format";
import type { EntryKind } from "./types";

export const drawerOpen = signal(false);

// Selected dashboard period, format "month:YYYY-MM". Kept outside the view so
// it survives navigating away and back, like the original app's module state.
export const dashboardPeriod = signal("month:" + today().slice(0, 7));

// Same idea, one selected period per transactions tab.
export const tabPeriods = signal<
  Record<Exclude<EntryKind, "transfer">, string>
>({
  income: "month:" + today().slice(0, 7),
  expense: "month:" + today().slice(0, 7),
  investment: "month:" + today().slice(0, 7),
});

// Calendar's selected month, format "YYYY-MM" (no "month:" prefix, unlike the period signals above).
export const calendarMonth = signal(today().slice(0, 7));

interface ModalState {
  title: string;
  body: ComponentChildren;
}

export const modal = signal<ModalState | null>(null);

export function openModal(title: string, body: ComponentChildren) {
  modal.value = { title, body };
}

export function closeModal() {
  modal.value = null;
}
