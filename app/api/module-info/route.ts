/**
 * GET proxy → users-be /v1/modules/users/info
 *
 * Sprint 4 / C5 Phase B. Public read for any authenticated session.
 */
import { NextResponse } from "next/server";
import { getUsers } from "@/lib/api";
import { requireToken } from "@/lib/session";

export async function GET() {
  try {
    const token = requireToken();
    const out = await getUsers("/v1/modules/users/info", token);
    return NextResponse.json(out);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 },
    );
  }
}
