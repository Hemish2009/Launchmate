// src/App.jsx — router root
// Routes:
//   /              → Landing page
//   /auth          → Sign in / Sign up
//   /app           → redirect → /app/discover
//   /app/:tab      → AppShell (discover | team | courses | profile)
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import LandingPage  from "./launchmate-landing";
import AuthScreen   from "./AuthScreen";
import AppShell     from "./AppShell";

/* ── Global CSS (keyframes, resets, utility classes) ── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@200;300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { background:#080808; color:#f0f0f0; -webkit-font-smoothing:antialiased; }
  ::placeholder { color:rgba(255,255,255,0.18) !important; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:2px; }
  @keyframes fadeIn  { from{opacity:0}         to{opacity:1} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes sheetUp { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
  @keyframes orbP    { 0%,100%{opacity:0.4;transform:scale(0.85)} 50%{opacity:1;transform:scale(1.15)} }
  @keyframes toastAnim {
    0%   { opacity:0; transform:translateX(-50%) translateY(12px); }
    12%  { opacity:1; transform:translateX(-50%) translateY(0); }
    80%  { opacity:1; transform:translateX(-50%) translateY(0); }
    100% { opacity:0; transform:translateX(-50%) translateY(-6px); }
  }
  .gc  { transition:border-color 0.2s, transform 0.2s, background 0.2s; }
  .gcc { cursor:pointer; }
  .gcc:hover { border-color:rgba(255,255,255,0.14) !important; background:rgba(255,255,255,0.045) !important; transform:translateY(-1px); }
  .lmbtn { transition:opacity 0.15s, transform 0.15s; }
  .lmbtn:hover:not(:disabled) { opacity:0.88; transform:translateY(-1px); }
  .lmbtn:active:not(:disabled){ transform:translateY(0); }
  @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
`;

/* ── Protected route ── */
function ProtectedRoute({ children }) {
  const [auth, setAuth] = useState(null); // null=checking, true/false
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data:{ session } }) => {
      if (!session) navigate("/auth", { replace:true });
      else setAuth(true);
    });
  }, [navigate]);

  if (!auth) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#080808" }}>
      <div style={{ width:32, height:32, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.08)", borderTop:"2px solid rgba(255,255,255,0.5)", animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  return children;
}

/* ── Landing wrapper (redirect if already logged in) ── */
function LandingWrapper() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data:{ session } }) => {
      if (session) navigate("/app/discover", { replace:true });
    });
  }, [navigate]);
  return <LandingPage />;
}

export default function App() {
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <BrowserRouter>
        <Routes>
          <Route path="/"           element={<LandingWrapper/>}/>
          <Route path="/auth"       element={<AuthScreen/>}/>
          <Route path="/app"        element={<Navigate to="/app/discover" replace/>}/>
          <Route path="/app/:tab"   element={<ProtectedRoute><AppShell/></ProtectedRoute>}/>
          {/* Legacy redirect for old /launchmate URL */}
          <Route path="/launchmate" element={<Navigate to="/app/discover" replace/>}/>
          <Route path="*"           element={<Navigate to="/" replace/>}/>
        </Routes>
      </BrowserRouter>
    </>
  );
}