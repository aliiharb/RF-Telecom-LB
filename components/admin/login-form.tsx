"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-header)]"
    >
      <label className="grid gap-2 text-sm font-semibold text-[var(--color-text-1)]">
        Admin name or email
        <input
          type="text"
          required
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-[var(--color-text-1)] outline-none transition-colors placeholder:text-[var(--color-text-3)] focus:border-[var(--color-accent)]"
          placeholder="ali or zahraa"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-[var(--color-text-1)]">
        Password
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-[var(--color-text-1)] outline-none transition-colors placeholder:text-[var(--color-text-3)] focus:border-[var(--color-accent)]"
          placeholder="Enter password"
        />
      </label>
      {error ? (
        <p className="rounded-lg border border-[rgba(220,38,38,0.25)] bg-[rgba(220,38,38,0.08)] p-3 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary h-11 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
