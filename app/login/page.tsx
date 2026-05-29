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
  const [hint, setHint] = useState<string | null>(null);

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
      setHint(
        channel === "sms"
          ? "Twilio is disabled in this build — the code was written to the Cloud Run log for freshify-users. Paste it here."
          : "Check your inbox (or the freshify-users Cloud Run log if email isn't wired yet)."
      );
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
    <div className="container" style={{ maxWidth: 440, paddingTop: 80 }}>
      <div className="stack" style={{ gap: 24 }}>
        <div>
          <div className="kicker">Sovereign Portal</div>
          <h1 style={{ marginTop: 8 }}>Sign in</h1>
          <p className="muted" style={{ marginTop: 8 }}>
            Phone or email — we&apos;ll send you a code.
          </p>
        </div>

        <div className="card">
          {step === "identifier" ? (
            <form onSubmit={requestCode} className="stack">
              <div className="row" style={{ gap: 8 }}>
                <button
                  type="button"
                  className={channel === "sms" ? "primary" : "ghost"}
                  onClick={() => setChannel("sms")}
                  style={{ flex: 1 }}
                >
                  Phone
                </button>
                <button
                  type="button"
                  className={channel === "email" ? "primary" : "ghost"}
                  onClick={() => setChannel("email")}
                  style={{ flex: 1 }}
                >
                  Email
                </button>
              </div>

              <div>
                <label className="label">
                  {channel === "sms" ? "Phone (E.164, e.g. +16085551234)" : "Email"}
                </label>
                <input
                  type={channel === "sms" ? "tel" : "email"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={channel === "sms" ? "+16085551234" : "you@example.com"}
                  required
                  autoFocus
                />
              </div>

              {error && <div className="error">{error}</div>}

              <button type="submit" className="primary" disabled={busy || !identifier}>
                {busy ? "Sending..." : "Send code"}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="stack">
              <div className="muted" style={{ fontSize: 14 }}>
                Sent to <strong style={{ color: "var(--fg)" }}>{identifier}</strong>{" "}
                <button
                  type="button"
                  className="ghost"
                  style={{ padding: "4px 10px", fontSize: 12, marginLeft: 8 }}
                  onClick={() => {
                    setStep("identifier");
                    setCode("");
                    setError(null);
                    setHint(null);
                  }}
                >
                  Change
                </button>
              </div>

              <div>
                <label className="label">Verification code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Display name (first-time only)</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="optional"
                />
              </div>

              {hint && <div className="muted" style={{ fontSize: 13 }}>{hint}</div>}
              {error && <div className="error">{error}</div>}

              <button type="submit" className="primary" disabled={busy || !code}>
                {busy ? "Verifying..." : "Verify & sign in"}
              </button>
            </form>
          )}
        </div>

        <div className="muted" style={{ fontSize: 12, textAlign: "center" }}>
          By signing in you agree to Freshify&apos;s terms.
        </div>
      </div>
    </div>
  );
}
