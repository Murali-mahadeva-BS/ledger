import { useLocation } from "preact-iso";
import { NAV } from "../lib/nav";
import { drawerOpen } from "../lib/ui";

export function Drawer() {
  const { path } = useLocation();
  return (
    <>
      <div
        class={
          "fixed inset-0 z-30 bg-black/40" + (drawerOpen.value ? "" : " hidden")
        }
        onClick={() => (drawerOpen.value = false)}
      />
      <aside
        class={
          "drawer fixed inset-y-0 left-0 z-40 w-[min(18rem,85vw)] bg-white p-4 shadow-2xl" +
          (drawerOpen.value ? " open" : "")
        }
      >
        <div class="mb-5 flex justify-between">
          <b class="text-xl text-teal-700">ledger</b>
          <button
            class="text-2xl"
            onClick={() => (drawerOpen.value = false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <nav class="space-y-1">
          {NAV.map((item) => (
            <a
              key={item.path}
              href={item.path}
              class={
                "block w-full rounded-xl px-3 py-2 text-left " +
                (path === item.path ? "active" : "")
              }
              onClick={() => (drawerOpen.value = false)}
            >
              <span class="mr-3">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}
