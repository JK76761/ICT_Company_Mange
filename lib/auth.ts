import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { getUserByUsername } from "@/lib/data";
import { isAdmin } from "@/lib/permissions";
import type { SessionUser } from "@/lib/types";

function encodeSession(session: SessionUser): string {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function decodeSession(value: string | undefined): SessionUser | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as SessionUser;
    if (!parsed?.username || !parsed?.role || !parsed?.id || !parsed?.name) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function normalizeSession(session: SessionUser | null): Promise<SessionUser | null> {
  if (!session) {
    return null;
  }

  const user = await getUserByUsername(session.username);
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role
  };
}

export async function getServerSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return normalizeSession(decodeSession(raw));
}

export function getRequestSession(request: NextRequest): SessionUser | null {
  const raw = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return decodeSession(raw);
}

export async function getVerifiedRequestSession(
  request: NextRequest
): Promise<SessionUser | null> {
  return normalizeSession(getRequestSession(request));
}

export function setSessionCookie(response: NextResponse, session: SessionUser): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: encodeSession(session),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0
  });
}

export async function requireRequestSession(
  request: NextRequest
): Promise<SessionUser | NextResponse> {
  const session = await getVerifiedRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

export async function requireAdminRequestSession(
  request: NextRequest
): Promise<SessionUser | NextResponse> {
  const sessionOrResponse = await requireRequestSession(request);
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  if (!isAdmin(sessionOrResponse.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return sessionOrResponse;
}
