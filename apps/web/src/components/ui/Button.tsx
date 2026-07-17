import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
}

const VARIANT_STYLES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-cyan-500 text-slate-950 hover:bg-cyan-400",
  ghost: "border border-slate-800 text-slate-300 hover:bg-slate-900",
  danger: "text-rose-400 hover:bg-rose-500/10",
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_STYLES[variant]} ${className ?? ""}`}
      {...props}
    />
  );
}
