/**
 * URM01 — Users List (operator-only)
 *
 * Cross-tenant user directory. Only visible to users with the operator claim.
 * Tenants users see a 404/redirect.
 *
 * Columns: USER DETAILS | TITLE | PHONE NO | LAST ACTIVITY | STATUS |
 *          ASSIGNED COMPANY | ASSIGNED WORKSPACES
 */
import { redirect } from "next/navigation";
import Link from "next/link";
import { readSessionToken } from "@/lib/session";
import { decodeJwt } from "@/lib/jwt";
import { getUsers } from "@/lib/api";
import { Chrome } from "@/lib/Chrome";
import { loadChromeContext } from "@/lib/chromeContext";

export const dynamic = "force-dynamic";

interface AdminUserRow {
  userId: string;
  displayName: string | null;
  email: string;
  phone?: string | null;
  title?: string | null;
  status?: "active" | "inactive" | "pending" | null;
  lastActiveAt?: string | null;
  assignedCompanies?: Array<{ companyId: string; name: string }>;
  assignedWorkspaces?: Array<{ workspaceId: string; name: string }>;
  isOperator?: boolean;
}

interface AdminUsersResponse {
  users: AdminUserRow[];
}

function handleFromEmail(email?: string | null): string {
  if (!email) return "user";
  if (email.startsWith("+")) return email.replace(/[^0-9]/g, "");
  return email.split("@")[0] || email;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function formatRelative(iso?: string | null): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const delta = Date.now() - then;
  const mins = Math.round(delta / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function statusClass(status?: string | null): string {
  if (status === "inactive") return "is-inactive";
  if (status === "pending") return "is-pending";
  return "is-active";
}

function statusLabel(status?: string | null): string {
  if (status === "inactive") return "Inactive";
  if (status === "pending") return "Pending";
  return "Active";
}

export default async function UsersListPage() {
  const token = readSessionToken();
  if (!token) redirect("/login");

  const claims = decodeJwt(token);
  if (!claims) redirect("/login");

  // Operator gate — non-operators bounce back to dashboard
  if (!claims.operator) redirect("/dashboard");

  const isOperator = Boolean(claims.operator);
  const displayName = claims.displayName || claims.email || "User";
  const handle = handleFromEmail(claims.email);

  let users: AdminUserRow[] = [];
  let error: string | null = null;
  try {
    const out = await getUsers<AdminUsersResponse>("/v1/admin/users", token);
    users = out.users || [];
  } catch (e) {
    error = (e as Error).message;
  }

  const total = users.length;
  const active = users.filter((u) => (u.status || "active") === "active").length;
  const inactive = users.filter((u) => u.status === "inactive").length;
  const pending = users.filter((u) => u.status === "pending").length;

  return (
    <Chrome
      active="users"
      pageTitle="Users"
      user={{ userId: claims.userId, displayName, handle, isOperator }}
      activeCompany={claims.companyName ? { name: claims.companyName } : null}
    >
      <div className="page-breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <span className="page-breadcrumb-sep">›</span>
        <span className="page-breadcrumb-current">Users</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-header-title">Overview</h1>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn btn-secondary">
            <span aria-hidden>⬆</span> Export
          </button>
          <Link href="/dashboard/users/list/new" className="btn btn-primary">
            + New User
          </Link>
        </div>
      </div>

      {error && (
        <div className="warning-banner" style={{ marginBottom: 16 }}>
          <span className="warning-banner-icon" aria-hidden>⚠</span>
          {error}
        </div>
      )}

      {/* RAS metric cards */}
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-icon" aria-hidden>◯</span>
            <span className="metric-card-badge">+{total} TOTAL</span>
          </div>
          <div className="metric-card-body">
            <p className="metric-card-label">Total Users</p>
            <p className="metric-card-value">{total}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-icon is-green" aria-hidden>✓</span>
            <span className="metric-card-badge">{total > 0 ? Math.round((active / total) * 100) : 0}% ACTIVE</span>
          </div>
          <div className="metric-card-body">
            <p className="metric-card-label">Active</p>
            <p className="metric-card-value">{active}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-icon is-amber" aria-hidden>⊘</span>
            <span className="metric-card-badge is-amber">PENDING</span>
          </div>
          <div className="metric-card-body">
            <p className="metric-card-label">Pending</p>
            <p className="metric-card-value">{pending}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-icon" aria-hidden>✕</span>
            <span className="metric-card-badge is-gray">INACTIVE</span>
          </div>
          <div className="metric-card-body">
            <p className="metric-card-label">Inactive</p>
            <p className="metric-card-value">{inactive}</p>
          </div>
        </div>
      </div>

      {/* List card with filter bar + table */}
      <div className="list-card">
        <div className="filter-bar">
          <div className="filter-pills">
            <button type="button" className="filter-pill is-active">All</button>
            <button type="button" className="filter-pill">Active</button>
            <button type="button" className="filter-pill">Pending</button>
            <button type="button" className="filter-pill">Inactive</button>
          </div>
          <div className="search-input-wrap">
            <span className="search-input-icon" aria-hidden>⌕</span>
            <input
              className="search-input"
              placeholder="search for name, title, company, workspace, phone..."
              disabled
            />
          </div>
          <button type="button" className="filter-button" aria-label="Filter">⚙</button>
        </div>

        {users.length === 0 ? (
          <div className="list-card-empty">
            <p style={{ margin: "24px 0 8px", fontWeight: 600, color: "var(--fg)" }}>No users yet</p>
            <p style={{ margin: 0 }}>Invite a user to get started.</p>
          </div>
        ) : (
          <>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Title</th>
                    <th>Phone No</th>
                    <th>Last Activity</th>
                    <th>Status</th>
                    <th>Assigned Company</th>
                    <th>Assigned Workspaces</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const uHandle = handleFromEmail(u.email);
                    const companies = u.assignedCompanies || [];
                    const workspaces = u.assignedWorkspaces || [];
                    const firstCompany = companies[0];
                    const overflowCompanies = companies.length - 1;
                    const firstWs = workspaces[0];
                    const overflowWs = workspaces.length - 1;
                    return (
                      <tr key={u.userId} className="is-clickable">
                        <td>
                          <div className="user-cell">
                            <span className="avatar-circle">{initials(u.displayName || u.email || "?")}</span>
                            <div className="user-cell-text">
                              <Link
                                href={`/dashboard/users/list/${u.userId}`}
                                className="user-cell-name"
                                style={{ color: "var(--fg)", textDecoration: "none" }}
                              >
                                {u.displayName || u.email || "(unnamed)"}
                              </Link>
                              <div className="user-cell-handle">@{uHandle}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`pill ${u.isOperator ? "is-violet" : "is-gray"}`}>
                            {u.isOperator ? "Operator" : (u.title || "Member")}
                          </span>
                        </td>
                        <td style={{ color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                          {u.phone || (u.email?.startsWith("+") ? u.email : "—")}
                        </td>
                        <td style={{ color: "var(--muted)" }}>
                          {formatRelative(u.lastActiveAt)}
                        </td>
                        <td>
                          <span className={`status-pill ${statusClass(u.status)}`}>
                            {statusLabel(u.status)}
                          </span>
                        </td>
                        <td>
                          {firstCompany ? (
                            <span className="tag-cell">
                              <span className="tag-chip">{firstCompany.name || firstCompany.companyId}</span>
                              {overflowCompanies > 0 && (
                                <span className="tag-chip-overflow">+{overflowCompanies}</span>
                              )}
                            </span>
                          ) : (
                            <span style={{ color: "var(--muted)" }}>—</span>
                          )}
                        </td>
                        <td>
                          {firstWs ? (
                            <span className="tag-cell">
                              <span className="tag-chip">{firstWs.name}</span>
                              {overflowWs > 0 && (
                                <span className="tag-chip-overflow">+{overflowWs}</span>
                              )}
                            </span>
                          ) : (
                            <span style={{ color: "var(--muted)" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="load-more">
              <span className="load-more-link" aria-disabled="true">
                Load More →
              </span>
            </div>
          </>
        )}
      </div>
    </Chrome>
  );
}
