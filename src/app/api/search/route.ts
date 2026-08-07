import { NextResponse } from "next/server";

import { apiSession } from "@/lib/auth/server";
import { searchAll } from "@/lib/search/service";

export async function GET(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  const results = await searchAll(session!, q);
  return NextResponse.json({ results });
}
