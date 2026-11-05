import { Link } from "react-router-dom";
import {
  Card as ShadcnCard,
  CardContent,
  CardDescription,
  CardTitle,
} from "./ui/card";

interface CardProps {
  title: string;
  value: string;
  sub?: string;
  color?: string;
  href?: string;
}

export function Card({ title, value, sub, color, href }: CardProps) {
  const content = (
    <ShadcnCard className="h-full gap-2 rounded-2xl border bg-white p-4 shadow-sm transition hover:border-teal-300 hover:shadow-md">
      <CardContent className="p-0">
        <CardDescription className="text-xs">{title}</CardDescription>
        <CardTitle className={"mt-1 block text-xl " + (color ?? "")}>
          {value}
        </CardTitle>
        {sub && <small className="text-muted-foreground">{sub}</small>}
      </CardContent>
    </ShadcnCard>
  );

  return href ? (
    <Link
      to={href}
      className="block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
    >
      {content}
    </Link>
  ) : (
    content
  );
}
