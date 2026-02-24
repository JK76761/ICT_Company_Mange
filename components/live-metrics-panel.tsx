"use client";

import { startTransition, useCallback, useEffect, useState } from "react";

import { formatDateTime, relativePercent } from "@/lib/format";
import type { MetricsSnapshot } from "@/lib/types";

interface LiveMetricsPanelProps {
  initialMetrics: MetricsSnapshot;
}

function Meter({
  label,
  value,
  accent
}: {
  label: string;
  value: number;
  accent: "brass" | "moss" | "signal";
}) {
  const color =
    accent === "brass" ? "bg-brass" : accent === "moss" ? "bg-moss" : "bg-signal";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink/75">{label}</span>
        <span className="font-semibold">{relativePercent(value)}</span>
      </div>
      <div className="h-2 rounded-full bg-black/10">
        <div
          className={`h-2 rounded-full ${color} transition-[width] duration-500 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

export function LiveMetricsPanel({ initialMetrics }: LiveMetricsPanelProps) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadMetrics = useCallback(async () => {
    setRefreshing(true);

    try {
      const response = await fetch("/api/metrics", {
        cache: "no-store"
      });

      const payload = (await response.json().catch(() => ({}))) as {
        metrics?: MetricsSnapshot;
        error?: string;
      };

      if (!response.ok || !payload.metrics) {
        setError(payload.error ?? "Unable to refresh metrics.");
        return;
      }

      setMetrics(payload.metrics);
      setError(null);
    } catch {
      setError("Network error while refreshing metrics.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      startTransition(() => {
        void loadMetrics();
      });
    }, 15000);

    return () => window.clearInterval(interval);
  }, [loadMetrics]);

  return (
    <section className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">System Monitoring (Mock)</h2>
          <p className="text-sm text-ink/70">
            Live client refresh via `/api/metrics` every 15 seconds.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            startTransition(() => {
              void loadMetrics();
            })
          }
          disabled={refreshing}
          className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium hover:border-brass disabled:opacity-70"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-black/10 bg-white/60 p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold">Resource Utilization</p>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                metrics.serviceHealth === "HEALTHY"
                  ? "bg-moss/10 text-moss"
                  : "bg-signal/10 text-signal"
              }`}
            >
              {metrics.serviceHealth}
            </span>
          </div>
          <div className="space-y-4">
            <Meter label="CPU" value={metrics.cpu} accent="signal" />
            <Meter label="Disk" value={metrics.disk} accent="brass" />
          </div>
        </div>

        <div className="rounded-xl border border-black/10 bg-white/60 p-4">
          <p className="text-sm font-semibold">Network and Support</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-black/10 bg-white p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-ink/60">Inbound</p>
              <p className="mt-2 text-2xl font-semibold">{metrics.networkInMbps} Mbps</p>
            </div>
            <div className="rounded-lg border border-black/10 bg-white p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-ink/60">Outbound</p>
              <p className="mt-2 text-2xl font-semibold">{metrics.networkOutMbps} Mbps</p>
            </div>
            <div className="rounded-lg border border-black/10 bg-white p-3 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.12em] text-ink/60">
                Active Tickets
              </p>
              <p className="mt-2 text-2xl font-semibold">{metrics.activeTickets}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-ink/60">
        <p>Last updated: {formatDateTime(metrics.updatedAt)}</p>
        {error ? <p className="text-signal">{error}</p> : null}
      </div>
    </section>
  );
}
