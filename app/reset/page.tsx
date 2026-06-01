"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const IconLock = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    <circle cx="12" cy="16" r="1" fill="currentColor"/>
  </svg>
);

export default function ResetPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const trimmed = email.trim().toLowerCase();
    setTimeout(() => {
      setBusy(false);
      if (trimmed.endsWith("@blocked.test") || trimmed.includes("unknown")) {
        router.push("/reset/failed");
      } else {
        router.push(`/reset/sent?email=${encodeURIComponent(trimmed)}`);
      }
    }, 600);
  }

  return (
    <div className="login-split">
      {/* Left brand panel */}
      <aside className="login-brand-panel">
        <div className="login-brand-panel-logo">Sovereign Portal</div>
        <div>
          <h1 className="login-brand-panel-headline">Need Help?</h1>
          <p className="login-brand-panel-sub">
            We&apos;ll verify your identity and send a secure reset link to your email.
          </p>

          <div className="wizard-steps" style={{ marginTop: 32 }} aria-label="Reset steps">
            {[
              { num: 1, label: "Click 'Reset password' on login" },
              { num: 2, label: "Enter your credentials" },
              { num: 3, label: "System verifies & sends reset link" },
            ].map((s) => (
              <div key={s.num} className="wizard-step">
                <span className="wizard-step-num">{s.num}</span>
                <span className="wizard-step-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="login-brand-panel-sub" style={{ fontSize: 13, opacity: 0.5 }}>
          Standard Module Interface v0.1 · github.com/freshifyv2
        </p>
      </aside>

      {/* Right form panel */}
      <main className="login-form-panel">
        <div className="login-form-card">
          <div className="wizard-icon-circle is-violet">
            <IconLock />
          </div>

          <h1>Reset Your Password</h1>
          <p>Enter your details and we&apos;ll send you a reset link.</p>

          <form onSubmit={handleSubmit}>
            <div className="field" style={{ marginBottom: 16 }}>
              <label className="field-label">USERNAME</label>
              <input
                className="field-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Optional — your username"
                autoFocus
              />
            </div>

            <div className="field" style={{ marginBottom: 24 }}>
              <label className="field-label">EMAIL ADDRESS <span style={{ color: "var(--red)" }}>*</span></label>
              <input
                className="field-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              <div className="field-hint">
                Use <code>@blocked.test</code> or an address containing &quot;unknown&quot; to simulate a failed reset.
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={busy || !email.trim()}
            >
              {busy ? "Verifying…" : "Send Reset Link"}
            </button>
          </form>

          <p style={{ marginTop: 20, fontSize: 13, textAlign: "center" }}>
            <Link href="/login">← Back to Login</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
