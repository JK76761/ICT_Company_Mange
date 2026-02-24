import { NextResponse, type NextRequest } from "next/server";

import { requireAdminRequestSession } from "@/lib/auth";
import { deleteUserAccount, updateUserRole } from "@/lib/data";
import type { UserRole } from "@/lib/types";

interface UserRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: UserRouteContext) {
  const sessionOrResponse = await requireAdminRequestSession(request);
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { role } = (body ?? {}) as { role?: UserRole };
  if (role !== "ADMIN" && role !== "STAFF") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const { id } = await context.params;
  const result = await updateUserRole(id, role, sessionOrResponse);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ user: result.user });
}

export async function DELETE(request: NextRequest, context: UserRouteContext) {
  const sessionOrResponse = await requireAdminRequestSession(request);
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const { id } = await context.params;
  const result = await deleteUserAccount(id, sessionOrResponse);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
