import { redirect } from "next/navigation";

import { ShellNav } from "@/components/shell-nav";
import { getServerSession } from "@/lib/auth";

export default async function ProtectedLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  if (!session) {
    redirect("/");
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-4 sm:px-6">
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <ShellNav session={session} />
        <main className="space-y-4">{children}</main>
      </div>
    </div>
  );
}

