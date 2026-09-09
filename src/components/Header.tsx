import { useLocation } from "preact-iso";
import { NAV } from "../lib/nav";
import { drawerOpen } from "../lib/ui";

export function Header() {
  const { path } = useLocation();
  const current = NAV.find((item) => item.path === path);
  return (
    <header class="sticky top-0 z-20 flex justify-between border-b bg-white/95 px-3 py-3 backdrop-blur sm:px-4">
      <div class="flex gap-3">
        <button
          class="rounded-xl px-2 text-xl"
          onClick={() => (drawerOpen.value = true)}
          aria-label="Open menu"
        >
          ☰
        </button>
        <div>
          <h1 class="font-bold text-teal-700">ledger</h1>
          <p class="text-xs text-slate-500">{current?.label ?? ""}</p>
        </div>
      </div>
    </header>
  );
}
