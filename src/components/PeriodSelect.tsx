import { monthsWithEntries } from "../lib/selectors";
import type { LedgerData } from "../lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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
    <Select value={"month:" + selectedMonth} onValueChange={onChange}>
      <SelectTrigger aria-label="Period" className="min-w-0 sm:flex-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {months.map((m) => (
          <SelectItem key={m} value={"month:" + m}>
            {new Date(m + "-01T12:00:00").toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
