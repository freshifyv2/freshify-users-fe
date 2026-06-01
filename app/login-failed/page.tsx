import Link from "next/link";

const IconX = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function LoginFailedPage() {
  return (
    <div className="login-split">
      {/* Left panel */}
      <aside className="login-brand-panel">
        <div className="login-brand-panel-logo">Sovereign Portal</div>
        <div>
          <h1 className="login-brand-panel-headline">
            Access Denied.
          </h1>
          <p className="login-brand-panel-sub">
            Your credentials could not be verified.
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
            <IconX />
          </div>

          <h1>Log in Failed</h1>
          <p>
            Your account credentials were not recognized, or your account
            permissions have been revoked.
          </p>

          <div className="info-panel is-red" style={{ marginBottom: 24 }}>
            <p className="info-panel-title">Possible Reasons</p>
            <ul className="info-panel-list">
              <li>Incorrect username, email, or password</li>
              <li>Account has been deactivated by an admin</li>
            </ul>
          </div>

          <div className="btn-row">
            <Link href="/login" className="btn btn-primary">
              Try Again
            </Link>
            <Link href="/support" className="btn btn-secondary">
              Contact Support
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
