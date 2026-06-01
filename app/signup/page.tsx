"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ── SVG Icons ─────────────────────────────────────────────────────────────────

const IconEnvelope = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M2 7l10 7 10-7"/>
  </svg>
);

const IconBuilding = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="1"/>
    <path d="M3 9h18"/>
    <path d="M9 21V9"/>
    <rect x="6" y="13" width="3" height="3"/>
    <rect x="6" y="5" width="3" height="3"/>
    <rect x="12" y="5" width="3" height="3"/>
    <rect x="12" y="13" width="3" height="3"/>
  </svg>
);

const IconBriefcase = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    <line x1="12" y1="12" x2="12" y2="12"/>
    <path d="M2 13h20"/>
  </svg>
);

const IconUsers = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="9" cy="7" r="4"/>
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    <path d="M21 21v-2a4 4 0 0 0-3-3.87"/>
  </svg>
);

const IconCheck = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

// ── Helpers ────────────────────────────────────────────────────────────────────

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const masked =
    local.length <= 2
      ? local[0] + "***"
      : local[0] + "***" + local[local.length - 1];
  return `${masked}@${domain}`;
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface InviteRow {
  email: string;
  role: string;
}

// ── Wizard step definitions ────────────────────────────────────────────────────

const STEPS = [
  { label: "Create Account" },
  { label: "Verify Email" },
  { label: "Create Company" },
  { label: "Create Workspace" },
  { label: "Invite Team" },
];

// Steps shown in the left-panel indicator (only 4 milestones shown)
const INDICATOR_STEPS = [
  { label: "Create Account" },
  { label: "Create Company" },
  { label: "Create Workspace" },
  { label: "Invite Team" },
];

function indicatorStatus(indicatorIdx: number, currentStep: number): "done" | "active" | "future" {
  // Indicator 0 = wizard step 1, Indicator 1 = wizard step 3, etc.
  // Map indicator index to wizard step threshold
  const wizardThresholds = [1, 3, 4, 5];
  const threshold = wizardThresholds[indicatorIdx];
  if (currentStep > threshold) return "done";
  if (currentStep >= threshold) return "active";
  // Step 2 (verify) shows indicator 0 as active still
  if (indicatorIdx === 0 && currentStep === 2) return "active";
  return "future";
}

// ── Left panel per step ────────────────────────────────────────────────────────

function BrandPanel({ step }: { step: number }) {
  return (
    <aside className="login-brand-panel">
      <div className="login-brand-panel-logo">Sovereign Portal</div>
      <div>
        <h1 className="login-brand-panel-headline">
          {step <= 2
            ? "Your sovereign platform starts here."
            : step === 3
            ? "Set up your company."
            : step === 4
            ? "Create your workspace."
            : "Grow your team."}
        </h1>
        <p className="login-brand-panel-sub">
          {step <= 2
            ? "Create your account and start building on Sovereign Portal."
            : step === 3
            ? "Add your company details — you'll be appointed Super Admin with full control."
            : step === 4
            ? "Workspaces let you organize your team by function or project."
            : "Invite teammates to collaborate. You can always do this later."}
        </p>

        {/* Step indicator */}
        <nav className="wizard-steps" aria-label="Signup progress">
          {INDICATOR_STEPS.map((s, idx) => {
            const status = indicatorStatus(idx, step);
            return (
              <div
                key={s.label}
                className={`wizard-step${status === "active" ? " is-active" : status === "done" ? " is-done" : ""}`}
              >
                <span className="wizard-step-num">
                  {status === "done" ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </span>
                <span className="wizard-step-label">{s.label}</span>
              </div>
            );
          })}
        </nav>
      </div>
      <p className="login-brand-panel-sub" style={{ fontSize: 13, opacity: 0.5 }}>
        Standard Module Interface v0.1 · github.com/freshifyv2
      </p>
    </aside>
  );
}

// ── Main wizard component ──────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter();

  // Current wizard step (1–5)
  const [step, setStep] = useState(1);

  // Step 1 fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tosChecked, setTosChecked] = useState(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Step 2
  const [resentDone, setResentDone] = useState(false);

  // Step 3 fields
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [industry, setIndustry] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");

  // Step 4 fields
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceType, setWorkspaceType] = useState("");
  const [description, setDescription] = useState("");

  // Step 5 fields
  const [invites, setInvites] = useState<InviteRow[]>([{ email: "", role: "Member" }]);

  // ── Step 1 submit ────────────────────────────────────────────────────────────
  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setStep1Error(null);
    if (password !== confirmPassword) {
      setStep1Error("Passwords do not match.");
      return;
    }
    if (!tosChecked) {
      setStep1Error("You must agree to the Terms of Service.");
      return;
    }
    setStep(2);
  }

  // ── Step 2 resend ────────────────────────────────────────────────────────────
  function handleResend() {
    setResentDone(true);
    setTimeout(() => setResentDone(false), 2000);
  }

  // ── Step 5 invite rows ───────────────────────────────────────────────────────
  function addInviteRow() {
    setInvites([...invites, { email: "", role: "Member" }]);
  }

  function updateInvite(idx: number, field: keyof InviteRow, value: string) {
    const updated = [...invites];
    updated[idx] = { ...updated[idx], [field]: value };
    setInvites(updated);
  }

  function handleFinish() {
    router.push("/login?just_signed_up=1");
  }

  // ── Step 3 ───────────────────────────────────────────────────────────────────
  const superAdminBanner = (
    <div className="info-banner is-violet" style={{ marginTop: 20 }}>
      <span aria-hidden>🛡</span>
      <span>
        <strong>You&apos;ll become Super Admin</strong> — Full control over company settings, users, and data.
      </span>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="login-split">
      <BrandPanel step={step} />

      <main className="login-form-panel">
        <div className="login-form-card">

          {/* ── Step 1: Get Started ──────────────────────────────────────── */}
          {step === 1 && (
            <>
              <h1>Get Started</h1>
              <p>Create your Sovereign Portal account.</p>
              <form onSubmit={handleStep1}>
                <div className="field-grid" style={{ marginBottom: 16 }}>
                  <div className="field">
                    <label className="field-label">FIRST NAME</label>
                    <input
                      className="field-input"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="field">
                    <label className="field-label">LAST NAME</label>
                    <input
                      className="field-input"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Smith"
                      required
                    />
                  </div>
                </div>

                <div className="field" style={{ marginBottom: 16 }}>
                  <label className="field-label">EMAIL ADDRESS</label>
                  <input
                    className="field-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    required
                  />
                </div>

                <div className="field" style={{ marginBottom: 16 }}>
                  <label className="field-label">PASSWORD</label>
                  <input
                    className="field-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    minLength={8}
                    required
                  />
                </div>

                <div className="field" style={{ marginBottom: 20 }}>
                  <label className="field-label">CONFIRM PASSWORD</label>
                  <input
                    className="field-input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                  />
                </div>

                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20, fontSize: 13, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={tosChecked}
                    onChange={(e) => setTosChecked(e.target.checked)}
                    style={{ marginTop: 2, accentColor: "var(--violet)", flexShrink: 0 }}
                  />
                  <span style={{ color: "var(--fg-2)" }}>
                    I agree to the{" "}
                    <Link href="#">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="#">Privacy Policy</Link>
                  </span>
                </label>

                {step1Error && (
                  <div className="warning-banner" style={{ marginBottom: 16 }}>
                    <span className="warning-banner-icon" aria-hidden>⚠</span>
                    {step1Error}
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                  Create Account
                </button>

                <p style={{ marginTop: 16, fontSize: 13, textAlign: "center" }}>
                  Already have an account?{" "}
                  <Link href="/login">Sign In</Link>
                </p>
              </form>
            </>
          )}

          {/* ── Step 2: Verify Email ─────────────────────────────────────── */}
          {step === 2 && (
            <>
              <div className="wizard-icon-circle is-amber">
                <IconEnvelope />
              </div>
              <h1>Check your email</h1>
              <p>
                We&apos;ve sent a verification link to{" "}
                <strong>{email ? maskEmail(email) : "your email"}</strong>.
              </p>

              <div className="info-banner" style={{ marginBottom: 20 }}>
                <span aria-hidden>💡</span>
                Can&apos;t find it? Check your spam or junk folder.
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{ width: "100%", marginBottom: 12 }}
                onClick={handleResend}
              >
                Resend Verification Link
                {resentDone && (
                  <span className="pill is-green" style={{ marginLeft: 8, fontSize: 11 }}>
                    Sent!
                  </span>
                )}
              </button>

              <p style={{ textAlign: "center", fontSize: 13, marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  style={{ background: "none", border: "none", color: "var(--violet)", cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0 }}
                >
                  I clicked the link → Continue
                </button>
              </p>

              <p style={{ textAlign: "center", fontSize: 13, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 13, padding: 0 }}
                >
                  Wrong email? Go back and fix it
                </button>
              </p>
            </>
          )}

          {/* ── Step 3: Create Company ───────────────────────────────────── */}
          {step === 3 && (
            <>
              <div className="wizard-icon-circle is-violet">
                <IconBuilding />
              </div>
              <h1>Create your Company</h1>
              <p>Set up your company profile. You&apos;ll be its Super Admin.</p>

              <form onSubmit={(e) => { e.preventDefault(); setStep(4); }}>
                <div className="field" style={{ marginBottom: 16 }}>
                  <label className="field-label">COMPANY NAME <span style={{ color: "var(--red)" }}>*</span></label>
                  <input
                    className="field-input"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Corp"
                    required
                  />
                </div>

                <div className="field" style={{ marginBottom: 16 }}>
                  <label className="field-label">COMPANY TYPE</label>
                  <select
                    className="field-input field-select"
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value)}
                  >
                    <option value="">Select type…</option>
                    <option value="service">Service Business</option>
                    <option value="logistics">Logistics</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="retail">Retail</option>
                    <option value="professional">Professional Services</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="field" style={{ marginBottom: 16 }}>
                  <label className="field-label">INDUSTRY</label>
                  <input
                    className="field-input"
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Supply Chain, SaaS, Medical Devices"
                  />
                </div>

                <div className="field-grid" style={{ marginBottom: 16 }}>
                  <div className="field">
                    <label className="field-label">PHONE</label>
                    <input
                      className="field-input"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="field">
                    <label className="field-label">WEBSITE</label>
                    <input
                      className="field-input"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://acme.com"
                    />
                  </div>
                </div>

                {superAdminBanner}

                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 20 }}>
                  Continue →
                </button>
              </form>
            </>
          )}

          {/* ── Step 4: Create Workspace ─────────────────────────────────── */}
          {step === 4 && (
            <>
              <div className="wizard-icon-circle is-violet">
                <IconBriefcase />
              </div>
              <h1>Create your Workspace</h1>
              <p>Workspaces organize your team and their work.</p>

              <form onSubmit={(e) => { e.preventDefault(); setStep(5); }}>
                <div className="field" style={{ marginBottom: 16 }}>
                  <label className="field-label">WORKSPACE NAME <span style={{ color: "var(--red)" }}>*</span></label>
                  <input
                    className="field-input"
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="Operations HQ"
                    required
                  />
                </div>

                <div className="field" style={{ marginBottom: 16 }}>
                  <label className="field-label">WORKSPACE TYPE</label>
                  <select
                    className="field-input field-select"
                    value={workspaceType}
                    onChange={(e) => setWorkspaceType(e.target.value)}
                  >
                    <option value="">Select type…</option>
                    <option value="operations">Operations</option>
                    <option value="sales">Sales</option>
                    <option value="engineering">Engineering</option>
                    <option value="support">Support</option>
                    <option value="finance">Finance</option>
                    <option value="hr">HR</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="field" style={{ marginBottom: 16 }}>
                  <label className="field-label">DESCRIPTION</label>
                  <textarea
                    className="field-input field-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this workspace focus on?"
                  />
                </div>

                {superAdminBanner}

                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 20 }}>
                  Continue →
                </button>
              </form>
            </>
          )}

          {/* ── Step 5: Invite Team ──────────────────────────────────────── */}
          {step === 5 && (
            <>
              <div className="wizard-icon-circle is-violet">
                <IconUsers />
              </div>
              <h1>Invite your Team</h1>
              <p style={{ marginBottom: 24 }}>
                Optional — add teammates now or skip and invite later.
              </p>

              <div style={{ marginBottom: 16 }}>
                {invites.map((row, idx) => (
                  <div key={idx} className="invite-row">
                    <input
                      className="field-input"
                      type="email"
                      value={row.email}
                      onChange={(e) => updateInvite(idx, "email", e.target.value)}
                      placeholder="teammate@example.com"
                    />
                    <select
                      className="field-input field-select"
                      value={row.role}
                      onChange={(e) => updateInvite(idx, "role", e.target.value)}
                      style={{ width: 120, flexShrink: 0 }}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Member">Member</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={addInviteRow}
                  style={{ marginTop: 4 }}
                >
                  + Add another
                </button>
              </div>

              <div className="btn-row" style={{ marginTop: 24 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleFinish}
                >
                  Send Invites &amp; Enter Platform
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleFinish}
                >
                  Skip for now
                </button>
              </div>

              {/* Checkmark confirmation visual */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20, color: "var(--muted)", fontSize: 13 }}>
                <span className="wizard-icon-circle is-green" style={{ width: 28, height: 28, marginBottom: 0 }}>
                  <IconCheck />
                </span>
                Account ready — just invite or skip to enter the portal.
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}

// Re-export step label constant for type safety (unused at runtime, helps tree shake)
export const _STEPS = STEPS;
