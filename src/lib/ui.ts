import { createStore } from "zustand/vanilla";
import type { ReactNode } from "react";
import { today } from "./format";
import type { EntryKind } from "./types";

interface ModalState {
  title: string;
  body: ReactNode;
}

interface UiState {
  drawerOpen: boolean;
  dashboardPeriod: string;
  tabPeriods: Record<Exclude<EntryKind, "transfer">, string>;
  calendarMonth: string;
  modal: ModalState | null;
  setDrawerOpen: (open: boolean) => void;
  setDashboardPeriod: (period: string) => void;
  setTabPeriod: (kind: Exclude<EntryKind, "transfer">, period: string) => void;
  setCalendarMonth: (month: string) => void;
  openModal: (title: string, body: ReactNode) => void;
  closeModal: () => void;
}

const currentMonth = today().slice(0, 7);

export const uiStore = createStore<UiState>((set) => ({
  drawerOpen: false,
  dashboardPeriod: "month:" + currentMonth,
  tabPeriods: {
    income: "month:" + currentMonth,
    expense: "month:" + currentMonth,
    investment: "month:" + currentMonth,
  },
  calendarMonth: currentMonth,
  modal: null,
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
  setDashboardPeriod: (dashboardPeriod) => set({ dashboardPeriod }),
  setTabPeriod: (kind, period) =>
    set((state) => ({
      tabPeriods: { ...state.tabPeriods, [kind]: period },
    })),
  setCalendarMonth: (calendarMonth) => set({ calendarMonth }),
  openModal: (title, body) => set({ modal: { title, body } }),
  closeModal: () => set({ modal: null }),
}));

export function openModal(title: string, body: ReactNode) {
  uiStore.getState().openModal(title, body);
}

export function closeModal() {
  uiStore.getState().closeModal();
}
