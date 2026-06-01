import Link from "next/link";

const IconInfo = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="8" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="12" y1="12" x2="12" y2="16"/>
  </svg>
);

const IconX = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function ResetFailedPage() {
  return (
    <div className="login-split">
      {/* Left panel */}
      <aside className="login-brand-panel">
        <div className="login-brand-panel-logo">Sovereign Portal</div>
        <div>
          <div className="wizard-icon-circle is-red" style={{ marginBottom: 20 }}>
            <IconX />
          </div>
          <h1 className="login-brand-panel-headline" style={{ fontSize: 32 }}>
            Verification Failed
          </h1>
          <p className="login-brand-panel-sub">
            We couldn&apos;t verify your identity. Please try again or contact support.
          </p>
        </div>
        <p className="login-brand-panel-sub" style={{ fontSize: 13, opacity: 0.5 }}>
          Standard Module Interface v0.1 · github.com/freshifyv2
        </p>
      </aside>

      {/* Right card */}
      <main className="login-form-panel">
        <div className="login-form-card">
          <div className="wizard-icon-circle is-red">
            <IconInfo />
          </div>

          <h1>Couldn&apos;t Reset Password</h1>
          <p>
            We were unable to locate an account matching the details you
            provided. Please review and try again.
          </p>

          <div className="info-panel is-red" style={{ marginBottom: 16 }}>
            <p className="info-panel-title">What Happened?</p>
            <ul className="info-panel-list">
              <li>Email address not found in the system</li>
              <li>Account has been removed by an admin</li>
            </ul>
          </div>

          <div className="info-panel is-gray" style={{ marginBottom: 24 }}>
            <p className="info-panel-title">Need More Help?</p>
            <ul className="info-panel-list">
              <li>Submit a Support Ticket and our team will assist you</li>
            </ul>
          </div>

          <div className="btn-row">
            <Link href="/reset" className="btn btn-primary">
              Try Again
            </Link>
            <Link href="/support" className="btn btn-secondary">
              Contact Support
            </Link>
          </div>

          <p style={{ marginTop: 20, fontSize: 13, textAlign: "center" }}>
            <Link href="/login">← Back to Login Page</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
