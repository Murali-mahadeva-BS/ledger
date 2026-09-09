import { useState } from "preact/hooks";
import { cash } from "../lib/format";
import type { LendBorrowRecord } from "../lib/types";
import { closeModal } from "../lib/ui";

interface PartialLendBorrowFormProps {
  item: LendBorrowRecord;
  which: "lending" | "loans";
  onSubmit: (amount: number) => void;
}

export function PartialLendBorrowForm({
  item,
  which,
  onSubmit,
}: PartialLendBorrowFormProps) {
  const [amount, setAmount] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(Number(amount));
      }}
    >
      <p class="text-sm text-slate-500">Outstanding: {cash(item.amount)}</p>
      <label class="field">
        Amount {which === "lending" ? "received" : "paid"} now (₹)
        <input
          required
          type="number"
          min="0.01"
          max={item.amount}
          step="any"
          value={amount}
          onInput={(e) => setAmount(e.currentTarget.value)}
        />
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
          Save
        </button>
      </div>
    </form>
  );
}
