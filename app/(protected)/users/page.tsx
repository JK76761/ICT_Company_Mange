import { redirect } from "next/navigation";

import { UsersModule } from "@/components/users-module";
import { getServerSession } from "@/lib/auth";
import { listUsers } from "@/lib/data";

export default async function UsersPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/");
  }

  return <UsersModule initialUsers={await listUsers()} viewer={session} />;
}
