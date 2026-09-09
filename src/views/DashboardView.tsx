import { Card } from "../components/Card";
import { PartialEntryForm } from "../components/PartialEntryForm";
import { PeriodSelect } from "../components/PeriodSelect";
import { cash, formatDate, pct, today } from "../lib/format";
import {
  accountBalance,
  entryTitle,
  inSelectedPeriod,
  isPosted,
  signedAmount,
  totalBalance,
} from "../lib/selectors";
import { data, partialSettleEntry, postEntry } from "../lib/store";
import type { Entry } from "../lib/types";
import { closeModal, dashboardPeriod, openModal } from "../lib/ui";

const approveLabel = (kind: Entry["kind"]) =>
  kind === "income" ? "Credited" : "Debited";

function openPartialModal(entry: Entry) {
  openModal(
    "Partial " + approveLabel(entry.kind).toLowerCase(),
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

export function DashboardView(_props: { path?: string }) {
  const d = data.value;
  const period = dashboardPeriod.value;
  const entries = d.entries.filter((e) => inSelectedPeriod(e, period));
  const income = entries
    .filter((e) => isPosted(e) && e.kind === "income")
    .reduce((n, e) => n + e.amount, 0);
  const expenses = entries
    .filter((e) => isPosted(e) && e.kind === "expense")
    .reduce((n, e) => n + e.amount, 0);
  const investments = entries
    .filter((e) => isPosted(e) && e.kind === "investment")
    .reduce((n, e) => n + e.amount, 0);
  const future = d.entries
    .filter((e) => !isPosted(e) && e.date >= today())
    .reduce((n, e) => n + signedAmount(e), 0);
  const overdue = d.entries.filter((e) => !isPosted(e) && e.date < today());
  const lendingOverdue = d.lending.filter(
    (l) => !l.settled && l.returnDate < today(),
  );
  const loansOverdue = d.loans.filter(
    (l) => !l.settled && l.returnDate < today(),
  );
  const lendingOutstanding = d.lending
    .filter((l) => !l.settled)
    .reduce((n, l) => n + l.amount, 0);
  const loansOutstanding = d.loans
    .filter((l) => !l.settled)
    .reduce((n, l) => n + l.amount, 0);
  const expensePct =
    income > 0 ? pct((expenses / income) * 100) + " of income" : "";
  const investmentPct =
    income > 0 ? pct((investments / income) * 100) + " of income" : "";
  const total = totalBalance(d);
  const needsAttention =
    overdue.length > 0 || lendingOverdue.length > 0 || loansOverdue.length > 0;

  return (
    <div>
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 class="text-2xl font-bold">Overview</h2>
        <PeriodSelect
          data={d}
          value={period}
          onChange={(v) => (dashboardPeriod.value = v)}
        />
      </div>
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Card title="Total balance" value={cash(total)} color="text-teal-700" />
        <Card
          title="Forecast balance"
          value={cash(total + future)}
          color="text-slate-700"
        />
        <Card title="Income" value={cash(income)} color="text-emerald-600" />
        <Card
          title="Expenses"
          value={cash(expenses)}
          sub={expensePct}
          color="text-rose-600"
        />
        <Card
          title="Investments"
          value={cash(investments)}
          sub={investmentPct}
          color="text-violet-600"
        />
      </div>
      <h3 class="mb-2 mt-5 font-bold">Account balances</h3>
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {d.accounts.map((a) => {
          const bal = accountBalance(d, a.id);
          return (
            <Card
              key={a.id}
              title={a.name}
              value={cash(bal)}
              sub={a.type}
              color={bal < 0 ? "text-rose-600" : "text-teal-700"}
            />
          );
        })}
      </div>
      <h3 class="mb-2 mt-5 font-bold">Lending &amp; loans</h3>
      <div class="grid grid-cols-2 gap-3">
        <Card
          title="Lending outstanding"
          value={cash(lendingOutstanding)}
          color="text-emerald-600"
        />
        <Card
          title="Loans outstanding"
          value={cash(loansOutstanding)}
          color="text-rose-600"
        />
      </div>
      {needsAttention && (
        <section class="mt-5">
          <h3 class="mb-2 font-bold">Needs attention</h3>
          <div class="space-y-2">
            {overdue.map((e) => (
              <div
                key={e.id}
                class="flex justify-between rounded-xl border bg-white p-3"
              >
                <span>
                  <b>{entryTitle(e)}</b>
                  <small class="block text-slate-500">
                    Due {formatDate(e.date)} · {e.kind}
                  </small>
                </span>
                <span>
                  <button
                    class="rounded-lg bg-teal-50 px-2 text-xs font-semibold text-teal-700"
                    onClick={() => postEntry(e.id)}
                  >
                    {approveLabel(e.kind)}
                  </button>
                  <button
                    class="ml-1 text-xs font-semibold text-teal-700"
                    onClick={() => openPartialModal(e)}
                  >
                    Partial
                  </button>
                </span>
              </div>
            ))}
            {lendingOverdue.map((l) => (
              <div key={l.id} class="rounded-xl border bg-white p-3">
                <b>{l.person}</b> owes you {cash(l.amount)}
                <small class="block text-slate-500">
                  Return date was {formatDate(l.returnDate)}
                </small>
              </div>
            ))}
            {loansOverdue.map((l) => (
              <div key={l.id} class="rounded-xl border bg-white p-3">
                You owe <b>{l.person}</b> {cash(l.amount)}
                <small class="block text-slate-500">
                  Repayment was due {formatDate(l.returnDate)}
                </small>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
