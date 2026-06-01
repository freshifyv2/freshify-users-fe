"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const IconCheck = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const masked =
    local.length <= 2
      ? local[0] + "***"
      : local[0] + "***" + local[local.length - 1];
  return `${masked}@${domain}`;
}

function ResetSentContent() {
  const params = useSearchParams();
  const rawEmail = params.get("email") ?? "";
  const [resentDone, setResentDone] = useState(false);

  function handleResend() {
    setResentDone(true);
    setTimeout(() => setResentDone(false), 2000);
  }

  return (
    <div className="login-split">
      {/* Left panel */}
      <aside className="login-brand-panel">
        <div className="login-brand-panel-logo">Sovereign Portal</div>
        <div>
          <h1 className="login-brand-panel-headline">
            We&apos;ll help you recover your Account Access.
          </h1>
          <p className="login-brand-panel-sub">
            A secure reset link has been dispatched. Check your inbox and follow
            the instructions to set a new password.
          </p>
        </div>
        <p className="login-brand-panel-sub" style={{ fontSize: 13, opacity: 0.5 }}>
          Standard Module Interface v0.1 · github.com/freshifyv2
        </p>
      </aside>

      {/* Right form panel */}
      <main className="login-form-panel">
        <div className="login-form-card">
          <div className="wizard-icon-circle is-green">
            <IconCheck />
          </div>

          <h1>Reset Link Sent</h1>
          <p>
            If an account exists for the email below, you&apos;ll receive a password
            reset link within a few minutes.
          </p>

          <div className="sent-to-block">
            <div className="sent-to-label">SENT TO</div>
            <div className="sent-to-value">
              {rawEmail ? maskEmail(rawEmail) : "your email address"}
            </div>
          </div>

          <div className="info-banner" style={{ marginBottom: 24 }}>
            <span aria-hidden>💡</span>
            Didn&apos;t receive it? Check your spam folder or resend below.
          </div>

          <div className="btn-row">
            <Link href="/login" className="btn btn-secondary">
              Back to Login
            </Link>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleResend}
            >
              Resend Link
              {resentDone && (
                <span className="pill is-green" style={{ marginLeft: 8, fontSize: 11 }}>
                  Sent!
                </span>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ResetSentPage() {
  return (
    <Suspense>
      <ResetSentContent />
    </Suspense>
  );
}
