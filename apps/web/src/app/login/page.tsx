import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-50">
          <span className="text-cyan-400">~</span> Commissioning
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
