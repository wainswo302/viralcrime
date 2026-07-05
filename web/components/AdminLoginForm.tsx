"use client";

import { useState } from "react";
import { useAdminAuth } from "@/components/AdminAuth";

export function AdminLoginForm() {
  const { login } = useAdminAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const ok = await login(username, password);
    setPending(false);
    if (!ok) setError("Invalid credentials.");
  }

  return (
    <main className="wrap" style={{ maxWidth: "24rem" }}>
      <p className="eyebrow">Admin</p>
      <h1 className="headline" style={{ fontSize: "2rem" }}>Sign in</h1>
      <form onSubmit={onSubmit}>
        {error && <p className="error-text">{error}</p>}
        <label className="field">
          <span className="field__label">Username</span>
          <input
            className="field__input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
          />
        </label>
        <label className="field">
          <span className="field__label">Password</span>
          <input
            className="field__input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        <button className="btn btn--primary" type="submit" disabled={pending}>
          {pending ? "Checking…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
