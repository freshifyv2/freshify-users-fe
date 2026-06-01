/**
 * Operator-only proxy to freshify-users PATCH /v1/admin/users/:userId.
 * The BE enforces the operator claim — this route just forwards the JWT.
 */
import { NextResponse } from "next/server";
import { patchUsers } from "@/lib/api";
import { readSessionToken } from "@/lib/session";

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } },
) {
  const token = readSessionToken();
  if (!token) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const out = await patchUsers<{ ok: true; userId: string; changed: string[] }>(
      `/v1/admin/users/${params.userId}`,
      body,
      token,
    );
    return NextResponse.json(out);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
