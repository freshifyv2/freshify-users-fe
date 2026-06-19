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
import { OperatorOnly403 } from "@/lib/OperatorOnly";

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

// Deploy 5.16 — filter pills + search wired via searchParams (server-side).
type UsersFilter = "all" | "active" | "pending" | "inactive";
function parseUsersFilter(v: string | string[] | undefined): UsersFilter {
  const s = Array.isArray(v) ? v[0] : v;
  if (s === "active" || s === "pending" || s === "inactive") return s;
  return "all";
}
function parseQuery(v: string | string[] | undefined): string {
  const s = Array.isArray(v) ? v[0] : v;
  return (s ?? "").trim().slice(0, 80);
}

export default async function UsersListPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; q?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const usersFilter = parseUsersFilter(sp.status);
  const query = parseQuery(sp.q);
  const token = readSessionToken();
  if (!token) redirect("/login");

  const claims = decodeJwt(token);
  if (!claims) redirect("/login");

  // Operator gate — non-operators see a 403 view (Deploy 5).
  const isOperator = Boolean(claims.operator);
  const displayName = claims.displayName || claims.email || "User";
  const handle = handleFromEmail(claims.email);
  if (!isOperator) {
    return (
      <OperatorOnly403
        active="users"
        pageTitle="Users"
        user={{ userId: claims.userId, displayName, handle, isOperator: false }}
        activeCompany={claims.companyName ? { name: claims.companyName } : null}
        detail="The cross-tenant user directory"
      />
    );
  }

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

  // Deploy 5.16 — apply filter + search server-side. Counts above stay
  // anchored to the full dataset.
  const qLower = query.toLowerCase();
  const visibleUsers = users.filter((u) => {
    const effStatus = u.status || "active";
    if (usersFilter !== "all" && effStatus !== usersFilter) return false;
    if (!qLower) return true;
    const hay = [
      u.displayName ?? "",
      u.email,
      u.phone ?? "",
      u.title ?? "",
      u.userId,
      ...(u.assignedCompanies ?? []).map((c) => c.name),
      ...(u.assignedWorkspaces ?? []).map((w) => w.name),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(qLower);
  });
  const buildHref = (filter: UsersFilter) => {
    const params = new URLSearchParams();
    if (filter !== "all") params.set("status", filter);
    if (query) params.set("q", query);
    const qs = params.toString();
    return qs ? `/dashboard/users/list?${qs}` : "/dashboard/users/list";
  };

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
          <Link href="/dashboard/users/settings" className="btn btn-secondary">
            <span aria-hidden>⚙</span> Module Settings
          </Link>
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

      {/* Metric cards */}
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
            <Link
              href={buildHref("all")}
              className={`filter-pill ${usersFilter === "all" ? "is-active" : ""}`}
            >
              All ({total})
            </Link>
            <Link
              href={buildHref("active")}
              className={`filter-pill ${usersFilter === "active" ? "is-active" : ""}`}
            >
              Active ({active})
            </Link>
            <Link
              href={buildHref("pending")}
              className={`filter-pill ${usersFilter === "pending" ? "is-active" : ""}`}
            >
              Pending ({pending})
            </Link>
            <Link
              href={buildHref("inactive")}
              className={`filter-pill ${usersFilter === "inactive" ? "is-active" : ""}`}
            >
              Inactive ({inactive})
            </Link>
          </div>
          <form method="GET" action="/dashboard/users/list" className="search-input-wrap">
            {usersFilter !== "all" && (
              <input type="hidden" name="status" value={usersFilter} />
            )}
            <span className="search-input-icon" aria-hidden>⌕</span>
            <input
              className="search-input"
              name="q"
              defaultValue={query}
              placeholder="Search by name, title, company, workspace, phone…"
              autoComplete="off"
            />
            {query && (
              <Link
                href={buildHref(usersFilter)}
                className="search-input-clear"
                aria-label="Clear search"
              >
                ×
              </Link>
            )}
          </form>
        </div>

        {users.length === 0 ? (
          <div className="list-card-empty">
            <p style={{ margin: "24px 0 8px", fontWeight: 600, color: "var(--fg)" }}>No users yet</p>
            <p style={{ margin: 0 }}>Invite a user to get started.</p>
          </div>
        ) : visibleUsers.length === 0 ? (
          <div className="list-card-empty">
            <p style={{ margin: "24px 0 8px", fontWeight: 600, color: "var(--fg)" }}>No users match these filters</p>
            <p style={{ margin: 0 }}>
              Try a different filter or{" "}
              <Link href="/dashboard/users/list">clear filters</Link>.
            </p>
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
                  {visibleUsers.map((u) => {
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
                              <Link
                                href={`/dashboard/companies/${firstCompany.companyId}`}
                                className="tag-chip is-link"
                              >
                                {firstCompany.name || firstCompany.companyId}
                              </Link>
                              {overflowCompanies > 0 && (
                                <Link
                                  href={`/dashboard/users/list/${u.userId}`}
                                  className="tag-chip-overflow is-link"
                                  title={`See all ${companies.length} companies`}
                                >
                                  +{overflowCompanies}
                                </Link>
                              )}
                            </span>
                          ) : (
                            <span style={{ color: "var(--muted)" }}>—</span>
                          )}
                        </td>
                        <td>
                          {firstWs ? (
                            <span className="tag-cell">
                              <Link
                                href={`/dashboard/workspaces/${firstWs.workspaceId}`}
                                className="tag-chip is-link"
                              >
                                {firstWs.name}
                              </Link>
                              {overflowWs > 0 && (
                                <Link
                                  href={`/dashboard/users/list/${u.userId}`}
                                  className="tag-chip-overflow is-link"
                                  title={`See all ${workspaces.length} workspaces`}
                                >
                                  +{overflowWs}
                                </Link>
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
