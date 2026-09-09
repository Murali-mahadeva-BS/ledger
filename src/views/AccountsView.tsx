import { AccountForm } from "../components/AccountForm";
import { IconButton } from "../components/IconButton";
import { PencilIcon, TrashIcon } from "../components/icons";
import { cash } from "../lib/format";
import { accountBalance } from "../lib/selectors";
import { addAccount, data, deleteAccount, updateAccount } from "../lib/store";
import type { Account } from "../lib/types";
import { closeModal, openModal } from "../lib/ui";

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
  const accounts = data.value.accounts;
  return (
    <div>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-2xl font-bold">Accounts</h2>
        <button
          class="rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white"
          onClick={() => openAccountModal()}
        >
          Add account
        </button>
      </div>
      <div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {accounts.map((account) => {
          const balance = accountBalance(data.value, account.id);
          return (
            <div
              key={account.id}
              class="rounded-2xl border bg-white p-4 shadow-sm"
            >
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs text-slate-500">{account.type}</p>
                  <b class="text-lg">{account.name}</b>
                </div>
                <div class="-mr-1 -mt-1 flex gap-1">
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
                class={
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
