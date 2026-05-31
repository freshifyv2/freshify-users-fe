import { redirect } from "next/navigation";
import Link from "next/link";
import { readSessionToken } from "@/lib/session";
import { decodeJwt } from "@/lib/jwt";
import { Chrome } from "@/lib/Chrome";
import { getUsers } from "@/lib/api";

export const dynamic = "force-dynamic";

interface MeMembershipsResponse {
  companies: Array<{ companyId: string; name: string; role: "admin" | "member" }>;
  workspaces: Array<{
    workspaceId: string;
    name: string;
    companyId: string;
    role: "admin" | "member";
  }>;
}

async function fetchMyMemberships(token: string): Promise<MeMembershipsResponse> {
  try {
    return await getUsers<MeMembershipsResponse>("/v1/me/memberships", token);
  } catch {
    return { companies: [], workspaces: [] };
  }
}

function handleFromEmail(email: string): string {
  if (!email) return "user";
  if (email.startsWith("+")) return email.replace(/[^0-9]/g, "");
  return email.split("@")[0] || email;
}

interface AccountPageProps {
  searchParams?: { tab?: string };
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const token = readSessionToken();
  if (!token) redirect("/login");

  const claims = decodeJwt(token);
  if (!claims) redirect("/login");

  const memberships = await fetchMyMemberships(token);
  const tab = searchParams?.tab === "settings" ? "settings" : "profile";
  const displayName = claims.displayName || "User";
  const handle = handleFromEmail(claims.email);
  const isOperator = Boolean(claims.operator);
  const status = "Active"; // Could derive from claims.status if available
  const title = isOperator ? "Operator" : (claims.roles?.[0]?.role || "Member");

  const firstName = displayName.split(/\s+/)[0] || "";
  const lastName = displayName.split(/\s+/).slice(1).join(" ");

  return (
    <Chrome
      active="account"
      pageTitle="User Detail"
      user={{ userId: claims.userId, displayName, handle, isOperator }}
      activeCompany={claims.companyName ? { name: claims.companyName } : null}
    >
      {/* HERO CARD — RAS URM02 pattern */}
      <div className="hero-card">
        <div className="hero-card-left">
          <span className="avatar-circle is-lg" aria-hidden style={{ background: "var(--violet-soft)", color: "var(--violet)" }}>
            {(firstName[0] || "U").toUpperCase()}{(lastName[0] || "").toUpperCase()}
          </span>
          <div className="hero-card-text">
            <span className="status-pill is-active hero-card-status">Active</span>
            <h1 className="hero-card-title">
              {displayName}
              <span className="hero-card-handle">(@{handle})</span>
            </h1>
            <p className="hero-card-subtitle">{title}</p>
          </div>
        </div>
        <div className="hero-card-actions">
          <button type="button" className="btn btn-primary" disabled>
            Update User Profile
          </button>
        </div>
      </div>

      {/* PROFILE / SETTINGS tabs (RAS) */}
      <div className="detail-tabs">
        <Link href="?tab=profile" className={`detail-tab ${tab === "profile" ? "is-active" : ""}`}>
          PROFILE
        </Link>
        <Link href="?tab=settings" className={`detail-tab ${tab === "settings" ? "is-active" : ""}`}>
          SETTINGS
        </Link>
      </div>

      {tab === "profile" ? (
        <>
          {/* Primary Information card */}
          <div className="section-card">
            <div className="section-card-header">
              <h3 className="section-card-title">Primary Information</h3>
            </div>
            <div className="field-grid">
              <div className="field">
                <label className="field-label">FIRST NAME</label>
                <input className="field-input is-readonly" value={firstName} readOnly />
              </div>
              <div className="field">
                <label className="field-label">LAST NAME</label>
                <input className="field-input is-readonly" value={lastName} readOnly />
              </div>
              <div className="field">
                <label className="field-label">USER HANDLE</label>
                <input className="field-input is-readonly" value={`@${handle}`} readOnly />
              </div>
              <div className="field">
                <label className="field-label">USER STATUS</label>
                <select className="field-input field-select is-readonly" disabled>
                  <option>Active</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">PHONE NO</label>
                <input className="field-input is-readonly" value={claims.email?.startsWith("+") ? claims.email : ""} readOnly />
              </div>
              <div className="field">
                <label className="field-label">EMAIL</label>
                <input className="field-input is-readonly" value={claims.email || ""} readOnly />
              </div>
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label className="field-label">TITLE</label>
                <input className="field-input is-readonly" value={title} readOnly />
              </div>
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label className="field-label">USER ID</label>
                <input className="field-input is-readonly" value={claims.userId} readOnly />
                <div className="field-hint">Sovereign module identifier — used in all cross-module references.</div>
              </div>
            </div>
          </div>

          {/* Assigned Companies card — driven by Companies BE membership lookup */}
          <div className="section-card">
            <div className="section-card-header">
              <span className="section-card-icon" aria-hidden>◇</span>
              <h3 className="section-card-title">Assigned Companies</h3>
              {memberships.companies.length > 0 && (
                <span className="section-card-count">{memberships.companies.length}</span>
              )}
            </div>
            {memberships.companies.length > 0 ? (
              memberships.companies.map((c, idx) => {
                const isPrimary = c.companyId === claims.companyId || (!claims.companyId && idx === 0);
                return (
                  <div key={c.companyId} className="assignment-row">
                    <div className="assignment-row-info">
                      <h4 className="assignment-row-name">
                        {c.name || c.companyId}
                        {isPrimary && <span className="primary-badge">PRIMARY</span>}
                      </h4>
                      <span className="assignment-row-sub">Role: {c.role}</span>
                    </div>
                    <Link href={`/dashboard/companies/${c.companyId}`} className="btn btn-secondary btn-sm">
                      Open →
                    </Link>
                  </div>
                );
              })
            ) : isOperator ? (
              <div className="muted">
                Operators see all companies across tenants in the Companies module — no direct company memberships required.
              </div>
            ) : (
              <div className="muted">No company memberships found.</div>
            )}
          </div>

          {/* Assigned Workspaces card — driven by Workspaces BE membership lookup */}
          <div className="section-card">
            <div className="section-card-header">
              <span className="section-card-icon" aria-hidden>◉</span>
              <h3 className="section-card-title">Assigned Workspaces</h3>
              {memberships.workspaces.length > 0 && (
                <span className="section-card-count">{memberships.workspaces.length}</span>
              )}
            </div>
            {memberships.workspaces.length > 0 ? (
              memberships.workspaces.map((w) => (
                <div key={w.workspaceId} className="assignment-row">
                  <div className="assignment-row-info">
                    <h4 className="assignment-row-name">{w.name || w.workspaceId}</h4>
                    <span className="assignment-row-sub">
                      Company: {w.companyId} · Role: {w.role}
                    </span>
                  </div>
                  <Link href={`/dashboard/workspaces/${w.workspaceId}`} className="btn btn-secondary btn-sm">
                    Open →
                  </Link>
                </div>
              ))
            ) : isOperator ? (
              <div className="muted">
                Operators see all workspaces across tenants in the Workspaces module — no direct workspace memberships required.
              </div>
            ) : (
              <div className="muted">No workspace memberships found.</div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* SETTINGS TAB */}
          <div className="section-card">
            <div className="section-card-header">
              <h3 className="section-card-title">Notification Settings</h3>
            </div>
            <div className="toggle-row">
              <span className="toggle-row-label">Email Notifications</span>
              <label className="toggle">
                <input type="checkbox" defaultChecked disabled />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="toggle-row">
              <span className="toggle-row-label">SMS Notifications</span>
              <label className="toggle">
                <input type="checkbox" disabled />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="toggle-row">
              <span className="toggle-row-label">Push Notifications</span>
              <label className="toggle">
                <input type="checkbox" defaultChecked disabled />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-header">
              <h3 className="section-card-title">Change Password</h3>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Password reset via email</p>
                <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--muted)" }}>You can request a password change through the email process. A reset link will be sent to your registered email.</p>
              </div>
              <button type="button" className="btn btn-primary" disabled>Send Password Reset Email</button>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-header">
              <h3 className="section-card-title">Account Actions</h3>
            </div>
            <div className="action-row">
              <span className="action-row-icon" aria-hidden>⊘</span>
              <div className="action-row-text">
                <p className="action-row-title">Deactivate Account</p>
                <p className="action-row-sub">Temporarily disable profile</p>
              </div>
            </div>
            <div className="action-row">
              <span className="action-row-icon" aria-hidden>✕</span>
              <div className="action-row-text">
                <p className="action-row-title">Delete Account</p>
                <p className="action-row-sub">Permanently remove all data</p>
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-header">
              <h3 className="section-card-title">Session</h3>
            </div>
            <form action="/api/logout" method="post">
              <button type="submit" className="btn btn-secondary">Sign Out</button>
            </form>
          </div>
        </>
      )}
    </Chrome>
  );
}
