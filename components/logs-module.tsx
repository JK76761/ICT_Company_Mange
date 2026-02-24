"use client";

import { useDeferredValue, useEffect, useState } from "react";

import { formatDateTime } from "@/lib/format";
import type { ActivityLogEntry } from "@/lib/types";

interface LogsModuleProps {
  initialLogs: ActivityLogEntry[];
}

export function LogsModule({ initialLogs }: LogsModuleProps) {
  const [query, setQuery] = useState("");
  const [logs, setLogs] = useState<ActivityLogEntry[]>(initialLogs);
  const [total, setTotal] = useState(initialLogs.length);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    let cancelled = false;

    async function loadLogs() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ limit: "100" });
        if (deferredQuery.trim()) {
          params.set("q", deferredQuery.trim());
        }

        const response = await fetch(`/api/logs?${params.toString()}`, {
          cache: "no-store"
        });

        const payload = (await response.json().catch(() => ({}))) as {
          logs?: ActivityLogEntry[];
          total?: number;
          error?: string;
        };

        if (!response.ok || !payload.logs) {
          throw new Error(payload.error ?? "Unable to load logs.");
        }

        if (!cancelled) {
          setLogs(payload.logs);
          setTotal(payload.total ?? payload.logs.length);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadLogs();

    return () => {
      cancelled = true;
    };
  }, [deferredQuery]);

  return (
    <section className="space-y-5">
      <div className="panel p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Immutable Activity Logs</h2>
            <p className="mt-1 text-sm text-ink/70">
              Login, account changes, and administrative actions are appended to the audit trail.
            </p>
          </div>

          <div className="w-full max-w-md">
            <label htmlFor="log-search" className="mb-2 block text-sm font-medium text-ink/80">
              Search logs
            </label>
            <input
              id="log-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by user, action, target, details..."
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-brass"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-ink/60">
          <p>
            Showing {logs.length} of {total} entries
            {deferredQuery ? ` for "${deferredQuery}"` : ""}
          </p>
          {loading ? <p>Refreshing...</p> : null}
          {error ? <p className="text-signal">{error}</p> : null}
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-black/5 text-xs uppercase tracking-[0.08em] text-ink/60">
              <tr>
                <th className="px-5 py-3 font-semibold">Timestamp</th>
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Action</th>
                <th className="px-5 py-3 font-semibold">Target</th>
                <th className="px-5 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((entry) => (
                <tr key={entry.id} className="border-t border-black/5 align-top">
                  <td className="px-5 py-4 font-mono-ui text-xs text-ink/75">
                    {formatDateTime(entry.timestamp)}
                  </td>
                  <td className="px-5 py-4 font-medium">{entry.user}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold">
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-ink/75">{entry.target ?? "-"}</td>
                  <td className="px-5 py-4 text-ink/75">{entry.details}</td>
                </tr>
              ))}
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-ink/60">
                    No log entries match the current filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

