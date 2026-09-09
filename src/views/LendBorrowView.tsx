import { IconButton } from "../components/IconButton";
import { LendBorrowForm } from "../components/LendBorrowForm";
import { PartialLendBorrowForm } from "../components/PartialLendBorrowForm";
import { TrashIcon } from "../components/icons";
import { cash, formatDate } from "../lib/format";
import {
  addLendBorrow,
  data,
  deleteLendBorrow,
  partialSettleLendBorrow,
  settleLendBorrow,
} from "../lib/store";
import type { LendBorrowRecord } from "../lib/types";
import { closeModal, openModal } from "../lib/ui";

type LendBorrowList = "lending" | "loans";

function openAddModal(list: LendBorrowList) {
  const isLend = list === "lending";
  openModal(
    isLend ? "Record lending" : "Record loan",
    <LendBorrowForm
      isLend={isLend}
      onSubmit={(input) => {
        addLendBorrow(list, input);
        closeModal();
      }}
    />,
  );
}

function openPartialModal(list: LendBorrowList, item: LendBorrowRecord) {
  openModal(
    "Partial payment",
    <PartialLendBorrowForm
      item={item}
      which={list}
      onSubmit={(amount) => {
        try {
          partialSettleLendBorrow(list, item.id, amount);
          closeModal();
        } catch (err) {
          alert((err as Error).message);
        }
      }}
    />,
  );
}

function LendBorrowView({
  list,
  heading,
}: {
  list: LendBorrowList;
  heading: string;
}) {
  const isLend = list === "lending";
  const items = data.value[list];
  const settledLabel = isLend ? "Received" : "Repaid";
  const settleLabel = isLend ? "Mark received" : "Mark repaid";
  const verb = isLend ? " owes you " : "You owe ";

  return (
    <div>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-2xl font-bold">{heading}</h2>
        <button
          class="rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white"
          onClick={() => openAddModal(list)}
        >
          {isLend ? "Record lending" : "Record loan"}
        </button>
      </div>
      <div class="mt-5 space-y-2">
        {items.length ? (
          items.map((item) => (
            <div
              key={item.id}
              class="flex items-center justify-between rounded-xl bg-white p-3"
            >
              <span>
                {isLend ? (
                  <>
                    <b>{item.person}</b>
                    {verb}
                    {cash(item.amount)}
                  </>
                ) : (
                  <>
                    {verb}
                    <b>{item.person}</b>
                  </>
                )}
                <small class="block text-slate-500">
                  {isLend ? "Lent " : "Borrowed "}
                  {formatDate(item.date)} · {isLend ? "return " : "repay by "}
                  {formatDate(item.returnDate)}
                  {item.originalAmount &&
                  item.originalAmount !== item.amount &&
                  !item.settled
                    ? " · of " + cash(item.originalAmount) + " total"
                    : ""}
                </small>
              </span>
              <span class="flex items-center gap-1">
                {!isLend && <b>{cash(item.amount)}</b>}
                {item.settled ? (
                  <span class="text-xs text-teal-700">{settledLabel}</span>
                ) : (
                  <>
                    <button
                      class="text-xs text-teal-700"
                      onClick={() => settleLendBorrow(list, item.id)}
                    >
                      {settleLabel}
                    </button>
                    <button
                      class="text-xs text-teal-700"
                      onClick={() => openPartialModal(list, item)}
                    >
                      Partial
                    </button>
                  </>
                )}
                <IconButton
                  label="Delete"
                  danger
                  onClick={() => deleteLendBorrow(list, item.id)}
                >
                  <TrashIcon />
                </IconButton>
              </span>
            </div>
          ))
        ) : (
          <div class="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No {heading.toLowerCase()} recorded.
          </div>
        )}
      </div>
    </div>
  );
}

export function LendingView(_props: { path?: string }) {
  return <LendBorrowView list="lending" heading="Lending" />;
}

export function LoanView(_props: { path?: string }) {
  return <LendBorrowView list="loans" heading="Loans" />;
}
