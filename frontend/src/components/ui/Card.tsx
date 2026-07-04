import type { ElementType, HTMLAttributes, PropsWithChildren } from "react";

interface CardProps extends HTMLAttributes<HTMLElement> {
  tone?: "default" | "accent";
  as?: ElementType;
}

export function Card({
  children,
  className = "",
  tone = "default",
  as,
  ...props
}: PropsWithChildren<CardProps>) {
  const Component = as ?? "section";

  return (
    <Component
      {...props}
      className={`ui-card ${tone === "accent" ? "ui-card-accent" : ""} ${className}`.trim()}
    >
      {children}
    </Component>
  );
}
