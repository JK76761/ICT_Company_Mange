import { redirect } from "next/navigation";

import { LogsModule } from "@/components/logs-module";
import { getServerSession } from "@/lib/auth";
import { listLogs } from "@/lib/data";

export default async function LogsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/");
  }

  return <LogsModule initialLogs={(await listLogs()).slice(0, 100)} />;
}
