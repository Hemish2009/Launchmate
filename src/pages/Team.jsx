// src/pages/Team.jsx  →  /app/team
import { useState } from "react";
import { useAuth } from "../hooks/useSupabase";
import { mono, TEAM, AVAIL_CONF, Avatar, Tag, Btn, SearchBar, FilterChips, EmptyState } from "../shared";

export default function TeamPage({ lg, toast }) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const teamFiltered = TEAM.filter(p => {
    const matchAvail = filter === "All" || p.avail === filter;
    const q = search.toLowerCase().trim();
    const matchSearch = !q || [p.name, p.role, p.bio, ...p.skills, ...p.openTo].join(" ").toLowerCase().includes(q);
    return matchAvail && matchSearch;
  });

  return (
    <div style={{ animation:"fadeUp 0.3s ease" }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:lg?28:22, fontWeight:600, letterSpacing:"-0.03em", marginBottom:4 }}>Find Your Team</div>
        <div style={{ fontFamily:mono, fontSize:10, color:"rgba(255,255,255,0.22)" }}>
          {teamFiltered.length} builders · ready to co-found or contribute
        </div>
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, skill, role…"/>
        <FilterChips options={["All","Full-time","Part-time","Evenings"]} active={filter} onChange={setFilter}/>
      </div>

      {search && (
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
          <span style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em" }}>RESULTS FOR</span>
          <span style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:"3px 12px", fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.6)" }}>"{search}"</span>
          <span onClick={()=>setSearch("")} style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.25)", cursor:"pointer", textDecoration:"underline" }}>clear</span>
        </div>
      )}

      {teamFiltered.length === 0
        ? <EmptyState query={search||filter} onClear={()=>{setSearch("");setFilter("All");}}/>
        : (
          <div style={{ display:"grid", gridTemplateColumns:lg?"repeat(2,1fr)":"1fr", gap:14 }}>
            {teamFiltered.map((p, i) => {
              const ac = AVAIL_CONF[p.avail] || AVAIL_CONF["Part-time"];
              return (
                <div key={p.name} className="gcc" style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:22, padding:"22px", position:"relative", overflow:"hidden", animation:`fadeUp 0.4s ease ${i*0.07}s both` }}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)", pointerEvents:"none" }}/>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                    <div style={{ display:"flex", gap:14, alignItems:"center" }}>
                      <div style={{ position:"relative" }}>
                        <Avatar initials={p.av} size={52}/>
                        <div style={{ position:"absolute", bottom:1, right:1, width:12, height:12, borderRadius:"50%", background:ac.dot, border:"2px solid #080808" }}/>
                      </div>
                      <div>
                        <div style={{ fontSize:16, fontWeight:600, letterSpacing:"-0.01em", marginBottom:2 }}>{p.name}</div>
                        <div style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.32)", marginBottom:7 }}>{p.role} · {p.exp}</div>
                        <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:ac.bg, border:`1px solid ${ac.border}`, borderRadius:20, padding:"3px 10px" }}>
                          <span style={{ width:5, height:5, borderRadius:"50%", background:ac.dot, display:"inline-block" }}/>
                          <span style={{ fontFamily:mono, fontSize:8, color:ac.text, letterSpacing:"0.1em" }}>{p.avail.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                    <Btn variant="primary" onClick={()=>toast(`Request sent to ${p.name} ✓`)} style={{ borderRadius:10, padding:"8px 16px", fontSize:11, flexShrink:0 }}>Connect</Btn>
                  </div>
                  <div style={{ fontSize:13, fontWeight:300, color:"rgba(255,255,255,0.38)", lineHeight:1.65, marginBottom:14 }}>{p.bio}</div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>{p.skills.map(s=><Tag key={s} label={s}/>)}</div>
                  <div style={{ paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <span style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.2)", letterSpacing:"0.12em" }}>OPEN TO</span>
                    {p.openTo.map(o=><span key={o} style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"3px 10px", letterSpacing:"0.06em" }}>{o}</span>)}
                  </div>
                </div>
              );
            })}
          </div>
        )
      }

      <div style={{ marginTop:24, background:"rgba(255,255,255,0.02)", border:"1px dashed rgba(255,255,255,0.07)", borderRadius:20, padding:"28px 24px", textAlign:"center" }}>
        <div style={{ fontSize:15, fontWeight:500, color:"rgba(255,255,255,0.45)", marginBottom:6 }}>Are you a builder looking for your next project?</div>
        <div style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.2)", marginBottom:18, letterSpacing:"0.08em" }}>Join 120+ builders and get matched to ideas in your stack.</div>
        <Btn variant="primary" onClick={()=>toast("Builder profile coming soon 🚀")} style={{ borderRadius:12, padding:"11px 24px" }}>Join as a Builder</Btn>
      </div>
    </div>
  );
}