"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { login } from "@/lib/apiClient";
import { useLanguage } from "@/contexts/LanguageContext";

export function LoginForm() {
  const router = useRouter();
  const { dict } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(dict.login.invalidCredentials);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Input
        label={dict.login.email}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label={dict.login.password}
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <Button type="submit" disabled={submitting} className="mt-2">
        {submitting ? dict.login.signingIn : dict.login.signIn}
      </Button>
    </form>
  );
}
