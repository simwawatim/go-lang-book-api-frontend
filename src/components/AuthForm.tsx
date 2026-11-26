"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, AuthResponse, FieldErrors } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Props = {
  mode: "login" | "register";
  submit: (values: { name: string; email: string; password: string }) => Promise<AuthResponse>;
};

function nextPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export default function AuthForm({ mode, submit }: Props) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [fields, setFields] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFields({});
    setError("");
    try {
      signIn(await submit(values));
      router.push(nextPath());
    } catch (err) {
      if (err instanceof ApiError) {
        setFields(err.fields ?? {});
        if (err.status === 409) setError("An account with this email already exists. Log in instead.");
        else if (err.status === 401) setError("Email or password is incorrect.");
        else setError(err.fields ? "Fix the highlighted fields and try again." : err.message);
      } else {
        setError("Could not reach the server. Check your connection and try again.");
      }
      setBusy(false);
    }
  }

  return (
    <section className="narrow auth">
      <h1>{isRegister ? "Create an account" : "Log in"}</h1>
      <p className="muted">
        {isRegister ? "You need an account to add and edit books." : "Log in to add and edit your books."}
      </p>
      <form className="form" onSubmit={onSubmit} noValidate>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {isRegister && (
          <label className={fields.name ? "field field-invalid" : "field"}>
            <span className="field-label">Name</span>
            <input value={values.name} onChange={set("name")} autoComplete="name" autoFocus maxLength={100} />
            {fields.name && <span className="field-error">Name {fields.name}.</span>}
          </label>
        )}
        <label className={fields.email ? "field field-invalid" : "field"}>
          <span className="field-label">Email</span>
          <input
            type="email"
            value={values.email}
            onChange={set("email")}
            autoComplete="email"
            autoFocus={!isRegister}
          />
          {fields.email && <span className="field-error">Email {fields.email}.</span>}
        </label>
        <label className={fields.password ? "field field-invalid" : "field"}>
          <span className="field-label">Password</span>
          {isRegister && <span className="field-hint">At least 8 characters</span>}
          <input
            type="password"
            value={values.password}
            onChange={set("password")}
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
          {fields.password && <span className="field-error">Password {fields.password}.</span>}
        </label>
        <div className="form-actions">
          <button type="submit" className="button" disabled={busy}>
            {busy ? (isRegister ? "Creating account…" : "Logging in…") : isRegister ? "Create account" : "Log in"}
          </button>
        </div>
      </form>
      <p className="muted small">
        {isRegister ? (
          <>
            Already have an account? <Link href="/login">Log in</Link>
          </>
        ) : (
          <>
            New here? <Link href="/register">Create an account</Link>
          </>
        )}
      </p>
    </section>
  );
}
