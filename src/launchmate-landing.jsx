// src/launchmate-landing.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { supabase } from "./supabase";

const mono = "'DM Mono',monospace";
const sans = "'DM Sans','Helvetica Neue',sans-serif";

function useWindowSize() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn); fn();
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

function StatCounter({ value, label, delay }) {
  const [n, setN] = useState(0);
  const target = parseInt(value.replace(/\D/g, "")) || 0;
  const suffix = value.replace(/[0-9]/g, "");
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let s = 0; const step = target / 50;
        const t = setInterval(() => {
          s += step;
          if (s >= target) { setN(target); clearInterval(t); } else setN(Math.floor(s));
        }, 30);
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return (
    <div ref={ref} style={{ textAlign:"center", animation:`fadeUp 0.6s ease ${delay}s both` }}>
      <div style={{ fontSize:"clamp(32px,4vw,46px)", fontWeight:300, letterSpacing:"-0.04em", color:"#f0f0f0", lineHeight:1 }}>{n}{suffix}</div>
      <div style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.25)", letterSpacing:"0.18em", textTransform:"uppercase", marginTop:8 }}>{label}</div>
    </div>
  );
}

const SCENE_CARDS = [
  { title:"AI Meal Planner",      tag:"Health · AI",  author:"Sarah K.",  xp:3,  yp:8,  z:40, rx:-8, ry:12,  delay:0,   fi:0 },
  { title:"Skills Exchange",      tag:"Community",    author:"Marcus T.", xp:56, yp:3,  z:20, rx:6,  ry:-10, delay:0.8, fi:1 },
  { title:"Accountability Timer", tag:"Productivity", author:"Priya M.",  xp:65, yp:50, z:60, rx:-5, ry:8,   delay:1.4, fi:2 },
  { title:"Gen Z Investing",      tag:"Finance",      author:"Alex R.",   xp:2,  yp:58, z:30, rx:7,  ry:-6,  delay:0.5, fi:0 },
  { title:"Remote Team OS",       tag:"B2B · SaaS",   author:"Jamie L.",  xp:33, yp:72, z:10, rx:-4, ry:9,   delay:1.1, fi:1 },
];
function FloatCard({ c }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position:"absolute", left:`${c.xp}%`, top:`${c.yp}%`, width:190,
        transform:`translateZ(${c.z}px) rotateX(${c.rx}deg) rotateY(${c.ry}deg) scale(${hov?1.06:1})`,
        transition:"transform 0.45s cubic-bezier(0.23,1,0.32,1)",
        animation:`cf${c.fi} ${4.5+c.fi*0.8}s ease-in-out infinite ${c.delay}s`,
        zIndex:Math.round(c.z/10) }}>
      <div style={{ background:hov?"rgba(255,255,255,0.09)":"rgba(255,255,255,0.055)",
        border:`1px solid ${hov?"rgba(255,255,255,0.18)":"rgba(255,255,255,0.09)"}`,
        borderRadius:16, padding:"13px 15px",
        backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
        boxShadow:hov?"0 24px 60px rgba(0,0,0,0.65),inset 0 1px 0 rgba(255,255,255,0.15)":"0 12px 40px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.07)",
        transition:"all 0.4s ease" }}>
        <div style={{ fontFamily:mono, fontSize:8, letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", marginBottom:7 }}>{c.tag}</div>
        <div style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.82)", lineHeight:1.4, marginBottom:10 }}>{c.title}</div>
        <div style={{ display:"flex", alignItems:"center", gap:7, paddingTop:9, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ width:22, height:22, borderRadius:6, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:mono, fontSize:7, color:"rgba(255,255,255,0.35)" }}>{c.author.slice(0,2)}</div>
          <span style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.28)" }}>{c.author}</span>
        </div>
      </div>
    </div>
  );
}
function Scene3D({ mx, my }) {
  return (
    <div style={{ position:"absolute", inset:0, perspective:"900px", perspectiveOrigin:"50% 50%", pointerEvents:"none" }}>
      <div style={{ position:"absolute", inset:0, transformStyle:"preserve-3d",
        transform:`rotateX(${(my-0.5)*7}deg) rotateY(${(mx-0.5)*-7}deg)`,
        transition:"transform 0.12s ease-out" }}>
        {SCENE_CARDS.map((c,i) => <FloatCard key={i} c={c}/>)}
        <div style={{ position:"absolute", bottom:-40, left:"50%", width:900, height:500,
          transform:"translateX(-50%) rotateX(70deg)",
          backgroundImage:"linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px)",
          backgroundSize:"60px 60px",
          maskImage:"radial-gradient(ellipse 70% 80% at 50% 30%,black 30%,transparent 100%)",
          WebkitMaskImage:"radial-gradient(ellipse 70% 80% at 50% 30%,black 30%,transparent 100%)" }} />
        <div style={{ position:"absolute", top:"22%", left:"28%", width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,255,255,0.055) 0%,transparent 70%)", filter:"blur(30px)", animation:"orbP 5s ease-in-out infinite" }} />
        <div style={{ position:"absolute", top:"40%", right:"18%", width:130, height:130, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,255,255,0.035) 0%,transparent 70%)", filter:"blur(20px)", animation:"orbP 7s ease-in-out infinite 1.5s" }} />
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const goAuth = () => navigate("/auth");

  const [mx, setMx] = useState(0.5);
  const [my, setMy] = useState(0.5);
  const [scrollY, setScrollY] = useState(0);
  const [email,       setEmail]       = useState("");
  const [joined,      setJoined]      = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError,   setJoinError]   = useState("");
  const w = useWindowSize();
  const md = w >= 768;
  const lg = w >= 1024;

  useEffect(() => {
    const move = e => { setMx(e.clientX/window.innerWidth); setMy(e.clientY/window.innerHeight); };
    const scroll = () => setScrollY(window.scrollY);
    window.addEventListener("mousemove", move);
    window.addEventListener("scroll", scroll);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("scroll", scroll); };
  }, []);

  const handleJoin = async () => {
    const trimmed = email.trim();
    if (!trimmed.includes("@")) { setJoinError("Please enter a valid email address."); return; }
    setJoinLoading(true);
    setJoinError("");
    const { error } = await supabase.from("waitlist").insert({ email: trimmed });
    setJoinLoading(false);
    if (error && error.code === "23505") {
      // Already on waitlist — treat as success so user isn't confused
      setJoined(true);
    } else if (error) {
      setJoinError("Something went wrong — please try again.");
    } else {
      setJoined(true);
    }
  };
  const sec = { padding: md?"100px 60px":"70px 20px", maxWidth:1200, margin:"0 auto", width:"100%" };

  return (
    <div style={{ fontFamily:sans, background:"#060608", color:"#f0f0f0", width:"100%", overflowX:"hidden" }}>

      {/* ── global keyframes ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap');
        @keyframes heroR  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes badgePop { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
        @keyframes orbP { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes ringP{ 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes cf0  { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)} }
        @keyframes cf1  { 0%,100%{transform:translateY(-8px)} 50%{transform:translateY(8px)} }
        @keyframes cf2  { 0%,100%{transform:translateY(6px)} 50%{transform:translateY(-10px)} }
        @keyframes shineSlide { from{left:-100%} to{left:200%} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .lmbtn { transition:opacity 0.18s ease,transform 0.18s ease !important; }
        .lmbtn:hover { opacity:0.88; transform:translateY(-1px); }
        .lmbtn:active { transform:translateY(0); opacity:1; }
        .ctashine { position:relative; overflow:hidden; }
        .ctashine::after { content:""; position:absolute; top:0; left:-100%; width:60%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent); transform:skewX(-20deg); animation:shineSlide 3.5s ease-in-out infinite 1s; }
        .ghostbtn:hover { background:rgba(255,255,255,0.08) !important; color:rgba(255,255,255,0.75) !important; }
        .navlnk { transition:color 0.2s; }
        .navlnk:hover { color:rgba(255,255,255,0.7) !important; }
        .featcard { transition:border-color 0.25s,background 0.25s,transform 0.25s; }
        .featcard:hover { background:rgba(255,255,255,0.05) !important; border-color:rgba(255,255,255,0.13) !important; transform:translateY(-2px); }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100,
        padding:`0 ${md?"40px":"16px"}`,
        background:scrollY>40?"rgba(6,6,8,0.92)":"transparent",
        backdropFilter:scrollY>40?"blur(24px)":"none",
        WebkitBackdropFilter:scrollY>40?"blur(24px)":"none",
        borderBottom:scrollY>40?"1px solid rgba(255,255,255,0.05)":"none",
        transition:"all 0.4s ease",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        height:64, width:"100%" }}>

        {/* logo — dark glass pill in nav */}
        <Logo size={20} variant="dark" style={{ cursor:"pointer" }} />

        {lg && (
          <div style={{ display:"flex", gap:32, position:"absolute", left:"50%", transform:"translateX(-50%)" }}>
            {[["Features","features"],["How It Works","how-it-works"],["Courses","courses-preview"],["Community","waitlist-cta"]].map(([l,id]) => (
              <span key={l} className="navlnk" onClick={()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth"})}
                style={{ fontSize:13, color:"rgba(255,255,255,0.35)", cursor:"pointer" }}>{l}</span>
            ))}
          </div>
        )}

        <div style={{ display:"flex", gap:10, alignItems:"center", flexShrink:0 }}>
          {md && (
            <button className="lmbtn" onClick={goAuth}
              style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.55)", borderRadius:10, padding:"8px 18px", fontFamily:sans, fontSize:13, fontWeight:500, cursor:"pointer" }}>
              Sign in
            </button>
          )}
          <button className="lmbtn ctashine" onClick={goAuth}
            style={{ background:"rgba(240,240,240,0.93)", color:"#060608", border:"none", borderRadius:10, padding:"8px 18px", fontFamily:sans, fontSize:13, fontWeight:600, cursor:"pointer" }}>
            Join Beta
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:"100vh", width:"100%", position:"relative", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:md?"120px 40px 80px":"110px 20px 80px", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 100% 60% at 50% 0%,rgba(255,255,255,0.04) 0%,transparent 60%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"50%", left:"50%", width:"min(800px,90vw)", height:"min(800px,90vw)", marginLeft:"min(-400px,-45vw)", marginTop:"min(-400px,-45vw)", borderRadius:"50%", border:"1px solid rgba(255,255,255,0.04)", animation:"ringP 6s ease-in-out infinite", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"50%", left:"50%", width:"min(560px,65vw)", height:"min(560px,65vw)", marginLeft:"min(-280px,-32.5vw)", marginTop:"min(-280px,-32.5vw)", borderRadius:"50%", border:"1px solid rgba(255,255,255,0.055)", animation:"ringP 6s ease-in-out infinite 1s", pointerEvents:"none" }} />
        <div style={{ position:"absolute", inset:0, opacity:md?0.75:0.4, pointerEvents:"none" }}><Scene3D mx={mx} my={my}/></div>

        <div style={{ position:"relative", zIndex:10, textAlign:"center", width:"100%", maxWidth:740, padding:"0 16px" }}>
          {/* hero badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:100, padding:"6px 16px", marginBottom:28, animation:"badgePop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#e0e0e0", animation:"orbP 2s ease-in-out infinite" }} />
            <span style={{ fontFamily:mono, fontSize:md?10:8, color:"rgba(255,255,255,0.5)", letterSpacing:"0.14em", textTransform:"uppercase" }}>Now in Beta · 847 builders joined</span>
          </div>

          {/* logo hero mark — light glass pill (the 04 style!) */}
          <div style={{ display:"flex", justifyContent:"center", marginBottom:28, animation:"heroR 0.8s cubic-bezier(0.23,1,0.32,1) 0.05s both" }}>
            <Logo size={md?38:28} variant="dark" />
          </div>

          <h1 style={{ fontSize:"clamp(36px,7vw,80px)", fontWeight:300, lineHeight:1.06, letterSpacing:"-0.04em", marginBottom:22, animation:"heroR 0.8s cubic-bezier(0.23,1,0.32,1) 0.1s both" }}>
            Where great ideas<br/>
            <span style={{ fontWeight:600, background:"linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.55) 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>find their people</span>
          </h1>

          <p style={{ fontSize:md?17:14, fontWeight:300, color:"rgba(255,255,255,0.42)", lineHeight:1.7, maxWidth:500, margin:"0 auto 40px", animation:"heroR 0.8s cubic-bezier(0.23,1,0.32,1) 0.25s both" }}>
            Post your app idea, get structured feedback, find co-founders and builders — built for non-technical dreamers.
          </p>

          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginBottom:32, animation:"heroR 0.8s cubic-bezier(0.23,1,0.32,1) 0.4s both" }}>
            <button className="lmbtn ctashine" onClick={goAuth}
              style={{ background:"#f0f0f0", color:"#060608", border:"none", borderRadius:14, padding:md?"14px 28px":"12px 22px", fontFamily:sans, fontSize:md?15:13, fontWeight:600, cursor:"pointer" }}>
              Request Early Access →
            </button>
            <button className="lmbtn ghostbtn"
              onClick={()=>document.getElementById("how-it-works")?.scrollIntoView({behavior:"smooth"})}
              style={{ background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.55)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:md?"14px 24px":"12px 18px", fontFamily:sans, fontSize:md?15:13, fontWeight:400, cursor:"pointer" }}>
              See How It Works
            </button>
          </div>

          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", animation:"heroR 0.8s cubic-bezier(0.23,1,0.32,1) 0.55s both" }}>
            {[["💡","Post Ideas"],["🤝","Find Co-founders"],["🎓","Expert Mentors"],["🚀","Build Together"]].map(([ic,tx]) => (
              <div key={tx} style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:100, padding:"6px 14px" }}>
                <span style={{ fontSize:12 }}>{ic}</span>
                <span style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.4)", letterSpacing:"0.1em" }}>{tx}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position:"absolute", bottom:28, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:6, animation:"fadeIn 1s ease 1.5s both" }}>
          <div style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.18)", letterSpacing:"0.22em", textTransform:"uppercase" }}>Scroll</div>
          <div style={{ width:1, height:30, background:"linear-gradient(to bottom,rgba(255,255,255,0.18),transparent)" }} />
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding:md?"70px 60px":"60px 20px", borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)", background:"rgba(255,255,255,0.015)", width:"100%" }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"grid", gridTemplateColumns:`repeat(${md?4:2},1fr)`, gap:md?"20px":"40px 20px" }}>
          <StatCounter value="847"  label="Beta Members"  delay={0}   />
          <StatCounter value="320+" label="Ideas Posted"  delay={0.1} />
          <StatCounter value="94+"  label="Teams Matched" delay={0.2} />
          <StatCounter value="38+"  label="Expert Mentors" delay={0.3} />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ ...sec }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <div style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.22)", letterSpacing:"0.22em", textTransform:"uppercase", marginBottom:14 }}>Platform</div>
          <h2 style={{ fontSize:"clamp(26px,4vw,42px)", fontWeight:300, letterSpacing:"-0.03em" }}>Everything to go from idea<br/><span style={{ fontWeight:600 }}>to reality</span></h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:`repeat(${lg?3:md?2:1},1fr)`, gap:12 }}>
          {[
            ["💡","Idea Posting","Share your concept with structured context — problem, audience, stage.",0],
            ["💬","Structured Feedback","Guided prompts that extract actionable insights from experienced builders.",0.07],
            ["🔗","Smart Matching","Surfaces the right builders and designers for your specific idea and stage.",0.14],
            ["🤝","Co-founder Search","Find a technical co-founder who shares your vision. Filter by skills and availability.",0.21],
            ["🎓","Mentor Sessions","Book 1-on-1 time with YC alumni, PMs, and lawyers who've shipped real products.",0.28],
            ["📈","Progress Tracking","Your idea evolves publicly. Show momentum, attract better collaborators over time.",0.35],
          ].map(([ic,ti,de,dl]) => (
            <div key={ti} className="featcard" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"24px 20px", position:"relative", overflow:"hidden", animation:`fadeUp 0.5s ease ${dl}s both` }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)" }} />
              <div style={{ fontSize:24, marginBottom:12 }}>{ic}</div>
              <div style={{ fontSize:15, fontWeight:500, marginBottom:7, letterSpacing:"-0.01em" }}>{ti}</div>
              <div style={{ fontSize:13, fontWeight:300, color:"rgba(255,255,255,0.38)", lineHeight:1.7 }}>{de}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding:md?"100px 60px":"70px 20px", background:"rgba(255,255,255,0.01)", borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)", width:"100%" }}>
        <div style={{ maxWidth:600, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <div style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.22)", letterSpacing:"0.22em", textTransform:"uppercase", marginBottom:14 }}>Process</div>
            <h2 style={{ fontSize:"clamp(26px,4vw,40px)", fontWeight:300, letterSpacing:"-0.03em" }}>Simple. <span style={{ fontWeight:600 }}>Powerful.</span></h2>
          </div>
          {[
            ["01","Post Your Idea","Describe the problem, who it's for, and what stage you're at. No technical knowledge required."],
            ["02","Get Matched","Our platform surfaces builders, designers, and mentors based on your idea's category."],
            ["03","Collaborate & Build","Connect directly, schedule mentor sessions, and track your progress together."],
            ["04","Ship It","With the right team and guidance, turn your idea into a real product."],
          ].map(([n,ti,de],i) => (
            <div key={n} style={{ animation:`fadeUp 0.6s ease ${i*0.1}s both` }}>
              <div style={{ display:"flex", gap:18, alignItems:"flex-start" }}>
                <div style={{ width:38, height:38, borderRadius:11, flexShrink:0, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:mono, fontSize:11, color:"rgba(255,255,255,0.35)", fontWeight:500 }}>{n}</div>
                <div style={{ paddingBottom:i<3?28:0 }}>
                  <div style={{ fontSize:15, fontWeight:500, marginBottom:5, letterSpacing:"-0.01em" }}>{ti}</div>
                  <div style={{ fontSize:13, fontWeight:300, color:"rgba(255,255,255,0.38)", lineHeight:1.7 }}>{de}</div>
                </div>
              </div>
              {i<3 && <div style={{ width:1, height:20, background:"linear-gradient(to bottom,rgba(255,255,255,0.08),transparent)", marginLeft:19, marginBottom:8 }} />}
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ ...sec }}>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <div style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.22)", letterSpacing:"0.22em", textTransform:"uppercase", marginBottom:14 }}>Community</div>
          <h2 style={{ fontSize:"clamp(26px,4vw,40px)", fontWeight:300, letterSpacing:"-0.03em" }}>Heard from <span style={{ fontWeight:600 }}>beta members</span></h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:`repeat(${lg?3:md?2:1},1fr)`, gap:12 }}>
          {[
            ["I had the idea for 2 years but no skills. Within a week I found a dev co-founder and we're already building.","Sarah K.","Founder, MealMind",0],
            ["As a developer looking for interesting projects, this is exactly what was missing. Idea quality here is high.","Kai N.","Full-stack Dev",0.1],
            ["The mentor session with a YC founder was worth more than 3 months of self-research. Changed my direction.","Alex R.","Idea Stage Founder",0.2],
          ].map(([q,n,r,d]) => (
            <div key={n} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"22px", position:"relative", overflow:"hidden", animation:`fadeUp 0.6s ease ${d}s both` }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.09),transparent)" }} />
              <div style={{ fontSize:26, color:"rgba(255,255,255,0.1)", fontFamily:"Georgia,serif", lineHeight:1, marginBottom:10 }}>"</div>
              <div style={{ fontSize:13, fontWeight:300, color:"rgba(255,255,255,0.52)", lineHeight:1.75, marginBottom:18 }}>{q}</div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:30, height:30, borderRadius:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.35)" }}>{n.slice(0,2)}</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:500 }}>{n}</div>
                  <div style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.25)" }}>{r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WAITLIST CTA ── */}
      <section id="waitlist-cta" style={{ padding:md?"120px 60px":"80px 20px", textAlign:"center", position:"relative", overflow:"hidden", borderTop:"1px solid rgba(255,255,255,0.05)", width:"100%" }}>
        <div style={{ position:"absolute", top:"50%", left:"50%", width:600, height:400, background:"radial-gradient(ellipse,rgba(255,255,255,0.04) 0%,transparent 70%)", transform:"translate(-50%,-50%)", pointerEvents:"none" }} />
        <div style={{ position:"relative", zIndex:2, maxWidth:520, margin:"0 auto" }}>
          <div style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.22)", letterSpacing:"0.22em", textTransform:"uppercase", marginBottom:18 }}>Early Access</div>
          <h2 style={{ fontSize:"clamp(28px,5vw,48px)", fontWeight:300, letterSpacing:"-0.04em", marginBottom:14 }}>Your idea deserves<br/><span style={{ fontWeight:600 }}>a real shot.</span></h2>
          <p style={{ fontSize:15, fontWeight:300, color:"rgba(255,255,255,0.38)", lineHeight:1.7, maxWidth:380, margin:"0 auto 40px" }}>
            Join 847+ early members. Free beta access, premium features at launch.
          </p>
          {joined ? (
            <div style={{ display:"inline-flex", alignItems:"center", gap:10, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.14)", borderRadius:14, padding:"16px 28px", animation:"badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>
              <span style={{ fontSize:18 }}>🎉</span>
              <span style={{ fontFamily:mono, fontSize:11, color:"rgba(255,255,255,0.7)", letterSpacing:"0.1em" }}>You're in! We'll be in touch.</span>
            </div>
          ) : (
            <div>
              <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (joinError) setJoinError(""); }}
                  onKeyDown={e => e.key === "Enter" && !joinLoading && handleJoin()}
                  disabled={joinLoading}
                  style={{
                    padding:"13px 18px", borderRadius:12, fontSize:14, fontFamily:sans,
                    width:md?260:"100%", maxWidth:"100%",
                    background: joinError ? "rgba(255,80,80,0.07)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${joinError ? "rgba(255,100,100,0.35)" : "rgba(255,255,255,0.1)"}`,
                    color:"#f0f0f0", outline:"none", opacity: joinLoading ? 0.6 : 1,
                    transition:"border-color 0.2s, background 0.2s",
                  }}
                />
                <button
                  className="lmbtn ctashine"
                  onClick={handleJoin}
                  disabled={joinLoading}
                  style={{
                    background: joinLoading ? "rgba(220,220,220,0.7)" : "#f0f0f0",
                    color:"#060608", border:"none", borderRadius:12,
                    padding:"13px 22px", fontFamily:sans, fontSize:14, fontWeight:500,
                    cursor: joinLoading ? "not-allowed" : "pointer", flexShrink:0,
                    minWidth:148, display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8,
                    transition:"background 0.2s",
                  }}
                >
                  {joinLoading ? (
                    <>
                      <span style={{ width:14, height:14, borderRadius:"50%", border:"2px solid rgba(0,0,0,0.15)", borderTop:"2px solid #060608", display:"inline-block", animation:"spin 0.7s linear infinite" }}/>
                      Joining…
                    </>
                  ) : "Get Early Access"}
                </button>
              </div>
              {joinError && (
                <div style={{ fontFamily:mono, fontSize:9, color:"rgba(255,110,110,0.85)", marginTop:10, letterSpacing:"0.06em" }}>
                  {joinError}
                </div>
              )}
            </div>
          )}
          <div style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.18)", marginTop:16, letterSpacing:"0.1em" }}>No credit card · Invite-only beta · Free at launch</div>
          <div style={{ marginTop:28 }}>
            <span onClick={goAuth} style={{ fontFamily:mono, fontSize:10, color:"rgba(255,255,255,0.28)", letterSpacing:"0.12em", cursor:"pointer", textDecoration:"underline", textUnderlineOffset:3 }}>
              Already have access? Sign in →
            </span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding:md?"36px 60px":"28px 20px", borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16, width:"100%" }}>
        <Logo size={18} variant="dark" />
        <div style={{ display:"flex", gap:24 }}>
          {["Privacy","Terms","Contact"].map(l => (
            <span key={l} className="navlnk" style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.2)", letterSpacing:"0.14em", textTransform:"uppercase", cursor:"pointer" }}>{l}</span>
          ))}
        </div>
        <div style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.15)" }}>© 2026 Launchmate</div>
      </footer>

    </div>
  );
}