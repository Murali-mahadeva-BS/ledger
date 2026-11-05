import { Link, useLocation } from "react-router-dom";
import { useStore } from "zustand";
import { NAV } from "../lib/nav";
import { uiStore } from "../lib/ui";
import { Button } from "./ui/button";

export function Drawer() {
  const isOpen = useStore(uiStore, (state) => state.drawerOpen);
  const setDrawerOpen = useStore(uiStore, (state) => state.setDrawerOpen);
  const { pathname } = useLocation();
  return (
    <>
      <div
        className={
          "fixed inset-0 z-30 bg-black/40" + (isOpen ? "" : " hidden")
        }
        onClick={() => setDrawerOpen(false)}
      />
      <aside
        className={
          "drawer fixed inset-y-0 left-0 z-40 w-[min(18rem,85vw)] bg-white p-4 shadow-2xl" +
          (isOpen ? " open" : "")
        }
      >
        <div className="mb-5 flex justify-between">
          <b className="text-xl text-teal-700">ledger</b>
          <Button
            variant="ghost"
            size="icon"
            className="text-2xl"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            ×
          </Button>
        </div>
        <nav className="space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={
                "block w-full rounded-xl px-3 py-2 text-left " +
                (pathname === item.path ? "active" : "")
              }
              onClick={() => setDrawerOpen(false)}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
