import { useStore } from "zustand";
import { cash } from "../lib/format";
import { entryTitle, isPosted, monthsWithEntries } from "../lib/selectors";
import { data } from "../lib/store";
import type { Entry } from "../lib/types";
import { uiStore } from "../lib/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

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
  const d = useStore(data);
  const month = useStore(uiStore, (state) => state.calendarMonth);
  const setCalendarMonth = useStore(uiStore, (state) => state.setCalendarMonth);
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
        className="min-h-16 overflow-hidden rounded-lg border p-1 sm:min-h-24"
      >
        <small className="text-slate-400">{day}</small>
        {items.map((e) => (
          <div
            key={e.id}
            className={
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
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-end">
        <label className="text-sm font-semibold">
          Month
          <Select
            value={month}
            onValueChange={setCalendarMonth}
          >
            <SelectTrigger className="ml-2 inline-flex font-normal">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
            {months.map((mo) => (
              <SelectItem key={mo} value={mo}>
                {new Date(mo + "-01T12:00:00").toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </SelectItem>
            ))}
            </SelectContent>
          </Select>
        </label>
      </div>
      <div className="rounded-2xl bg-white p-3">
        <div className="mb-2 grid grid-cols-7 text-center text-xs text-slate-400">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>
        <div className="grid grid-cols-7 gap-1">{cells}</div>
      </div>
    </div>
  );
}
