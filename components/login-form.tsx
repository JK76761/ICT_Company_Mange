"use client";

import { useState } from "react";

interface LoginFormProps {
  redirectPath: string;
}

export function LoginForm({ redirectPath }: LoginFormProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "Unable to sign in.");
        return;
      }

      window.location.assign(redirectPath || "/dashboard");
    } catch {
      setError("Network error while signing in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="username" className="block text-sm font-medium text-ink/80">
          Username
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none ring-0 placeholder:text-ink/40 focus:border-brass"
          placeholder="admin"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-ink/80">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none ring-0 placeholder:text-ink/40 focus:border-brass"
          placeholder="admin123"
          required
        />
      </div>

      {error ? (
        <p className="rounded-xl border border-signal/20 bg-signal/10 px-3 py-2 text-sm text-signal">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "Signing in..." : "Sign in to RIMS"}
      </button>

      <div className="rounded-xl border border-black/10 bg-white/60 p-3 text-xs text-ink/70">
        <p className="font-semibold uppercase tracking-[0.12em] text-ink/60">Quick Fill</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setUsername("admin");
              setPassword("admin123");
            }}
            className="rounded-lg border border-black/10 bg-white px-2.5 py-1 font-medium hover:border-brass"
          >
            Admin Demo
          </button>
          <button
            type="button"
            onClick={() => {
              setUsername("staff");
              setPassword("staff123");
            }}
            className="rounded-lg border border-black/10 bg-white px-2.5 py-1 font-medium hover:border-brass"
          >
            Staff Demo
          </button>
        </div>
      </div>
    </form>
  );
}

