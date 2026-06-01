import { redirect } from "next/navigation";
import Link from "next/link";
import { readSessionToken } from "@/lib/session";
import { decodeJwt } from "@/lib/jwt";
import { Chrome } from "@/lib/Chrome";
import { loadChromeContext } from "@/lib/chromeContext";

export const dynamic = "force-dynamic";

function handleFromEmail(email: string): string {
  if (!email) return "user";
  if (email.startsWith("+")) return email.replace(/[^0-9]/g, "");
  return email.split("@")[0] || email;
}

const IconProfile = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
);

const IconWorkspace = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="14" rx="2" />
    <path d="M3 9h18M8 18v3M16 18v3M6 21h12" />
  </svg>
);

const IconActivity = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconAudit = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export default async function DeleteAccountPage() {
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
      pageTitle="Delete Account"
      user={{ userId: claims.userId, displayName, handle, isOperator }}
      activeCompany={claims.companyName ? { name: claims.companyName } : null}
      tenantOptions={chromeCtx.tenantOptions}
    >
      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <Link href="/account">Account</Link>
        <span className="breadcrumb-sep" aria-hidden>›</span>
        <span className="breadcrumb-current">Delete Account</span>
      </div>

      <div style={{ maxWidth: 680 }}>
        <h2 className="page-top-title" style={{ marginBottom: 20 }}>Delete Account</h2>

        {/* WARNING BANNER */}
        <div className="warning-banner" style={{ marginBottom: 28 }}>
          <span className="warning-banner-icon" aria-hidden>⚠</span>
          <div>
            <strong>This action is permanent and cannot be undone</strong>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--amber-text)" }}>
              Deleting your account will permanently erase all of your data from Sovereign Portal. 
              Your profile, workspace memberships, activity history, and audit logs will be permanently destroyed. 
              There is no recovery path after deletion is confirmed.
            </p>
          </div>
        </div>

        {/* WHAT YOU'LL LOSE */}
        <div className="section-card">
          <div className="section-card-header">
            <h3 className="section-card-title">What you&apos;ll permanently lose:</h3>
          </div>
          <div className="loss-grid">
            <div className="loss-card">
              <div className="loss-card-icon" aria-hidden>{IconProfile}</div>
              <div className="loss-card-text">
                <p className="loss-card-title">Profile &amp; Data</p>
                <p className="loss-card-sub">
                  Your display name, handle, contact details, and all personal settings.
                </p>
              </div>
            </div>
            <div className="loss-card">
              <div className="loss-card-icon" aria-hidden>{IconWorkspace}</div>
              <div className="loss-card-text">
                <p className="loss-card-title">Workspace Access</p>
                <p className="loss-card-sub">
                  Removed from all workspaces immediately. Workspace data itself is not deleted.
                </p>
              </div>
            </div>
            <div className="loss-card">
              <div className="loss-card-icon" aria-hidden>{IconActivity}</div>
              <div className="loss-card-text">
                <p className="loss-card-title">Activity &amp; History</p>
                <p className="loss-card-sub">
                  Login history, preferences, and notification configurations permanently deleted.
                </p>
              </div>
            </div>
            <div className="loss-card">
              <div className="loss-card-icon" aria-hidden>{IconAudit}</div>
              <div className="loss-card-text">
                <p className="loss-card-title">Audit Log Entries</p>
                <p className="loss-card-sub">
                  All audit trail records associated with your user ID will be anonymized or removed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <Link href="/account" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="button" className="btn btn-primary" disabled>
            Continue to Delete
          </button>
        </div>
      </div>
    </Chrome>
  );
}
