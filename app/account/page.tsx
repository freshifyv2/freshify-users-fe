import { redirect } from "next/navigation";
import Link from "next/link";
import { readSessionToken } from "@/lib/session";
import { decodeJwt } from "@/lib/jwt";
import { Chrome } from "@freshifyv2/portal-shell-ui";
import { loadChromeContext } from "@freshifyv2/portal-shell-ui";
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
  // Synthetic phone-only users have email of form `phone+<E164>@users.freshify.io`.
  // Render the E.164 phone (with single leading +), not the literal `phone+` prefix.
  const phoneMatch = email.match(/^phone\+?(\+?\d+)/);
  if (phoneMatch) return `+${phoneMatch[1].replace(/[^0-9]/g, "")}`;
  if (email.startsWith("+")) return email;
  return email.split("@")[0] || email;
}

// Inline SVG icons for controls rows
const IconEdit = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconBell = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 1 1 12 0c0 4 1.5 6 2 7H4c.5-1 2-3 2-7z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
);

const IconShield = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconDeactivate = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M4.93 4.93l14.14 14.14" />
  </svg>
);

const IconTrash = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const IconChevronRight = (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const IconBuilding = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21V8a1 1 0 0 1 1-1h7v14" />
    <path d="M11 21V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v17" />
    <path d="M6 11h2M6 14h2M6 17h2M15 7h2M15 10h2M15 13h2M15 16h2" />
  </svg>
);

const IconWorkspace = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="14" rx="2" />
    <path d="M3 9h18M8 18v3M16 18v3M6 21h12" />
  </svg>
);

// Hardcoded join-workspaces data (UAM02)
const JOIN_WORKSPACES = [
  { id: "ew", name: "Eastern Hub", tag: "Distribution", members: 24, requested: true },
  { id: "ml", name: "Midwest Logistics Hub", tag: "Hub", members: 18, requested: false },
  { id: "sn", name: "Southern Network", tag: "Retail", members: 31, requested: false },
  { id: "po", name: "Pacific Ops", tag: "Warehouse", members: 12, requested: false },
];

export default async function AccountPage() {
  const token = readSessionToken();
  if (!token) redirect("/login");

  const claims = decodeJwt(token);
  if (!claims) redirect("/login");

  const [chromeCtx, memberships] = await Promise.all([
    loadChromeContext(),
    fetchMyMemberships(token),
  ]);

  if (!chromeCtx) redirect("/login");

  const displayName = claims.displayName || "User";
  const handle = handleFromEmail(claims.email);
  const isOperator = Boolean(claims.operator);
  const title = isOperator ? "Operator" : (claims.roles?.[0]?.role || "Member");
  const firstName = displayName.split(/\s+/)[0] || "";
  const lastName = displayName.split(/\s+/).slice(1).join(" ");

  // Primary company
  const primaryCompany =
    memberships.companies.find((c) => c.companyId === claims.companyId) ||
    memberships.companies[0] ||
    null;

  // Show up to 3 workspaces in grid
  const displayWorkspaces = memberships.workspaces.slice(0, 3);

  return (
    <Chrome
      active="account"
      pageTitle="My Account"
      user={{ userId: claims.userId, displayName, handle, isOperator }}
      activeCompany={claims.companyName ? { name: claims.companyName } : null}
      tenantOptions={chromeCtx.tenantOptions}
    >
      {/* === JOIN WORKSPACES MODAL (UAM02) === */}
      <input type="checkbox" id="join-workspaces-modal" className="modal-toggle" aria-hidden />
      <label htmlFor="join-workspaces-modal" className="modal-backdrop" aria-hidden />
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="jw-title">
        <h2 className="modal-header-title" id="jw-title">JOIN WORKSPACES</h2>
        <p className="modal-header-sub" style={{ marginBottom: 8 }}>All workspaces</p>
        <div>
          {JOIN_WORKSPACES.map((ws) => (
            <div key={ws.id} className={`join-ws-row${ws.requested ? " is-requested" : ""}`}>
              <div className="join-ws-icon" aria-hidden>{IconWorkspace}</div>
              <div className="join-ws-info">
                <p className="join-ws-name">{ws.name}</p>
                <div className="join-ws-meta">
                  <span className="pill">{ws.tag}</span>
                  <span className="muted" style={{ fontSize: 12 }}>{ws.members} members</span>
                </div>
              </div>
              {ws.requested ? (
                <button type="button" className="btn btn-secondary btn-sm" disabled>
                  Requested ✓
                </button>
              ) : (
                <button type="button" className="btn btn-primary btn-sm" disabled>
                  Send Request
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <label htmlFor="join-workspaces-modal" className="btn btn-ghost">Close</label>
        </div>
      </div>

      {/* === HERO CARD (UAM01) === */}
      <div className="hero-card" style={{ marginBottom: 28 }}>
        <div className="hero-card-left">
          <span
            className="avatar-circle is-lg"
            aria-hidden
            style={{ background: "var(--violet-soft)", color: "var(--violet)" }}
          >
            {(firstName[0] || "U").toUpperCase()}{(lastName[0] || "").toUpperCase()}
          </span>
          <div className="hero-card-text">
            <span className="status-pill is-active hero-card-status">Active</span>
            <h1 className="hero-card-title">
              {displayName}
              <span className="hero-card-handle">(@{handle})</span>
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <span className="pill is-violet">{title}</span>
            </div>
          </div>
        </div>
        <div className="hero-card-actions">
          <button type="button" className="btn btn-secondary" disabled>
            Edit Profile Photo
          </button>
        </div>
      </div>

      {/* === 2-COLUMN GRID === */}
      <div className="account-grid">
        {/* LEFT COLUMN */}
        <div>
          {/* ASSOCIATED COMPANY */}
          <div className="section-label">
            <span>Associated Company</span>
          </div>
          {primaryCompany ? (
            <div className="company-row-card" style={{ marginBottom: 24 }}>
              <div className="company-row-card-icon" aria-hidden>{IconBuilding}</div>
              <div className="company-row-card-info">
                <p className="company-row-card-name">{primaryCompany.name || primaryCompany.companyId}</p>
                <span className="pill is-violet">Assigned</span>
              </div>
              <span className="company-row-card-badge">Super Admin</span>
            </div>
          ) : (
            <div className="section-card" style={{ marginBottom: 24 }}>
              <p className="muted" style={{ padding: "16px 20px" }}>
                {isOperator
                  ? "Operators see all companies in the Companies module."
                  : "No company membership found."}
              </p>
            </div>
          )}

          {/* ASSOCIATED WORKSPACES */}
          <div className="section-label">
            <span>Associated Workspaces</span>
            <label htmlFor="join-workspaces-modal" style={{ cursor: "pointer", color: "var(--violet)", fontWeight: 600, fontSize: 12 }}>
              Join Workspaces →
            </label>
          </div>

          {displayWorkspaces.length > 0 ? (
            <div className="workspace-grid">
              {displayWorkspaces.map((w) => (
                <div key={w.workspaceId} className="workspace-card">
                  <div className="workspace-card-icon" aria-hidden style={{ marginBottom: 4 }}>{IconWorkspace}</div>
                  <p className="workspace-card-name">{w.name || w.workspaceId}</p>
                  <span className="workspace-card-role">
                    <span className="pill">{w.role}</span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="section-card">
              <p className="muted" style={{ padding: "16px 20px" }}>
                {isOperator
                  ? "Operators see all workspaces in the Workspaces module."
                  : "No workspace memberships found."}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* SYSTEM CONTROLS */}
          <div className="section-card" style={{ marginBottom: 16, padding: 0 }}>
            <div className="section-card-header" style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
              <h3 className="section-card-title">System Controls</h3>
            </div>
            <Link href="/dashboard/users/account/edit" className="controls-row">
              <span className="controls-row-icon" aria-hidden>{IconEdit}</span>
              <div className="controls-row-text">
                <p className="controls-row-title">Edit Profile</p>
                <p className="controls-row-sub">Update personal information</p>
              </div>
              <span className="controls-row-chevron" aria-hidden>{IconChevronRight}</span>
            </Link>
            <Link href="/dashboard/users/account/notifications" className="controls-row">
              <span className="controls-row-icon" aria-hidden>{IconBell}</span>
              <div className="controls-row-text">
                <p className="controls-row-title">Notification Settings</p>
                <p className="controls-row-sub">Email, SMS, and Push</p>
              </div>
              <span className="controls-row-chevron" aria-hidden>{IconChevronRight}</span>
            </Link>
            <Link href="/dashboard/users/account/privacy" className="controls-row">
              <span className="controls-row-icon" aria-hidden>{IconShield}</span>
              <div className="controls-row-text">
                <p className="controls-row-title">Privacy Policy</p>
                <p className="controls-row-sub">How we handle your data</p>
              </div>
              <span className="controls-row-chevron" aria-hidden>{IconChevronRight}</span>
            </Link>
            <Link href="/dashboard/users/account/data-usage" className="controls-row">
              <span className="controls-row-icon" aria-hidden>{IconShield}</span>
              <div className="controls-row-text">
                <p className="controls-row-title">Data Usage Guidelines</p>
                <p className="controls-row-sub">What we collect and why</p>
              </div>
              <span className="controls-row-chevron" aria-hidden>{IconChevronRight}</span>
            </Link>
          </div>

          {/* DANGER ZONE */}
          <div className="danger-card" style={{ padding: 0 }}>
            <div className="section-card-header" style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
              <h3 className="section-card-title" style={{ color: "var(--red-text)" }}>Danger Zone</h3>
            </div>
            <Link href="/dashboard/users/account/deactivate" className="controls-row">
              <span className="controls-row-icon is-red" aria-hidden>{IconDeactivate}</span>
              <div className="controls-row-text">
                <p className="controls-row-title">Deactivate Account</p>
                <p className="controls-row-sub">Temporarily disable profile</p>
              </div>
              <span className="controls-row-chevron" aria-hidden>{IconChevronRight}</span>
            </Link>
            <Link href="/dashboard/users/account/delete" className="controls-row">
              <span className="controls-row-icon is-red" aria-hidden>{IconTrash}</span>
              <div className="controls-row-text">
                <p className="controls-row-title">Delete Account</p>
                <p className="controls-row-sub">Permanently remove all data</p>
              </div>
              <span className="controls-row-chevron" aria-hidden>{IconChevronRight}</span>
            </Link>
          </div>
        </div>
      </div>
    </Chrome>
  );
}
