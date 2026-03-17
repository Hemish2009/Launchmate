// src/shared.jsx
// Shared constants, hooks, and primitive UI components used across all pages.
// Import what you need: import { mono, Avatar, Btn, ... } from "../shared";

import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";

/* ══════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════ */
export const mono = "'DM Mono',monospace";
export const sans = "'DM Sans','Helvetica Neue',sans-serif";

/* ══════════════════════════════════════════════════════════
   SEED / FALLBACK DATA
══════════════════════════════════════════════════════════ */
export const SEED_IDEAS = [
  { id:1, title:"AI Meal Planner for Busy Parents",  author:"Sarah K.", av:"SK", stage:"Idea",      tags:["AI","Health","Mobile"],       feedback:12, matches:3,  traction:"320 waitlist",       category:"Health",       desc:"Generates weekly meal plans based on dietary needs, budget, and time constraints — then auto-creates a grocery list synced straight to your favourite supermarket app." },
  { id:2, title:"Local Skills Exchange Network",     author:"Marcus T.",av:"MT", stage:"Validated", tags:["Community","Market"],          feedback:28, matches:7,  traction:"2 pilots live",      category:"Community",    desc:"Neighbors trade skills — a plumber learns guitar in exchange for accounting help. Hyperlocal trust economy with zero cash required." },
  { id:3, title:"Focus Timer with Accountability",   author:"Priya M.", av:"PM", stage:"Building",  tags:["Productivity","Social"],       feedback:45, matches:12, traction:"180 beta users",     category:"Productivity", desc:"Pomodoro sessions where you're matched with a stranger for live mutual accountability. Drop-in rooms, silent co-working, real results." },
  { id:4, title:"Micro-Investment Tracker Gen Z",    author:"Alex R.",  av:"AR", stage:"Idea",      tags:["Finance","Education"],         feedback:8,  matches:2,  traction:"Early research",     category:"Finance",      desc:"Simplify investing for people with $10–100. Gamified learning, social gains, zero jargon. Built for the TikTok-finance generation." },
  { id:5, title:"On-Demand Dog Care Marketplace",    author:"Lily C.",  av:"LC", stage:"Validated", tags:["Pets","Marketplace","Mobile"], feedback:19, matches:5,  traction:"60 sitters onboarded",category:"Marketplace", desc:"Find trusted dog sitters, walkers, and groomers within 2 km in under 60 seconds. Real-time GPS tracking included." },
  { id:6, title:"B2B SaaS for Freelance Invoicing",  author:"Tom B.",   av:"TB", stage:"Building",  tags:["SaaS","Finance","B2B"],        feedback:37, matches:9,  traction:"$4k MRR",            category:"SaaS",         desc:"One-click invoicing, automatic late payment reminders, and multi-currency payouts. Freelancers get paid 2× faster on average." },
];

export const COURSES = [
  { id:1, title:"Zero to One: Validating Your Startup Idea", instructor:"David Osei", av:"DO", category:"Validation",  level:"Beginner",     duration:"4h 20m", lessons:18, students:2840, rating:4.9, tags:["Validation","PMF","Research"],           desc:"Learn the exact frameworks YC uses to stress-test ideas before writing a single line of code.",                                                                      free:true,  accent:"rgba(120,200,140,0.15)", accentBorder:"rgba(120,200,140,0.25)" },
  { id:2, title:"Fundraising 101: From Idea to Seed Round",  instructor:"Sara Elms",  av:"SE", category:"Fundraising", level:"Intermediate", duration:"6h 10m", lessons:24, students:1920, rating:4.8, tags:["Fundraising","Pitch","SAFE"],             desc:"Walk through building your first pitch deck and closing a pre-seed round — from a VC who's seen 800+ pitches.",                                                     free:false, accent:"rgba(140,160,255,0.12)", accentBorder:"rgba(140,160,255,0.22)" },
  { id:3, title:"Product Thinking for Non-Technical Founders",instructor:"James Wu",  av:"JW", category:"Product",     level:"Beginner",     duration:"3h 45m", lessons:15, students:3610, rating:4.9, tags:["Product","Roadmap","User Research"],      desc:"A practical crash course on writing specs, prioritising backlogs, and talking to engineers — from a decade of Google PM experience.",                              free:true,  accent:"rgba(240,180,80,0.12)",  accentBorder:"rgba(240,180,80,0.22)"  },
  { id:4, title:"Design Systems That Scale",                  instructor:"Mia Torres", av:"MT", category:"Design",      level:"Intermediate", duration:"5h 30m", lessons:22, students:1450, rating:4.9, tags:["Design","Figma","Brand","UX"],           desc:"Build a design system from scratch in Figma — tokens, components, docs, and handoff. Used to ship at two unicorns.",                                               free:false, accent:"rgba(255,140,180,0.10)", accentBorder:"rgba(255,140,180,0.20)" },
  { id:5, title:"Technical Architecture for Startups",        instructor:"Raj Kapoor",av:"RK", category:"Engineering", level:"Advanced",     duration:"7h 00m", lessons:28, students:980,  rating:4.7, tags:["Engineering","Scaling","AWS","API"],      desc:"Choose the right stack and build infra that won't collapse at 10k users. Battle-tested advice from building Stripe's payment systems.",                           free:false, accent:"rgba(100,200,240,0.10)", accentBorder:"rgba(100,200,240,0.20)" },
  { id:6, title:"Startup Legal Basics: Cap Tables & SAFEs",   instructor:"Lena Park",  av:"LP", category:"Legal",       level:"Beginner",     duration:"2h 50m", lessons:12, students:2100, rating:4.8, tags:["Legal","Equity","Cap Table","Fundraising"],desc:"Everything founders get wrong about equity, SAFEs, and incorporation — explained in plain English by a lawyer who's closed $200M+ in deals.",                   free:true,  accent:"rgba(200,160,255,0.10)", accentBorder:"rgba(200,160,255,0.20)" },
];

export const TEAM = [
  { name:"Kai Nguyen",    role:"Full-stack Dev",   skills:["React","Node","AI/ML"],        av:"KN", avail:"Part-time", exp:"4 yrs", bio:"Built 3 SaaS products from zero. Love turning rough ideas into working prototypes fast.",          openTo:["Co-founder","Side project"]   },
  { name:"Sofia Reyes",   role:"Product Designer", skills:["Figma","UX Research","Brand"], av:"SR", avail:"Full-time", exp:"6 yrs", bio:"Ex-Airbnb designer. Obsessed with onboarding flows and design systems that actually scale.",        openTo:["Co-founder","Lead designer"]   },
  { name:"Omar Hassan",   role:"iOS Developer",    skills:["Swift","SwiftUI","Firebase"],  av:"OH", avail:"Evenings",  exp:"3 yrs", bio:"Shipped 4 apps to the App Store. Passionate about fluid animations and offline-first architecture.",openTo:["Side project","Equity role"]   },
  { name:"Jade Williams", role:"Growth Marketer",  skills:["SEO","Paid Ads","Content"],    av:"JW", avail:"Part-time", exp:"5 yrs", bio:"Scaled a DTC brand from 0 to $2M ARR. Know exactly which growth levers work at each stage.",       openTo:["Co-founder","Fractional CMO"]  },
  { name:"Ravi Patel",    role:"ML Engineer",      skills:["Python","LLMs","PyTorch"],     av:"RP", avail:"Full-time", exp:"5 yrs", bio:"PhD dropout turned builder. Fine-tuned LLMs for 3 startups. Looking for a mission worth shipping.",openTo:["Co-founder","Lead AI role"]    },
  { name:"Emma Clark",    role:"Backend Engineer", skills:["Go","PostgreSQL","AWS"],       av:"EC", avail:"Part-time", exp:"7 yrs", bio:"Infrastructure nerd. Built payment systems processing $50M/yr. Reliable, fast, and very direct.",  openTo:["Side project","Equity role"]   },
];

export const AVAIL_CONF = {
  "Full-time": { bg:"rgba(120,220,120,0.08)", border:"rgba(120,220,120,0.2)",  dot:"rgba(120,220,120,0.8)",  text:"rgba(160,240,160,0.85)" },
  "Part-time": { bg:"rgba(240,200,80,0.07)",  border:"rgba(240,200,80,0.18)",  dot:"rgba(240,200,80,0.75)",  text:"rgba(240,210,100,0.8)"  },
  "Evenings":  { bg:"rgba(140,160,255,0.07)", border:"rgba(140,160,255,0.18)", dot:"rgba(140,160,255,0.75)", text:"rgba(170,185,255,0.8)"  },
};

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */

/** Maps a raw Supabase idea row to the UI shape used by IdeaCard / IdeaDetailModal. */
export function normalizeIdea(row) {
  if (!row) return null;
  const au = row.author || {};
  return {
    ...row,
    desc:     row.description ?? row.desc ?? "",
    author:   au.name     ?? row.author_name ?? "Unknown",
    av:       au.initials ?? (au.name ? au.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "??"),
    feedback: row.feedback_count ?? row.feedback ?? 0,
    matches:  row.match_count    ?? row.matches   ?? 0,
    traction: row.traction ?? "",
    category: row.category ?? "",
    tags:     Array.isArray(row.tags) ? row.tags : [],
  };
}

/* ══════════════════════════════════════════════════════════
   SHARED HOOKS
══════════════════════════════════════════════════════════ */

/** Returns the current inner window width, reactive to resize. */
export function useWindowSize() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    fn();
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

/** Simple toast — returns [message, fireToast]. Message auto-clears after 2.8s. */
export function useToast() {
  const [t, set] = useState(null);
  const fire = useCallback(msg => {
    set(msg);
    setTimeout(() => set(null), 2800);
  }, []);
  return [t, fire];
}

/* ══════════════════════════════════════════════════════════
   PRIMITIVE COMPONENTS
══════════════════════════════════════════════════════════ */

/** Circular/rounded avatar — shows image if src provided, otherwise initials. */
export function Avatar({ src, initials, size = 40 }) {
  if (src) return (
    <img
      src={src} alt="av"
      style={{ width:size, height:size, borderRadius:size*0.28, objectFit:"cover", flexShrink:0, border:"1px solid rgba(255,255,255,0.12)" }}
    />
  );
  return (
    <div style={{
      width:size, height:size, borderRadius:size*0.28, flexShrink:0,
      background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:mono, fontSize:size*0.27, color:"rgba(255,255,255,0.4)",
      letterSpacing:"0.04em", userSelect:"none",
    }}>{initials}</div>
  );
}

/** Small pill tag, optionally removable. */
export function Tag({ label, onRemove }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)",
      borderRadius:20, padding:"3px 10px",
      fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.35)",
      letterSpacing:"0.1em", textTransform:"uppercase",
    }}>
      {label}
      {onRemove && (
        <span onClick={onRemove} style={{ cursor:"pointer", color:"rgba(255,255,255,0.25)", fontSize:11, lineHeight:1, marginLeft:1 }}>×</span>
      )}
    </span>
  );
}

/** Glass card container with optional hover state. */
export function GlassCard({ children, onClick, style = {} }) {
  return (
    <div
      onClick={onClick}
      className={`gc${onClick ? " gcc" : ""}`}
      style={{
        background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)",
        borderRadius:20, position:"relative", overflow:"hidden",
        cursor:onClick ? "pointer" : "default", ...style,
      }}
    >
      <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)", pointerEvents:"none" }}/>
      {children}
    </div>
  );
}

/** Button with four variants: primary | ghost | outline | danger. */
export function Btn({ children, onClick, variant = "primary", full = false, disabled = false, style = {} }) {
  const variants = {
    primary: { background:"rgba(240,240,240,0.93)", color:"#080808" },
    ghost:   { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)" },
    outline: { background:"transparent", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.55)" },
    danger:  { background:"rgba(255,60,60,0.1)", border:"1px solid rgba(255,60,60,0.2)", color:"rgba(255,120,120,0.9)" },
  };
  return (
    <button
      className="lmbtn"
      onClick={onClick}
      disabled={disabled}
      style={{
        border:"none", borderRadius:12, padding:"12px 20px",
        fontFamily:sans, fontSize:13, fontWeight:500,
        cursor:disabled ? "not-allowed" : "pointer",
        letterSpacing:"-0.01em", width:full ? "100%" : "auto",
        opacity:disabled ? 0.4 : 1,
        ...variants[variant], ...style,
      }}
    >{children}</button>
  );
}

/** Labelled text/textarea input field. */
export function FInput({ label, value, onChange, placeholder, type = "text", multiline = false }) {
  const base = {
    width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)",
    borderRadius:12, padding:"11px 14px", fontSize:13, fontFamily:sans,
    color:"#f0f0f0", outline:"none", resize:"none", lineHeight:1.6, boxSizing:"border-box",
  };
  return (
    <div style={{ marginBottom:16 }}>
      {label && (
        <div style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.28)", letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:7 }}>{label}</div>
      )}
      {multiline
        ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base}/>
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base}/>
      }
    </div>
  );
}

/** On/off toggle switch with label. */
export function Toggle({ on, onChange, label, sub }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
      <div>
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.55)" }}>{label}</div>
        {sub && <div style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.2)", marginTop:2 }}>{sub}</div>}
      </div>
      <div
        onClick={() => onChange(!on)}
        style={{
          width:42, height:24, borderRadius:12,
          background:on ? "rgba(240,240,240,0.88)" : "rgba(255,255,255,0.1)",
          border:`1px solid ${on ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)"}`,
          cursor:"pointer", position:"relative", transition:"all 0.25s ease", flexShrink:0,
        }}
      >
        <div style={{
          position:"absolute", top:3, left:on ? 19 : 3,
          width:16, height:16, borderRadius:"50%",
          background:on ? "#080808" : "rgba(255,255,255,0.35)",
          transition:"left 0.25s ease",
        }}/>
      </div>
    </div>
  );
}

/** Bottom-sheet modal with backdrop. Pass onBackdropClick to override close on backdrop. */
export function Sheet({ children, onClose, onBackdropClick, wide = false }) {
  const handleBackdrop = onBackdropClick ?? onClose;
  return (
    <div
      onClick={handleBackdrop}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center", animation:"fadeIn 0.2s ease" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:"100%", maxWidth:wide ? 680 : 540,
          background:"#111113", border:"1px solid rgba(255,255,255,0.1)",
          borderTop:"1px solid rgba(255,255,255,0.12)",
          borderRadius:"28px 28px 0 0", padding:"10px 28px 56px",
          animation:"sheetUp 0.3s ease", maxHeight:"88vh", overflowY:"auto",
        }}
      >
        <div style={{ width:40, height:4, borderRadius:2, background:"rgba(255,255,255,0.12)", margin:"14px auto 24px" }}/>
        {children}
      </div>
    </div>
  );
}

/** Standardised sheet header with title, optional subtitle, close button, and optional action slot. */
export function SheetHeader({ title, sub, onClose, action }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
      <div>
        <div style={{ fontSize:20, fontWeight:600, letterSpacing:"-0.02em" }}>{title}</div>
        {sub && <div style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.22)", marginTop:4 }}>{sub}</div>}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        {action}
        <span
          onClick={onClose}
          style={{ cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", width:30, height:30, borderRadius:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l10 10M11 1L1 11"/>
          </svg>
        </span>
      </div>
    </div>
  );
}

/** Animated search input with clear button. */
export function SearchBar({ value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position:"relative", flex:1, minWidth:240 }}>
      <div style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:focused ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.22)", transition:"color 0.2s", display:"flex" }}>
        <Search size={15}/>
      </div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width:"100%", boxSizing:"border-box",
          background:focused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)",
          border:`1px solid ${focused ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.09)"}`,
          borderRadius:14, padding:"11px 36px 11px 40px",
          fontSize:13, fontFamily:sans, color:"#f0f0f0",
          outline:"none", transition:"all 0.2s",
        }}
      />
      {value && (
        <span
          onMouseDown={e => { e.preventDefault(); onChange(""); }}
          style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", cursor:"pointer", display:"flex", alignItems:"center" }}
        >
          <X size={13} color="rgba(255,255,255,0.4)"/>
        </span>
      )}
    </div>
  );
}

/** Row of selectable filter pills. active pill gets white background. */
export function FilterChips({ options, active, onChange }) {
  return (
    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
      {options.map(f => (
        <button
          key={f}
          onClick={() => onChange(f)}
          style={{
            background:active === f ? "rgba(240,240,240,0.92)" : "rgba(255,255,255,0.04)",
            border:"1px solid", borderColor:active === f ? "transparent" : "rgba(255,255,255,0.08)",
            borderRadius:20, padding:"7px 16px",
            color:active === f ? "#080808" : "rgba(255,255,255,0.3)",
            fontFamily:mono, fontSize:9, letterSpacing:"0.12em",
            textTransform:"uppercase", cursor:"pointer", transition:"all 0.2s",
            flexShrink:0, whiteSpace:"nowrap",
          }}
        >{f}</button>
      ))}
    </div>
  );
}

/** Shown when search/filter yields no results. */
export function EmptyState({ query, onClear }) {
  return (
    <div style={{ textAlign:"center", padding:"60px 20px" }}>
      <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
        <Search size={36} color="rgba(255,255,255,0.15)"/>
      </div>
      <div style={{ fontSize:15, fontWeight:500, marginBottom:6, color:"rgba(255,255,255,0.4)" }}>
        No results{query ? ` for "${query}"` : ""}
      </div>
      <div style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.2)", marginBottom:22, letterSpacing:"0.08em" }}>
        Try different keywords or clear the filters
      </div>
      <button
        onClick={onClear}
        style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 20px", color:"rgba(255,255,255,0.5)", fontFamily:sans, fontSize:12, cursor:"pointer" }}
      >Clear search</button>
    </div>
  );
}