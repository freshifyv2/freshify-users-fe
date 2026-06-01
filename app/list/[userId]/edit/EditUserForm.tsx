"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface InitialValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  title: string;
  userHandle: string;
}

export default function EditUserForm({
  userId,
  initial,
}: {
  userId: string;
  initial: InitialValues;
}) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [status, setStatus] = useState<"active" | "inactive">(initial.status);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavedMsg(null);
    setSubmitting(true);
    try {
      const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const body = {
        displayName,
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        status,
      };
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const out = await res.json();
      const changed: string[] = out.changed || [];
      setSavedMsg(
        changed.length === 0
          ? "No changes to save."
          : `Saved: ${changed.join(", ")}`,
      );
      // Refresh server data so the read-only header reflects new values.
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="warning-banner" style={{ marginBottom: 16 }}>
          <span className="warning-banner-icon" aria-hidden>⚠</span>
          {error}
        </div>
      )}
      {savedMsg && !error && (
        <div className="info-banner" style={{ marginBottom: 16 }}>
          <span aria-hidden>✓</span>
          {savedMsg}
        </div>
      )}

      <div className="section-card">
        <div className="section-card-header">
          <h3 className="section-card-title">Primary Information</h3>
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
            <label className="field-label">USER HANDLE</label>
            <input
              className="field-input is-readonly"
              value={`@${initial.userHandle}`}
              readOnly
            />
            <div className="field-hint">Derived from email — change email to update.</div>
          </div>
          <div className="field">
            <label className="field-label">USER STATUS</label>
            <select
              className="field-input field-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label">PHONE NO</label>
            <input
              className="field-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1..."
            />
            <div className="field-hint">E.164 format. Used for OTP login.</div>
          </div>
          <div className="field">
            <label className="field-label">EMAIL</label>
            <input
              type="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label className="field-label">TITLE</label>
            <input className="field-input is-readonly" value={initial.title} readOnly />
            <div className="field-hint">Title is stored on the company membership, not the user.</div>
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label className="field-label">USER ID</label>
            <input className="field-input is-readonly" value={userId} readOnly />
            <div className="field-hint">Sovereign module identifier — used in all cross-module references.</div>
          </div>
        </div>
      </div>

      <div className="page-header-actions" style={{ justifyContent: "flex-end", marginTop: 8 }}>
        <Link
          href={`/dashboard/users/list/${userId}`}
          className="btn btn-secondary"
        >
          Cancel
        </Link>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : "Update User Profile"}
        </button>
      </div>
    </form>
  );
}
