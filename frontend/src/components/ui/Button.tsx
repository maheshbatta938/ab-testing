import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { Link, type LinkProps } from "react-router-dom";

type ButtonVariant = "default" | "secondary" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg";

const variantClassMap: Record<ButtonVariant, string> = {
  default: "ui-button ui-button-default",
  secondary: "ui-button ui-button-secondary",
  ghost: "ui-button ui-button-ghost",
  link: "ui-button ui-button-link"
};

const sizeClassMap: Record<ButtonSize, string> = {
  sm: "ui-button-sm",
  md: "ui-button-md",
  lg: "ui-button-lg"
};

interface SharedButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, SharedButtonProps {}

interface ButtonLinkProps extends LinkProps, SharedButtonProps {}

const buildClassName = ({
  variant = "default",
  size = "md",
  className = ""
}: SharedButtonProps) => `${variantClassMap[variant]} ${sizeClassMap[size]} ${className}`.trim();

export function Button({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button {...props} className={buildClassName({ variant, size, className })}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}: PropsWithChildren<ButtonLinkProps>) {
  return (
    <Link {...props} className={buildClassName({ variant, size, className })}>
      {children}
    </Link>
  );
}
