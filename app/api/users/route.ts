import { NextResponse, type NextRequest } from "next/server";

import { requireAdminRequestSession, requireRequestSession } from "@/lib/auth";
import { createUserAccount, listUsers } from "@/lib/data";
import type { UserRole } from "@/lib/types";

export async function GET(request: NextRequest) {
  const sessionOrResponse = await requireRequestSession(request);
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  return NextResponse.json({
    users: await listUsers(),
    viewer: sessionOrResponse
  });
}

export async function POST(request: NextRequest) {
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

  const { username, name, password, role } = (body ?? {}) as {
    username?: string;
    name?: string;
    password?: string;
    role?: UserRole;
  };

  if (!username || !name || !password || (role !== "ADMIN" && role !== "STAFF")) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  const result = await createUserAccount(
    { username, name, password, role },
    sessionOrResponse
  );

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ user: result.user }, { status: 201 });
}
