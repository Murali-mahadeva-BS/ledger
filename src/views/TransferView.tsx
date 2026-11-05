import { useStore } from "zustand";
import { IconButton } from "../components/IconButton";
import { TransferForm } from "../components/TransferForm";
import { TrashIcon } from "../components/icons";
import { cash, formatDate } from "../lib/format";
import { accountName } from "../lib/selectors";
import { addTransfer, data, deleteEntry } from "../lib/store";
import { closeModal, openModal } from "../lib/ui";
import { Button } from "../components/ui/button";

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
  const d = useStore(data);
  const transfers = d.entries
    .filter((e) => e.kind === "transfer")
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button onClick={openTransferModal}>
          New transfer
        </Button>
      </div>
      <div className="mt-5 space-y-2">
        {transfers.length ? (
          transfers.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between rounded-xl bg-white p-3"
            >
              <span>
                <b>{accountName(d, e.fromAccount!)}</b> →{" "}
                <b>{accountName(d, e.toAccount!)}</b>
                <small className="block text-slate-500">{formatDate(e.date)}</small>
              </span>
              <span className="flex items-center gap-1">
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
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No transfers yet.
          </div>
        )}
      </div>
    </div>
  );
}
