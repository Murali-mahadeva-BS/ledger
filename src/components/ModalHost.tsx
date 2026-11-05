import { useStore } from "zustand";
import { closeModal, uiStore } from "../lib/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export function ModalHost() {
  const state = useStore(uiStore, (ui) => ui.modal);
  return (
    <Dialog
      open={Boolean(state)}
      onOpenChange={(open) => {
        if (!open) closeModal();
      }}
    >
      {state && (
        <DialogContent className="fixed inset-x-0 bottom-0 top-auto max-h-[94vh] w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-t-3xl p-5 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {state.title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2">{state.body}</div>
        </DialogContent>
      )}
    </Dialog>
  );
}
