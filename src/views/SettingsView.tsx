import { useState } from "preact/hooks";
import { IconButton } from "../components/IconButton";
import { TrashIcon } from "../components/icons";
import {
  addCategory,
  data,
  deleteCategory,
  exportBackup,
  importBackup,
} from "../lib/store";

function handleExport() {
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(new Blob([exportBackup()]));
  anchor.download = "ledger-backup.json";
  anchor.click();
}

function handleImport(e: Event) {
  const input = e.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      if (!confirm("Replace all data?")) return;
      importBackup(String(reader.result));
    } catch {
      alert("Invalid backup");
    }
  };
  reader.readAsText(file);
  input.value = "";
}

export function SettingsView(_props: { path?: string }) {
  const [category, setCategory] = useState("");
  const categories = data.value.categories;

  return (
    <div>
      <h2 class="text-2xl font-bold">Settings</h2>
      <section class="mt-5 rounded-2xl bg-white p-4">
        <h3 class="font-bold">Expense categories</h3>
        <form
          class="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addCategory(category);
            setCategory("");
          }}
        >
          <input
            required
            value={category}
            onInput={(e) => setCategory(e.currentTarget.value)}
            class="h-11 min-w-0 flex-1 rounded-xl border px-3"
            placeholder="New expense category"
          />
          <button class="h-11 rounded-xl bg-teal-600 px-4 text-white">
            Add
          </button>
        </form>
        <div class="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c} class="chip">
              {c}
              <IconButton
                label="Remove"
                danger
                onClick={() => deleteCategory(c)}
              >
                <TrashIcon />
              </IconButton>
            </span>
          ))}
        </div>
      </section>
      <section class="mt-4 rounded-2xl bg-white p-4">
        <h3 class="font-bold">Your data</h3>
        <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            class="rounded-xl bg-slate-100 py-2 text-sm font-semibold"
            onClick={handleExport}
          >
            Export JSON
          </button>
          <label class="cursor-pointer rounded-xl bg-slate-100 py-2 text-center text-sm font-semibold">
            Import JSON
            <input
              type="file"
              accept="application/json"
              class="hidden"
              onChange={handleImport}
            />
          </label>
        </div>
      </section>
    </div>
  );
}
