import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const { signInWithPassword, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = useMemo(() => {
    const from = location.state?.from;
    return typeof from === "string" ? from : "/";
  }, [location.state]);

  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // If user is already logged in, go to app.
  if (user) {
    navigate("/");
  }

  return (
    <div className="grid" style={{ marginTop: 22 }}>
      <div className="card" style={{ gridColumn: "span 12", maxWidth: 520 }}>
        <div className="cardHeader">
          <div>
            <h2>{mode === "signin" ? "Sign in" : "Create account"}</h2>
            <span>Use your email/password to access the claims workspace.</span>
          </div>
          <span className="badge badgePrimary">Supabase Auth</span>
        </div>

        {error ? <div className="alert alertError" role="alert">{error}</div> : null}

        <div className="formRow" style={{ marginTop: 12 }}>
          <div style={{ gridColumn: "span 2" }}>
            <label>
              <div className="helpText">Email</div>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                type="email"
                autoComplete="email"
              />
            </label>
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label>
              <div className="helpText">Password</div>
              <input
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </label>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14, alignItems: "center" }}>
          <button
            className="btn btnPrimary"
            disabled={busy}
            onClick={async () => {
              setError("");
              setBusy(true);
              try {
                if (!email || !password) {
                  throw new Error("Email and password are required.");
                }
                if (mode === "signin") {
                  await signInWithPassword({ email, password });
                  navigate(redirectTo);
                } else {
                  await signUp({ email, password });
                  // Many projects require email confirmation; keep UX explicit.
                  setError("Account created. If email confirmation is enabled, check your inbox before signing in.");
                  setMode("signin");
                }
              } catch (e) {
                setError(e?.message || "Authentication failed.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Working…" : mode === "signin" ? "Sign in" : "Sign up"}
          </button>

          <button
            className="btn"
            disabled={busy}
            onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
          >
            {mode === "signin" ? "Create account" : "Use existing account"}
          </button>
        </div>


      </div>
    </div>
  );
}
