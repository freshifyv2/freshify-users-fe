import { redirect } from "next/navigation";
import { readSessionToken } from "@/lib/session";
import { decodeJwt } from "@/lib/jwt";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default function AccountPage() {
  const token = readSessionToken();
  if (!token) redirect("/login");

  const claims = decodeJwt(token);
  if (!claims) redirect("/login");

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <div className="brand">Sovereign Portal</div>
          <div className="nav-links">
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <Link href="/dashboard/companies" className="nav-link">Companies</Link>
            <Link href="/dashboard/workspaces" className="nav-link">Workspaces</Link>
            <Link href="/dashboard/users/account" className="nav-link active">Account</Link>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="stack" style={{ gap: 24 }}>
          <div className="between">
            <div>
              <div className="kicker">Account</div>
              <h1 style={{ marginTop: 8 }}>{claims.displayName || "Your account"}</h1>
            </div>
            <LogoutButton />
          </div>

          <div className="card">
            <h2 style={{ marginBottom: 16 }}>Profile</h2>
            <table>
              <tbody>
                <tr>
                  <th style={{ width: 200 }}>User ID</th>
                  <td><code style={{ fontSize: 13 }}>{claims.userId}</code></td>
                </tr>
                <tr>
                  <th>Email / phone</th>
                  <td>{claims.email}</td>
                </tr>
                <tr>
                  <th>Display name</th>
                  <td>{claims.displayName || "—"}</td>
                </tr>
                <tr>
                  <th>Active company</th>
                  <td>{claims.companyName || claims.companyId || "—"}</td>
                </tr>
                <tr>
                  <th>Active workspace</th>
                  <td>{claims.workspaceName || claims.workspaceId || "—"}</td>
                </tr>
                <tr>
                  <th>Session expires</th>
                  <td>{claims.exp ? new Date(claims.exp * 1000).toLocaleString() : "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: 8 }}>Roles</h2>
            <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
              Assignments across the User / Company / Workspace / Module layers.
            </p>
            {claims.roles && claims.roles.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Layer</th>
                    <th>Scope</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.roles.map((r, i) => (
                    <tr key={i}>
                      <td><span className="pill">{r.layer}</span></td>
                      <td><code style={{ fontSize: 12 }}>{r.scopeId || "—"}</code></td>
                      <td>{r.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="muted">No role assignments yet.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
