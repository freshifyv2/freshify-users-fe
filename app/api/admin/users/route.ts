import { NextResponse } from "next/server";
import { postUsers } from "@/lib/api";
import { readSessionToken } from "@/lib/session";

/**
 * Operator-only proxy to freshify-users POST /v1/admin/users.
 * The BE enforces the operator claim — this route just forwards the JWT.
 */
export async function POST(req: Request) {
  const token = readSessionToken();
  if (!token) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const out = await postUsers<{ userId: string }>("/v1/admin/users", body, token);
    return NextResponse.json(out);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
