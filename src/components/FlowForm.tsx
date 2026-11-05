import { useState } from "react";
import { useStore } from "zustand";
import { today } from "../lib/format";
import { entryTitle } from "../lib/selectors";
import { data } from "../lib/store";
import type { Entry, EntryKind } from "../lib/types";
import { closeModal } from "../lib/ui";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

export type FlowFormResult =
  | {
      recurring: false;
      title: string;
      amount: number;
      date: string;
      accountId: string;
      category?: string;
      note?: string;
      manual: boolean;
    }
  | {
      recurring: true;
      title: string;
      amount: number;
      day: number;
      startMonth: string;
      months?: number;
      accountId: string;
      category?: string;
      note?: string;
      manual: boolean;
    };

interface FlowFormProps {
  kind: Exclude<EntryKind, "transfer">;
  entry?: Entry;
  onSubmit: (result: FlowFormResult) => void;
}

export function FlowForm({ kind, entry, onSubmit }: FlowFormProps) {
  const ledgerData = useStore(data);
  const isEdit = !!entry;
  const lockedRecurring = isEdit && !!entry?.recurringId;
  const accounts = ledgerData.accounts;
  const categories = ledgerData.categories;

  const [title, setTitle] = useState(entry ? entryTitle(entry) : "");
  const [amount, setAmount] = useState(entry ? String(entry.amount) : "");
  const [recurring, setRecurring] = useState(false);
  const [date, setDate] = useState(entry ? entry.date : today());
  const [day, setDay] = useState(
    entry ? String(+entry.date.slice(8, 10)) : "1",
  );
  const [startMonth, setStartMonth] = useState(
    entry ? entry.date.slice(0, 7) : today().slice(0, 7),
  );
  const [months, setMonths] = useState(
    entry?.recurringId
      ? String(
          ledgerData.recurring.find((r) => r.id === entry.recurringId)
            ?.months ?? "",
        )
      : "",
  );
  const [accountId, setAccountId] = useState(
    entry?.accountId ?? accounts[0]?.id ?? "",
  );
  const [category, setCategory] = useState(
    entry?.category ?? categories[0] ?? "",
  );
  const [note, setNote] = useState(entry?.note ?? "");
  const [manual, setManual] = useState(entry ? !!entry.manual : true);

  const placeholder =
    kind === "income"
      ? "Salary"
      : kind === "investment"
        ? "Index fund SIP"
        : "Monthly rent";
  const dateLabel = kind === "income" ? "Credit date" : "Debit date";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const shared = {
          title,
          amount: Math.round(Number(amount)),
          accountId,
          category: kind === "expense" ? category : undefined,
          note,
          manual,
        };
        if (!lockedRecurring && recurring) {
          onSubmit({
            ...shared,
            recurring: true,
            day: Number(day),
            startMonth,
            months: months ? Math.round(Number(months)) : undefined,
          });
        } else {
          onSubmit({ ...shared, recurring: false, date });
        }
      }}
    >
      <label className="field">
        Title
        <Input
          required
          maxLength={80}
          value={title}
          placeholder={"e.g. " + placeholder}
          onChange={(e) => setTitle(e.currentTarget.value)}
        />
      </label>
      <label className="field">
        Amount (₹)
        <Input
          required
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.currentTarget.value)}
        />
      </label>
      {lockedRecurring ? (
        <label className="field">
          {dateLabel}
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.currentTarget.value)}
          />
        </label>
      ) : (
        <>
          <label className="field">
            Entry type
            <Select
              value={recurring ? "true" : "false"}
              onValueChange={(value) => setRecurring(value === "true")}
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">One-time</SelectItem>
                <SelectItem value="true">Recurring monthly</SelectItem>
              </SelectContent>
            </Select>
          </label>
          {!recurring ? (
            <label className="field">
              {dateLabel}
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.currentTarget.value)}
              />
            </label>
          ) : (
            <>
              <label className="field">
                Day of month
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={day}
                  onChange={(e) => setDay(e.currentTarget.value)}
                />
              </label>
              <label className="field">
                Starts from
                <Input
                  type="month"
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.currentTarget.value)}
                />
              </label>
              <label className="field">
                Recur for how long
                <span className="font-normal text-slate-500"></span>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  placeholder="Indefinite"
                  value={months}
                  onChange={(e) => setMonths(e.currentTarget.value)}
                />
              </label>
            </>
          )}
        </>
      )}
      <label className="field">
        Account
        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger className="mt-1 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
          {accounts.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name} · {a.type}
            </SelectItem>
          ))}
          </SelectContent>
        </Select>
      </label>
      {kind === "expense" && (
        <label className="field">
          Category
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
            </SelectContent>
          </Select>
        </label>
      )}
      <label className="field">
        Note <span className="font-normal text-slate-500">(optional)</span>
        <Textarea
          rows={3}
          maxLength={500}
          placeholder="Anything useful to remember"
          value={note}
          onChange={(e) => setNote(e.currentTarget.value)}
        />
      </label>
      <label className="mt-4 flex gap-2 text-sm">
        <input
          type="checkbox"
          checked={manual}
          onChange={(e) => setManual(e.currentTarget.checked)}
        />
        Require manual approval before balance changes
      </label>
      <div className="mt-5 flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={closeModal}
        >
          Cancel
        </Button>
        <Button className="flex-1">
          {isEdit ? "Save changes" : "Save"}
        </Button>
      </div>
    </form>
  );
}
