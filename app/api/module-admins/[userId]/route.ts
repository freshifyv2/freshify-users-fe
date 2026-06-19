/**
 * DELETE proxy → users-be /v1/modules/users/admins/:userId
 *
 * Sprint 4 / C5 Phase B. Operator-only (BE enforces).
 */
import { NextResponse } from "next/server";
import { delUsers } from "@/lib/api";
import { requireToken } from "@/lib/session";

export async function DELETE(
  _req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const token = requireToken();
    const out = await delUsers(
      `/v1/modules/users/admins/${encodeURIComponent(params.userId)}`,
      token,
    );
    return NextResponse.json(out);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 },
    );
  }
}
