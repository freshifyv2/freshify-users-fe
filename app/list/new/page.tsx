/**
 * URM04 — New User (operator-only)
 *
 * Sectioned form: User Details + Assign Company + Assign Workspaces.
 * Submit triggers a server action that POSTs to /v1/admin/users.
 */
import { redirect } from "next/navigation";
import Link from "next/link";
import { readSessionToken } from "@/lib/session";
import { decodeJwt } from "@/lib/jwt";
import { Chrome } from "@/lib/Chrome";
import NewUserForm from "./NewUserForm";

export const dynamic = "force-dynamic";

function handleFromEmail(email?: string | null): string {
  if (!email) return "user";
  if (email.startsWith("+")) return email.replace(/[^0-9]/g, "");
  return email.split("@")[0] || email;
}

export default function NewUserPage() {
  const token = readSessionToken();
  if (!token) redirect("/login");
  const claims = decodeJwt(token);
  if (!claims) redirect("/login");
  if (!claims.operator) redirect("/dashboard");

  const displayName = claims.displayName || claims.email || "User";
  const handle = handleFromEmail(claims.email);

  return (
    <Chrome
      active="users"
      pageTitle="New User"
      user={{ userId: claims.userId, displayName, handle, isOperator: true }}
      activeCompany={claims.companyName ? { name: claims.companyName } : null}
    >
      <div className="page-breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <span className="page-breadcrumb-sep">›</span>
        <Link href="/dashboard/users/list">Users</Link>
        <span className="page-breadcrumb-sep">›</span>
        <span className="page-breadcrumb-current">New User</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-header-title">New User</h1>
        </div>
      </div>

      <NewUserForm />
    </Chrome>
  );
}
