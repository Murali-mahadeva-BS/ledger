import { useState } from "react";
import { cash } from "../lib/format";
import type { Entry } from "../lib/types";
import { closeModal } from "../lib/ui";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

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
        onSubmit(Math.round(Number(amount)));
      }}
    >
      <p className="text-sm text-slate-500">Total due: {cash(entry.amount)}</p>
      <label className="field">
        Amount now (₹)
        <Input
          required
          type="number"
          min="1"
          max={entry.amount}
          step="1"
          inputMode="numeric"
          placeholder="e.g. 7000"
          value={amount}
          onChange={(e) => setAmount(e.currentTarget.value)}
        />
      </label>
      <p className="mt-2 text-xs text-slate-500">
        The remaining balance stays as a new pending entry.
      </p>
      <div className="mt-5 flex gap-2">
        <Button
          variant="outline"
          type="button"
          className="flex-1"
          onClick={closeModal}
        >
          Cancel
        </Button>
        <Button className="flex-1">
          Save
        </Button>
      </div>
    </form>
  );
}
