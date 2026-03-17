// src/components/PostIdeaSheet.jsx
import { useState } from "react";
import { mono, sans, Avatar, Btn, Tag } from "../shared";
import { Bookmark } from "lucide-react";

const DRAFT_KEY = "launchmate_idea_draft";

function PostIdeaSheet({ onClose, onPost, toast, userProfile }) {
  const savedDraft = (() => {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); } catch { return null; }
  })();

  const EMPTY = { title:"", problem:"", audience:"", stage:"Idea", tags:"" };
  const [form,    setForm]    = useState(savedDraft || EMPTY);
  const [confirm, setConfirm] = useState(false);
  const [focused, setFocused] = useState(null);

  const f = k => v => setForm(p => ({ ...p, [k]: v }));
  const valid   = form.title.trim().length > 3 && form.problem.trim().length > 5;
  const isDirty = form.title.trim() || form.problem.trim() || form.audience.trim() || form.tags.trim();

  const tryClose = () => { if (isDirty) setConfirm(true); else onClose(); };

  const saveDraft = () => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch {}
    toast("Draft saved — we'll keep it for you ✓");
    onClose();
  };
  const discard = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    onClose();
  };
  const submit = () => {
    if (!valid) return;
    onPost({ ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) });
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    toast("🚀 Idea posted! You're on your way.");
    onClose();
  };

  const inputStyle = (key) => ({
    width:"100%", background: focused===key ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
    border:`1px solid ${focused===key ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)"}`,
    borderRadius:14, padding:"12px 16px", fontSize:13, fontFamily:sans,
    color:"rgba(255,255,255,0.88)", outline:"none", resize:"none", lineHeight:1.7,
    boxSizing:"border-box", transition:"all 0.18s",
    caretColor:"rgba(255,255,255,0.7)",
  });

  const labelStyle = {
    fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.28)",
    letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:8, display:"block",
  };

  return (
    /* Backdrop — same as idea detail modal */
    <div onClick={tryClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.72)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", animation:"fadeIn 0.2s ease" }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:580, background:"#111113", border:"1px solid rgba(255,255,255,0.1)", borderRadius:28, padding:"28px", animation:"sheetUp 0.3s ease", maxHeight:"92vh", overflowY:"auto", position:"relative" }}>

        {/* top shimmer */}
        <div style={{ position:"absolute", top:0, left:"10%", right:"10%", height:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)", borderRadius:1, pointerEvents:"none" }}/>

        {/* ── Draft restored banner ── */}
        {savedDraft && (
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(240,200,80,0.07)", border:"1px solid rgba(240,200,80,0.18)", borderRadius:10, padding:"8px 14px", marginBottom:20 }}>
            <Bookmark size={12} color="rgba(240,210,100,0.8)"/>
            <span style={{ fontFamily:mono, fontSize:8.5, color:"rgba(240,210,100,0.8)", letterSpacing:"0.06em", flex:1 }}>Draft restored</span>
            <span onClick={discard} style={{ fontFamily:mono, fontSize:8.5, color:"rgba(255,255,255,0.25)", cursor:"pointer", textDecoration:"underline" }}>Discard</span>
          </div>
        )}

        {/* ── Header: avatar + title + X ── */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <Avatar src={userProfile?.avatar} initials={userProfile?.initials || "?"} size={38}/>
            <div>
              <div style={{ fontSize:15, fontWeight:600, letterSpacing:"-0.02em", color:"rgba(255,255,255,0.88)" }}>Share Your Idea</div>
              <div style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.25)", marginTop:2, letterSpacing:"0.08em" }}>get feedback · find your team</div>
            </div>
          </div>
          <button onClick={tryClose} style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13"/>
            </svg>
          </button>
        </div>

        {/* ── Stage pill (above form, like idea modal) ── */}
        <div style={{ display:"flex", gap:8, marginBottom:22 }}>
          {["Idea","Validated","Building"].map(s => {
            const active = form.stage === s;
            const dots = { Idea:"#666", Validated:"#6c6", Building:"#aaa" };
            return (
              <button key={s} onClick={()=>setForm(p=>({...p,stage:s}))} style={{
                display:"inline-flex", alignItems:"center", gap:6,
                background: active ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)",
                border:`1px solid ${active ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.07)"}`,
                borderRadius:20, padding:"6px 14px", cursor:"pointer", transition:"all 0.18s",
              }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:dots[s], display:"inline-block", animation:s==="Building"?"orbP 1.8s ease-in-out infinite":undefined }}/>
                <span style={{ fontFamily:mono, fontSize:8, color: active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)", letterSpacing:"0.14em", textTransform:"uppercase" }}>{s}</span>
              </button>
            );
          })}
        </div>

        {/* ── Divider ── */}
        <div style={{ height:1, background:"rgba(255,255,255,0.05)", marginBottom:22 }}/>

        {/* ── Form fields ── */}
        <div style={{ marginBottom:16 }}>
          <label style={labelStyle}>Idea Title</label>
          <input
            value={form.title}
            onChange={e=>f("title")(e.target.value)}
            placeholder="What's the big idea?"
            onFocus={()=>setFocused("title")}
            onBlur={()=>setFocused(null)}
            style={inputStyle("title")}
          />
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={labelStyle}>The Problem</label>
          <textarea
            rows={3}
            value={form.problem}
            onChange={e=>f("problem")(e.target.value)}
            placeholder="What problem does it solve? Who has this problem?"
            onFocus={()=>setFocused("problem")}
            onBlur={()=>setFocused(null)}
            style={inputStyle("problem")}
          />
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
          <div>
            <label style={labelStyle}>Target Audience</label>
            <input
              value={form.audience}
              onChange={e=>f("audience")(e.target.value)}
              placeholder="Who is your ideal user?"
              onFocus={()=>setFocused("audience")}
              onBlur={()=>setFocused(null)}
              style={inputStyle("audience")}
            />
          </div>
          <div>
            <label style={labelStyle}>Tags (comma separated)</label>
            <input
              value={form.tags}
              onChange={e=>f("tags")(e.target.value)}
              placeholder="AI, Health, Mobile…"
              onFocus={()=>setFocused("tags")}
              onBlur={()=>setFocused(null)}
              style={inputStyle("tags")}
            />
          </div>
        </div>

        {/* ── Progress hint ── */}
        {!valid && isDirty && (
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:16, padding:"8px 14px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:10 }}>
            <AlertCircle size={12} color="rgba(255,255,255,0.25)"/>
            <span style={{ fontFamily:mono, fontSize:8.5, color:"rgba(255,255,255,0.25)", letterSpacing:"0.04em" }}>
              {!form.title.trim() || form.title.trim().length <= 3 ? "Add an idea title (min 4 chars)" : "Add more detail to the problem description"}
            </span>
          </div>
        )}

        {/* ── Action buttons — same grid pattern as idea modal ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:10, marginTop:4 }}>
          <button
            onClick={submit}
            disabled={!valid}
            style={{ background: valid ? "rgba(240,240,240,0.92)" : "rgba(255,255,255,0.08)", border:"none", borderRadius:14, padding:"14px", fontSize:14, fontWeight:600, color: valid ? "#080808" : "rgba(255,255,255,0.25)", cursor: valid ? "pointer" : "not-allowed", transition:"all 0.2s" }}
            onMouseEnter={e=>{ if(valid) e.currentTarget.style.opacity="0.88"; }}
            onMouseLeave={e=>{ e.currentTarget.style.opacity="1"; }}
          >
            Post Idea
          </button>
          <button
            onClick={isDirty ? saveDraft : onClose}
            style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:14, padding:"14px 20px", fontSize:13, fontWeight:400, color:"rgba(255,255,255,0.45)", cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", gap:7, whiteSpace:"nowrap" }}
            onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.07)"; e.currentTarget.style.color="rgba(255,255,255,0.65)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.color="rgba(255,255,255,0.45)"; }}
          >
            <Bookmark size={13}/>{isDirty ? "Save Draft" : "Cancel"}
          </button>
        </div>
      </div>

      {/* ── Guard Dialog (discard / continue / save) ── */}
      {confirm && (
        <div onClick={e=>e.stopPropagation()} style={{ position:"fixed", inset:0, zIndex:400, display:"flex", alignItems:"center", justifyContent:"center", padding:24, background:"rgba(0,0,0,0.55)", animation:"fadeIn 0.15s ease" }}>
          <div style={{ width:"100%", maxWidth:340, background:"#18181b", border:"1px solid rgba(255,255,255,0.1)", borderRadius:24, padding:"28px 24px", animation:"sheetUp 0.2s ease", position:"relative" }}>
            <div style={{ position:"absolute", top:0, left:"15%", right:"15%", height:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)", borderRadius:1 }}/>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
              <div style={{ width:48, height:48, borderRadius:14, background:"rgba(240,200,80,0.1)", border:"1px solid rgba(240,200,80,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Bookmark size={22} color="rgba(240,210,100,0.85)"/>
              </div>
            </div>
            <div style={{ fontSize:17, fontWeight:600, letterSpacing:"-0.02em", textAlign:"center", marginBottom:8 }}>Save your progress?</div>
            <div style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.3)", textAlign:"center", lineHeight:1.8, marginBottom:24, letterSpacing:"0.04em" }}>You have an idea in progress.<br/>What would you like to do?</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <button onClick={saveDraft} style={{ background:"rgba(240,200,80,0.1)", border:"1px solid rgba(240,200,80,0.25)", borderRadius:14, padding:"13px 20px", display:"flex", alignItems:"center", gap:12, cursor:"pointer", transition:"all 0.2s", textAlign:"left" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(240,200,80,0.17)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(240,200,80,0.1)"}>
                <Bookmark size={16} color="rgba(240,210,100,0.85)"/>
                <div><div style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.85)", marginBottom:2 }}>Save Draft</div><div style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.3)", letterSpacing:"0.04em" }}>We'll keep it for next time</div></div>
              </button>
              <button onClick={()=>setConfirm(false)} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:"13px 20px", display:"flex", alignItems:"center", gap:12, cursor:"pointer", transition:"all 0.2s", textAlign:"left" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.09)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}>
                <ArrowRight size={16} color="rgba(255,255,255,0.6)"/>
                <div><div style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.75)", marginBottom:2 }}>Continue Editing</div><div style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.3)", letterSpacing:"0.04em" }}>Go back to your idea</div></div>
              </button>
              <button onClick={discard} style={{ background:"transparent", border:"1px solid rgba(255,60,60,0.15)", borderRadius:14, padding:"13px 20px", display:"flex", alignItems:"center", gap:12, cursor:"pointer", transition:"all 0.2s", textAlign:"left" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,60,60,0.07)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <Trash2 size={16} color="rgba(255,100,100,0.6)"/>
                <div><div style={{ fontSize:13, fontWeight:500, color:"rgba(255,120,120,0.75)", marginBottom:2 }}>Discard</div><div style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.25)", letterSpacing:"0.04em" }}>Remove and close</div></div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export { PostIdeaSheet };
export default PostIdeaSheet;