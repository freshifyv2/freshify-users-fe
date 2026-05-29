import { NextResponse } from "next/server";
import { postUsers } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const out = await postUsers("/v1/otp/request", body);
    return NextResponse.json(out);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
