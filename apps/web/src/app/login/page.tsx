import { LoginForm } from "@/components/auth/LoginForm";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { branding } from "@/lib/branding";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-950 px-4">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <BrandLogo size="medium" />
          <p className="text-sm text-slate-400">{branding.description}</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
