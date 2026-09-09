import { useState } from "preact/hooks";
import { today } from "../lib/format";
import type { LendBorrowInput } from "../lib/store";

interface LendBorrowFormProps {
  isLend: boolean;
  onSubmit: (input: LendBorrowInput) => void;
}

export function LendBorrowForm({ isLend, onSubmit }: LendBorrowFormProps) {
  const [person, setPerson] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [returnDate, setReturnDate] = useState(today());

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ person, amount: Number(amount), date, returnDate });
      }}
    >
      <label class="field">
        Person
        <input
          required
          value={person}
          onInput={(e) => setPerson(e.currentTarget.value)}
        />
      </label>
      <label class="field">
        Amount (₹)
        <input
          required
          type="number"
          min=".01"
          value={amount}
          onInput={(e) => setAmount(e.currentTarget.value)}
        />
      </label>
      <label class="field">
        {isLend ? "Lent on" : "Borrowed on"}
        <input
          type="date"
          value={date}
          onInput={(e) => setDate(e.currentTarget.value)}
        />
      </label>
      <label class="field">
        {isLend ? "Expected return" : "Repay by"}
        <input
          required
          type="date"
          value={returnDate}
          onInput={(e) => setReturnDate(e.currentTarget.value)}
        />
      </label>
      <button class="mt-5 w-full rounded-xl bg-teal-600 py-2 font-semibold text-white">
        Save
      </button>
    </form>
  );
}
