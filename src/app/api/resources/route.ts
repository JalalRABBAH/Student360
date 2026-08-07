import { NextResponse } from "next/server";

import { apiSession } from "@/lib/auth/server";
import { resolveResourceName } from "@/lib/search/service";

export async function GET(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const params = new URL(req.url).searchParams;
  const type = params.get("type");
  const id = params.get("id") ?? "";
  if (type !== "students" && type !== "classes") {
    return NextResponse.json({ error: "Invalid resource type" }, { status: 400 });
  }
  if (!id) {
    return NextResponse.json({ error: "Missing resource id" }, { status: 400 });
  }

  const name = await resolveResourceName(session!, type, id);
  return NextResponse.json({ name });
}
