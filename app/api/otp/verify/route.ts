import { NextResponse } from "next/server";
import { postUsers } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/session";

interface VerifyResp {
  userId: string;
  isNewUser: boolean;
  sessionToken: string;
  expiresAt: string;
}

interface SelectResp {
  userId: string;
  isNewUser: false;
  sessionToken: string;
  expiresAt: string;
}

interface CompanyRow {
  companyId: string;
  name: string;
  role: string;
}

const COMPANIES_URL =
  process.env.COMPANIES_SERVICE_URL ||
  "https://freshify-companies-sbzaekoo4q-uc.a.run.app";

/**
 * Post-OTP flow:
 *   1. Verify the OTP code via freshify-users → get a no-company JWT.
 *   2. Call freshify-companies /v1/companies with that JWT to find the user's
 *      memberships.
 *   3. If exactly one membership, call freshify-users /v1/session/select to
 *      swap the JWT for one with that companyId+companyName populated.
 *   4. Persist whichever JWT we end up with as the sp_session cookie.
 *
 * Users with 0 or 2+ memberships land at /dashboard with a null companyId;
 * the dashboard surfaces an account picker for the 2+ case.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const verify = await postUsers<VerifyResp>("/v1/otp/verify", body);
    let sessionToken = verify.sessionToken;
    let expiresAt = verify.expiresAt;

    // Look up the user's companies. Failures here are non-fatal — we just
    // hand back the no-company token and let the dashboard handle it.
    try {
      const cmpRes = await fetch(`${COMPANIES_URL}/v1/companies`, {
        headers: { authorization: `Bearer ${sessionToken}` },
        cache: "no-store",
      });
      if (cmpRes.ok) {
        const cmpJson = (await cmpRes.json()) as { companies: CompanyRow[] };
        const memberships = cmpJson.companies ?? [];
        if (memberships.length === 1) {
          const only = memberships[0];
          const sel = await postUsers<SelectResp>(
            "/v1/session/select",
            {
              companyId: only.companyId,
              companyName: only.name,
            },
            sessionToken,
          );
          sessionToken = sel.sessionToken;
          expiresAt = sel.expiresAt;
        }
      }
    } catch {
      // swallow — fall back to the no-company token
    }

    const res = NextResponse.json({
      userId: verify.userId,
      isNewUser: verify.isNewUser,
      expiresAt,
    });
    const maxAge = Math.max(
      0,
      Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
    );
    res.cookies.set({
      name: SESSION_COOKIE,
      value: sessionToken,
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
