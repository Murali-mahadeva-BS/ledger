import { useLocation, useRoute } from "preact-iso";
import { PencilIcon, RepeatIcon, TrashIcon } from "../components/icons";
import { cash, formatDate } from "../lib/format";
import {
  accountName,
  auditLogForEntry,
  entryTitle,
  isPosted,
} from "../lib/selectors";
import { data, postEntry } from "../lib/store";
import type { EntryKind } from "../lib/types";
import {
  KIND_COLOR,
  approveLabel,
  handleDelete,
  openFlowModal,
  openPartialModal,
} from "./TransactionsView";

type FlowKind = Exclude<EntryKind, "transfer">;

function EntryDetail({
  kind,
  id,
  backPath,
}: {
  kind: FlowKind;
  id: string;
  backPath: string;
}) {
  const { route } = useLocation();
  const d = data.value;
  const entry = d.entries.find((e) => e.id === id);

  if (!entry) {
    return (
      <div>
        <a href={backPath} class="text-sm font-semibold text-teal-700">
          ← Back
        </a>
        <p class="mt-4 text-sm text-slate-500">This entry no longer exists.</p>
      </div>
    );
  }

  const plus = entry.kind === "income";
  const log = auditLogForEntry(d, entry.id);

  return (
    <div>
      <a href={backPath} class="text-sm font-semibold text-teal-700">
        ← Back
      </a>
      <div class="mt-3 rounded-2xl bg-white p-4 shadow-sm">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <h2 class="truncate text-xl font-bold">
              {entryTitle(entry)}
              {entry.recurringId && (
                <span title="Recurring monthly" class="ml-1 text-teal-600">
                  <RepeatIcon />
                </span>
              )}
            </h2>
            <small class="block text-slate-500">{formatDate(entry.date)}</small>
          </div>
          <b class={"whitespace-nowrap text-xl " + KIND_COLOR[kind]}>
            {plus ? "+" : "−"}
            {cash(entry.amount)}
          </b>
        </div>
        <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt class="text-slate-500">Status</dt>
            <dd class="font-semibold">
              {isPosted(entry) ? "Posted" : "Pending"}
            </dd>
          </div>
          <div>
            <dt class="text-slate-500">Account</dt>
            <dd class="font-semibold">
              {accountName(d, entry.accountId ?? "")}
            </dd>
          </div>
          {entry.category && (
            <div>
              <dt class="text-slate-500">Category</dt>
              <dd class="font-semibold">{entry.category}</dd>
            </div>
          )}
          {entry.note && (
            <div class="col-span-2">
              <dt class="text-slate-500">Note</dt>
              <dd>{entry.note}</dd>
            </div>
          )}
        </dl>
        <div class="mt-4 flex flex-wrap items-center gap-2">
          {!isPosted(entry) && (
            <>
              <button
                class="rounded-xl bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700"
                onClick={() => postEntry(entry.id)}
              >
                {approveLabel(kind)}
              </button>
              <button
                class="rounded-xl border px-3 py-2 text-sm font-semibold text-teal-700"
                onClick={() => openPartialModal(entry)}
              >
                Partial
              </button>
            </>
          )}
          <button
            class="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold text-slate-700"
            onClick={() => openFlowModal(kind, entry)}
          >
            <PencilIcon /> Edit
          </button>
          <button
            class="flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600"
            onClick={() => {
              handleDelete(entry);
              if (!data.value.entries.some((e) => e.id === entry.id)) {
                route(backPath);
              }
            }}
          >
            <TrashIcon /> Delete
          </button>
        </div>
      </div>

      <section class="mt-5">
        <h3 class="mb-2 font-bold">Logs</h3>
        {log.length ? (
          <ul class="space-y-2">
            {log.map((item) => (
              <li
                key={item.id}
                class="rounded-2xl bg-white p-3 text-sm shadow-sm"
              >
                <b>{item.action}</b>
                {item.detail && (
                  <span class="text-slate-500"> — {item.detail}</span>
                )}
                <small class="block text-slate-500">
                  {new Date(item.timestamp).toLocaleString("en-IN")}
                </small>
              </li>
            ))}
          </ul>
        ) : (
          <div class="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No activity recorded yet.
          </div>
        )}
      </section>
    </div>
  );
}

export function IncomeEntryDetailView(_props: { path?: string }) {
  const { params } = useRoute();
  return <EntryDetail kind="income" id={params.id} backPath="/income" />;
}
