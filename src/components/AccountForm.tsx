import { useState } from "react";
import type { Account, AccountType } from "../lib/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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
      <label className="field">
        Account name
        <Input
          required
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
      </label>
      <label className="field">
        Type
        <Select value={type} onValueChange={(value) => setType(value as AccountType)}>
          <SelectTrigger className="mt-1 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Bank">Bank</SelectItem>
            <SelectItem value="Wallet">Wallet</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
          </SelectContent>
        </Select>
      </label>
      <Button className="mt-5 w-full">
        {account ? "Save changes" : "Add"}
      </Button>
    </form>
  );
}
