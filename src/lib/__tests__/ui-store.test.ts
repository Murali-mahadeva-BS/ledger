import { beforeEach, describe, expect, it } from "vitest";
import { uiStore } from "../ui";

describe("UI store", () => {
  beforeEach(() => {
    uiStore.setState(uiStore.getInitialState(), true);
  });

  it("initializes the selected periods to the current month", () => {
    expect(uiStore.getState().dashboardPeriod).toMatch(/^month:\d{4}-\d{2}$/);
    expect(uiStore.getState().tabPeriods).toEqual({
      income: uiStore.getState().dashboardPeriod,
      expense: uiStore.getState().dashboardPeriod,
      investment: uiStore.getState().dashboardPeriod,
    });
    expect(uiStore.getState().calendarMonth).toBe(
      uiStore.getState().dashboardPeriod.slice("month:".length),
    );
  });

  it("updates a single transaction period without changing the others", () => {
    const before = uiStore.getState().tabPeriods;

    uiStore.getState().setTabPeriod("expense", "month:2026-02");

    expect(uiStore.getState().tabPeriods).toEqual({
      ...before,
      expense: "month:2026-02",
    });
  });

  it("opens and closes the modal", () => {
    const body = "modal body";
    uiStore.getState().openModal("Confirm", body);

    expect(uiStore.getState().modal).toEqual({ title: "Confirm", body });

    uiStore.getState().closeModal();
    expect(uiStore.getState().modal).toBeNull();
  });

  it("updates drawer, dashboard period and calendar month", () => {
    uiStore.getState().setDrawerOpen(true);
    uiStore.getState().setDashboardPeriod("month:2026-02");
    uiStore.getState().setCalendarMonth("2026-01");

    expect(uiStore.getState()).toMatchObject({
      drawerOpen: true,
      dashboardPeriod: "month:2026-02",
      calendarMonth: "2026-01",
    });
  });
});
