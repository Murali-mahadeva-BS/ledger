import { useLocation } from "react-router-dom";
import { useStore } from "zustand";
import { NAV } from "../lib/nav";
import { uiStore } from "../lib/ui";
import { Button } from "./ui/button";

export function Header() {
  const setDrawerOpen = useStore(uiStore, (state) => state.setDrawerOpen);
  const { pathname } = useLocation();
  const current = NAV.find((item) => item.path === pathname);
  return (
    <header className="sticky top-0 z-20 flex justify-between border-b bg-white/95 px-3 py-3 backdrop-blur sm:px-4">
      <div className="flex gap-3">
        <Button
          variant="ghost"
          className="rounded-xl px-2 text-xl"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </Button>
        <div>
          <h1 className="font-bold text-teal-700">ledger</h1>
          <p className="text-xs text-slate-500">{current?.label ?? ""}</p>
        </div>
      </div>
    </header>
  );
}
