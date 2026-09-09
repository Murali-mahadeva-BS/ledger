# Ledger — Project Guidelines

Personal finance tracker (income/expense/investment/transfers/lending/loans/calendar), mobile-first PWA.

## Architecture

- Stack: Preact + TypeScript + Vite + Tailwind v4 + `@preact/signals` + `preact-iso` router + `vite-plugin-pwa`.
- `src/lib/` — framework-agnostic core, no JSX:
  - `types.ts` — data model (`Account`, `Entry`, `RecurringSchedule`, `LendBorrowRecord`, `LedgerData`).
  - `storage.ts` — localStorage load/save. Storage key is `"ledger-v2"` — **never change this** without a migration, or existing users lose their data.
  - `store.ts` — single `data` signal holding `LedgerData`, plus every mutating action (`addOneTimeEntry`, `postEntry`, `addTransfer`, `deleteAccount`, `importBackup`, etc.). All state changes go through these actions, never mutate `data.value` directly from a view.
  - `selectors.ts` — pure read-only queries (`accountBalance`, `signedAmount`, `inSelectedPeriod`, ...).
  - `recurring.ts` — `reconcileRecurring()` materializes due recurring schedules into real entries; runs once on load in `store.ts`.
  - `ui.ts` — ephemeral UI-only signals: `drawerOpen`, `modal` (+ `openModal`/`closeModal`), `dashboardPeriod`, `tabPeriods`, `calendarMonth`.
  - `nav.ts` — `NAV` array is the single source of truth for routes/labels/icons (drawer nav + header subtitle + `app.tsx` routes are all driven from or kept in sync with it).
- `src/components/` — shared, reusable UI (forms, icon button, cards, period/month selects). Views compose these.
- `src/views/` — one file per route, wired into `preact-iso`'s `<Router>` in `app.tsx`. Some export multiple thin wrapper components sharing one generic implementation (see `TransactionsView.tsx` → `IncomeView`/`ExpenseView`/`InvestmentView`, `LendBorrowView.tsx` → `LendingView`/`LoanView`).

## Conventions

- **Validation lives in the lib layer, confirmation lives in the UI.** Store actions `throw new Error("message")` for invalid input (e.g. deleting the last account, transferring to the same account); views `try/catch` and `alert()` the message. Destructive actions (delete account/entry/schedule) call `confirm()` in the view _before_ invoking the action — the lib never calls `confirm`/`alert` itself.
- Preact Signals auto-subscribe on `.value` reads inside a component body — no `useComputed`/HOC needed. Mutate state only via `src/lib/store.ts` actions, which reassign `data.value` to trigger re-renders.
- `preact-iso` has no `Link` component — plain `<a href="/path">` works since `LocationProvider` intercepts same-origin clicks globally.
- Tailwind is compiled via `@tailwindcss/vite` (no CDN). Custom non-utility classes (`.modal`, `.drawer`, `.field`, `.chip`, `.icon-btn`, `.pending-*`) live in `src/index.css`.
- Mobile-first: base styles target small screens, `sm:`/`lg:` breakpoints layer on larger layouts.

## Build and Test

- `npm run dev` — Vite dev server.
- `npm run build` — `tsc -b && vite build` (also generates the PWA manifest + service worker via `vite-plugin-pwa`).
- `npm test` — `vitest run`; tests live in `src/lib/__tests__/` and cover balance math + recurring reconciliation.

## History

This app was migrated from a single-file vanilla JS/HTML app to Preact. See `docs/MIGRATION.md` for the full step-by-step history and rationale if you need context on why something is structured the way it is.
