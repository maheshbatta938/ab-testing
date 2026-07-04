import type { PropsWithChildren } from "react";

interface BadgeProps {
  tone?: "default" | "success" | "warning" | "muted";
  className?: string;
}

export function Badge({
  children,
  tone = "default",
  className = ""
}: PropsWithChildren<BadgeProps>) {
  return <span className={`ui-badge ui-badge-${tone} ${className}`.trim()}>{children}</span>;
}
