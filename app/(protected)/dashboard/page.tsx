import Link from "next/link";
import { redirect } from "next/navigation";

import { LiveMetricsPanel } from "@/components/live-metrics-panel";
import { formatDateTime } from "@/lib/format";
import { getServerSession } from "@/lib/auth";
import {
  getDashboardSummary,
  getMetrics,
  getPersistenceModeLabel,
  listLogs
} from "@/lib/data";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/");
  }

  const summary = await getDashboardSummary();
  const metrics = await getMetrics();
  const recentLogs = (await listLogs()).slice(0, 6);
  const persistenceMode = getPersistenceModeLabel();

  return (
    <div className="space-y-4">
      <section className="panel relative overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brass via-moss to-signal" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/60">
              Operations Overview
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Welcome back, {session.name}
            </h2>
            <p className="mt-2 text-sm text-ink/70">
              This dashboard summarizes user administration and system monitoring for the RIMS MVP.
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-ink/55">
              Persistence mode: {persistenceMode}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/users"
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium hover:border-brass"
            >
              Manage users
            </Link>
            <Link
              href="/logs"
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium hover:border-brass"
            >
              View logs
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-black/10 bg-white/60 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-ink/60">Total Users</p>
            <p className="mt-2 text-2xl font-semibold">{summary.totalUsers}</p>
          </div>
          <div className="rounded-xl border border-black/10 bg-white/60 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-ink/60">Admins</p>
            <p className="mt-2 text-2xl font-semibold">{summary.adminUsers}</p>
          </div>
          <div className="rounded-xl border border-black/10 bg-white/60 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-ink/60">Staff</p>
            <p className="mt-2 text-2xl font-semibold">{summary.staffUsers}</p>
          </div>
          <div className="rounded-xl border border-black/10 bg-white/60 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-ink/60">Audit Entries</p>
            <p className="mt-2 text-2xl font-semibold">{summary.logEntries}</p>
          </div>
        </div>
      </section>

      <LiveMetricsPanel initialMetrics={metrics} />

      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold">Recent Activity</h3>
            <p className="text-sm text-ink/65">
              Latest events recorded in the immutable audit trail.
            </p>
          </div>
          <Link
            href="/logs"
            className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm font-medium hover:border-brass"
          >
            Open full log
          </Link>
        </div>

        <ul className="divide-y divide-black/5">
          {recentLogs.map((entry) => (
            <li key={entry.id} className="px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold">
                    {entry.action}
                  </span>
                  <p className="text-sm">
                    <span className="font-semibold">{entry.user}</span>{" "}
                    <span className="text-ink/70">{entry.details}</span>
                    {entry.target ? (
                      <>
                        {" "}
                        <span className="text-ink/50">Target:</span>{" "}
                        <span className="font-medium">{entry.target}</span>
                      </>
                    ) : null}
                  </p>
                </div>
                <p className="text-xs text-ink/60">{formatDateTime(entry.timestamp)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
