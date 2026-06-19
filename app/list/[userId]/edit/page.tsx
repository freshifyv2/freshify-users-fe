/**
 * URM02E — Edit User Detail (operator-only).
 *
 * Server-rendered shell that fetches the target user and hands the editable
 * fields to a client EditUserForm. Layout matches the read-only detail page
 * so the operator transitions between view and edit without visual jump.
 */
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { readSessionToken } from "@/lib/session";
import { decodeJwt } from "@/lib/jwt";
import { getUsers } from "@/lib/api";
import { Chrome } from "@freshifyv2/portal-shell-ui";
import { OperatorOnly403 } from "@/lib/OperatorOnly";
import EditUserForm from "./EditUserForm";

export const dynamic = "force-dynamic";

interface AdminUserDetail {
  userId: string;
  displayName: string | null;
  email: string;
  phone?: string | null;
  title?: string | null;
  status?: "active" | "inactive" | "pending" | null;
  isOperator?: boolean;
  assignedCompanies?: Array<{ companyId: string; name: string; role?: string; isPrimary?: boolean }>;
  assignedWorkspaces?: Array<{ workspaceId: string; name: string; companyId?: string; role?: string }>;
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
}

export default async function EditUserPage({ params }: PageProps) {
  const token = readSessionToken();
  if (!token) redirect("/login");
  const claims = decodeJwt(token);
  if (!claims) redirect("/login");
  if (!claims.operator) {
    return (
      <OperatorOnly403
        active="users"
        pageTitle="Edit User"
        user={{
          userId: claims.userId,
          displayName: claims.displayName || claims.email || "User",
          handle: (claims.email || "").startsWith("+")
            ? (claims.email || "").replace(/[^0-9]/g, "")
            : (claims.email || "").split("@")[0] || "user",
          isOperator: false,
        }}
        activeCompany={claims.companyName ? { name: claims.companyName } : null}
        detail="Editing users"
      />
    );
  }

  const viewerName = claims.displayName || claims.email || "User";
  const viewerHandle = handleFromEmail(claims.email);

  let user: AdminUserDetail | null = null;
  let loadError: string | null = null;
  try {
    const out = await getUsers<{ user: AdminUserDetail }>(`/v1/admin/users/${params.userId}`, token);
    user = out.user;
  } catch (e) {
    loadError = (e as Error).message;
  }

  if (!user && !loadError) notFound();

  const u = user!;
  const displayName = u?.displayName || "User";
  const userHandle = handleFromEmail(u?.email);
  const firstName = displayName.split(/\s+/)[0] || "";
  const lastName = displayName.split(/\s+/).slice(1).join(" ");
  const initials = `${(firstName[0] || "U").toUpperCase()}${(lastName[0] || "").toUpperCase()}`;
  const title = u?.isOperator ? "Operator" : (u?.title || "Member");

  const primaryCompany = u?.assignedCompanies?.find((c) => c.isPrimary) || u?.assignedCompanies?.[0];
  const assignedWorkspaces = u?.assignedWorkspaces || [];

  return (
    <Chrome
      active="users"
      pageTitle="Edit User"
      user={{ userId: claims.userId, displayName: viewerName, handle: viewerHandle, isOperator: true }}
      activeCompany={claims.companyName ? { name: claims.companyName } : null}
    >
      <div className="page-breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <span className="page-breadcrumb-sep">›</span>
        <Link href="/dashboard/users/list">Users</Link>
        <span className="page-breadcrumb-sep">›</span>
        <Link href={`/dashboard/users/list/${params.userId}`}>{displayName}</Link>
        <span className="page-breadcrumb-sep">›</span>
        <span className="page-breadcrumb-current">Edit</span>
      </div>

      {loadError && (
        <div className="warning-banner" style={{ marginBottom: 16 }}>
          <span className="warning-banner-icon" aria-hidden>⚠</span>
          {loadError}
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
      </div>

      <EditUserForm
        userId={u.userId}
        initial={{
          firstName,
          lastName,
          email: u.email,
          phone: u.phone || "",
          status: (u.status === "inactive" ? "inactive" : "active") as "active" | "inactive",
          title,
          userHandle,
        }}
      />

      {/* Read-only assignment context — memberships are mutated elsewhere */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-icon" aria-hidden>◇</span>
          <h3 className="section-card-title">Assigned Company</h3>
        </div>
        {primaryCompany ? (
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
        ) : (
          <div className="muted">No company assigned.</div>
        )}
        <div className="info-banner" style={{ marginTop: 12 }}>
          <span aria-hidden>ⓘ</span>
          Company assignment is managed through the Companies module.
        </div>
      </div>

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
        <div className="info-banner" style={{ marginTop: 12 }}>
          <span aria-hidden>ⓘ</span>
          Workspace assignments are managed through the Workspaces module.
        </div>
      </div>
    </Chrome>
  );
}
