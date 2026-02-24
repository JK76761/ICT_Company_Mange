import { NextResponse, type NextRequest } from "next/server";

import { getVerifiedRequestSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getVerifiedRequestSession(request);
  if (!session) {
    return NextResponse.json({ session: null });
  }

  return NextResponse.json({ session });
}
