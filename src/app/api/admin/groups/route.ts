import { NextResponse } from "next/server";

import { apiSession } from "@/lib/auth/server";
import {
  createSchoolGroup,
  deleteSchoolGroup,
  getGroupsOverview,
  listPlatformGroups,
  updateSchoolGroup,
} from "@/lib/platform/groups";
import { errorCode } from "@/lib/errors";

export async function GET() {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });
  const [groups, overview] = await Promise.all([listPlatformGroups(session!), getGroupsOverview(session!)]);
  return NextResponse.json({ groups, overview });
}

export async function POST(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload", code: "VALIDATION" }, { status: 400 });
  }

  try {
    const result = await createSchoolGroup(session!, {
      name: typeof body.name === "string" ? body.name : "",
      city: typeof body.city === "string" ? body.city : null,
      country: typeof body.country === "string" ? body.country : undefined,
      pricePerSeat: typeof body.pricePerSeat === "number" ? body.pricePerSeat : undefined,
    });
    return NextResponse.json(result);
  } catch (e) {
    const code = errorCode(e);
    const status = code === "FORBIDDEN" ? 403 : code === "NAME_TAKEN" ? 409 : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}

export async function PATCH(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Missing id", code: "INVALID" }, { status: 400 });

  try {
    const result = await updateSchoolGroup(session!, id, {
      name: typeof body.name === "string" ? body.name : undefined,
      city: body.hasOwnProperty("city") ? (typeof body.city === "string" ? body.city : null) : undefined,
      country: typeof body.country === "string" ? body.country : undefined,
      status: typeof body.status === "string" ? body.status : undefined,
      pricePerSeat: typeof body.pricePerSeat === "number" ? body.pricePerSeat : undefined,
    });
    return NextResponse.json(result);
  } catch (e) {
    const code = errorCode(e);
    const status = code === "FORBIDDEN" ? 403 : code === "NOT_FOUND" ? 404 : code === "NAME_TAKEN" ? 409 : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}

export async function DELETE(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Missing id", code: "INVALID" }, { status: 400 });

  try {
    const result = await deleteSchoolGroup(session!, id);
    return NextResponse.json(result);
  } catch (e) {
    const code = errorCode(e);
    const status = code === "FORBIDDEN" ? 403 : code === "NOT_FOUND" ? 404 : code === "GROUP_HAS_SCHOOLS" ? 409 : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}
