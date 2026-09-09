import { useState } from "preact/hooks";
import type { Account, AccountType } from "../lib/types";

interface AccountFormProps {
  account?: Account;
  onSubmit: (input: { name: string; type: AccountType }) => void;
}

export function AccountForm({ account, onSubmit }: AccountFormProps) {
  const [name, setName] = useState(account?.name ?? "");
  const [type, setType] = useState<AccountType>(account?.type ?? "Bank");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        onSubmit({ name: trimmed, type });
      }}
    >
      <label class="field">
        Account name
        <input
          required
          value={name}
          onInput={(e) => setName(e.currentTarget.value)}
        />
      </label>
      <label class="field">
        Type
        <select
          value={type}
          onChange={(e) => setType(e.currentTarget.value as AccountType)}
        >
          <option>Bank</option>
          <option>Wallet</option>
          <option>Cash</option>
        </select>
      </label>
      <button class="mt-5 w-full rounded-xl bg-teal-600 py-2 font-semibold text-white">
        {account ? "Save changes" : "Add"}
      </button>
    </form>
  );
}
