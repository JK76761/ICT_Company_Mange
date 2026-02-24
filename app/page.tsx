import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

interface HomePageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await getServerSession();
  if (session) {
    redirect("/dashboard");
  }

  const params = (await searchParams) ?? {};
  const redirectPath =
    typeof params.redirect === "string" && params.redirect.startsWith("/")
      ? params.redirect
      : "/dashboard";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6">
      <section className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-16 -top-14 h-48 w-48 rounded-full bg-brass/15 blur-2xl" />
          <div className="absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-moss/15 blur-2xl" />
          <div className="relative">
            <p className="mb-3 inline-flex items-center rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink/80">
              RIMS MVP
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Regional IT Management System
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-ink/75 sm:text-base">
              Internal IT support simulation platform for user administration, role-based
              access control, activity logging, and monitoring concepts.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="panel-soft p-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink/70">
                  Core Modules
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-ink/85">
                  <li>Authentication and role-based access (Admin / Staff)</li>
                  <li>User account management with admin-only controls</li>
                  <li>Immutable activity logging for admin actions</li>
                  <li>Mock system monitoring indicators (CPU, Disk, Network)</li>
                </ul>
              </div>

              <div className="panel-soft p-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink/70">
                  Demo Credentials
                </h2>
                <div className="mt-3 space-y-2 text-sm">
                  <p>
                    <span className="font-semibold">Admin:</span>{" "}
                    <code className="rounded bg-black/5 px-1">admin / admin123</code>
                  </p>
                  <p>
                    <span className="font-semibold">Staff:</span>{" "}
                    <code className="rounded bg-black/5 px-1">staff / staff123</code>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 text-sm text-ink/70 sm:grid-cols-3">
              <div className="rounded-xl border border-black/10 bg-white/50 p-3">
                <p className="font-semibold text-ink">Phase 1</p>
                <p>Mock data + API routes</p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white/50 p-3">
                <p className="font-semibold text-ink">Phase 2</p>
                <p>PostgreSQL + Prisma</p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white/50 p-3">
                <p className="font-semibold text-ink">Deploy</p>
                <p>Vercel now, AWS later</p>
              </div>
            </div>
          </div>
        </div>

        <div className="panel p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Sign in</h2>
            <p className="mt-2 text-sm text-ink/70">
              Use a demo account to access the RIMS admin workspace.
            </p>
          </div>
          <LoginForm redirectPath={redirectPath} />
        </div>
      </section>
    </main>
  );
}

