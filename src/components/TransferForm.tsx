import { useState } from "preact/hooks";
import { today } from "../lib/format";
import type { TransferInput } from "../lib/store";
import { data } from "../lib/store";

interface TransferFormProps {
  onSubmit: (input: TransferInput) => void;
}

export function TransferForm({ onSubmit }: TransferFormProps) {
  const accounts = data.value.accounts;
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
        onSubmit({ amount: Number(amount), fromAccount, toAccount, date });
      }}
    >
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
        From
        <select
          value={fromAccount}
          onChange={(e) => setFromAccount(e.currentTarget.value)}
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} · {a.type}
            </option>
          ))}
        </select>
      </label>
      <label class="field">
        To
        <select
          value={toAccount}
          onChange={(e) => setToAccount(e.currentTarget.value)}
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} · {a.type}
            </option>
          ))}
        </select>
      </label>
      <label class="field">
        Date
        <input
          type="date"
          value={date}
          onInput={(e) => setDate(e.currentTarget.value)}
        />
      </label>
      <button class="mt-5 w-full rounded-xl bg-teal-600 py-2 font-semibold text-white">
        Transfer
      </button>
    </form>
  );
}
