"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-ink">{label}</span>
      <input
        {...props}
        className="focus-ring h-11 w-full rounded-md border border-border-strong px-3 text-sm text-ink placeholder:text-ink-faint"
      />
    </label>
  );
}

export function AccountAuth() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", phone: "", password: "" });

  async function submit(url: string, body: unknown) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page max-w-md py-16 sm:py-24">
      <div className="mb-6 flex gap-6 border-b border-border text-sm">
        <button
          className={`-mb-px border-b-2 pb-3 font-medium ${tab === "login" ? "border-blue-700 text-blue-700" : "border-transparent text-ink-muted"}`}
          onClick={() => {
            setTab("login");
            setError(null);
          }}
        >
          Sign In
        </button>
        <button
          className={`-mb-px border-b-2 pb-3 font-medium ${tab === "register" ? "border-blue-700 text-blue-700" : "border-transparent text-ink-muted"}`}
          onClick={() => {
            setTab("register");
            setError(null);
          }}
        >
          Create Account
        </button>
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-destructive">{error}</p>}

      {tab === "login" ? (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit("/api/account/login", loginForm);
          }}
        >
          <Field
            label="Email"
            type="email"
            required
            value={loginForm.email}
            onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
          />
          <Field
            label="Password"
            type="password"
            required
            value={loginForm.password}
            onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
          />
          <Button size="lg" type="submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit("/api/account/register", registerForm);
          }}
        >
          <Field
            label="Full name"
            required
            value={registerForm.name}
            onChange={(e) => setRegisterForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Field
            label="Email"
            type="email"
            required
            value={registerForm.email}
            onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))}
          />
          <Field
            label="Phone"
            type="tel"
            placeholder="03XX XXXXXXX"
            value={registerForm.phone}
            onChange={(e) => setRegisterForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <Field
            label="Password"
            type="password"
            required
            minLength={8}
            value={registerForm.password}
            onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))}
          />
          <p className="text-xs text-ink-faint">At least 8 characters.</p>
          <Button size="lg" type="submit" disabled={submitting}>
            {submitting ? "Creating account…" : "Create Account"}
          </Button>
        </form>
      )}
    </div>
  );
}
