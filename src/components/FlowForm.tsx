import { useState } from "preact/hooks";
import { today } from "../lib/format";
import { entryTitle } from "../lib/selectors";
import { data } from "../lib/store";
import type { Entry, EntryKind } from "../lib/types";
import { closeModal } from "../lib/ui";

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
  const isEdit = !!entry;
  const lockedRecurring = isEdit && !!entry?.recurringId;
  const accounts = data.value.accounts;
  const categories = data.value.categories;

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
          amount: Number(amount),
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
          });
        } else {
          onSubmit({ ...shared, recurring: false, date });
        }
      }}
    >
      <label class="field">
        Title
        <input
          required
          maxLength={80}
          value={title}
          placeholder={"e.g. " + placeholder}
          onInput={(e) => setTitle(e.currentTarget.value)}
        />
      </label>
      <label class="field">
        Amount (₹)
        <input
          required
          type="number"
          min="0"
          step="any"
          inputmode="decimal"
          placeholder="0"
          value={amount}
          onInput={(e) => setAmount(e.currentTarget.value)}
        />
      </label>
      {lockedRecurring ? (
        <label class="field">
          {dateLabel}
          <input
            type="date"
            value={date}
            onInput={(e) => setDate(e.currentTarget.value)}
          />
        </label>
      ) : (
        <>
          <label class="field">
            Entry type
            <select
              value={recurring ? "true" : "false"}
              onChange={(e) => setRecurring(e.currentTarget.value === "true")}
            >
              <option value="false">One-time</option>
              <option value="true">Recurring monthly</option>
            </select>
          </label>
          {!recurring ? (
            <label class="field">
              {dateLabel}
              <input
                type="date"
                value={date}
                onInput={(e) => setDate(e.currentTarget.value)}
              />
            </label>
          ) : (
            <>
              <label class="field">
                Day of month
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={day}
                  onInput={(e) => setDay(e.currentTarget.value)}
                />
              </label>
              <label class="field">
                Starts from
                <input
                  type="month"
                  value={startMonth}
                  onInput={(e) => setStartMonth(e.currentTarget.value)}
                />
              </label>
            </>
          )}
        </>
      )}
      <label class="field">
        Account
        <select
          value={accountId}
          onChange={(e) => setAccountId(e.currentTarget.value)}
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} · {a.type}
            </option>
          ))}
        </select>
      </label>
      {kind === "expense" && (
        <label class="field">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.currentTarget.value)}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      )}
      <label class="field">
        Note <span class="font-normal text-slate-500">(optional)</span>
        <textarea
          rows={3}
          maxLength={500}
          placeholder="Anything useful to remember"
          value={note}
          onInput={(e) => setNote(e.currentTarget.value)}
        />
      </label>
      <label class="mt-4 flex gap-2 text-sm">
        <input
          type="checkbox"
          checked={manual}
          onChange={(e) => setManual(e.currentTarget.checked)}
        />
        Require manual approval before balance changes
      </label>
      <div class="mt-5 flex gap-2">
        <button
          type="button"
          class="flex-1 rounded-xl border py-2"
          onClick={closeModal}
        >
          Cancel
        </button>
        <button class="flex-1 rounded-xl bg-teal-600 py-2 font-semibold text-white">
          {isEdit ? "Save changes" : "Save"}
        </button>
      </div>
    </form>
  );
}
