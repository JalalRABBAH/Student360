import { NextResponse } from "next/server";

import { apiSession } from "@/lib/auth/server";
import { listGroupPayments, recordGroupPayment } from "@/lib/platform/groups";
import { errorCode } from "@/lib/errors";

export async function GET() {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });
  try {
    const payments = await listGroupPayments(session!);
    return NextResponse.json({ payments });
  } catch (e) {
    const code = errorCode(e);
    const status = code === "FORBIDDEN" ? 403 : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}

export async function POST(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload", code: "VALIDATION" }, { status: 400 });
  }

  try {
    const result = await recordGroupPayment(session!, {
      billingId: typeof body.billingId === "string" ? body.billingId : "",
      type: (typeof body.type === "string" ? body.type : "") as "add" | "charge" | "refund" | "credit",
      amount: Number(body.amount) || 0,
      note: typeof body.note === "string" ? body.note : null,
      pdfFileId: typeof body.pdfFileId === "string" ? body.pdfFileId : null,
    });
    return NextResponse.json(result);
  } catch (e) {
    const code = errorCode(e);
    const status = code === "FORBIDDEN" ? 403 : code === "NOT_FOUND" ? 404 : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}
