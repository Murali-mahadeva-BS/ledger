import { useState } from "react";
import { cash } from "../lib/format";
import type { LendBorrowRecord } from "../lib/types";
import { closeModal } from "../lib/ui";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

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
        onSubmit(Math.round(Number(amount)));
      }}
    >
      <p className="text-sm text-slate-500">Outstanding: {cash(item.amount)}</p>
      <label className="field">
        Amount {which === "lending" ? "received" : "paid"} now (₹)
        <Input
          required
          type="number"
          min="1"
          max={item.amount}
          step="1"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.currentTarget.value)}
        />
      </label>
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
