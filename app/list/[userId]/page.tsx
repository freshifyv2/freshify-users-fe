/**
 * URM02 — Edit User Detail (operator-only)
 *
 * Hero card + PROFILE/SETTINGS tabs + Primary Information +
 * Assigned Company + Assigned Workspaces section cards.
 */
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { readSessionToken } from "@/lib/session";
import { decodeJwt } from "@/lib/jwt";
import { getUsers } from "@/lib/api";
import { Chrome } from "@/lib/Chrome";

export const dynamic = "force-dynamic";

interface AdminUserDetail {
  userId: string;
  displayName: string | null;
  email: string;
  phone?: string | null;
  title?: string | null;
  status?: "active" | "inactive" | "pending" | null;
  createdAt?: string | null;
  lastActiveAt?: string | null;
  assignedCompanies?: Array<{ companyId: string; name: string; role?: string; isPrimary?: boolean }>;
  assignedWorkspaces?: Array<{ workspaceId: string; name: string; companyId?: string; role?: string }>;
  isOperator?: boolean;
}

function handleFromEmail(email?: string | null): string {
  if (!email) return "user";
  if (email.startsWith("+")) return email.replace(/[^0-9]/g, "");
  return email.split("@")[0] || email;
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

interface PageProps {
  params: { userId: string };
  searchParams?: { tab?: string };
}

export default async function UserDetailPage({ params, searchParams }: PageProps) {
  const token = readSessionToken();
  if (!token) redirect("/login");
  const claims = decodeJwt(token);
  if (!claims) redirect("/login");
  if (!claims.operator) redirect("/dashboard");

  const tab = searchParams?.tab === "settings" ? "settings" : "profile";

  const viewerName = claims.displayName || claims.email || "User";
  const viewerHandle = handleFromEmail(claims.email);

  let user: AdminUserDetail | null = null;
  let error: string | null = null;
  try {
    const out = await getUsers<{ user: AdminUserDetail }>(`/v1/admin/users/${params.userId}`, token);
    user = out.user;
  } catch (e) {
    error = (e as Error).message;
  }

  if (!user && !error) notFound();

  const u = user!;
  const displayName = u?.displayName || "User";
  const userHandle = handleFromEmail(u?.email);
  const firstName = displayName.split(/\s+/)[0] || "";
  const lastName = displayName.split(/\s+/).slice(1).join(" ");
  const title = u?.isOperator ? "Operator" : (u?.title || "Member");
  const initials = `${(firstName[0] || "U").toUpperCase()}${(lastName[0] || "").toUpperCase()}`;

  const primaryCompany = u?.assignedCompanies?.find((c) => c.isPrimary) || u?.assignedCompanies?.[0];
  const otherCompanies = (u?.assignedCompanies || []).filter((c) => c.companyId !== primaryCompany?.companyId);
  const assignedWorkspaces = u?.assignedWorkspaces || [];

  return (
    <Chrome
      active="users"
      pageTitle="User Detail"
      user={{ userId: claims.userId, displayName: viewerName, handle: viewerHandle, isOperator: true }}
      activeCompany={claims.companyName ? { name: claims.companyName } : null}
    >
      <div className="page-breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <span className="page-breadcrumb-sep">›</span>
        <Link href="/dashboard/users/list">Users</Link>
        <span className="page-breadcrumb-sep">›</span>
        <span className="page-breadcrumb-current">{displayName}</span>
      </div>

      {error && (
        <div className="warning-banner" style={{ marginBottom: 16 }}>
          <span className="warning-banner-icon" aria-hidden>⚠</span>
          {error}
        </div>
      )}

      {/* HERO CARD */}
      <div className="hero-card">
        <div className="hero-card-left">
          <span
            className="avatar-circle is-lg"
            aria-hidden
            style={{ background: "var(--violet-soft)", color: "var(--violet)" }}
          >
            {initials}
          </span>
          <div className="hero-card-text">
            <span className={`status-pill ${statusClass(u?.status)} hero-card-status`}>
              {statusLabel(u?.status)}
            </span>
            <h1 className="hero-card-title">
              {displayName}
              <span className="hero-card-handle">(@{userHandle})</span>
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

      <div className="detail-tabs">
        <Link
          href={`/dashboard/users/list/${params.userId}?tab=profile`}
          className={`detail-tab ${tab === "profile" ? "is-active" : ""}`}
        >
          PROFILE
        </Link>
        <Link
          href={`/dashboard/users/list/${params.userId}?tab=settings`}
          className={`detail-tab ${tab === "settings" ? "is-active" : ""}`}
        >
          SETTINGS
        </Link>
      </div>

      {tab === "profile" ? (
        <>
          {/* Primary Information */}
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
                <input className="field-input is-readonly" value={`@${userHandle}`} readOnly />
              </div>
              <div className="field">
                <label className="field-label">USER STATUS</label>
                <select className="field-input field-select is-readonly" disabled>
                  <option>{statusLabel(u?.status)}</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">PHONE NO</label>
                <input
                  className="field-input is-readonly"
                  value={u?.phone || (u?.email?.startsWith("+") ? u.email : "")}
                  readOnly
                />
              </div>
              <div className="field">
                <label className="field-label">EMAIL</label>
                <input className="field-input is-readonly" value={u?.email || ""} readOnly />
              </div>
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label className="field-label">TITLE</label>
                <input className="field-input is-readonly" value={title} readOnly />
              </div>
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label className="field-label">USER ID</label>
                <input className="field-input is-readonly" value={u?.userId || ""} readOnly />
                <div className="field-hint">Sovereign module identifier — used in all cross-module references.</div>
              </div>
            </div>
          </div>

          {/* Assigned Company */}
          <div className="section-card">
            <div className="section-card-header">
              <span className="section-card-icon" aria-hidden>◇</span>
              <h3 className="section-card-title">Assigned Company</h3>
            </div>
            {primaryCompany ? (
              <>
                <div className="assignment-row">
                  <div className="assignment-row-info">
                    <h4 className="assignment-row-name">
                      {primaryCompany.name || primaryCompany.companyId}
                      <span className="primary-badge">PRIMARY ASSIGNMENT</span>
                    </h4>
                    <span className="assignment-row-sub">Role: {primaryCompany.role || "member"}</span>
                  </div>
                  <Link href={`/dashboard/companies/${primaryCompany.companyId}`} className="btn btn-secondary btn-sm">
                    Open →
                  </Link>
                </div>
                {otherCompanies.map((c) => (
                  <div key={c.companyId} className="assignment-row">
                    <div className="assignment-row-info">
                      <h4 className="assignment-row-name">{c.name || c.companyId}</h4>
                      <span className="assignment-row-sub">Role: {c.role || "member"}</span>
                    </div>
                    <Link href={`/dashboard/companies/${c.companyId}`} className="btn btn-secondary btn-sm">
                      Open →
                    </Link>
                  </div>
                ))}
              </>
            ) : (
              <div className="muted">No company assigned.</div>
            )}
          </div>

          {/* Assigned Workspaces */}
          <div className="section-card">
            <div className="section-card-header">
              <span className="section-card-icon" aria-hidden>◉</span>
              <h3 className="section-card-title">Assigned Workspaces</h3>
            </div>
            {assignedWorkspaces.length > 0 ? (
              assignedWorkspaces.map((w) => (
                <div key={w.workspaceId} className="assignment-row">
                  <div className="assignment-row-info">
                    <h4 className="assignment-row-name">{w.name || w.workspaceId}</h4>
                    <span className="assignment-row-sub">Role: {w.role || "member"}</span>
                  </div>
                  <Link href={`/dashboard/workspaces/${w.workspaceId}`} className="btn btn-secondary btn-sm">
                    Open →
                  </Link>
                </div>
              ))
            ) : (
              <div className="muted">No workspaces assigned.</div>
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
              <h3 className="section-card-title">Account Actions</h3>
            </div>
            <div className="action-row">
              <span className="action-row-icon" aria-hidden>⊘</span>
              <div className="action-row-text">
                <p className="action-row-title">Deactivate User</p>
                <p className="action-row-sub">Temporarily disable this user's access</p>
              </div>
            </div>
            <div className="action-row">
              <span className="action-row-icon" aria-hidden>✕</span>
              <div className="action-row-text">
                <p className="action-row-title">Delete User</p>
                <p className="action-row-sub">Permanently remove this user and all their data</p>
              </div>
            </div>
          </div>
        </>
      )}
    </Chrome>
  );
}
