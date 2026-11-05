import type { ReactNode } from "react";
import { Button } from "./ui/button";

interface IconButtonProps {
  onClick: () => void;
  label: string;
  danger?: boolean;
  children: ReactNode;
}

export function IconButton({
  onClick,
  label,
  danger,
  children,
}: IconButtonProps) {
  return (
    <Button
      variant={danger ? "destructive" : "ghost"}
      size="icon"
      className="shrink-0"
      onClick={onClick}
      aria-label={label}
      title={label}
      type="button"
    >
      {children}
    </Button>
  );
}
