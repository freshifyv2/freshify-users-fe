import { redirect } from "next/navigation";
import { readSessionToken } from "@/lib/session";

/**
 * Users service root.
 *
 * In the composed portal (this app is mounted at /dashboard/users/* by the
 * portal-shell rewrites), authenticated traffic should not land here — the
 * shell sends them to /dashboard. As a defensive redirect, push to /account
 * when a session is present.
 *
 * Unauthenticated traffic: send to /login. When this app is hit through
 * the portal-shell, /login resolves to the shell's RLG06 page (rebuilt in
 * slice 5.18g). Direct hits to the standalone users-fe URL also resolve
 * to /login (which no longer exists in this app since slice 5.18h), so we
 * additionally support a PORTAL_SHELL_URL env to redirect to the shell
 * domain when running outside the shell composition.
 */
export default function UsersIndex() {
  const token = readSessionToken();
  if (token) redirect("/account");
  const shellUrl = process.env.PORTAL_SHELL_URL;
  if (shellUrl) redirect(`${shellUrl.replace(/\/$/, "")}/login`);
  redirect("/login");
}
