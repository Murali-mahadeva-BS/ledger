import { useState, type ChangeEvent } from "react";
import { useStore } from "zustand";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { IconButton } from "../components/IconButton";
import { TrashIcon } from "../components/icons";
import {
  addCategory,
  data,
  deleteCategory,
  exportBackup,
  importBackup,
  resetData,
} from "../lib/store";
import { openModal } from "../lib/ui";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

function handleExport() {
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(new Blob([exportBackup()]));
  anchor.download = "ledger-backup.json";
  anchor.click();
}

function handleReset() {
  openModal(
    "Clear all data?",
    <ConfirmDialog
      message="This will permanently delete all accounts, entries, schedules and loans. This cannot be undone."
      confirmLabel="Clear data"
      onConfirm={resetData}
    />,
  );
}

function handleImport(e: ChangeEvent<HTMLInputElement>) {
  const input = e.currentTarget;
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
  const categories = useStore(data).categories;
  const [category, setCategory] = useState("");

  return (
    <div>
      <section className="rounded-2xl bg-white p-4">
        <h3 className="font-bold">Expense categories</h3>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addCategory(category);
            setCategory("");
          }}
        >
          <Input
            required
            value={category}
            onChange={(e) => setCategory(e.currentTarget.value)}
            className="h-11 min-w-0 flex-1 rounded-xl px-3"
            placeholder="New expense category"
          />
          <Button className="h-11 px-4">
            Add
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c} className="chip">
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
      <section className="mt-4 rounded-2xl bg-white p-4">
        <h3 className="font-bold">Your data</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button variant="secondary" onClick={handleExport}>
            Export JSON
          </Button>
          <label className="cursor-pointer rounded-xl bg-slate-100 py-2 text-center text-sm font-semibold">
            Import JSON
            <Input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImport}
            />
          </label>
        </div>
        <Button
          variant="destructive"
          className="mt-3 w-full rounded-xl bg-red-50 py-2 text-sm font-semibold text-red-700"
          onClick={handleReset}
        >
          Clear data
        </Button>
      </section>
    </div>
  );
}
