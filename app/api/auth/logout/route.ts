import { NextResponse, type NextRequest } from "next/server";

import { clearSessionCookie, getVerifiedRequestSession } from "@/lib/auth";
import { recordLogout } from "@/lib/data";

export async function POST(request: NextRequest) {
  const session = await getVerifiedRequestSession(request);
  if (session) {
    await recordLogout(session);
  }

  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
