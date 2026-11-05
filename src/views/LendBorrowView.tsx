import { useStore } from "zustand";
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
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

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
  const items = useStore(data)[list];
  const settledLabel = isLend ? "Received" : "Repaid";
  const settleLabel = isLend ? "Mark received" : "Mark repaid";
  const verb = isLend ? " owes you " : "You owe ";

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button onClick={() => openAddModal(list)}>
          {isLend ? "Record lending" : "Record loan"}
        </Button>
      </div>
      <div className="mt-5 space-y-2">
        {items.length ? (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl bg-white p-3"
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
                <small className="block text-slate-500">
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
              <span className="flex items-center gap-1">
                {!isLend && <b>{cash(item.amount)}</b>}
                {item.settled ? (
                  <Badge variant="secondary" className="text-teal-700">{settledLabel}</Badge>
                ) : (
                  <>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-xs text-teal-700"
                      onClick={() => settleLendBorrow(list, item.id)}
                    >
                      {settleLabel}
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-xs text-teal-700"
                      onClick={() => openPartialModal(list, item)}
                    >
                      Partial
                    </Button>
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
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
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
