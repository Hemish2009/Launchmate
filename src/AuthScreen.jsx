// src/AuthScreen.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import Logo from "./Logo";

const sans = "'DM Sans','Helvetica Neue',sans-serif";
const mono = "'DM Mono',monospace";
const SG = "'Space Grotesk',sans-serif";

function Field({ label, type = "text", value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <div style={{
          fontFamily: mono, fontSize: 8, color: "rgba(255,255,255,0.35)",
          letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8
        }}>
          {label}
        </div>
      )}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", boxSizing: "border-box",
          background: focused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${focused ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.09)"}`,
          borderRadius: 14, padding: "13px 16px", fontSize: 14,
          fontFamily: sans, color: "#f0f0f0", outline: "none", transition: "all 0.2s",
        }}
      />
    </div>
  );
}

export default function AuthScreen({ onAuth }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setError(""); setLoading(true);
    if (mode === "signup") {
      const { error: e } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
      if (e) { setError(e.message); setLoading(false); return; }
      setDone(true);
    } else {
      const { error: e } = await supabase.auth.signInWithPassword({ email, password });
      if (e) { setError(e.message); setLoading(false); return; }
      if (onAuth) onAuth();
      else navigate("/launchmate");
    }
    setLoading(false);
  };

  const goLanding = () => navigate("/");

  /* ── styles ── */
  const page = {
    fontFamily: sans,
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    position: "relative",
    overflow: "hidden",
    /* light mesh bg — the 04 frosted glass aesthetic */
    background: "#eaeaf2",
    backgroundImage: [
      "radial-gradient(ellipse 65% 55% at 18% 28%, rgba(255,255,255,0.92) 0%, transparent 60%)",
      "radial-gradient(ellipse 55% 65% at 82% 72%, rgba(210,210,235,0.55) 0%, transparent 62%)",
      "radial-gradient(ellipse 45% 40% at 55% 5%,  rgba(240,240,255,0.4)  0%, transparent 55%)",
    ].join(","),
  };

  /* ── email confirm ── */
  if (done) return (
    <div style={page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap');`}</style>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <Logo size={28} variant="light" />
        </div>
        <div style={{
          width: 56, height: 56, borderRadius: 18, background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.75)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 26, margin: "0 auto 20px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,1)"
        }}>✉️</div>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 8, color: "#0a0a0a" }}>Check your inbox</div>
        <div style={{ fontSize: 14, color: "rgba(0,0,0,0.45)", lineHeight: 1.7, marginBottom: 28 }}>
          We sent a confirmation link to <strong style={{ color: "#0a0a0a" }}>{email}</strong>.<br />
          Click it to activate your account.
        </div>
        <button onClick={() => { setDone(false); setMode("signin"); }}
          style={{
            background: "#0a0a0a", border: "none", borderRadius: 14, padding: "13px 32px",
            fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: sans
          }}>
          Go to Sign In
        </button>
      </div>
    </div>
  );

  /* ── main form ── */
  return (
    <div style={page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:scale(1)} }
        @keyframes badgePop { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
        .auth-input:focus { border-color:rgba(255,255,255,0.25) !important; background:rgba(255,255,255,0.07) !important; }
        .auth-submit { transition: opacity 0.18s, transform 0.18s; }
        .auth-submit:hover:not(:disabled) { opacity:0.88; transform:translateY(-1px); }
        .auth-submit:active:not(:disabled) { transform:translateY(0); }
        .back-btn { transition:color 0.2s; }
        .back-btn:hover { color:rgba(0,0,0,0.55) !important; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 420, animation: "fadeUp 0.5s cubic-bezier(0.23,1,0.32,1) both" }}>

        {/* back to landing */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <span className="back-btn" onClick={goLanding}
            style={{
              fontFamily: mono, fontSize: 8, color: "rgba(0,0,0,0.3)", letterSpacing: "0.16em",
              textTransform: "uppercase", cursor: "pointer"
            }}>
            ← launchmate.com
          </span>
        </div>

        {/* Logo — light glass pill on the light mesh bg */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <Logo size={32} variant="light" />
          </div>
          <div style={{ fontFamily: mono, fontSize: 9, color: "rgba(0,0,0,0.28)", letterSpacing: "0.2em" }}>
            {mode === "signup" ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}
          </div>
        </div>

        {/* Glass card */}
        <div style={{
          background: "rgba(255,255,255,0.52)",
          backdropFilter: "blur(28px) saturate(190%)",
          WebkitBackdropFilter: "blur(28px) saturate(190%)",
          border: "1px solid rgba(255,255,255,0.75)",
          borderTopColor: "rgba(255,255,255,0.92)",
          borderRadius: 28, padding: "32px 28px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1)",
          position: "relative", overflow: "hidden",
        }}>
          {/* shimmer top */}
          <div style={{
            position: "absolute", top: 0, left: "8%", right: "8%", height: 1,
            background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.9),transparent)"
          }} />

          {/* fields — override colours for light bg */}
          {mode === "signup" && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: mono, fontSize: 8, color: "rgba(0,0,0,0.35)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>Your Name</div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Alex Johnson"
                style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.55)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 14, padding: "13px 16px", fontSize: 14, fontFamily: sans, color: "#0a0a0a", outline: "none", transition: "all 0.2s" }}
                onFocus={e => { e.target.style.background = "rgba(255,255,255,0.75)"; e.target.style.borderColor = "rgba(0,0,0,0.2)"; }}
                onBlur={e => { e.target.style.background = "rgba(255,255,255,0.55)"; e.target.style.borderColor = "rgba(0,0,0,0.1)"; }} />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: mono, fontSize: 8, color: "rgba(0,0,0,0.35)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>Email</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.55)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 14, padding: "13px 16px", fontSize: 14, fontFamily: sans, color: "#0a0a0a", outline: "none", transition: "all 0.2s" }}
              onFocus={e => { e.target.style.background = "rgba(255,255,255,0.75)"; e.target.style.borderColor = "rgba(0,0,0,0.2)"; }}
              onBlur={e => { e.target.style.background = "rgba(255,255,255,0.55)"; e.target.style.borderColor = "rgba(0,0,0,0.1)"; }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: mono, fontSize: 8, color: "rgba(0,0,0,0.35)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>Password</div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters"
              style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.55)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 14, padding: "13px 16px", fontSize: 14, fontFamily: sans, color: "#0a0a0a", outline: "none", transition: "all 0.2s" }}
              onFocus={e => { e.target.style.background = "rgba(255,255,255,0.75)"; e.target.style.borderColor = "rgba(0,0,0,0.2)"; }}
              onBlur={e => { e.target.style.background = "rgba(255,255,255,0.55)"; e.target.style.borderColor = "rgba(0,0,0,0.1)"; }}
              onKeyDown={e => e.key === "Enter" && submit()} />
          </div>

          {error && (
            <div style={{
              background: "rgba(200,50,50,0.08)", border: "1px solid rgba(200,50,50,0.2)",
              borderRadius: 12, padding: "10px 14px", marginBottom: 16, fontSize: 12,
              color: "rgba(180,50,50,0.9)", fontFamily: mono
            }}>
              {error}
            </div>
          )}

          <button className="auth-submit" onClick={submit}
            disabled={loading || !email || !password || (mode === "signup" && !name)}
            style={{
              width: "100%", background: loading ? "rgba(0,0,0,0.35)" : "#0a0a0a",
              border: "none", borderRadius: 16, padding: "15px", fontSize: 14, fontWeight: 600,
              color: "#fff", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s",
              marginBottom: 20, fontFamily: sans,
              boxShadow: loading ? "none" : "0 4px 20px rgba(0,0,0,0.2)"
            }}>
            {loading ? "Please wait…" : mode === "signup" ? "Create Account" : "Sign In"}
          </button>

          <div style={{
            textAlign: "center", fontFamily: mono, fontSize: 9,
            color: "rgba(0,0,0,0.3)", letterSpacing: "0.08em"
          }}>
            {mode === "signup" ? "ALREADY HAVE AN ACCOUNT?" : "DON'T HAVE AN ACCOUNT?"}
            {" "}
            <span onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(""); }}
              style={{ color: "rgba(0,0,0,0.65)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
              {mode === "signup" ? "Sign in" : "Sign up free"}
            </span>
          </div>
        </div>

        <div style={{
          textAlign: "center", marginTop: 20, fontFamily: mono, fontSize: 8,
          color: "rgba(0,0,0,0.22)", letterSpacing: "0.1em"
        }}>
          BY CONTINUING YOU AGREE TO OUR TERMS & PRIVACY POLICY
        </div>
      </div>
    </div>
  );
}