import { useStore } from "zustand";
import { AccountForm } from "../components/AccountForm";
import { IconButton } from "../components/IconButton";
import { PencilIcon, TrashIcon } from "../components/icons";
import { cash } from "../lib/format";
import { accountBalance } from "../lib/selectors";
import { addAccount, data, deleteAccount, updateAccount } from "../lib/store";
import type { Account } from "../lib/types";
import { closeModal, openModal } from "../lib/ui";
import { Button } from "../components/ui/button";

function openAccountModal(account?: Account) {
  openModal(
    account ? "Rename account" : "Add account",
    <AccountForm
      account={account}
      onSubmit={(input) => {
        if (account) updateAccount(account.id, input);
        else addAccount(input);
        closeModal();
      }}
    />,
  );
}

function handleDelete(account: Account) {
  if (
    !confirm(
      "Delete this account? Entries and transfers tied to it will be removed too.",
    )
  )
    return;
  try {
    deleteAccount(account.id);
  } catch (err) {
    alert((err as Error).message);
  }
}

export function AccountsView(_props: { path?: string }) {
  const ledgerData = useStore(data);
  const accounts = ledgerData.accounts;
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button onClick={() => openAccountModal()}>
          Add account
        </Button>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {accounts.map((account) => {
          const balance = accountBalance(ledgerData, account.id);
          return (
            <div
              key={account.id}
              className="rounded-2xl border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500">{account.type}</p>
                  <b className="text-lg">{account.name}</b>
                </div>
                <div className="-mr-1 -mt-1 flex gap-1">
                  <IconButton
                    label="Rename"
                    onClick={() => openAccountModal(account)}
                  >
                    <PencilIcon />
                  </IconButton>
                  <IconButton
                    label="Delete"
                    danger
                    onClick={() => handleDelete(account)}
                  >
                    <TrashIcon />
                  </IconButton>
                </div>
              </div>
              <b
                className={
                  "mt-2 block text-xl " +
                  (balance < 0 ? "text-rose-600" : "text-teal-700")
                }
              >
                {cash(balance)}
              </b>
            </div>
          );
        })}
      </div>
    </div>
  );
}
