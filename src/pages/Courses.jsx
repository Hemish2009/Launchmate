// src/pages/Courses.jsx  →  /app/courses
import { useState } from "react";
import { mono, COURSES, Avatar, Tag, Btn, SearchBar, FilterChips, EmptyState } from "../shared";
import { Star, Layers, Zap, ArrowRight } from "lucide-react";

const LEVEL_CONF = {
  Beginner:     { bg:"rgba(120,200,140,0.08)", border:"rgba(120,200,140,0.2)",  color:"rgba(160,230,170,0.85)" },
  Intermediate: { bg:"rgba(240,200,80,0.07)",  border:"rgba(240,200,80,0.18)",  color:"rgba(240,210,100,0.85)" },
  Advanced:     { bg:"rgba(240,120,100,0.07)", border:"rgba(240,120,100,0.18)", color:"rgba(255,160,140,0.85)" },
};

export default function CoursesPage({ lg, md, toast }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...new Set(COURSES.map(c => c.category))];

  const filtered = COURSES.filter(c => {
    const matchCat = filter === "All" || c.category === filter;
    const q = search.toLowerCase().trim();
    const matchSearch = !q || [c.title, c.instructor, c.category, c.desc, ...(c.tags||[])].join(" ").toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handleEnroll = (course) => toast(`Enrolled in "${course.title}" ✓`);

  return (
    <div style={{ animation:"fadeUp 0.3s ease" }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:lg?28:22, fontWeight:600, letterSpacing:"-0.03em", marginBottom:4 }}>Founder Courses</div>
        <div style={{ fontFamily:mono, fontSize:10, color:"rgba(255,255,255,0.22)" }}>learn from founders who've done it · go from idea to launch</div>
      </div>

      {/* Featured banner */}
      <div style={{ background:"linear-gradient(135deg,rgba(120,200,140,0.08) 0%,rgba(100,160,255,0.08) 100%)", border:"1px solid rgba(120,200,140,0.18)", borderRadius:22, padding:"22px 24px", marginBottom:24, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(120,200,140,0.3),transparent)" }}/>
        <div style={{ flex:1, minWidth:220 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(120,200,140,0.12)", border:"1px solid rgba(120,200,140,0.25)", borderRadius:20, padding:"3px 12px", marginBottom:10, fontFamily:mono, fontSize:8, color:"rgba(160,230,170,0.9)", letterSpacing:"0.14em" }}>
            <Zap size={10} color="rgba(160,230,170,0.9)"/> FREE THIS WEEK
          </div>
          <div style={{ fontSize:lg?20:17, fontWeight:600, letterSpacing:"-0.02em", lineHeight:1.3, marginBottom:6 }}>Zero to One: Validating Your Startup Idea</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.35)", fontWeight:300, marginBottom:12 }}>by David Osei · YC Alum · 18 lessons · 4h 20m</div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              <Star size={12} fill="rgba(240,200,60,0.9)" color="rgba(240,200,60,0.9)"/>
              <span style={{ fontFamily:mono, fontSize:10, color:"rgba(255,255,255,0.65)" }}>4.9</span>
            </div>
            <span style={{ width:3, height:3, borderRadius:"50%", background:"rgba(255,255,255,0.15)", display:"inline-block" }}/>
            <span style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.3)" }}>2,840 enrolled</span>
          </div>
        </div>
        <Btn variant="primary" onClick={()=>handleEnroll(COURSES[0])} style={{ borderRadius:12, padding:"12px 24px", display:"inline-flex", alignItems:"center", gap:8, flexShrink:0 }}>
          Start Free <ArrowRight size={14}/>
        </Btn>
      </div>

      {/* Search + filter */}
      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search courses, topics, instructors…"/>
        <FilterChips options={categories} active={filter} onChange={setFilter}/>
      </div>

      {/* Grid */}
      {filtered.length === 0
        ? <EmptyState query={search||filter} onClear={()=>{setSearch("");setFilter("All");}}/>
        : (
          <div style={{ display:"grid", gridTemplateColumns:lg?"repeat(3,1fr)":md?"repeat(2,1fr)":"1fr", gap:14 }}>
            {filtered.map((c, i) => {
              const lc = LEVEL_CONF[c.level] || LEVEL_CONF.Beginner;
              return (
                <div key={c.id} className="gcc" style={{ background:c.accent??"rgba(255,255,255,0.025)", border:`1px solid ${c.accentBorder??"rgba(255,255,255,0.07)"}`, borderRadius:22, padding:"22px 20px", position:"relative", overflow:"hidden", animation:`fadeUp 0.4s ease ${i*0.07}s both`, display:"flex", flexDirection:"column" }}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.09),transparent)", pointerEvents:"none" }}/>
                  {c.free && <div style={{ position:"absolute", top:16, right:16, background:"rgba(120,200,140,0.15)", border:"1px solid rgba(120,200,140,0.3)", borderRadius:20, padding:"2px 10px", fontFamily:mono, fontSize:7.5, color:"rgba(160,230,170,0.9)", letterSpacing:"0.12em" }}>FREE</div>}
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                    <Avatar initials={c.av} size={36}/>
                    <div>
                      <div style={{ fontSize:12, fontWeight:500, color:"rgba(255,255,255,0.55)" }}>{c.instructor}</div>
                      <div style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.2)", marginTop:2 }}>{c.category}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:15, fontWeight:600, letterSpacing:"-0.015em", lineHeight:1.35, marginBottom:8, flex:1, color:"rgba(255,255,255,0.92)" }}>{c.title}</div>
                  <div style={{ fontSize:12, fontWeight:300, color:"rgba(255,255,255,0.35)", lineHeight:1.65, marginBottom:14 }}>{c.desc}</div>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:14 }}>{(c.tags||[]).map(t=><Tag key={t} label={t}/>)}</div>
                  <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:16, flexWrap:"wrap" }}>
                    <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:lc.bg, border:`1px solid ${lc.border}`, borderRadius:20, padding:"3px 10px" }}>
                      <span style={{ fontFamily:mono, fontSize:8, color:lc.color, letterSpacing:"0.1em" }}>{c.level.toUpperCase()}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}><Layers size={11} color="rgba(255,255,255,0.3)"/><span style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.3)" }}>{c.lessons} lessons</span></div>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}><Zap size={11} color="rgba(255,255,255,0.3)"/><span style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.3)" }}>{c.duration}</span></div>
                  </div>
                  <div style={{ paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <Star size={12} fill="rgba(240,200,60,0.9)" color="rgba(240,200,60,0.9)"/>
                      <span style={{ fontFamily:mono, fontSize:10, color:"rgba(255,255,255,0.65)", fontWeight:500 }}>{c.rating}</span>
                      <span style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.2)" }}>({c.students.toLocaleString()})</span>
                    </div>
                    <Btn variant="primary" onClick={()=>handleEnroll(c)} style={{ borderRadius:10, padding:"9px 18px", fontSize:11, display:"inline-flex", alignItems:"center", gap:6 }}>
                      {c.free?"Start Free":"Enroll"}<ArrowRight size={13}/>
                    </Btn>
                  </div>
                </div>
              );
            })}

            {/* Suggest a course */}
            <div style={{ background:"rgba(255,255,255,0.015)", border:"1px dashed rgba(255,255,255,0.08)", borderRadius:22, padding:"28px 20px", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:220 }}>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}><Layers size={30} color="rgba(255,255,255,0.25)"/></div>
              <div style={{ fontSize:14, fontWeight:400, color:"rgba(255,255,255,0.4)", fontStyle:"italic", marginBottom:6 }}>More courses coming.</div>
              <div style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.18)", lineHeight:1.9, marginBottom:18, letterSpacing:"0.05em" }}>Got something founders need to learn?<br/>Teach it here.</div>
              <Btn variant="outline" onClick={()=>toast("Course submissions opening soon 🚀")} style={{ borderRadius:10, padding:"9px 20px", fontSize:11 }}>Submit a Course</Btn>
            </div>
          </div>
        )
      }
    </div>
  );
}