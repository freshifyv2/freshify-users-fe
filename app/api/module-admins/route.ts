/**
 * GET / POST proxy → users-be /v1/modules/users/admins
 *
 * Sprint 4 / C5 Phase B. Operator-only mutation (BE enforces).
 */
import { NextResponse } from "next/server";
import { getUsers, postUsers } from "@/lib/api";
import { requireToken } from "@/lib/session";

export async function GET() {
  try {
    const token = requireToken();
    const out = await getUsers("/v1/modules/users/admins", token);
    return NextResponse.json(out);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const token = requireToken();
    const body = await req.json();
    const out = await postUsers("/v1/modules/users/admins", body, token);
    return NextResponse.json(out);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 },
    );
  }
}
