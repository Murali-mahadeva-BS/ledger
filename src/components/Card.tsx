interface CardProps {
  title: string;
  value: string;
  sub?: string;
  color?: string;
}

export function Card({ title, value, sub, color }: CardProps) {
  return (
    <div class="rounded-2xl border bg-white p-4 shadow-sm">
      <p class="text-xs text-slate-500">{title}</p>
      <b class={"mt-1 block text-xl " + (color ?? "")}>{value}</b>
      {sub && <small class="text-slate-500">{sub}</small>}
    </div>
  );
}
