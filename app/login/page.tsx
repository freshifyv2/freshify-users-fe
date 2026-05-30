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
    <div className="login-split">
      <aside className="login-brand-panel">
        <div className="login-brand-panel-logo">Sovereign Portal</div>
        <div>
          <h1 className="login-brand-panel-headline">
            The sovereign foundation, working out of the box.
          </h1>
          <p className="login-brand-panel-sub">
            Users, Companies, and Workspaces as first-class sovereign modules —
            the same architecture you license, the same software you build on.
          </p>
        </div>
        <p className="login-brand-panel-sub" style={{ fontSize: 13, opacity: 0.5 }}>
          Standard Module Interface v0.1 · github.com/freshifyv2
        </p>
      </aside>

      <main className="login-form-panel">
        <div className="login-form-card">
          <h1>Sign in</h1>
          <p>
            {step === "identifier"
              ? "Phone or email — we'll send you a verification code."
              : `Code sent to ${identifier}`}
          </p>

          {step === "identifier" ? (
            <form onSubmit={requestCode}>
              <div className="filter-pills" style={{ marginBottom: 20 }}>
                <button
                  type="button"
                  className={`filter-pill ${channel === "sms" ? "is-active" : ""}`}
                  onClick={() => setChannel("sms")}
                >
                  Phone
                </button>
                <button
                  type="button"
                  className={`filter-pill ${channel === "email" ? "is-active" : ""}`}
                  onClick={() => setChannel("email")}
                >
                  Email
                </button>
              </div>

              <div className="field" style={{ marginBottom: 20 }}>
                <label className="field-label">
                  {channel === "sms" ? "PHONE NUMBER" : "EMAIL ADDRESS"}
                </label>
                <input
                  className="field-input"
                  type={channel === "sms" ? "tel" : "email"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={channel === "sms" ? "+16085551234" : "you@example.com"}
                  required
                  autoFocus
                />
                <div className="field-hint">
                  {channel === "sms"
                    ? "Use E.164 format with country code (e.g. +1 for US)."
                    : "We'll send the code to this address."}
                </div>
              </div>

              {error && (
                <div className="warning-banner" style={{ marginBottom: 16 }}>
                  <span className="warning-banner-icon" aria-hidden>⚠</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%" }}
                disabled={busy || !identifier.trim()}
              >
                {busy ? "Sending code..." : "Send verification code"}
              </button>

              <p style={{ marginTop: 20, fontSize: 12, color: "var(--muted)" }}>
                Demo build — share the verification code with anyone you grant access.
                Real SMS / email delivery is wired by setting the Twilio adapter env vars.
              </p>
            </form>
          ) : (
            <form onSubmit={verifyCode}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <span className="status-pill is-active">Code sent</span>
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

              <div className="field" style={{ marginBottom: 20 }}>
                <label className="field-label">VERIFICATION CODE</label>
                <input
                  className="field-input"
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
                <div className="field-hint">
                  Six digits. Demo access uses a shared code shared verbally by the host.
                </div>
              </div>

              <div className="field" style={{ marginBottom: 20 }}>
                <label className="field-label">DISPLAY NAME (FIRST SIGN-IN ONLY)</label>
                <input
                  className="field-input"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Optional — how should we greet you?"
                />
              </div>

              {error && (
                <div className="warning-banner" style={{ marginBottom: 16 }}>
                  <span className="warning-banner-icon" aria-hidden>⚠</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%" }}
                disabled={busy || !code}
              >
                {busy ? "Verifying..." : "Verify & sign in"}
              </button>

              <p style={{ marginTop: 20, fontSize: 12, color: "var(--muted)" }}>
                By signing in you agree to Freshify&apos;s terms of service.
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
