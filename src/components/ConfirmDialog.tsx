import { closeModal } from "../lib/ui";
import { Button } from "./ui/button";

interface ConfirmDialogProps {
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
}

export function ConfirmDialog({
  message,
  confirmLabel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <div>
      <p className="text-slate-600">{message}</p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={closeModal} type="button">
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            onConfirm();
            closeModal();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
