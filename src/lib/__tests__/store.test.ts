import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => ({
  saveData: vi.fn(),
}));

vi.mock("../storage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../storage")>();
  return {
    ...actual,
    loadData: () => actual.defaultData(),
    saveData: storage.saveData,
  };
});

import {
  addOneTimeEntry,
  addTransfer,
  data,
  deleteAccount,
  exportBackup,
  importBackup,
  partialSettleEntry,
  postEntry,
  resetData,
  unpostEntry,
} from "../store";
import { defaultData, saveData } from "../storage";
import type { Entry } from "../types";

const entryInput = {
  kind: "income" as const,
  title: "Pay",
  amount: 1200,
  date: "2026-03-01",
  accountId: "bank",
};

describe("ledger store actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    data.setState(defaultData());
  });

  it("adds a manual entry as pending and persists the new state", () => {
    const listener = vi.fn();
    const unsubscribe = data.subscribe(listener);

    addOneTimeEntry({ ...entryInput, manual: true });

    expect(data.getState().entries).toHaveLength(1);
    expect(data.getState().entries[0]).toMatchObject({
      ...entryInput,
      status: "pending",
    });
    expect(data.getState().auditLog[0]).toMatchObject({
      entryId: data.getState().entries[0].id,
      action: "Created",
    });
    expect(listener).toHaveBeenCalledOnce();
    expect(saveData).toHaveBeenCalledWith(data.getState());

    unsubscribe();
  });

  it("adds an entry without manual approval as posted", () => {
    addOneTimeEntry({ ...entryInput, manual: false });

    expect(data.getState().entries[0].status).toBe("posted");
  });

  it("posts and reverts an entry while recording both actions", () => {
    addOneTimeEntry({ ...entryInput, manual: true });
    const entryId = data.getState().entries[0].id;

    postEntry(entryId);
    unpostEntry(entryId);

    expect(data.getState().entries[0].status).toBe("pending");
    expect(data.getState().auditLog.map(({ action }) => action)).toEqual([
      "Created",
      "Posted",
      "Reverted to pending",
    ]);
  });

  it("partially settles an entry and creates a pending remainder", () => {
    addOneTimeEntry({ ...entryInput, manual: true });
    const original = data.getState().entries[0];

    partialSettleEntry(original.id, 400);

    expect(data.getState().entries).toHaveLength(2);
    expect(data.getState().entries[0]).toMatchObject({
      id: original.id,
      amount: 400,
      status: "posted",
    });
    expect(data.getState().entries[1]).toMatchObject({
      title: "Pay (remaining)",
      amount: 800,
      status: "pending",
      accountId: "bank",
    });
  });

  it("rejects a partial settlement that is not between zero and the total", () => {
    addOneTimeEntry({ ...entryInput, manual: true });
    const before = structuredClone(data.getState());

    expect(() => partialSettleEntry(data.getState().entries[0].id, 1200)).toThrow(
      "Enter an amount greater than 0 and less than the total due.",
    );
    expect(data.getState()).toEqual(before);
  });

  it("rejects a transfer to the same account without changing the state", () => {
    const before = data.getState();

    expect(() =>
      addTransfer({
        amount: 100,
        fromAccount: "bank",
        toAccount: "bank",
        date: "2026-03-01",
      }),
    ).toThrow("Choose different accounts.");
    expect(data.getState()).toBe(before);
    expect(saveData).not.toHaveBeenCalled();
  });

  it("prevents deleting the last account", () => {
    data.setState({
      ...defaultData(),
      accounts: [{ id: "only", name: "Only account", type: "Cash" }],
    });

    expect(() => deleteAccount("only")).toThrow("Keep at least one account.");
    expect(data.getState().accounts).toHaveLength(1);
  });

  it("round-trips an exported backup and persists imported data", () => {
    const imported = {
      ...defaultData(),
      entries: [
        {
          id: "backup-entry",
          ...entryInput,
          status: "posted",
          manual: false,
        } satisfies Entry,
      ],
    };

    importBackup(JSON.stringify(imported));

    expect(JSON.parse(exportBackup())).toEqual(imported);
    expect(saveData).toHaveBeenCalledWith(imported);
  });

  it("resets data to defaults and persists the reset", () => {
    addOneTimeEntry({ ...entryInput, manual: true });
    vi.mocked(saveData).mockClear();

    resetData();

    expect(data.getState()).toEqual(defaultData());
    expect(saveData).toHaveBeenCalledWith(data.getState());
  });
});
