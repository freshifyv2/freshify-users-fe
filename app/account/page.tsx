import { redirect } from "next/navigation";
import Link from "next/link";
import { readSessionToken } from "@/lib/session";
import { decodeJwt } from "@/lib/jwt";
import { Chrome } from "@/lib/Chrome";

export const dynamic = "force-dynamic";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function handleFromEmail(email: string): string {
  if (!email) return "user";
  if (email.startsWith("+")) return email.replace(/[^0-9]/g, "");
  return email.split("@")[0] || email;
}

export default function AccountPage() {
  const token = readSessionToken();
  if (!token) redirect("/login");

  const claims = decodeJwt(token);
  if (!claims) redirect("/login");

  const displayName = claims.displayName || "User";
  const handle = handleFromEmail(claims.email);
  const sessionExp = claims.exp ? new Date(claims.exp * 1000) : null;
  const daysLeft = sessionExp
    ? Math.max(0, Math.round((sessionExp.getTime() - Date.now()) / 86400000))
    : null;

  return (
    <Chrome
      active="account"
      pageTitle="Account"
      user={{ userId: claims.userId, displayName, handle }}
      activeCompany={claims.companyName ? { name: claims.companyName } : null}
    >
      <div className="breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <span className="sep">›</span>
        <span className="current">Account</span>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Your account</h1>
          <div className="sub">Profile, memberships, and session controls.</div>
        </div>
      </div>

      <div className="row-account">
        <div className="account-main">
          <div className="profile-card">
            <div className="profile-avatar profile-avatar-lg">{initials(displayName)}</div>
            <div className="profile-info">
              <div className="profile-name-row">
                <h2>{displayName}</h2>
                <span className="pill violet">
                  <span className="dot" /> {claims.roles?.[0]?.role || "member"}
                </span>
              </div>
              <div className="profile-handle">@{handle}</div>
              <div className="profile-meta">
                <span>{claims.email}</span>
                <span>·</span>
                <span><code>{claims.userId}</code></span>
              </div>
            </div>
            <div className="profile-actions">
              <button className="btn btn-ghost btn-sm" type="button" disabled>Edit photo</button>
            </div>
          </div>

          <div className="kicker">Associated company</div>
          <div className="card">
            {claims.companyId ? (
              <div className="associated-row">
                <div className="row-avatar">{initials(claims.companyName || claims.companyId)}</div>
                <div className="associated-info">
                  <div className="associated-name">{claims.companyName || "—"}</div>
                  <div className="associated-sub">
                    <code>{claims.companyId}</code>
                  </div>
                </div>
                <span className="pill green"><span className="dot" /> Active</span>
                <Link href={`/dashboard/companies/${claims.companyId}`} className="btn btn-ghost btn-sm">
                  Open →
                </Link>
              </div>
            ) : (
              <div className="muted">No active company in this session.</div>
            )}
          </div>

          <div className="kicker">Associated workspaces</div>
          <div className="row-3">
            {claims.workspaceId ? (
              <div className="workspace-tile">
                <div className="workspace-tile-icon" aria-hidden>◉</div>
                <div className="workspace-tile-name">{claims.workspaceName || "Workspace"}</div>
                <div className="workspace-tile-sub">
                  <code>{claims.workspaceId}</code>
                </div>
                <Link
                  href={`/dashboard/workspaces/${claims.workspaceId}`}
                  className="btn btn-ghost btn-sm btn-block"
                >
                  Open
                </Link>
              </div>
            ) : (
              <div className="workspace-tile workspace-tile-empty">
                <div className="muted">No active workspace.</div>
              </div>
            )}
          </div>

          <div className="kicker">Role assignments</div>
          <div className="card">
            {claims.roles && claims.roles.length > 0 ? (
              <table className="table">
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
                      <td><span className="pill violet">{r.layer}</span></td>
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

        <aside className="account-rail">
          <div className="kicker">System controls</div>
          <div className="card stack-tight">
            <button className="rail-btn" type="button" disabled>
              <span aria-hidden>◐</span> Edit profile
            </button>
            <button className="rail-btn" type="button" disabled>
              <span aria-hidden>◔</span> Notification settings
            </button>
            <button className="rail-btn" type="button" disabled>
              <span aria-hidden>◇</span> Privacy policy
            </button>
          </div>

          <div className="kicker">Session</div>
          <div className="card stack-tight">
            <div className="kv-row">
              <span className="muted">Expires</span>
              <span>{sessionExp ? sessionExp.toLocaleDateString() : "—"}</span>
            </div>
            <div className="kv-row">
              <span className="muted">Days remaining</span>
              <span>{daysLeft !== null ? `${daysLeft} day${daysLeft === 1 ? "" : "s"}` : "—"}</span>
            </div>
            <form action="/api/logout" method="post">
              <button type="submit" className="btn btn-ghost btn-block">Sign out</button>
            </form>
          </div>

          <div className="kicker">Danger zone</div>
          <div className="danger-zone">
            <div className="danger-row">
              <div>
                <div className="danger-title">Deactivate account</div>
                <div className="danger-sub">Temporarily disable. You can reactivate later.</div>
              </div>
              <button className="btn btn-danger btn-sm" type="button" disabled>Deactivate</button>
            </div>
            <div className="danger-row">
              <div>
                <div className="danger-title">Delete account</div>
                <div className="danger-sub">Permanent. All sovereign data is removed.</div>
              </div>
              <button className="btn btn-danger btn-sm" type="button" disabled>Delete</button>
            </div>
          </div>
        </aside>
      </div>
    </Chrome>
  );
}
