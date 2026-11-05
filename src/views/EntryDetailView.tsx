import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore } from "zustand";
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
import { Button } from "../components/ui/button";

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
  const d = useStore(data);
  const navigate = useNavigate();
  const entry = d.entries.find((e) => e.id === id);

  if (!entry) {
    return (
      <div>
        <Link to={backPath} className="text-sm font-semibold text-teal-700">
          ← Back
        </Link>
        <p className="mt-4 text-sm text-slate-500">This entry no longer exists.</p>
      </div>
    );
  }

  const plus = entry.kind === "income";
  const log = auditLogForEntry(d, entry.id);

  return (
    <div>
      <Link to={backPath} className="text-sm font-semibold text-teal-700">
        ← Back
      </Link>
      <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold">
              {entryTitle(entry)}
              {entry.recurringId && (
                <span title="Recurring monthly" className="ml-1 text-teal-600">
                  <RepeatIcon />
                </span>
              )}
            </h2>
            <small className="block text-slate-500">{formatDate(entry.date)}</small>
          </div>
          <b className={"whitespace-nowrap text-xl " + KIND_COLOR[kind]}>
            {plus ? "+" : "−"}
            {cash(entry.amount)}
          </b>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-500">Status</dt>
            <dd className="font-semibold">
              {isPosted(entry) ? "Posted" : "Pending"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Account</dt>
            <dd className="font-semibold">
              {accountName(d, entry.accountId ?? "")}
            </dd>
          </div>
          {entry.category && (
            <div>
              <dt className="text-slate-500">Category</dt>
              <dd className="font-semibold">{entry.category}</dd>
            </div>
          )}
          {entry.note && (
            <div className="col-span-2">
              <dt className="text-slate-500">Note</dt>
              <dd>{entry.note}</dd>
            </div>
          )}
        </dl>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {!isPosted(entry) && (
            <>
              <Button
                size="sm"
                className="rounded-xl bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700"
                onClick={() => postEntry(entry.id)}
              >
                {approveLabel(kind)}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-teal-700"
                onClick={() => openPartialModal(entry)}
              >
                Partial
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700"
            onClick={() => openFlowModal(kind, entry)}
          >
            <PencilIcon /> Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold"
            onClick={() => {
              handleDelete(entry);
              if (!data.getState().entries.some((e) => e.id === entry.id)) {
                navigate(backPath);
              }
            }}
          >
            <TrashIcon /> Delete
          </Button>
        </div>
      </div>

      <section className="mt-5">
        <h3 className="mb-2 font-bold">Logs</h3>
        {log.length ? (
          <ul className="space-y-2">
            {log.map((item) => (
              <li key={item.id} className="rounded-2xl bg-white p-3 text-sm shadow-sm">
                <b>{item.action}</b>
                {item.detail && (
                  <span className="text-slate-500"> — {item.detail}</span>
                )}
                <small className="block text-slate-500">
                  {new Date(item.timestamp).toLocaleString("en-IN")}
                </small>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No activity recorded yet.
          </div>
        )}
      </section>
    </div>
  );
}

export function IncomeEntryDetailView(_props: { path?: string }) {
  const { id } = useParams();
  return <EntryDetail kind="income" id={id ?? ""} backPath="/income" />;
}
