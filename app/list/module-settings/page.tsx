/**
 * URM Module Settings — operator-only.
 *
 * Combined Roles + Registry view for the Users module. Roles section
 * lists the portal-level role keys recognized by URM. Registry section
 * lists module metadata (collection names, integrations) for transparency.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { readSessionToken } from "@/lib/session";
import { decodeJwt } from "@/lib/jwt";
import { Chrome } from "@/lib/Chrome";
import { OperatorOnly403 } from "@/lib/OperatorOnly";

export const dynamic = "force-dynamic";

interface RoleRow { key: string; label: string; scope: string; description: string }
interface RegistryEntry { key: string; label: string; value: string }

const ROLES: RoleRow[] = [
  { key: "portal.operator", label: "Operator", scope: "Portal", description: "Full cross-tenant read/write across all sovereign modules." },
  { key: "portal.support", label: "Support", scope: "Portal", description: "Read-only cross-tenant access for troubleshooting." },
  { key: "company.admin", label: "Company Admin", scope: "Company", description: "Manage users, workspaces, and settings within their own company." },
  { key: "company.member", label: "Company Member", scope: "Company", description: "Default role for invited company users." },
  { key: "workspace.admin", label: "Workspace Admin", scope: "Workspace", description: "Manage workspace membership and settings." },
  { key: "workspace.member", label: "Workspace Member", scope: "Workspace", description: "Default workspace participation role." },
];

const REGISTRY: RegistryEntry[] = [
  { key: "moduleId", label: "Module ID", value: "users" },
  { key: "service", label: "Backend service", value: "freshify-users" },
  { key: "collections", label: "MongoDB collections", value: "users, sessions, otp_codes, portal_settings, invites, audit_log" },
  { key: "endpoints", label: "Public route prefix", value: "/v1/users, /v1/admin/users, /v1/otp, /v1/portal-settings, /v1/portal-invites" },
  { key: "ownsAuth", label: "Owns authentication", value: "Yes — sessions, OTP, password" },
  { key: "ownsSettings", label: "Owns portal_settings", value: "Yes (singleton)" },
];

export default async function URMModuleSettingsPage() {
  const token = readSessionToken();
  if (!token) redirect("/login");
  const claims = decodeJwt(token);
  if (!claims) redirect("/login");

  const handle = (claims.email || "").startsWith("+")
    ? (claims.email || "").replace(/[^0-9]/g, "")
    : (claims.email || "").split("@")[0] || "operator";
  const displayName = claims.displayName || claims.email || "Operator";
  if (!claims.operator) {
    return (
      <OperatorOnly403
        active="users"
        pageTitle="Users — Module Settings"
        user={{ userId: claims.userId, displayName, handle, isOperator: false }}
        activeCompany={claims.companyName ? { name: claims.companyName } : null}
        detail="Users module settings"
      />
    );
  }

  return (
    <Chrome
      active="users"
      pageTitle="Users — Module Settings"
      user={{ userId: claims.userId, displayName: claims.displayName || claims.email || "Operator", handle, isOperator: true }}
      activeCompany={claims.companyName ? { name: claims.companyName } : null}
    >
      <div className="page-breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <span className="page-breadcrumb-sep">›</span>
        <Link href="/dashboard/users/list">Users</Link>
        <span className="page-breadcrumb-sep">›</span>
        <span className="page-breadcrumb-current">Module Settings</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-header-title">Users Module Settings</h1>
          <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
            Roles recognised by the Users module and registry metadata for this sovereign service.
          </p>
        </div>
      </div>

      <section className="list-card" style={{ marginBottom: 16 }}>
        <header style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
          <h2 style={{ margin: 0, fontSize: 15 }}>Roles</h2>
        </header>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Role key</th>
                <th>Label</th>
                <th>Scope</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map((r) => (
                <tr key={r.key}>
                  <td><code style={{ fontSize: 12 }}>{r.key}</code></td>
                  <td>{r.label}</td>
                  <td><span className="pill is-violet">{r.scope}</span></td>
                  <td style={{ color: "var(--muted)" }}>{r.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="list-card">
        <header style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
          <h2 style={{ margin: 0, fontSize: 15 }}>Registry</h2>
        </header>
        <div style={{ padding: "8px 16px" }}>
          <dl style={{ display: "grid", gridTemplateColumns: "minmax(220px, 1fr) minmax(0, 2fr)", gap: "12px 24px", margin: 0 }}>
            {REGISTRY.map((entry) => (
              <div key={entry.key} style={{ display: "contents" }}>
                <dt style={{ color: "var(--fg-2)", fontSize: 14, padding: "8px 0", borderBottom: "1px solid var(--line)" }}>{entry.label}</dt>
                <dd style={{ color: "var(--muted)", fontSize: 14, padding: "8px 0", borderBottom: "1px solid var(--line)", margin: 0 }}>{entry.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </Chrome>
  );
}
