import { useState } from "react";
import { today } from "../lib/format";
import type { LendBorrowInput } from "../lib/store";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

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
        onSubmit({
          person,
          amount: Math.round(Number(amount)),
          date,
          returnDate,
        });
      }}
    >
      <label className="field">
        Person
        <Input
          required
          value={person}
          onChange={(e) => setPerson(e.currentTarget.value)}
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
          value={amount}
          onChange={(e) => setAmount(e.currentTarget.value)}
        />
      </label>
      <label className="field">
        {isLend ? "Lent on" : "Borrowed on"}
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.currentTarget.value)}
        />
      </label>
      <label className="field">
        {isLend ? "Expected return" : "Repay by"}
        <Input
          required
          type="date"
          value={returnDate}
          onChange={(e) => setReturnDate(e.currentTarget.value)}
        />
      </label>
      <Button className="mt-5 w-full">
        Save
      </Button>
    </form>
  );
}
