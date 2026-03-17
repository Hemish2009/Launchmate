// src/pages/Discover.jsx  →  /app/discover
import { useState } from "react";
import { supabase } from "../supabase";
import { useAuth, useIdeas, useLikes, submitFeedback, useFeedback } from "../hooks/useSupabase";
import {
  mono, sans, SEED_IDEAS, normalizeIdea,
  Avatar, Tag, Btn, SearchBar, FilterChips, EmptyState,
} from "../shared";
import {
  Heart, MessageCircle, Users, TrendingUp,
  CheckCircle2, Info, ChevronDown, Handshake, UserCheck,
} from "lucide-react";

/* ── IdeaCard ── */
const STAGE_CONF = {
  Idea:      { dot:"#555", label:"#666", glow:"rgba(255,255,255,0.03)", pulse:false },
  Validated: { dot:"#8b8", label:"#7a9", glow:"rgba(120,200,120,0.04)", pulse:false },
  Building:  { dot:"#aaa", label:"#bbb", glow:"rgba(255,255,255,0.05)", pulse:true  },
};
function IdeaCard({ idea, i, liked, onLike, onOpen, lg }) {
  const sc = STAGE_CONF[idea.stage] || STAGE_CONF.Idea;
  return (
    <div onClick={()=>onOpen(idea)} className="gcc" style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:22, padding:"22px 22px 18px", cursor:"pointer", position:"relative", overflow:"hidden", animation:`fadeUp 0.4s ease ${i*0.06}s both`, boxShadow:`0 0 40px ${sc.glow}` }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.09),transparent)", pointerEvents:"none" }}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <Avatar initials={idea.av} size={30}/>
          <div>
            <div style={{ fontSize:11, fontWeight:500, color:"rgba(255,255,255,0.5)" }}>{idea.author}</div>
            <div style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.2)", letterSpacing:"0.08em" }}>{idea.category}</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"3px 10px" }}>
            <span style={{ width:5, height:5, borderRadius:"50%", background:sc.dot, display:"inline-block", animation:sc.pulse?"orbP 1.8s ease-in-out infinite":undefined }}/>
            <span style={{ fontFamily:mono, fontSize:7.5, color:sc.label, letterSpacing:"0.14em", textTransform:"uppercase" }}>{idea.stage}</span>
          </div>
          <span onMouseDown={e=>{e.stopPropagation(); onLike(idea.id);}} style={{ cursor:"pointer", color:liked?"rgba(255,160,160,0.9)":"rgba(255,255,255,0.18)", transition:"all 0.18s", userSelect:"none", display:"flex", alignItems:"center" }}>
            <Heart size={15} fill={liked?"rgba(255,160,160,0.9)":"none"} stroke={liked?"rgba(255,160,160,0.9)":"rgba(255,255,255,0.18)"}/>
          </span>
        </div>
      </div>
      <div style={{ fontSize:lg?18:16, fontWeight:600, lineHeight:1.3, marginBottom:8, letterSpacing:"-0.02em", color:"rgba(255,255,255,0.92)" }}>{idea.title}</div>
      <div style={{ fontSize:13, fontWeight:300, color:"rgba(255,255,255,0.36)", lineHeight:1.68, marginBottom:16 }}>{idea.desc}</div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>{(idea.tags||[]).map(t=><Tag key={t} label={t}/>)}</div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display:"flex", gap:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}><MessageCircle size={12} color="rgba(255,255,255,0.25)"/><span style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.28)" }}>{idea.feedback} feedback</span></div>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}><Users size={12} color="rgba(255,255,255,0.25)"/><span style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.28)" }}>{idea.matches} matches</span></div>
        </div>
        {idea.traction && <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.04)", borderRadius:20, padding:"3px 10px", border:"1px solid rgba(255,255,255,0.06)" }}><TrendingUp size={10} color="rgba(255,255,255,0.35)"/><span style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.35)", letterSpacing:"0.06em" }}>{idea.traction}</span></div>}
      </div>
    </div>
  );
}

/* ── FeedbackList ── */
function FeedbackList({ ideaId, currentUserId }) {
  const { feedbacks, loading } = useFeedback(ideaId);
  const timeAgo = ts => { const d=Math.floor((Date.now()-new Date(ts))/1000); if(d<60)return"just now"; if(d<3600)return`${Math.floor(d/60)}m ago`; if(d<86400)return`${Math.floor(d/3600)}h ago`; return`${Math.floor(d/86400)}d ago`; };
  if (loading) return <div style={{ padding:"16px 0" }}>{[0,1].map(i=><div key={i} style={{ display:"flex", gap:12, marginBottom:16, opacity:0.5-i*0.15 }}><div style={{ width:32, height:32, borderRadius:10, background:"rgba(255,255,255,0.05)", flexShrink:0 }}/><div style={{ flex:1 }}><div style={{ height:10, width:"30%", borderRadius:5, background:"rgba(255,255,255,0.05)", marginBottom:8 }}/><div style={{ height:10, width:"80%", borderRadius:5, background:"rgba(255,255,255,0.04)" }}/></div></div>)}</div>;
  if (feedbacks.length === 0) return <div style={{ textAlign:"center", padding:"24px 0" }}><div style={{ display:"flex", justifyContent:"center", marginBottom:10 }}><MessageCircle size={24} color="rgba(255,255,255,0.12)"/></div><div style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.22)", letterSpacing:"0.08em" }}>No feedback yet — be the first</div></div>;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {feedbacks.map(fb => {
        const name=fb.author?.name||"Anonymous"; const initials=fb.author?.initials||name.slice(0,2).toUpperCase(); const isMe=fb.author_id===currentUserId;
        return (
          <div key={fb.id} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
            <Avatar initials={initials} size={32}/>
            <div style={{ flex:1, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"12px 14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ fontSize:12, fontWeight:500, color:"rgba(255,255,255,0.7)" }}>{name}</span>
                  {isMe && <span style={{ fontFamily:mono, fontSize:7.5, color:"rgba(255,255,255,0.3)", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"1px 7px" }}>YOU</span>}
                </div>
                <span style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.2)" }}>{timeAgo(fb.created_at)}</span>
              </div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.55)", lineHeight:1.7 }}>{fb.body}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── IdeaDetailModal ── */
export function IdeaDetailModal({ idea, currentUserId, onClose, toast }) {
  const [view, setView] = useState("detail");
  const [feedbackText, setFeedbackText] = useState("");
  const [connectMsg, setConnectMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const [feedFocused, setFeedFocused] = useState(false);
  const [connFocused, setConnFocused] = useState(false);
  const [showFeedbacks, setShowFeedbacks] = useState(false);
  const isOwnIdea = idea.author_id === currentUserId;
  const feedbacksVisible = isOwnIdea ? true : showFeedbacks;
  const stageDot = { Building:"#aaa", Validated:"rgba(120,200,120,0.85)", Idea:"#555" };

  const handleFeedback = async () => {
    if (!feedbackText.trim()) return;
    setSubmitting(true);
    const { error } = await submitFeedback({ ideaId:idea.id, authorId:currentUserId, body:feedbackText.trim() });
    setSubmitting(false);
    if (error) { toast("Failed to send — please try again"); return; }
    setDone("feedback"); toast("Feedback sent ✓");
  };
  const handleConnect = async () => {
    if (!connectMsg.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("connect_requests").insert({ from_user_id:currentUserId, to_user_id:idea.author_id, message:connectMsg.trim() });
    setSubmitting(false);
    if (error?.code==="23505") { toast("Already sent a connect request"); setDone("connect"); return; }
    if (error) { toast("Failed to send — please try again"); return; }
    setDone("connect"); toast("Connect request sent ✓");
  };
  const inputBase = f => ({ width:"100%", background:f?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.03)", border:`1px solid ${f?"rgba(255,255,255,0.18)":"rgba(255,255,255,0.07)"}`, borderRadius:14, padding:"12px 16px", fontSize:13, fontFamily:sans, color:"rgba(255,255,255,0.88)", outline:"none", resize:"none", lineHeight:1.7, boxSizing:"border-box", transition:"all 0.18s" });

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", animation:"fadeIn 0.2s ease" }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:640, background:"#111113", border:"1px solid rgba(255,255,255,0.1)", borderRadius:28, animation:"sheetUp 0.3s ease", maxHeight:"92vh", overflowY:"auto", position:"relative" }}>
        <div style={{ position:"absolute", top:0, left:"10%", right:"10%", height:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)", pointerEvents:"none" }}/>
        <div style={{ padding:"28px 28px 32px" }}>
          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <Avatar initials={idea.av} size={40}/>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.85)" }}>{idea.author}</div>
                <div style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.25)", letterSpacing:"0.1em", textTransform:"uppercase", marginTop:2 }}>{idea.category||"Founder"}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M1 1l12 12M13 1L1 13"/></svg>
            </button>
          </div>
          {/* Stage + title */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"5px 14px", marginBottom:14 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:stageDot[idea.stage]||"#555", display:"inline-block", animation:idea.stage==="Building"?"orbP 1.8s ease-in-out infinite":undefined }}/>
            <span style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.5)", letterSpacing:"0.16em" }}>{(idea.stage||"Idea").toUpperCase()}</span>
          </div>
          <div style={{ fontSize:24, fontWeight:700, lineHeight:1.25, marginBottom:10, letterSpacing:"-0.025em", color:"rgba(255,255,255,0.95)" }}>{idea.title}</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>{(idea.tags||[]).map(t=><Tag key={t} label={t}/>)}</div>
          <div style={{ fontSize:14, fontWeight:300, color:"rgba(255,255,255,0.48)", lineHeight:1.85, marginBottom:18 }}>{idea.desc||idea.description}</div>
          {(idea.problem||idea.audience)&&<div style={{ display:"grid", gridTemplateColumns:idea.problem&&idea.audience?"1fr 1fr":"1fr", gap:10, marginBottom:18 }}>{idea.problem&&<div style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"14px 16px" }}><div style={{ fontFamily:mono, fontSize:7.5, color:"rgba(255,255,255,0.25)", letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:6 }}>Problem</div><div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", lineHeight:1.7 }}>{idea.problem}</div></div>}{idea.audience&&<div style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"14px 16px" }}><div style={{ fontFamily:mono, fontSize:7.5, color:"rgba(255,255,255,0.25)", letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:6 }}>Audience</div><div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", lineHeight:1.7 }}>{idea.audience}</div></div>}</div>}
          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:22, paddingBottom:22, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            {[[MessageCircle,idea.feedback??0,"Feedback"],[Users,idea.matches??0,"Matches"],[Heart,idea.traction||"—","Traction"]].map(([Ic,val,label])=>(
              <div key={label} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"12px 10px", textAlign:"center" }}>
                <div style={{ display:"flex", justifyContent:"center", marginBottom:5 }}><Ic size={16} color="rgba(255,255,255,0.3)"/></div>
                <div style={{ fontSize:16, fontWeight:600, color:"rgba(255,255,255,0.8)", marginBottom:2 }}>{val}</div>
                <div style={{ fontFamily:mono, fontSize:7.5, color:"rgba(255,255,255,0.22)", letterSpacing:"0.1em", textTransform:"uppercase" }}>{label}</div>
              </div>
            ))}
          </div>
          {/* Feedback section */}
          <div style={{ marginBottom:24 }}>
            <button onClick={()=>setShowFeedbacks(v=>!v)} style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", background:"none", border:"none", cursor:"pointer", padding:0, marginBottom:feedbacksVisible?16:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <MessageCircle size={14} color="rgba(255,255,255,0.4)"/>
                <span style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.4)", letterSpacing:"0.12em", textTransform:"uppercase" }}>Feedback {idea.feedback>0?`· ${idea.feedback}`:""}</span>
                {isOwnIdea&&idea.feedback>0&&<span style={{ background:"rgba(240,240,240,0.9)", color:"#080808", borderRadius:20, padding:"1px 7px", fontFamily:mono, fontSize:8, fontWeight:600 }}>{idea.feedback}</span>}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:5, fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.25)" }}>
                {feedbacksVisible?"Hide":"Show"}
                <ChevronDown size={13} color="rgba(255,255,255,0.25)" style={{ transform:feedbacksVisible?"rotate(180deg)":"rotate(0deg)", transition:"transform 0.2s" }}/>
              </div>
            </button>
            {feedbacksVisible&&<FeedbackList ideaId={idea.id} currentUserId={currentUserId}/>}
          </div>
          <div style={{ height:1, background:"rgba(255,255,255,0.05)", marginBottom:22 }}/>
          {/* Actions */}
          {!isOwnIdea&&(<>
            {view==="detail"&&<div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <button onClick={()=>setView("feedback")} style={{ background:"rgba(240,240,240,0.92)", border:"none", borderRadius:14, padding:"14px", fontSize:14, fontWeight:600, color:"#080808", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><MessageCircle size={16}/>Give Feedback</button>
              <button onClick={()=>setView("connect")} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:14, padding:"14px", fontSize:14, fontWeight:500, color:"rgba(255,255,255,0.7)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><Handshake size={16}/>Offer to Help</button>
            </div>}
            {view==="feedback"&&<div style={{ animation:"fadeUp 0.2s ease" }}>{done==="feedback"?<div style={{ textAlign:"center", padding:"28px 0" }}><div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}><div style={{ width:52, height:52, borderRadius:16, background:"rgba(120,220,120,0.1)", border:"1px solid rgba(120,220,120,0.25)", display:"flex", alignItems:"center", justifyContent:"center" }}><CheckCircle2 size={26} color="rgba(140,220,140,0.9)"/></div></div><div style={{ fontSize:16, fontWeight:600, marginBottom:6 }}>Feedback sent!</div><div style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.3)", marginBottom:20 }}>The founder will be notified</div><button onClick={()=>{setDone(null);setView("detail");setShowFeedbacks(true);}} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"10px 24px", fontSize:13, color:"rgba(255,255,255,0.55)", cursor:"pointer" }}>View Feedbacks</button></div>:<><div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}><button onClick={()=>setView("detail")} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"5px 10px", cursor:"pointer", display:"flex", alignItems:"center", gap:5, color:"rgba(255,255,255,0.4)", fontSize:12 }}><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 1L3 6l5 5"/></svg>Back</button><div style={{ fontSize:15, fontWeight:600, color:"rgba(255,255,255,0.8)" }}>Give Feedback</div></div><textarea rows={5} value={feedbackText} onChange={e=>setFeedbackText(e.target.value)} placeholder="Be specific and constructive…" onFocus={()=>setFeedFocused(true)} onBlur={()=>setFeedFocused(false)} style={inputBase(feedFocused)}/><div style={{ marginTop:4, marginBottom:14 }}><span style={{ fontFamily:mono, fontSize:8, color:feedbackText.length>=20?"rgba(120,200,120,0.6)":"rgba(255,255,255,0.18)" }}>{feedbackText.length} chars {feedbackText.length>=20?"✓":"· min 20"}</span></div><button onClick={handleFeedback} disabled={submitting||feedbackText.trim().length<20} style={{ width:"100%", background:feedbackText.trim().length>=20?"rgba(240,240,240,0.92)":"rgba(255,255,255,0.07)", border:"none", borderRadius:14, padding:"14px", fontSize:14, fontWeight:600, color:feedbackText.trim().length>=20?"#080808":"rgba(255,255,255,0.25)", cursor:feedbackText.trim().length>=20&&!submitting?"pointer":"not-allowed" }}>{submitting?"Sending…":"Send Feedback"}</button></>}</div>}
            {view==="connect"&&<div style={{ animation:"fadeUp 0.2s ease" }}>{done==="connect"?<div style={{ textAlign:"center", padding:"28px 0" }}><div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}><div style={{ width:52, height:52, borderRadius:16, background:"rgba(120,160,255,0.1)", border:"1px solid rgba(120,160,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center" }}><UserCheck size={26} color="rgba(140,170,255,0.9)"/></div></div><div style={{ fontSize:16, fontWeight:600, marginBottom:6 }}>Request sent!</div><button onClick={onClose} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"10px 24px", fontSize:13, color:"rgba(255,255,255,0.55)", cursor:"pointer" }}>Close</button></div>:<><div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}><button onClick={()=>setView("detail")} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"5px 10px", cursor:"pointer", display:"flex", alignItems:"center", gap:5, color:"rgba(255,255,255,0.4)", fontSize:12 }}><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 1L3 6l5 5"/></svg>Back</button><div style={{ fontSize:15, fontWeight:600, color:"rgba(255,255,255,0.8)" }}>Offer to Help</div></div><div style={{ display:"flex", alignItems:"center", gap:12, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"14px 16px", marginBottom:14 }}><Avatar initials={idea.av} size={40}/><div><div style={{ fontSize:14, fontWeight:500, color:"rgba(255,255,255,0.8)", marginBottom:2 }}>{idea.author}</div><div style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.28)" }}>Founder · {idea.title}</div></div></div><textarea rows={5} value={connectMsg} onChange={e=>setConnectMsg(e.target.value)} placeholder="Introduce yourself…" onFocus={()=>setConnFocused(true)} onBlur={()=>setConnFocused(false)} style={inputBase(connFocused)}/><div style={{ marginTop:4, marginBottom:14 }}><span style={{ fontFamily:mono, fontSize:8, color:connectMsg.length>=30?"rgba(120,200,120,0.6)":"rgba(255,255,255,0.18)" }}>{connectMsg.length} chars {connectMsg.length>=30?"✓":"· min 30"}</span></div><button onClick={handleConnect} disabled={submitting||connectMsg.trim().length<30} style={{ width:"100%", background:connectMsg.trim().length>=30?"rgba(240,240,240,0.92)":"rgba(255,255,255,0.07)", border:"none", borderRadius:14, padding:"14px", fontSize:14, fontWeight:600, color:connectMsg.trim().length>=30?"#080808":"rgba(255,255,255,0.25)", cursor:connectMsg.trim().length>=30&&!submitting?"pointer":"not-allowed" }}>{submitting?"Sending…":"Send Connect Request"}</button></>}</div>}
          </>)}
          {isOwnIdea&&<div style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"14px 18px", display:"flex", alignItems:"center", gap:12 }}><Info size={16} color="rgba(255,255,255,0.3)"/><span style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.3)" }}>This is your idea. Others can send you feedback and connect requests.</span></div>}
        </div>
      </div>
    </div>
  );
}

/* ══ DISCOVER PAGE ══ */
export default function DiscoverPage({ lg, onOpenPost, toast }) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modal,  setModal]  = useState(null);

  const { ideas:rawIdeas, loading } = useIdeas({ stage:filter==="All"?null:filter, search });
  const allIdeas = rawIdeas.map(normalizeIdea);
  const filtered = allIdeas.length>0 ? allIdeas : (search||filter!=="All") ? [] : SEED_IDEAS;
  const { liked, toggleLike } = useLikes(user?.id);

  return (
    <div style={{ animation:"fadeUp 0.3s ease" }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:lg?28:22, fontWeight:600, letterSpacing:"-0.03em", marginBottom:4 }}>Discover Ideas</div>
        <div style={{ fontFamily:mono, fontSize:10, color:"rgba(255,255,255,0.22)" }}>{filtered.length} idea{filtered.length!==1?"s":""} · looking for co-founders &amp; builders</div>
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search ideas, tags, authors…"/>
        <FilterChips options={["All","Idea","Validated","Building"]} active={filter} onChange={setFilter}/>
      </div>
      {search&&<div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}><span style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em" }}>RESULTS FOR</span><span style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:"3px 12px", fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.6)" }}>"{search}"</span><span onClick={()=>setSearch("")} style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.25)", cursor:"pointer", textDecoration:"underline" }}>clear</span></div>}
      {loading ? (
        <div style={{ display:"grid", gridTemplateColumns:lg?"repeat(2,1fr)":"1fr", gap:14 }}>
          {[0,1,2,3].map(i=><div key={i} style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:22, padding:"22px", height:200, animation:`fadeIn 0.4s ease ${i*0.07}s both` }}><div style={{ height:10, width:"40%", borderRadius:6, background:"rgba(255,255,255,0.05)", marginBottom:14 }}/><div style={{ height:20, width:"70%", borderRadius:6, background:"rgba(255,255,255,0.05)", marginBottom:10 }}/><div style={{ height:10, width:"90%", borderRadius:6, background:"rgba(255,255,255,0.04)", marginBottom:6 }}/><div style={{ height:10, width:"60%", borderRadius:6, background:"rgba(255,255,255,0.03)" }}/></div>)}
        </div>
      ) : filtered.length===0
        ? <EmptyState query={search||filter} onClear={()=>{setSearch("");setFilter("All");}}/>
        : <div style={{ display:"grid", gridTemplateColumns:lg?"repeat(2,1fr)":"1fr", gap:14 }}>{filtered.map((idea,i)=><IdeaCard key={idea.id} idea={idea} i={i} liked={!!liked[idea.id]} onLike={id=>toggleLike(id)} onOpen={setModal} lg={lg}/>)}</div>
      }
      {filtered.length>0&&<div style={{ marginTop:24, background:"rgba(255,255,255,0.02)", border:"1px dashed rgba(255,255,255,0.07)", borderRadius:20, padding:"28px 24px", textAlign:"center" }}><div style={{ fontSize:15, fontWeight:500, color:"rgba(255,255,255,0.45)", marginBottom:6 }}>Got an idea worth building?</div><div style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.2)", marginBottom:18, letterSpacing:"0.08em" }}>Post it and get feedback from 200+ builders in 24 hrs.</div><Btn variant="primary" onClick={onOpenPost} style={{ borderRadius:12, padding:"11px 24px" }}>+ Post Your Idea</Btn></div>}
      {modal&&<IdeaDetailModal idea={modal} currentUserId={user?.id} onClose={()=>setModal(null)} toast={toast}/>}
    </div>
  );
}