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

// Inline SVG — lock icon for password modal
const IconLock = (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconBuilding = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21V8a1 1 0 0 1 1-1h7v14" />
    <path d="M11 21V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v17" />
    <path d="M6 11h2M6 14h2M6 17h2M15 7h2M15 10h2M15 13h2M15 16h2" />
  </svg>
);

export default async function EditProfilePage() {
  const token = readSessionToken();
  if (!token) redirect("/login");

  const claims = decodeJwt(token);
  if (!claims) redirect("/login");

  const chromeCtx = await loadChromeContext();
  if (!chromeCtx) redirect("/login");

  const displayName = claims.displayName || "User";
  const handle = handleFromEmail(claims.email);
  const isOperator = Boolean(claims.operator);
  const title = isOperator ? "Operator" : (claims.roles?.[0]?.role || "Member");
  const firstName = displayName.split(/\s+/)[0] || "";
  const lastName = displayName.split(/\s+/).slice(1).join(" ");
  const companyName = claims.companyName || "—";
  const email = claims.email || "";
  const phone = email.startsWith("+") ? email : "";

  return (
    <Chrome
      active="account"
      pageTitle="Edit Profile"
      user={{ userId: claims.userId, displayName, handle, isOperator }}
      activeCompany={claims.companyName ? { name: claims.companyName } : null}
      tenantOptions={chromeCtx.tenantOptions}
    >
      {/* === CHANGE PASSWORD MODAL (UAM04) === */}
      <input type="checkbox" id="change-password-modal" className="modal-toggle" aria-hidden />
      <label htmlFor="change-password-modal" className="modal-backdrop" aria-hidden />
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="cp-title">
        <div className="modal-icon-circle" aria-hidden>{IconLock}</div>
        <h2 className="modal-header-title" id="cp-title">Change your Password</h2>
        <p className="modal-header-sub">
          Enter the email address linked to your account. We&apos;ll send you a secure link to reset your password.
        </p>
        <div className="field">
          <label className="field-label" htmlFor="cp-email">EMAIL ADDRESS</label>
          <input
            id="cp-email"
            className="field-input"
            type="email"
            defaultValue={email}
            disabled
            readOnly
          />
        </div>
        <div className="modal-actions">
          <label htmlFor="change-password-modal" className="btn btn-ghost">Cancel</label>
          <button type="button" className="btn btn-primary" disabled>
            Send Reset Link
          </button>
        </div>
      </div>

      {/* === BREADCRUMB + TOP ACTION ROW === */}
      <div className="breadcrumb">
        <Link href="/account">Account</Link>
        <span className="breadcrumb-sep" aria-hidden>›</span>
        <span className="breadcrumb-current">Edit Profile</span>
      </div>

      <div className="page-top-row" style={{ marginBottom: 24 }}>
        <div className="page-top-row-left">
          <h2 className="page-top-title">Edit Profile</h2>
          <p className="page-top-sub">Update your personal information below.</p>
        </div>
        <button type="button" className="btn btn-primary" disabled>
          Save Changes
        </button>
      </div>

      {/* === PERSONAL INFORMATION === */}
      <div className="section-card" style={{ marginBottom: 20 }}>
        <div className="section-card-header">
          <h3 className="section-card-title">Personal Information</h3>
        </div>
        <div className="field-grid">
          <div className="field">
            <label className="field-label" htmlFor="ep-first">FIRST NAME</label>
            <input id="ep-first" className="field-input" defaultValue={firstName} disabled />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="ep-last">LAST NAME</label>
            <input id="ep-last" className="field-input" defaultValue={lastName} disabled />
          </div>
          <div className="field">
            <label className="field-label">USER HANDLE</label>
            <div className="field-readonly-row">
              <input
                className="field-input is-readonly"
                value={`@${handle}`}
                readOnly
                style={{ flex: 1 }}
              />
              <span className="field-check" aria-hidden>✓</span>
              <span className="field-check-label">System Generated</span>
            </div>
            <div className="field-hint">Automatically assigned — cannot be changed.</div>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="ep-title">JOB TITLE</label>
            <input id="ep-title" className="field-input" defaultValue={title} disabled />
          </div>
        </div>
      </div>

      {/* === CONTACT & SECURITY === */}
      <div className="section-card" style={{ marginBottom: 20 }}>
        <div className="section-card-header">
          <h3 className="section-card-title">Contact &amp; Security</h3>
        </div>
        <div className="field-grid">
          <div className="field">
            <label className="field-label" htmlFor="ep-phone">PHONE NO</label>
            <input id="ep-phone" className="field-input" defaultValue={phone} disabled placeholder="Not set" />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="ep-email">EMAIL ADDRESS</label>
            <input id="ep-email" className="field-input is-readonly" value={email} readOnly />
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label className="field-label">PASSWORD</label>
            <div className="password-row">
              <span className="password-dots" aria-label="Password hidden">••••••••••••</span>
              <label htmlFor="change-password-modal" className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}>
                Change Password →
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* === ORGANIZATION === */}
      <div className="section-card">
        <div className="section-card-header">
          <h3 className="section-card-title">Organization</h3>
        </div>
        <div className="field">
          <label className="field-label">MY COMPANY</label>
          <div className="org-card">
            <div className="org-card-icon" aria-hidden>{IconBuilding}</div>
            <span className="org-card-name">{companyName}</span>
            <span className="pill is-violet">Assigned</span>
          </div>
          <div className="field-hint">Company assignment is managed by your administrator.</div>
        </div>
      </div>
    </Chrome>
  );
}
