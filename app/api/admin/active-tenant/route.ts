/**
 * Operator-only: persist the active tenant scope in a separate cookie.
 *
 * We deliberately do NOT mutate the signed JWT — instead we set a plain
 * `sp_active_tenant` cookie (httpOnly, same-site lax). Pages read it via
 * `readActiveTenant()` and pass it down as a query parameter / filter on
 * every list/detail fetch.
 *
 * - companyId="" or absent → clear the override (operator sees all)
 * - companyId="cmp_xxx"   → set the override (operator sees only that company)
 *
 * Non-operators are rejected; the cookie is never honoured for them server-side either.
 */

import { NextResponse } from "next/server";
import { readSessionToken } from "@/lib/session";
import { decodeJwt } from "@/lib/jwt";

const ACTIVE_TENANT_COOKIE = "sp_active_tenant";

export async function POST(req: Request) {
  const token = readSessionToken();
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url), { status: 303 });
  }
  const claims = decodeJwt(token);
  if (!claims?.operator) {
    return NextResponse.json({ error: "operator only" }, { status: 403 });
  }

  const form = await req.formData();
  const companyId = String(form.get("companyId") ?? "").trim();

  const referer = req.headers.get("referer") || "/dashboard";
  const res = NextResponse.redirect(referer, { status: 303 });

  if (!companyId) {
    res.cookies.delete(ACTIVE_TENANT_COOKIE);
  } else {
    res.cookies.set(ACTIVE_TENANT_COOKIE, companyId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
  return res;
}
