import { useState } from "preact/hooks";
import { cash } from "../lib/format";
import type { Entry } from "../lib/types";
import { closeModal } from "../lib/ui";

interface PartialEntryFormProps {
  entry: Entry;
  onSubmit: (amount: number) => void;
}

export function PartialEntryForm({ entry, onSubmit }: PartialEntryFormProps) {
  const [amount, setAmount] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(Number(amount));
      }}
    >
      <p class="text-sm text-slate-500">Total due: {cash(entry.amount)}</p>
      <label class="field">
        Amount now (₹)
        <input
          required
          type="number"
          min="0.01"
          max={entry.amount}
          step="any"
          placeholder="e.g. 7000"
          value={amount}
          onInput={(e) => setAmount(e.currentTarget.value)}
        />
      </label>
      <p class="mt-2 text-xs text-slate-500">
        The remaining balance stays as a new pending entry.
      </p>
      <div class="mt-5 flex gap-2">
        <button
          type="button"
          class="flex-1 rounded-xl border py-2"
          onClick={closeModal}
        >
          Cancel
        </button>
        <button class="flex-1 rounded-xl bg-teal-600 py-2 font-semibold text-white">
          Save
        </button>
      </div>
    </form>
  );
}
