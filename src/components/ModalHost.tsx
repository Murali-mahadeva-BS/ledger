import { closeModal, modal } from "../lib/ui";

export function ModalHost() {
  const state = modal.value;
  return (
    <div
      class={
        "modal fixed inset-0 z-50 items-end bg-black/40 sm:items-center sm:justify-center" +
        (state ? " open" : "")
      }
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      {state && (
        <div class="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 sm:max-w-lg sm:rounded-3xl">
          <div class="flex justify-between">
            <h2 class="text-lg font-bold">{state.title}</h2>
            <button class="text-2xl" onClick={closeModal} aria-label="Close">
              ×
            </button>
          </div>
          <div class="mt-2">{state.body}</div>
        </div>
      )}
    </div>
  );
}
