import { useState } from "react";
import { useStore } from "zustand";
import { today } from "../lib/format";
import type { TransferInput } from "../lib/store";
import { data } from "../lib/store";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface TransferFormProps {
  onSubmit: (input: TransferInput) => void;
}

export function TransferForm({ onSubmit }: TransferFormProps) {
  const accounts = useStore(data).accounts;
  const [amount, setAmount] = useState("");
  const [fromAccount, setFromAccount] = useState(accounts[0]?.id ?? "");
  const [toAccount, setToAccount] = useState(
    accounts[1]?.id ?? accounts[0]?.id ?? "",
  );
  const [date, setDate] = useState(today());

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          amount: Math.round(Number(amount)),
          fromAccount,
          toAccount,
          date,
        });
      }}
    >
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
        From
        <Select value={fromAccount} onValueChange={setFromAccount}>
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
      <label className="field">
        To
        <Select value={toAccount} onValueChange={setToAccount}>
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
      <label className="field">
        Date
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.currentTarget.value)}
        />
      </label>
      <Button className="mt-5 w-full">
        Transfer
      </Button>
    </form>
  );
}
