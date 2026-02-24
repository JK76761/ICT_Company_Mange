"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { roleLabel } from "@/lib/permissions";
import type { SessionUser } from "@/lib/types";

interface ShellNavProps {
  session: SessionUser;
}

const links = [
  { href: "/dashboard", label: "Dashboard", roles: ["ADMIN", "STAFF"] as const },
  { href: "/users", label: "Users", roles: ["ADMIN", "STAFF"] as const },
  { href: "/logs", label: "Activity Logs", roles: ["ADMIN", "STAFF"] as const },
  { href: "/runbook", label: "Security Runbook", roles: ["ADMIN", "STAFF"] as const }
];

export function ShellNav({ session }: ShellNavProps) {
  const pathname = usePathname();

  return (
    <aside className="panel sticky top-4 flex h-fit flex-col gap-5 p-4 sm:p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/60">
          Regional IT
        </p>
        <h1 className="mt-2 text-xl font-semibold leading-tight">
          Management Console
        </h1>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white/60 p-3">
        <p className="text-sm font-semibold">{session.name}</p>
        <p className="mt-1 text-xs text-ink/65">@{session.username}</p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-medium">
          <span
            className={`status-dot ${
              session.role === "ADMIN" ? "bg-brass" : "bg-moss"
            }`}
            aria-hidden
          />
          {roleLabel(session.role)}
        </div>
      </div>

      <nav aria-label="Primary navigation" className="space-y-2">
        {links
          .filter((item) => item.roles.includes(session.role))
          .map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "border-brass/50 bg-brass/10 text-ink"
                    : "border-black/10 bg-white/50 text-ink/80 hover:border-brass/40 hover:bg-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="mt-auto">
        <LogoutButton />
      </div>
    </aside>
  );
}

