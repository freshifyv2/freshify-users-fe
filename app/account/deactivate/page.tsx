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

const IconStatus = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M4.93 4.93l14.14 14.14" />
  </svg>
);

const IconBell = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 1 1 12 0c0 4 1.5 6 2 7H4c.5-1 2-3 2-7z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
    <line x1="20" y1="2" x2="4" y2="20" />
  </svg>
);

const IconRefresh = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

export default async function DeactivatePage() {
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
      pageTitle="Deactivate Account"
      user={{ userId: claims.userId, displayName, handle, isOperator }}
      activeCompany={claims.companyName ? { name: claims.companyName } : null}
      tenantOptions={chromeCtx.tenantOptions}
    >
      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <Link href="/dashboard/users/account">Account</Link>
        <span className="breadcrumb-sep" aria-hidden>›</span>
        <span className="breadcrumb-current">Deactivate Account</span>
      </div>

      <div style={{ maxWidth: 680 }}>
        <h2 className="page-top-title" style={{ marginBottom: 20 }}>Deactivate Account</h2>

        {/* WARNING BANNER */}
        <div className="warning-banner" style={{ marginBottom: 28 }}>
          <span className="warning-banner-icon" aria-hidden>⚠</span>
          <div>
            <strong>Before you continue</strong>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--amber-text)" }}>
              Deactivating your account will temporarily disable access to Sovereign Portal. 
              You will not be able to log in or access any modules until your account is reactivated.
            </p>
          </div>
        </div>

        {/* WHAT CHANGES */}
        <div className="section-card">
          <div className="section-card-header">
            <h3 className="section-card-title">Here&apos;s what changes:</h3>
          </div>
          <div className="changes-list">
            <div className="changes-item">
              <div className="changes-item-icon" aria-hidden>{IconStatus}</div>
              <div className="changes-item-text">
                <p className="changes-item-title">Status set to Deactivated</p>
                <p className="changes-item-sub">
                  Your profile will be marked as deactivated across all modules. Other users will not see you as active.
                </p>
              </div>
            </div>
            <div className="changes-item">
              <div className="changes-item-icon" aria-hidden>{IconBell}</div>
              <div className="changes-item-text">
                <p className="changes-item-title">No notifications sent</p>
                <p className="changes-item-sub">
                  All email, SMS, and push notifications will be suspended during deactivation.
                </p>
              </div>
            </div>
            <div className="changes-item">
              <div className="changes-item-icon" aria-hidden>{IconRefresh}</div>
              <div className="changes-item-text">
                <p className="changes-item-title">Auto-reactivates on login</p>
                <p className="changes-item-sub">
                  Your account will be automatically restored the next time you sign in. No data will be lost.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <Link href="/dashboard/users/account" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="button" className="btn btn-primary" disabled>
            Continue to Deactivate
          </button>
        </div>
      </div>
    </Chrome>
  );
}
