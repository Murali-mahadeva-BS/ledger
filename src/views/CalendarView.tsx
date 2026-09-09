import { cash } from "../lib/format";
import { entryTitle, isPosted, monthsWithEntries } from "../lib/selectors";
import { data } from "../lib/store";
import type { Entry } from "../lib/types";
import { calendarMonth } from "../lib/ui";

const KIND_POSTED_BG: Record<string, string> = {
  income: "bg-emerald-500",
  investment: "bg-violet-500",
  expense: "bg-rose-500",
  transfer: "bg-rose-500",
};

const KIND_PENDING_CLASS: Record<string, string> = {
  income: "pending-in",
  investment: "pending-investment",
  expense: "pending-out",
  transfer: "pending-out",
};

const entryClass = (e: Entry) =>
  isPosted(e) ? KIND_POSTED_BG[e.kind] : KIND_PENDING_CLASS[e.kind];

export function CalendarView(_props: { path?: string }) {
  const d = data.value;
  const month = calendarMonth.value;
  const [year, monthNum] = month.split("-").map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const firstWeekday = new Date(year, monthNum - 1, 1).getDay();
  const months = monthsWithEntries(d);

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(<div key={"blank" + i} />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = month + "-" + String(day).padStart(2, "0");
    const items = d.entries.filter((e) => e.date === dateStr);
    cells.push(
      <div
        key={dateStr}
        class="min-h-16 overflow-hidden rounded-lg border p-1 sm:min-h-24"
      >
        <small class="text-slate-400">{day}</small>
        {items.map((e) => (
          <div
            key={e.id}
            class={
              "mt-1 truncate rounded px-1 text-[10px] text-white " +
              entryClass(e)
            }
          >
            {entryTitle(e)} {cash(e.amount)}
          </div>
        ))}
      </div>,
    );
  }

  return (
    <div>
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 class="text-2xl font-bold">Calendar</h2>
        <label class="text-sm font-semibold">
          Month
          <select
            class="ml-2 rounded-xl border bg-transparent p-2 font-normal"
            value={month}
            onChange={(e) => (calendarMonth.value = e.currentTarget.value)}
          >
            {months.map((mo) => (
              <option key={mo} value={mo}>
                {new Date(mo + "-01T12:00:00").toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div class="rounded-2xl bg-white p-3">
        <div class="mb-2 grid grid-cols-7 text-center text-xs text-slate-400">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>
        <div class="grid grid-cols-7 gap-1">{cells}</div>
      </div>
    </div>
  );
}
