"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "identifier" | "code";
type Channel = "sms" | "email";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("identifier");
  const [channel, setChannel] = useState<Channel>("sms");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/otp/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), channel }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `request failed (${res.status})`);
      }
      setStep("code");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          channel,
          code: code.trim(),
          displayName: displayName.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `verify failed (${res.status})`);
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-split">
      <aside className="auth-brand">
        <div className="auth-brand-content">
          <div className="auth-brand-mark">
            <span className="auth-brand-mark-glyph" aria-hidden />
            Sovereign Portal
          </div>
          <h1>The sovereign foundation, working out of the box.</h1>
          <p className="lede">
            Users, Companies, and Workspaces as first-class sovereign modules — the
            same architecture you license, the same software you build on.
          </p>
          <ul className="auth-bullets">
            <li>Pluggable auth — Twilio, Auth0, Okta, Cognito, Clerk</li>
            <li>Standard Module Interface v0.1, with conformance you can verify</li>
            <li>Independently deployed FE / BE pairs composed by a shell</li>
            <li>No hosted SaaS. Always self-hosted on your cloud.</li>
          </ul>
        </div>
      </aside>

      <main className="auth-form-pane">
        <div className="auth-form-card">
          <h2>Sign in</h2>
          <p className="sub">
            {step === "identifier"
              ? "Phone or email — we'll send you a verification code."
              : `Code sent to ${identifier}`}
          </p>

          {step === "identifier" ? (
            <form onSubmit={requestCode}>
              <div className="auth-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={channel === "sms"}
                  className={`auth-tab ${channel === "sms" ? "active" : ""}`}
                  onClick={() => setChannel("sms")}
                >
                  Phone
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={channel === "email"}
                  className={`auth-tab ${channel === "email" ? "active" : ""}`}
                  onClick={() => setChannel("email")}
                >
                  Email
                </button>
              </div>

              <div className="field">
                <label className="field-label">
                  {channel === "sms" ? "Phone number" : "Email address"}
                </label>
                <input
                  type={channel === "sms" ? "tel" : "email"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    channel === "sms" ? "+16085551234" : "you@example.com"
                  }
                  required
                  autoFocus
                />
                <div className="help">
                  {channel === "sms"
                    ? "Use E.164 format with country code (e.g. +1 for US)."
                    : "We'll send the code to this address."}
                </div>
              </div>

              {error && (
                <div className="pill rose" style={{ marginBottom: 16 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={busy || !identifier.trim()}
              >
                {busy && <span className="spinner" />}
                {busy ? "Sending code..." : "Send verification code"}
              </button>

              <div className="divider-or">or</div>
              <p className="fineprint">
                Demo build — share the verification code with anyone you grant access.
                Real SMS / email delivery is wired by setting the Twilio adapter env vars.
              </p>
            </form>
          ) : (
            <form onSubmit={verifyCode}>
              <div className="cluster" style={{ marginBottom: 16 }}>
                <span className="pill green dot">Code sent</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setStep("identifier");
                    setCode("");
                    setError(null);
                  }}
                >
                  ← Change
                </button>
              </div>

              <div className="field">
                <label className="field-label">Verification code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  required
                  autoFocus
                  maxLength={6}
                />
                <div className="help">
                  Six digits. Demo access uses a shared code shared verbally by the host.
                </div>
              </div>

              <div className="field">
                <label className="field-label">Display name (first sign-in only)</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Optional — how should we greet you?"
                />
              </div>

              {error && (
                <div className="pill rose" style={{ marginBottom: 16 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={busy || !code}
              >
                {busy && <span className="spinner" />}
                {busy ? "Verifying..." : "Verify & sign in"}
              </button>

              <p className="fineprint">
                By signing in you agree to Freshify&apos;s terms of service.
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
