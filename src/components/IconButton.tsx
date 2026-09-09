import type { ComponentChildren } from "preact";

interface IconButtonProps {
  onClick: () => void;
  label: string;
  danger?: boolean;
  children: ComponentChildren;
}

export function IconButton({
  onClick,
  label,
  danger,
  children,
}: IconButtonProps) {
  return (
    <button
      class={"icon-btn" + (danger ? " danger" : "")}
      onClick={onClick}
      aria-label={label}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}
