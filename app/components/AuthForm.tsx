"use client";
// The app's OWN login and signup screens. The person signs in to the
// app; Kaman stays out of sight. The form posts to this app's
// server (app/api/auth/*), which checks the password with Kaman and keeps
// the session in httpOnly cookies.
import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiPath } from "../lib/apiPath";

export function AuthForm({ mode, title }: { mode: "login" | "signup"; title: string }) {
  // A plain form post (before scripts load) comes back with ?error=.
  const [error, setError] = React.useState<string | null>(useSearchParams().get("error"));
  const [busy, setBusy] = React.useState(false);
  const signup = mode === "signup";

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(apiPath(`/api/auth/${mode}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const out = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(out.error ?? `Something went wrong (HTTP ${res.status}).`);
        return;
      }
      window.location.assign(apiPath("/"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">{title}</p>
          <h1 className="text-xl font-semibold">{signup ? "Create your account" : "Sign in"}</h1>
        </div>
        <form
          method="post"
          action={apiPath(`/api/auth/${mode}`)}
          onSubmit={(e) => void submit(e)}
          className="flex flex-col gap-4"
          data-testid={`${mode}-form`}
        >
          {signup ? (
            <Field label="Your name" name="name" type="text" autoComplete="name" />
          ) : null}
          <Field label="Email" name="email" type="email" autoComplete="email" required />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete={signup ? "new-password" : "current-password"}
            required
            {...(signup ? { minLength: 8 } : {})}
          />
          {error ? (
            <p role="alert" className="text-sm text-destructive" data-testid="auth-error">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "One moment…" : signup ? "Create my account" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {signup ? (
            <>
              Already have an account? <Link href="/login" className="text-foreground underline">Sign in</Link>
            </>
          ) : (
            <>
              New here? <Link href="/signup" className="text-foreground underline">Create an account</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function Field(props: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const { label, ...input } = props;
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input
        {...input}
        className="rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
      />
    </label>
  );
}
