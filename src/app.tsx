import { Route, Routes } from "react-router-dom";
import { Drawer } from "./components/Drawer";
import { Header } from "./components/Header";
import { ModalHost } from "./components/ModalHost";
import { AccountsView } from "./views/AccountsView";
import { CalendarView } from "./views/CalendarView";
import { DashboardView } from "./views/DashboardView";
import { IncomeEntryDetailView } from "./views/EntryDetailView";
import { LendingView, LoanView } from "./views/LendBorrowView";
import { PlaceholderView } from "./views/PlaceholderView";
import { SettingsView } from "./views/SettingsView";
import {
  ExpenseView,
  IncomeView,
  InvestmentView,
} from "./views/TransactionsView";
import { TransferView } from "./views/TransferView";

export function App() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl px-3 pb-10 pt-3 sm:px-4 sm:pb-12 sm:pt-4">
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/income" element={<IncomeView />} />
          <Route path="/income/:id" element={<IncomeEntryDetailView />} />
          <Route path="/expense" element={<ExpenseView />} />
          <Route path="/investment" element={<InvestmentView />} />
          <Route path="/transfer" element={<TransferView />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/lending" element={<LendingView />} />
          <Route path="/loan" element={<LoanView />} />
          <Route path="/accounts" element={<AccountsView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="*" element={<PlaceholderView label="Not found" />} />
        </Routes>
      </main>
      <Drawer />
      <ModalHost />
    </>
  );
}
