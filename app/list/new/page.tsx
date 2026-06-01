/**
 * URM04 — New User (operator-only).
 *
 * Server component: fetches the operator-visible company directory and workspace
 * directory cross-tenant, then hands the lists to the client form so the
 * operator picks from real entities instead of pasting IDs.
 */
import { redirect } from "next/navigation";
import Link from "next/link";
import { readSessionToken } from "@/lib/session";
import { decodeJwt } from "@/lib/jwt";
import { Chrome } from "@/lib/Chrome";
import { getServiceJson, COMPANIES_URL, WORKSPACES_URL } from "@/lib/api";
import NewUserForm from "./NewUserForm";

export const dynamic = "force-dynamic";

function handleFromEmail(email?: string | null): string {
  if (!email) return "user";
  if (email.startsWith("+")) return email.replace(/[^0-9]/g, "");
  return email.split("@")[0] || email;
}

interface CompanyListItem {
  companyId: string;
  name: string;
}

interface WorkspaceListItem {
  workspaceId: string;
  companyId: string;
  name: string;
}

export default async function NewUserPage() {
  const token = readSessionToken();
  if (!token) redirect("/login");
  const claims = decodeJwt(token);
  if (!claims) redirect("/login");
  if (!claims.operator) redirect("/dashboard");

  const displayName = claims.displayName || claims.email || "User";
  const handle = handleFromEmail(claims.email);

  // Fetch directories in parallel; failure on either side just yields an empty
  // picker so the form still renders.
  let companies: CompanyListItem[] = [];
  let workspaces: WorkspaceListItem[] = [];
  let directoryError: string | null = null;
  try {
    const [cOut, wOut] = await Promise.all([
      getServiceJson<{ companies: CompanyListItem[] }>(
        COMPANIES_URL,
        "/v1/companies",
        token,
      ),
      getServiceJson<{ workspaces: WorkspaceListItem[] }>(
        WORKSPACES_URL,
        "/v1/workspaces",
        token,
      ),
    ]);
    companies = (cOut.companies || []).map((c) => ({
      companyId: c.companyId,
      name: c.name,
    }));
    workspaces = (wOut.workspaces || []).map((w) => ({
      workspaceId: w.workspaceId,
      companyId: w.companyId,
      name: w.name,
    }));
  } catch (e) {
    directoryError = (e as Error).message;
  }

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
          <p className="page-header-sub">
            A company must exist before creating a user. The user will be assigned to a company.
          </p>
        </div>
      </div>

      {directoryError && (
        <div className="warning-banner" style={{ marginBottom: 16 }}>
          <span className="warning-banner-icon" aria-hidden>⚠</span>
          Could not load directory: {directoryError}
        </div>
      )}

      <NewUserForm companies={companies} workspaces={workspaces} />
    </Chrome>
  );
}
