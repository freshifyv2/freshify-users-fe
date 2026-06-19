import { redirect } from "next/navigation";
import Link from "next/link";
import { readSessionToken } from "@/lib/session";
import { decodeJwt } from "@/lib/jwt";
import { Chrome } from "@freshifyv2/portal-shell-ui";
import { loadChromeContext } from "@freshifyv2/portal-shell-ui";

export const dynamic = "force-dynamic";

function handleFromEmail(email: string): string {
  if (!email) return "user";
  if (email.startsWith("+")) return email.replace(/[^0-9]/g, "");
  return email.split("@")[0] || email;
}

export default async function DataUsagePage() {
  const token = readSessionToken();
  if (!token) redirect("/login");

  const claims = decodeJwt(token);
  if (!claims) redirect("/login");

  const chromeCtx = await loadChromeContext();
  if (!chromeCtx) redirect("/login");

  const displayName = claims.displayName || "User";
  const handle = handleFromEmail(claims.email);
  const isOperator = Boolean(claims.operator);

  return (
    <Chrome
      active="account"
      pageTitle="Data Usage Guidelines"
      user={{ userId: claims.userId, displayName, handle, isOperator }}
      activeCompany={claims.companyName ? { name: claims.companyName } : null}
      tenantOptions={chromeCtx.tenantOptions}
    >
      <div className="breadcrumb">
        <Link href="/dashboard/users/account">Account</Link>
        <span className="breadcrumb-sep" aria-hidden>›</span>
        <span className="breadcrumb-current">Data Usage Guidelines</span>
      </div>

      <div style={{ maxWidth: 760 }}>
        <h2 className="page-top-title" style={{ marginBottom: 20 }}>Data Usage Guidelines</h2>

        <div className="section-card" style={{ padding: "24px 28px" }}>
          <p className="muted" style={{ marginBottom: 14, fontSize: 13 }}>
            Last updated: June 2026 (draft)
          </p>

          <h3 className="section-card-title" style={{ marginTop: 0 }}>What we collect</h3>
          <ul style={{ marginBottom: 16, lineHeight: 1.7, paddingLeft: 20 }}>
            <li><strong>Identity</strong> — display name, email, phone, and the avatar initial we generate from your name.</li>
            <li><strong>Membership</strong> — the companies and workspaces you belong to, and your role in each.</li>
            <li><strong>Activity</strong> — administrative actions you take (invites, role changes, assignments) for audit and compliance.</li>
            <li><strong>Session metadata</strong> — sign-in time, OTP delivery status, and the device used for sign-in.</li>
          </ul>

          <h3 className="section-card-title">What we do not collect</h3>
          <ul style={{ marginBottom: 16, lineHeight: 1.7, paddingLeft: 20 }}>
            <li>Third-party advertising cookies or cross-site trackers.</li>
            <li>Content from other applications or services you use.</li>
            <li>Location data beyond what your browser sends on a normal HTTPS request.</li>
          </ul>

          <h3 className="section-card-title">How long we keep it</h3>
          <p style={{ marginBottom: 16, lineHeight: 1.6 }}>
            Profile and membership records are retained while your account is active. The audit
            trail is retained for the duration required by your tenant&apos;s compliance policy
            (typically 7 years). Session tokens expire automatically; you can sign out at any
            time to revoke the active session.
          </p>

          <h3 className="section-card-title">Exports and deletion</h3>
          <p style={{ marginBottom: 0, lineHeight: 1.6 }}>
            You can request a copy of your data or permanent deletion from the Danger Zone on the{" "}
            <Link href="/dashboard/users/account" style={{ color: "var(--violet)", fontWeight: 600 }}>
              Account page
            </Link>
            . Deletion is irreversible once confirmed.
          </p>
        </div>

        <div style={{ marginTop: 28 }}>
          <Link href="/dashboard/users/account" className="btn btn-secondary">
            Back to Account
          </Link>
        </div>
      </div>
    </Chrome>
  );
}
