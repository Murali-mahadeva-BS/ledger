// Kept UTC-based to match the original app's stored date strings.
export const today = () => new Date().toISOString().slice(0, 10);

export const cash = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

export const pct = (n: number) => Math.round(n) + "%";

export const formatDate = (d: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(d + "T12:00:00"));
