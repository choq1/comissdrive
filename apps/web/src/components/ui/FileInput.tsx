interface FileInputProps {
  label?: string;
  accept?: string;
  onChange: (file: File | null) => void;
}

export function FileInput({ label, accept, onChange }: FileInputProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label && <span className="text-slate-400">{label}</span>}
      <input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 outline-none file:mr-3 file:rounded-md file:border-0 file:bg-cyan-500 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-950 hover:file:bg-cyan-400"
      />
    </label>
  );
}
