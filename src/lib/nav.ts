export interface NavItem {
  path: string;
  icon: string;
  label: string;
}

export const NAV: NavItem[] = [
  { path: "/", icon: "⌂", label: "Dashboard" },
  { path: "/income", icon: "↓", label: "Income" },
  { path: "/expense", icon: "↑", label: "Expenses" },
  { path: "/investment", icon: "◈", label: "Investments" },
  { path: "/transfer", icon: "⇄", label: "Transfers" },
  { path: "/calendar", icon: "□", label: "Calendar" },
  { path: "/lending", icon: "↗", label: "Lending" },
  { path: "/loan", icon: "↙", label: "Loans" },
  { path: "/accounts", icon: "▣", label: "Accounts" },
  { path: "/settings", icon: "⚙", label: "Settings" },
];
