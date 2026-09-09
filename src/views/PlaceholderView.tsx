export function PlaceholderView({
  label,
}: {
  label: string;
  path?: string;
  default?: boolean;
}) {
  return (
    <div class="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
      {label} view — coming soon.
    </div>
  );
}
