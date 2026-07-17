import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label && <span className="text-slate-400">{label}</span>}
      <input
        className={`rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-slate-600 ${className ?? ""}`}
        {...props}
      />
    </label>
  );
}
