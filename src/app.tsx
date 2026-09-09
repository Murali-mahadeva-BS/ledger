import { Router } from "preact-iso";
import { Drawer } from "./components/Drawer";
import { Header } from "./components/Header";
import { ModalHost } from "./components/ModalHost";
import { AccountsView } from "./views/AccountsView";
import { CalendarView } from "./views/CalendarView";
import { DashboardView } from "./views/DashboardView";
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
      <main class="mx-auto w-full max-w-6xl px-3 pb-10 pt-3 sm:px-4 sm:pb-12 sm:pt-4">
        <Router>
          <DashboardView path="/" />
          <IncomeView path="/income" />
          <ExpenseView path="/expense" />
          <InvestmentView path="/investment" />
          <TransferView path="/transfer" />
          <CalendarView path="/calendar" />
          <LendingView path="/lending" />
          <LoanView path="/loan" />
          <AccountsView path="/accounts" />
          <SettingsView path="/settings" />
          <PlaceholderView default label="Not found" />
        </Router>
      </main>
      <Drawer />
      <ModalHost />
    </>
  );
}
