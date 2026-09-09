import { makeId } from "./id";
import { today } from "./format";
import type { LedgerData } from "./types";

// Recurring schedules materialize into real entries so the calendar and every
// tab always agree on what exists. Auto-posted schedules only materialize
// once their due date arrives (so balances aren't debited early); schedules
// awaiting manual approval appear as soon as their month starts, since a
// pending entry can't touch a balance until approved, and this gives a
// window to edit that month's amount before approving it.
// Mutates `data` in place; returns true if any entries were added.
export function reconcileRecurring(data: LedgerData): boolean {
  const currentMonth = today().slice(0, 7);
  let changed = false;
  data.recurring.forEach((schedule) => {
    const startMonth = schedule.startMonth || currentMonth;
    let [year, month] = startMonth.split("-").map(Number);
    const [endYear, endMonth] = currentMonth.split("-").map(Number);
    while (year < endYear || (year === endYear && month <= endMonth)) {
      const period = year + "-" + String(month).padStart(2, "0");
      const dueDate =
        period +
        "-" +
        String(
          Math.min(schedule.day, new Date(year, month, 0).getDate()),
        ).padStart(2, "0");
      const exists = data.entries.some(
        (entry) => entry.recurringId === schedule.id && entry.period === period,
      );
      if (!exists && (schedule.manual || dueDate <= today())) {
        data.entries.push({
          ...schedule,
          id: makeId(),
          recurringId: schedule.id,
          period,
          date: dueDate,
          status: schedule.manual ? "pending" : "posted",
        });
        changed = true;
      }
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }
  });
  return changed;
}
