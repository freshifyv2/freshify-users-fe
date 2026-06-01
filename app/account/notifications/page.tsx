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

export default async function NotificationsPage() {
  const token = readSessionToken();
  if (!token) redirect("/login");

  const claims = decodeJwt(token);
  if (!claims) redirect("/login");

  const chromeCtx = await loadChromeContext();
  if (!chromeCtx) redirect("/login");

  const displayName = claims.displayName || "User";
  const handle = handleFromEmail(claims.email);
  const isOperator = Boolean(claims.operator);

  return (
    <Chrome
      active="account"
      pageTitle="Notification Settings"
      user={{ userId: claims.userId, displayName, handle, isOperator }}
      activeCompany={claims.companyName ? { name: claims.companyName } : null}
      tenantOptions={chromeCtx.tenantOptions}
    >
      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <Link href="/account">Account</Link>
        <span className="breadcrumb-sep" aria-hidden>›</span>
        <span className="breadcrumb-current">Notification Settings</span>
      </div>

      {/* HEADER CARD */}
      <div className="notif-header-card">
        <div>
          <h2 className="notif-header-title">Notification Settings</h2>
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
            Control how Sovereign Portal reaches you.
          </p>
        </div>
        <button type="button" className="btn btn-primary" disabled>
          Save Changes
        </button>
      </div>

      {/* TOGGLES CARD */}
      <div className="section-card">
        <div className="section-card-header">
          <h3 className="section-card-title">Communication Preferences</h3>
        </div>

        <div className="toggle-row">
          <div>
            <span className="toggle-row-label">Email Notifications</span>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
              Receive updates and alerts via email.
            </p>
          </div>
          <label className="toggle" aria-label="Email Notifications">
            <input type="checkbox" defaultChecked disabled />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="toggle-row">
          <div>
            <span className="toggle-row-label">SMS Notifications</span>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
              Receive text messages for critical updates.
            </p>
          </div>
          <label className="toggle" aria-label="SMS Notifications">
            <input type="checkbox" disabled />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="toggle-row">
          <div>
            <span className="toggle-row-label">Push Notifications</span>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
              Browser or app push alerts for real-time events.
            </p>
          </div>
          <label className="toggle" aria-label="Push Notifications">
            <input type="checkbox" defaultChecked disabled />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>
    </Chrome>
  );
}
