import { FlowForm, type FlowFormResult } from "../components/FlowForm";
import { Card } from "../components/Card";
import { IconButton } from "../components/IconButton";
import { PartialEntryForm } from "../components/PartialEntryForm";
import { PeriodSelect } from "../components/PeriodSelect";
import { PencilIcon, RepeatIcon, TrashIcon } from "../components/icons";
import { cash, formatDate } from "../lib/format";
import { entryTitle, inSelectedPeriod, isPosted } from "../lib/selectors";
import {
  addOneTimeEntry,
  addRecurringSchedule,
  convertEntryToRecurring,
  data,
  deleteEntry,
  deleteRecurringSchedule,
  partialSettleEntry,
  postEntry,
  unpostEntry,
  updateOneTimeEntry,
} from "../lib/store";
import type { Entry, EntryKind } from "../lib/types";
import { closeModal, openModal, tabPeriods } from "../lib/ui";

type FlowKind = Exclude<EntryKind, "transfer">;

const KIND_COLOR: Record<FlowKind, string> = {
  income: "text-emerald-600",
  expense: "text-rose-600",
  investment: "text-violet-600",
};

const approveLabel = (kind: FlowKind) =>
  kind === "income" ? "Credited" : "Debited";

function handleFlowSubmit(
  kind: FlowKind,
  entry: Entry | undefined,
  result: FlowFormResult,
) {
  if (result.recurring) {
    const input = {
      kind,
      title: result.title,
      amount: result.amount,
      day: result.day,
      startMonth: result.startMonth,
      accountId: result.accountId,
      category: result.category,
      note: result.note,
      manual: result.manual,
    };
    if (entry) convertEntryToRecurring(entry.id, input);
    else addRecurringSchedule(input);
  } else {
    const input = {
      kind,
      title: result.title,
      amount: result.amount,
      date: result.date,
      accountId: result.accountId,
      category: result.category,
      note: result.note,
      manual: result.manual,
    };
    if (entry) updateOneTimeEntry(entry.id, input);
    else addOneTimeEntry(input);
  }
  closeModal();
}

function openFlowModal(kind: FlowKind, entry?: Entry) {
  openModal(
    (entry ? "Edit " : "Add ") + kind,
    <FlowForm
      kind={kind}
      entry={entry}
      onSubmit={(result) => handleFlowSubmit(kind, entry, result)}
    />,
  );
}

function openPartialModal(entry: Entry) {
  openModal(
    "Partial " + approveLabel(entry.kind as FlowKind).toLowerCase(),
    <PartialEntryForm
      entry={entry}
      onSubmit={(amount) => {
        try {
          partialSettleEntry(entry.id, amount);
          closeModal();
        } catch (err) {
          alert((err as Error).message);
        }
      }}
    />,
  );
}

function handleDelete(entry: Entry) {
  if (entry.recurringId) {
    if (
      !confirm(
        "This is part of a recurring schedule. Delete the whole schedule and every entry it created?",
      )
    )
      return;
    deleteRecurringSchedule(entry.recurringId);
  } else {
    deleteEntry(entry.id);
  }
}

function EntryRow({ entry }: { entry: Entry }) {
  const plus = entry.kind === "income";
  const kind = entry.kind as FlowKind;
  return (
    <div class="grid min-w-0 grid-cols-1 gap-2 rounded-2xl bg-white p-3 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div class="min-w-0">
        <b class="block truncate">
          {entryTitle(entry)}
          {entry.recurringId && (
            <span title="Recurring monthly" class="text-teal-600">
              {" "}
              <RepeatIcon />
            </span>
          )}
        </b>
        <small class="block text-slate-500">{formatDate(entry.date)}</small>
      </div>
      <div class="flex min-w-0 flex-wrap items-center justify-end gap-1 sm:justify-end">
        <b class={"mr-1 " + KIND_COLOR[kind]}>
          {plus ? "+" : "−"}
          {cash(entry.amount)}
        </b>
        {!isPosted(entry) ? (
          <>
            <button
              class="rounded-lg bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700"
              onClick={() => postEntry(entry.id)}
            >
              {approveLabel(kind)}
            </button>
            <button
              class="px-2 py-1 text-xs font-semibold text-teal-700"
              onClick={() => openPartialModal(entry)}
            >
              Partial
            </button>
          </>
        ) : (
          <button
            class="px-2 py-1 text-xs font-semibold text-slate-500"
            onClick={() => unpostEntry(entry.id)}
          >
            Undo
          </button>
        )}
        <IconButton label="Edit" onClick={() => openFlowModal(kind, entry)}>
          <PencilIcon />
        </IconButton>
        <IconButton label="Delete" danger onClick={() => handleDelete(entry)}>
          <TrashIcon />
        </IconButton>
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div class="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function TransactionsView({
  kind,
  heading,
}: {
  kind: FlowKind;
  heading: string;
}) {
  const d = data.value;
  const period = tabPeriods.value[kind];
  const scoped = d.entries.filter(
    (e) => e.kind === kind && inSelectedPeriod(e, period),
  );
  const totalPosted = scoped.filter(isPosted).reduce((n, e) => n + e.amount, 0);
  const recurring = scoped
    .filter((e) => e.recurringId)
    .sort((a, b) => b.date.localeCompare(a.date));
  const oneTime = scoped
    .filter((e) => !e.recurringId)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          <h2 class="text-2xl font-bold">{heading}</h2>
          <PeriodSelect
            data={d}
            value={period}
            onChange={(v) =>
              (tabPeriods.value = { ...tabPeriods.value, [kind]: v })
            }
          />
        </div>
        <button
          class="w-full rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white sm:w-auto"
          onClick={() => openFlowModal(kind)}
        >
          Add {kind}
        </button>
      </div>
      <div class="mt-3">
        <Card
          title="Total for period"
          value={cash(totalPosted)}
          color={KIND_COLOR[kind]}
        />
      </div>
      <section class="mt-5">
        <h3 class="mb-2 font-bold">Recurring</h3>
        {recurring.length ? (
          <div class="space-y-2">
            {recurring.map((e) => (
              <EntryRow key={e.id} entry={e} />
            ))}
          </div>
        ) : (
          <Empty text={"No recurring " + kind + " this period."} />
        )}
      </section>
      <section class="mt-5">
        <h3 class="mb-2 font-bold">One-time</h3>
        {oneTime.length ? (
          <div class="space-y-2">
            {oneTime.map((e) => (
              <EntryRow key={e.id} entry={e} />
            ))}
          </div>
        ) : (
          <Empty text={"No one-time " + kind + " this period."} />
        )}
      </section>
    </div>
  );
}

export function IncomeView(_props: { path?: string }) {
  return <TransactionsView kind="income" heading="Income" />;
}

export function ExpenseView(_props: { path?: string }) {
  return <TransactionsView kind="expense" heading="Expenses" />;
}

export function InvestmentView(_props: { path?: string }) {
  return <TransactionsView kind="investment" heading="Investments" />;
}
