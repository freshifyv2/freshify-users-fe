/**
 * GET / PUT proxy → users-be /v1/modules/users/settings
 *
 * Sprint 4 / C5 Phase B. Operator-only mutation (BE enforces).
 */
import { NextResponse } from "next/server";
import { getUsers, putUsers } from "@/lib/api";
import { requireToken } from "@/lib/session";

export async function GET() {
  try {
    const token = requireToken();
    const out = await getUsers("/v1/modules/users/settings", token);
    return NextResponse.json(out);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const token = requireToken();
    const body = await req.json();
    const out = await putUsers("/v1/modules/users/settings", token, body);
    return NextResponse.json(out);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 },
    );
  }
}
