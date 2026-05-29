/**
 * Session cookie helpers. The portal shell sets a sp_session cookie that
 * carries the JWT issued by freshify-users. We read it server-side only;
 * never expose to client JS.
 */
import { cookies } from "next/headers";

export const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || "sp_session";

export function readSessionToken(): string | null {
  return cookies().get(SESSION_COOKIE)?.value ?? null;
}
