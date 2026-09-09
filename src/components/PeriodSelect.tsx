import { monthsWithEntries } from "../lib/selectors";
import type { LedgerData } from "../lib/types";

interface PeriodSelectProps {
  data: LedgerData;
  value: string;
  onChange: (value: string) => void;
}

export function PeriodSelect({ data, value, onChange }: PeriodSelectProps) {
  const months = monthsWithEntries(data);
  const selectedMonth = value.startsWith("month:")
    ? value.slice("month:".length)
    : months[0];
  return (
    <label class="flex min-w-0 items-center gap-2 text-sm font-semibold">
      Period
      <select
        class="min-w-0 flex-1 rounded-xl border bg-white p-2 font-normal sm:flex-none"
        value={"month:" + selectedMonth}
        onChange={(e) => onChange(e.currentTarget.value)}
      >
        {months.map((m) => (
          <option key={m} value={"month:" + m}>
            {new Date(m + "-01T12:00:00").toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </option>
        ))}
      </select>
    </label>
  );
}
