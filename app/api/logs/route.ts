import { NextResponse, type NextRequest } from "next/server";

import { requireRequestSession } from "@/lib/auth";
import { listLogs } from "@/lib/data";

export async function GET(request: NextRequest) {
  const sessionOrResponse = await requireRequestSession(request);
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const query = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const limitParam = request.nextUrl.searchParams.get("limit");
  const parsedLimit = limitParam ? Number(limitParam) : Number.NaN;
  const limit = Math.max(
    1,
    Math.min(200, Number.isFinite(parsedLimit) ? parsedLimit : 100)
  );

  const rows = (await listLogs()).filter((entry) => {
    if (!query) {
      return true;
    }

    return [entry.user, entry.action, entry.target ?? "", entry.details]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return NextResponse.json({
    logs: rows.slice(0, limit),
    total: rows.length
  });
}
