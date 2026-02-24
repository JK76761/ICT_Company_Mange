import { NextResponse, type NextRequest } from "next/server";

import { requireRequestSession } from "@/lib/auth";
import { getMetrics } from "@/lib/data";

export async function GET(request: NextRequest) {
  const sessionOrResponse = await requireRequestSession(request);
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  return NextResponse.json({ metrics: await getMetrics() });
}
