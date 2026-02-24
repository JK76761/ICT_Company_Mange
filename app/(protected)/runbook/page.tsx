export default function RunbookPage() {
  return (
    <div className="space-y-4">
      <section className="panel p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/60">
          Security Design Concepts
        </p>
        <h2 className="mt-2 text-2xl font-semibold">RIMS Backup and Recovery Runbook (MVP)</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/75">
          This page documents the backup and recovery concepts referenced in the project spec.
          The current MVP uses in-memory mock data, so these procedures are process-oriented and
          prepare the system for a future PostgreSQL + Prisma implementation.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="panel p-5">
          <h3 className="text-lg font-semibold">Access Control Rules</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink/80">
            <li className="rounded-xl border border-black/10 bg-white/60 p-3">
              Enforce role-based access control (RBAC) with `ADMIN` and `STAFF` roles.
            </li>
            <li className="rounded-xl border border-black/10 bg-white/60 p-3">
              Restrict user creation, deletion, and role modification to administrators only.
            </li>
            <li className="rounded-xl border border-black/10 bg-white/60 p-3">
              Maintain at least one administrator account at all times to avoid lockout.
            </li>
            <li className="rounded-xl border border-black/10 bg-white/60 p-3">
              Store sessions in secure HTTP-only cookies (demo cookie is unsigned; production
              should use signed or server-backed sessions).
            </li>
          </ul>
        </div>

        <div className="panel p-5">
          <h3 className="text-lg font-semibold">Immutable Logging Rules</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink/80">
            <li className="rounded-xl border border-black/10 bg-white/60 p-3">
              Append-only audit records for login, user creation, role changes, and deletion.
            </li>
            <li className="rounded-xl border border-black/10 bg-white/60 p-3">
              Timestamp every entry in UTC ISO-8601 format for consistent incident review.
            </li>
            <li className="rounded-xl border border-black/10 bg-white/60 p-3">
              Separate log viewing privileges from log mutation permissions (no delete endpoint).
            </li>
            <li className="rounded-xl border border-black/10 bg-white/60 p-3">
              Future phase: forward logs to centralized storage (e.g. CloudWatch / SIEM).
            </li>
          </ul>
        </div>
      </section>

      <section className="panel p-5">
        <h3 className="text-lg font-semibold">Backup and Recovery Concepts (Phase 2 Target)</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-black/10 bg-white/60 p-4">
            <p className="text-sm font-semibold">Backup Plan</p>
            <ul className="mt-3 space-y-2 text-sm text-ink/75">
              <li>Daily automated PostgreSQL dumps retained for 14 days.</li>
              <li>Weekly full snapshot retained for 8 weeks.</li>
              <li>Encryption at rest for backup artifacts.</li>
              <li>Restricted restore permissions to administrators only.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-black/10 bg-white/60 p-4">
            <p className="text-sm font-semibold">Recovery Procedure</p>
            <ol className="mt-3 space-y-2 text-sm text-ink/75">
              <li>1. Isolate incident and confirm recovery point objective (RPO).</li>
              <li>2. Restore latest valid backup into a staging environment.</li>
              <li>3. Verify user accounts and audit log integrity.</li>
              <li>4. Promote restored environment and notify stakeholders.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="panel p-5">
        <h3 className="text-lg font-semibold">Sample Log Structure</h3>
        <pre className="mt-4 overflow-x-auto rounded-xl border border-black/10 bg-ink p-4 text-sm text-white">
{`{
  "user": "admin",
  "action": "CREATE_USER",
  "timestamp": "2025-03-01T10:00:00Z"
}`}
        </pre>
      </section>
    </div>
  );
}

