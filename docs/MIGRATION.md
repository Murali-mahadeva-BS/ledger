# Migration history: vanilla HTML/JS → Preact

Original app: a single-file vanilla JS PWA (`main.html`, ~1421 lines, localStorage key `"ledger-v2"`, Tailwind via CDN). Migrated section-by-section to Preact + Vite + TypeScript + Tailwind + `@preact/signals` + `preact-iso`, then cut over — the legacy `main.html`, `manifest.webmanifest`, `service-worker.js`, and root `icon.svg` were removed once the new app reached full parity.

The `"ledger-v2"` localStorage key was kept unchanged throughout so existing users' data carries over automatically — this must not change without a data migration.

## Steps taken

1. **Scaffold**: Vite + Preact + TS (`preact-ts` template), Tailwind v4 via `@tailwindcss/vite`, `vite-plugin-pwa` configured with the original manifest fields, custom CSS (drawer/modal/pending-\*/field/chip/icon-btn) ported into `src/index.css`.
2. **Core lib layer** (`src/lib/`): `types.ts`, `format.ts`, `id.ts`, `storage.ts`, `selectors.ts`, `recurring.ts`, `store.ts`. A single `data` signal holds `LedgerData`; every mutation goes through an exported action function. Actions `throw Error()` for validation failures — `confirm()`/`alert()` dialogs stay in the UI layer, not the lib. Added `vitest` with tests for balance math and recurring reconciliation edge cases (auto-post timing, manual schedules, idempotency).
3. **Layout shell**: `preact-iso` router (`LocationProvider` in `main.tsx`, `Router` in `app.tsx`), `Header`, `Drawer` (`drawerOpen` signal), `ModalHost` (`modal` signal + `openModal`/`closeModal` in `lib/ui.ts`), `lib/nav.ts` as the single source of truth for routes/labels/icons. All 10 routes initially pointed at a shared `PlaceholderView` stub, replaced one-by-one in later steps. `preact-iso` has no `Link` component — plain `<a href>` works since `LocationProvider` intercepts same-origin clicks globally.
4. **Accounts view**: simplest CRUD, first real view — validated the modal + store wiring end-to-end. Added `IconButton`, `icons.tsx` (Pencil/Trash/Repeat SVGs ported from the original inline SVGs), `AccountForm`.
5. **Settings view**: expense category chips, export (`Blob` download of `exportBackup()`) and import (`FileReader` + `confirm("Replace all data?")` + `importBackup()`, invalid JSON caught and alerted).
6. **Dashboard view**: overview cards, account balances, lending/loans outstanding, "needs attention" (overdue pending entries + overdue lending/loans). Added `Card`, `PeriodSelect` (drives a new `dashboardPeriod` signal, format `"month:YYYY-MM"`, options built from `monthsWithEntries()`), `PartialEntryForm` (reused in Step 7).
7. **Transactions view** (Income/Expense/Investment): the most complex step. `FlowForm` handles add/edit with a one-time vs. recurring-monthly toggle; editing an entry that's already tied to a recurring schedule locks the form to date-only edits (matches the original — you can convert one-time → recurring, but not back). One generic `TransactionsView` internal component is wrapped by three thin exported components (`IncomeView`/`ExpenseView`/`InvestmentView`). Added a `tabPeriods` signal (per-kind period). Deleting an entry tied to a recurring schedule confirms, then deletes the whole schedule; otherwise deletes just that entry.
8. **Transfer view**: list + add/delete. No recurring concept, so delete has no confirm step (matches original).
9. **Calendar view**: month grid, `calendarMonth` signal (plain `"YYYY-MM"`, unlike the `"month:"`-prefixed period signals — intentional, matches the original's different state shape). Entries colored by kind/status using the ported `pending-*` CSS gradient classes and Tailwind background-color utilities.
10. **Lending/Loans views**: one generic `LendBorrowView` shared by both `LendingView` and `LoanView` (mirrors the original's shared function for both directions), with add and partial-settle forms.
11. **Cutover**: full verification (`tsc -b`, `vitest run`, `vite build`) all clean, then removed the legacy vanilla app files.

## Not yet done (future, separate efforts)

- **Charts** — likely Chart.js (no React-only wrapper needed since this is Preact).
- **API integration** — no backend yet; all state is local (`localStorage`).

## Notes for future contributors

- Original nav/route order: dashboard, income, expense, investment, transfer, calendar, lending, loan, accounts, settings — preserved in `src/lib/nav.ts`.
- If you need historical rationale for a specific decision not covered above, it's likely because the original app did it that way and parity was preserved intentionally rather than "improved" mid-migration.
