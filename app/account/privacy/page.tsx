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

export default async function PrivacyPage() {
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
      pageTitle="Privacy Policy"
      user={{ userId: claims.userId, displayName, handle, isOperator }}
      activeCompany={claims.companyName ? { name: claims.companyName } : null}
      tenantOptions={chromeCtx.tenantOptions}
    >
      <div className="breadcrumb">
        <Link href="/dashboard/users/account">Account</Link>
        <span className="breadcrumb-sep" aria-hidden>›</span>
        <span className="breadcrumb-current">Privacy Policy</span>
      </div>

      <div style={{ maxWidth: 760 }}>
        <h2 className="page-top-title" style={{ marginBottom: 20 }}>Privacy Policy</h2>

        <div className="section-card" style={{ padding: "24px 28px" }}>
          <p className="muted" style={{ marginBottom: 14, fontSize: 13 }}>
            Last updated: June 2026 (draft)
          </p>

          <h3 className="section-card-title" style={{ marginTop: 0 }}>How we handle your data</h3>
          <p style={{ marginBottom: 16, lineHeight: 1.6 }}>
            Sovereign Portal stores only the information required to operate your account: identity
            (display name, email, phone), the companies and workspaces you belong to, and an audit
            trail of administrative actions. We do not sell personal data and we do not run
            third-party advertising trackers inside the portal.
          </p>

          <h3 className="section-card-title">Who can see your information</h3>
          <p style={{ marginBottom: 16, lineHeight: 1.6 }}>
            Other members of a company or workspace can see your name, role, and contact details
            within the context of that tenant. Operators with platform-level roles can see all
            tenants for support and reconciliation. No information is shared across tenants
            without an explicit assignment.
          </p>

          <h3 className="section-card-title">Your controls</h3>
          <p style={{ marginBottom: 16, lineHeight: 1.6 }}>
            You can review and update your profile from{" "}
            <Link href="/dashboard/users/account/edit" style={{ color: "var(--violet)", fontWeight: 600 }}>
              Edit Profile
            </Link>
            , manage notifications from{" "}
            <Link href="/dashboard/users/account/notifications" style={{ color: "var(--violet)", fontWeight: 600 }}>
              Notification Settings
            </Link>
            , or request deactivation or deletion from the Account page Danger Zone.
          </p>

          <h3 className="section-card-title">Questions</h3>
          <p style={{ marginBottom: 0, lineHeight: 1.6 }}>
            Contact your tenant administrator or the Sovereign Portal operations team. A full
            policy will be published before general availability.
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
