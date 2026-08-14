import { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl ring-1 ring-forest/8 ${className}`}
      {...props}
    />
  );
}
