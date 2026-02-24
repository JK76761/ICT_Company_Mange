"use client";

import { useState } from "react";

export function LogoutButton() {
  const [busy, setBusy] = useState(false);

  async function onLogout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.assign("/");
    }
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={busy}
      className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-left text-sm font-medium text-ink transition hover:border-brass disabled:opacity-70"
    >
      {busy ? "Signing out..." : "Sign out"}
    </button>
  );
}

