import { IconButton } from "../components/IconButton";
import { TransferForm } from "../components/TransferForm";
import { TrashIcon } from "../components/icons";
import { cash, formatDate } from "../lib/format";
import { accountName } from "../lib/selectors";
import { addTransfer, data, deleteEntry } from "../lib/store";
import { closeModal, openModal } from "../lib/ui";

function openTransferModal() {
  openModal(
    "New transfer",
    <TransferForm
      onSubmit={(input) => {
        try {
          addTransfer(input);
          closeModal();
        } catch (err) {
          alert((err as Error).message);
        }
      }}
    />,
  );
}

export function TransferView(_props: { path?: string }) {
  const d = data.value;
  const transfers = d.entries
    .filter((e) => e.kind === "transfer")
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-2xl font-bold">Transfers</h2>
        <button
          class="rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white"
          onClick={openTransferModal}
        >
          New transfer
        </button>
      </div>
      <div class="mt-5 space-y-2">
        {transfers.length ? (
          transfers.map((e) => (
            <div
              key={e.id}
              class="flex items-center justify-between rounded-xl bg-white p-3"
            >
              <span>
                <b>{accountName(d, e.fromAccount!)}</b> →{" "}
                <b>{accountName(d, e.toAccount!)}</b>
                <small class="block text-slate-500">{formatDate(e.date)}</small>
              </span>
              <span class="flex items-center gap-1">
                <b>{cash(e.amount)}</b>
                <IconButton
                  label="Delete"
                  danger
                  onClick={() => deleteEntry(e.id)}
                >
                  <TrashIcon />
                </IconButton>
              </span>
            </div>
          ))
        ) : (
          <div class="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No transfers yet.
          </div>
        )}
      </div>
    </div>
  );
}
