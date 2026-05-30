"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewUserForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [workspaceIds, setWorkspaceIds] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          firstName,
          lastName,
          phone,
          email,
          title,
          companyId: companyId || null,
          workspaceIds: workspaceIds
            ? workspaceIds.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      router.push("/dashboard/users/list");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, "invite")}>
      {error && (
        <div className="warning-banner" style={{ marginBottom: 16 }}>
          <span className="warning-banner-icon" aria-hidden>⚠</span>
          {error}
        </div>
      )}

      {/* User Details */}
      <div className="section-card">
        <div className="section-card-header">
          <h3 className="section-card-title">User Details</h3>
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
            <label className="field-label">PHONE NO</label>
            <input
              className="field-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1..."
              required
            />
            <div className="field-hint">Used for OTP login. E.164 format.</div>
          </div>
          <div className="field">
            <label className="field-label">EMAIL</label>
            <input
              type="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label className="field-label">TITLE</label>
            <input
              className="field-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Account Manager"
            />
          </div>
        </div>
      </div>

      {/* Assign Company */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-icon" aria-hidden>◇</span>
          <h3 className="section-card-title">Assign Company</h3>
        </div>
        <div className="field-grid">
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label className="field-label">COMPANY ID</label>
            <input
              className="field-input"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              placeholder="cmp_..."
            />
            <div className="field-hint">
              Paste a company ID. (Search-select picker coming in next release.)
            </div>
          </div>
        </div>
      </div>

      {/* Assign Workspaces */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-icon" aria-hidden>◉</span>
          <h3 className="section-card-title">Assign Workspaces</h3>
        </div>
        <div className="field-grid">
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label className="field-label">WORKSPACE IDS</label>
            <input
              className="field-input"
              value={workspaceIds}
              onChange={(e) => setWorkspaceIds(e.target.value)}
              placeholder="wks_abc, wks_def"
            />
            <div className="field-hint">Comma-separated workspace IDs.</div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="page-header-actions" style={{ justifyContent: "flex-end", marginTop: 8 }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => history.back()}
          disabled={submitting}
        >
          Cancel
        </button>
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
    </form>
  );
}
