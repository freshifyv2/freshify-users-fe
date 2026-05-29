import { NextResponse } from "next/server";
import { postUsers } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/session";

interface VerifyResp {
  userId: string;
  isNewUser: boolean;
  sessionToken: string;
  expiresAt: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const out = await postUsers<VerifyResp>("/v1/otp/verify", body);
    const res = NextResponse.json({
      userId: out.userId,
      isNewUser: out.isNewUser,
      expiresAt: out.expiresAt,
    });
    const maxAge = Math.max(
      0,
      Math.floor((new Date(out.expiresAt).getTime() - Date.now()) / 1000),
    );
    res.cookies.set({
      name: SESSION_COOKIE,
      value: out.sessionToken,
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge,
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
