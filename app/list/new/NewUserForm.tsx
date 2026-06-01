"use client";

/**
 * URM04 client form — matches the Figma New User screen:
 *   • User Details (first, last, handle, email, title, phone, password, photo)
 *   • Assign Company (single select)
 *   • Assign Workspaces (multi-select filtered by company)
 *
 * The handle and password are auto-generated client-side as a preview. The BE
 * derives the real handle from the email and ignores the password field for
 * mode=invite. The photo dropzone is a placeholder — uploads land in the
 * Companies CDN module (Stage 7).
 */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CompanyOpt {
  companyId: string;
  name: string;
}

interface WorkspaceOpt {
  workspaceId: string;
  companyId: string;
  name: string;
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
  let out = "";
  const cryptoObj =
    typeof globalThis !== "undefined" && "crypto" in globalThis
      ? (globalThis.crypto as Crypto)
      : null;
  if (cryptoObj) {
    const bytes = new Uint8Array(14);
    cryptoObj.getRandomValues(bytes);
    for (let i = 0; i < bytes.length; i++) {
      out += chars[bytes[i]! % chars.length];
    }
  } else {
    for (let i = 0; i < 14; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return out;
}

function handleFromEmail(email: string): string {
  if (!email) return "";
  const base = email.split("@")[0] || "";
  return `@${base.toLowerCase().replace(/[^a-z0-9.-]/g, "")}`;
}

export default function NewUserForm({
  companies,
  workspaces,
}: {
  companies: CompanyOpt[];
  workspaces: WorkspaceOpt[];
}) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [workspaceIds, setWorkspaceIds] = useState<string[]>([]);
  const [password] = useState<string>(() => generatePassword());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const derivedHandle = handleFromEmail(email);

  const filteredWorkspaces = useMemo(
    () => (companyId ? workspaces.filter((w) => w.companyId === companyId) : workspaces),
    [companyId, workspaces],
  );

  function toggleWorkspace(id: string) {
    setWorkspaceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  async function handleSubmit(e: React.FormEvent, mode: "invite" | "draft") {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || undefined,
          email: email.trim().toLowerCase() || undefined,
          title: title.trim() || undefined,
          companyId: companyId || undefined,
          workspaceIds,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      router.push("/dashboard/users/list");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, "invite")}>
      <div className="page-header-actions" style={{ justifyContent: "flex-end", marginBottom: 12 }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={(e) => handleSubmit(e as unknown as React.FormEvent, "draft")}
          disabled={submitting}
        >
          Save as Draft
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Sending..." : "Send Invite"}
        </button>
      </div>

      {error && (
        <div className="warning-banner" style={{ marginBottom: 16 }}>
          <span className="warning-banner-icon" aria-hidden>⚠</span>
          {error}
        </div>
      )}

      {/* USER DETAILS */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-icon" aria-hidden>◇</span>
          <div>
            <h3 className="section-card-title">User Details</h3>
            <p className="section-card-sub">Basic information about the User.</p>
          </div>
        </div>
        <div className="field-grid">
          <div className="field">
            <label className="field-label">FIRST NAME</label>
            <input
              className="field-input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="field-label">LAST NAME</label>
            <input
              className="field-input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="field-label">HANDLE</label>
            <input
              className="field-input is-readonly"
              value={derivedHandle}
              placeholder="@janedoe12"
              readOnly
            />
            <div className="field-hint is-positive">
              {derivedHandle ? "✓ System checks for existing handles." : "Handle derived from email."}
            </div>
          </div>
          <div className="field">
            <label className="field-label">EMAIL</label>
            <input
              type="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="janedoe@example.com"
            />
          </div>
          <div className="field">
            <label className="field-label">TITLE</label>
            <input
              className="field-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Driver"
            />
          </div>
          <div className="field">
            <label className="field-label">PHONE</label>
            <input
              className="field-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (234) 567-4561"
            />
            <div className="field-hint">E.164 format. Used for OTP login.</div>
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label className="field-label">PASSWORD</label>
            <div className="password-row">
              <input className="field-input is-readonly" value={password} readOnly />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={copyPassword}
              >
                {copied ? "Copied" : "Copy ⎘"}
              </button>
            </div>
            <div className="field-hint is-warn">System generated. Can be copied and shared.</div>
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label className="field-label">PHOTO (OPTIONAL)</label>
            <div className="photo-dropzone" aria-disabled="true">
              <span className="photo-dropzone-icon" aria-hidden>⇪</span>
              <p className="photo-dropzone-text">Drag &amp; drop files here</p>
              <p className="photo-dropzone-or">or</p>
              <button type="button" className="btn btn-secondary btn-sm" disabled>
                Upload Image
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ASSIGN COMPANY */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-icon" aria-hidden>◇</span>
          <div>
            <h3 className="section-card-title">Assign Company</h3>
            <p className="section-card-sub">Search and select from existing companies.</p>
          </div>
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <select
            className="field-input field-select"
            value={companyId}
            onChange={(e) => {
              setCompanyId(e.target.value);
              setWorkspaceIds([]);
            }}
          >
            <option value="">+ Search or select company</option>
            {companies.map((c) => (
              <option key={c.companyId} value={c.companyId}>
                {c.name}
              </option>
            ))}
          </select>
          {companies.length === 0 && (
            <div className="field-hint is-warn">
              No companies available. Create one in the Companies module first.
            </div>
          )}
        </div>
      </div>

      {/* ASSIGN WORKSPACES */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-icon" aria-hidden>◉</span>
          <div>
            <h3 className="section-card-title">Assign Workspaces</h3>
            <p className="section-card-sub">Search and select from existing workspaces.</p>
          </div>
        </div>
        {!companyId ? (
          <div className="muted">Select a company first to see available workspaces.</div>
        ) : filteredWorkspaces.length === 0 ? (
          <div className="muted">No workspaces in this company yet.</div>
        ) : (
          <div className="workspace-picker">
            {filteredWorkspaces.map((w) => {
              const checked = workspaceIds.includes(w.workspaceId);
              return (
                <label key={w.workspaceId} className={`workspace-picker-row ${checked ? "is-checked" : ""}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleWorkspace(w.workspaceId)}
                  />
                  <span className="workspace-picker-name">{w.name}</span>
                  <span className="workspace-picker-id">{w.workspaceId}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ACTION BAR */}
      <div className="page-header-actions" style={{ justifyContent: "space-between", marginTop: 8 }}>
        <Link href="/dashboard/users/list" className="btn btn-link">
          ✕ Cancel and Discard
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={(e) => handleSubmit(e as unknown as React.FormEvent, "draft")}
            disabled={submitting}
          >
            Save as Draft
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Inviting..." : "Invite User"}
          </button>
        </div>
      </div>
    </form>
  );
}
