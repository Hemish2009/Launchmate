// src/pages/Profile.jsx  →  /app/profile
import { useState, useRef } from "react";
import { mono, sans, Avatar, Tag, Btn, GlassCard, Sheet, SheetHeader, FInput, Toggle } from "../shared";
import {
  User, Lightbulb, Bookmark, Bell, Gift, Settings2, Briefcase,
  MapPin, Globe, Twitter, ChevronRight, Check, Copy,
  CheckCircle2, LogOut,
} from "lucide-react";
import { useMyIdeas, useNotifications } from "../hooks/useSupabase";

function ProfileEmpty({ onEdit }) {
  return (
    <div style={{ textAlign:"center", padding:"48px 24px", background:"rgba(255,255,255,0.02)", border:"1px dashed rgba(255,255,255,0.08)", borderRadius:20 }}>
      <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}><User size={36} color="rgba(255,255,255,0.15)"/></div>
      <div style={{ fontSize:15, fontWeight:500, color:"rgba(255,255,255,0.4)", marginBottom:6 }}>Your profile is empty</div>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"rgba(255,255,255,0.2)", marginBottom:20, letterSpacing:"0.08em", lineHeight:1.8 }}>Add your name, bio, skills and what you're looking for<br/>so other founders can find and connect with you.</div>
      <Btn variant="primary" onClick={onEdit} style={{ borderRadius:12, padding:"11px 24px" }}>Complete Your Profile</Btn>
    </div>
  );
}

function ProfileTab({ profile, profileLoading, onEdit, myIdeas, myIdeasLoading, onDeleteIdea, notifs, notifsLoading, likedCount, markRead, markAllRead, toast, lg, onOpenPost, onSignOut, userEmail="" }) {
  const [sheet, setSheet] = useState(null);
  const unread = (notifs||[]).filter(n=>!n.read).length;
  const hasProfile = !!(profile.name || profile.bio || profile.role);

  const MENU = [
    { key:"myideas",  label:"My Ideas",       meta:myIdeasLoading ? "loading…" : `${myIdeas.length} posted`,      icon:<Lightbulb size={18} color="rgba(255,255,255,0.5)"/> },
    { key:"saved",    label:"Saved Ideas",     meta:`${likedCount} saved`,                                          icon:<Bookmark  size={18} color="rgba(255,255,255,0.5)"/> },
    { key:"notifs",   label:"Notifications",   meta:notifsLoading ? "loading…" : unread ? `${unread} unread` : "All caught up", icon:<Bell size={18} color="rgba(255,255,255,0.5)"/>, badge:unread },
    { key:"invite",   label:"Invite Friends",  meta:"Earn 1 month free",                                            icon:<Gift      size={18} color="rgba(255,255,255,0.5)"/> },
    { key:"settings", label:"Settings",        meta:"Notifications, privacy, account",                              icon:<Settings2 size={18} color="rgba(255,255,255,0.5)"/> },
  ];

  if (profileLoading) return (
    <div style={{ animation:"fadeUp 0.3s ease" }}>
      <div style={{ display:"grid", gridTemplateColumns:lg?"360px 1fr":"1fr", gap:16 }}>
        {[0,1].map(i=>(
          <div key={i} style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:22, padding:"26px 22px", height:340 }}>
            <div style={{ width:64, height:64, borderRadius:18, background:"rgba(255,255,255,0.05)", marginBottom:16 }}/>
            <div style={{ height:14, width:"55%", borderRadius:6, background:"rgba(255,255,255,0.05)", marginBottom:10 }}/>
            <div style={{ height:10, width:"35%", borderRadius:6, background:"rgba(255,255,255,0.04)", marginBottom:20 }}/>
            <div style={{ height:10, width:"80%", borderRadius:6, background:"rgba(255,255,255,0.04)", marginBottom:8 }}/>
            <div style={{ height:10, width:"60%", borderRadius:6, background:"rgba(255,255,255,0.03)" }}/>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div style={{ animation:"fadeUp 0.3s ease" }}>
        <div style={{ display:"grid", gridTemplateColumns:lg?"360px 1fr":"1fr", gap:16, alignItems:"start" }}>

          {/* ── LEFT: profile card ── */}
          <div>
            <GlassCard style={{ padding:"26px 22px", marginBottom:12 }}>
              {/* Avatar + name */}
              <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:18 }}>
                <div style={{ position:"relative" }}>
                  <Avatar src={profile.avatar} initials={profile.initials || "?"} size={64}/>
                  <div style={{ position:"absolute", bottom:-2, right:-2, width:16, height:16, borderRadius:"50%", background:"rgba(80,220,120,0.9)", border:"2px solid #080808" }}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:18, fontWeight:600, letterSpacing:"-0.02em", marginBottom:2, color: profile.name ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.3)", fontStyle: profile.name ? "normal" : "italic" }}>
                    {profile.name || "No name yet"}
                  </div>
                  <div style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.28)" }}>
                    {profile.username ? `@${profile.username}` : profile.email || ""}
                  </div>
                </div>
              </div>

              {/* Beta badge */}
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"4px 12px", marginBottom:14, fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.32)", letterSpacing:"0.12em" }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:"rgba(255,255,255,0.5)", display:"inline-block", animation:"orbP 2s ease-in-out infinite" }}/>
                BETA MEMBER
              </div>

              {/* Empty profile prompt or bio */}
              {!hasProfile ? (
                <ProfileEmpty onEdit={onEdit}/>
              ) : (
                <>
                  {/* Bio */}
                  {profile.bio ? (
                    <div style={{ fontSize:13, fontWeight:300, color:"rgba(255,255,255,0.4)", lineHeight:1.7, marginBottom:16 }}>{profile.bio}</div>
                  ) : (
                    <div onClick={onEdit} style={{ fontSize:13, color:"rgba(255,255,255,0.2)", fontStyle:"italic", marginBottom:16, cursor:"pointer" }}>Add a bio…</div>
                  )}

                  {/* Meta info */}
                  <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
                    {profile.role     && <div style={{ display:"flex", gap:9, alignItems:"center" }}><Briefcase size={13} color="rgba(255,255,255,0.3)"/><span style={{ fontSize:12, color:"rgba(255,255,255,0.38)" }}>{profile.role}</span></div>}
                    {profile.location && <div style={{ display:"flex", gap:9, alignItems:"center" }}><MapPin    size={13} color="rgba(255,255,255,0.3)"/><span style={{ fontSize:12, color:"rgba(255,255,255,0.38)" }}>{profile.location}</span></div>}
                    {profile.website  && <div style={{ display:"flex", gap:9, alignItems:"center" }}><Globe     size={13} color="rgba(255,255,255,0.3)"/><a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:"rgba(255,255,255,0.35)", textDecoration:"none" }}>{profile.website}</a></div>}
                    {profile.twitter  && <div style={{ display:"flex", gap:9, alignItems:"center" }}><Twitter   size={13} color="rgba(255,255,255,0.3)"/><span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{profile.twitter}</span></div>}
                    {!profile.role && !profile.location && (
                      <div onClick={onEdit} style={{ fontSize:12, color:"rgba(255,255,255,0.2)", fontStyle:"italic", cursor:"pointer" }}>Add role and location…</div>
                    )}
                  </div>

                  {/* Skills */}
                  {profile.skills.length > 0 ? (
                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.2)", letterSpacing:"0.16em", textTransform:"uppercase", marginBottom:8 }}>Skills</div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{profile.skills.map(s=><Tag key={s} label={s}/>)}</div>
                    </div>
                  ) : (
                    <div onClick={onEdit} style={{ fontSize:12, color:"rgba(255,255,255,0.2)", fontStyle:"italic", marginBottom:14, cursor:"pointer" }}>Add your skills…</div>
                  )}

                  {/* Looking For */}
                  {profile.lookingFor.length > 0 && (
                    <div style={{ marginBottom:18 }}>
                      <div style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.2)", letterSpacing:"0.16em", textTransform:"uppercase", marginBottom:8 }}>Looking For</div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{profile.lookingFor.map(s=><Tag key={s} label={s}/>)}</div>
                    </div>
                  )}

                  {/* Stats */}
                  <div style={{ display:"flex", paddingTop:16, borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                    {[[myIdeas.length,"Ideas"],[likedCount,"Saved"],["β","Access"]].map(([v,l],i,a)=>(
                      <div key={l} style={{ flex:1, textAlign:"center", borderRight:i<a.length-1?"1px solid rgba(255,255,255,0.06)":"none" }}>
                        <div style={{ fontSize:20, fontWeight:300 }}>{v}</div>
                        <div style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.2)", marginTop:3, letterSpacing:"0.12em", textTransform:"uppercase" }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Edit button */}
              <div style={{ marginTop:16 }}>
                <Btn variant="ghost" full onClick={onEdit} style={{ borderRadius:12 }}>
                  {hasProfile ? "Edit Profile" : "Set Up Profile"}
                </Btn>
              </div>
            </GlassCard>

            {/* Invite nudge */}
            <GlassCard style={{ padding:"18px 20px", textAlign:"center", border:"1px dashed rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.015)" }}>
              <div style={{ fontSize:14, fontWeight:300, fontStyle:"italic", color:"rgba(255,255,255,0.42)", marginBottom:6 }}>You're in early.</div>
              <div style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.18)", lineHeight:1.9, marginBottom:16, letterSpacing:"0.05em" }}>Invite 5 friends → free premium at launch.<br/>Move up the waitlist.</div>
              <Btn variant="primary" onClick={()=>setSheet("invite")} style={{ borderRadius:10, padding:"10px 20px", display:"inline-flex", alignItems:"center", gap:6 }}><Gift size={14}/>Invite Friends</Btn>
            </GlassCard>
          </div>

          {/* ── RIGHT: menu + idea preview ── */}
          <div>
            <GlassCard style={{ overflow:"hidden", marginBottom:12 }}>
              {MENU.map((item,i,arr)=>(
                <div key={item.key} onClick={()=>setSheet(item.key)} className="gcc"
                  style={{ padding:"15px 20px", borderBottom:i<arr.length-1?"1px solid rgba(255,255,255,0.04)":"none", display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{item.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:400, color:"rgba(255,255,255,0.72)", marginBottom:2 }}>{item.label}</div>
                    <div style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.22)" }}>{item.meta}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    {item.badge>0 && <div style={{ background:"rgba(240,240,240,0.92)", color:"#080808", borderRadius:20, padding:"2px 7px", fontFamily:mono, fontSize:8, fontWeight:600, minWidth:18, textAlign:"center" }}>{item.badge}</div>}
                    <ChevronRight size={15} color="rgba(255,255,255,0.14)"/>
                  </div>
                </div>
              ))}
            </GlassCard>

            {/* Latest idea or empty nudge */}
            {myIdeasLoading ? (
              <div style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:20, padding:"22px", height:120 }}>
                <div style={{ height:12, width:"60%", borderRadius:6, background:"rgba(255,255,255,0.05)", marginBottom:10 }}/>
                <div style={{ height:10, width:"80%", borderRadius:6, background:"rgba(255,255,255,0.04)" }}/>
              </div>
            ) : myIdeas.length > 0 ? (
              <>
                <div style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.18)", letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:10 }}>Latest Idea</div>
                <GlassCard style={{ padding:"18px 20px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                    <div style={{ fontSize:14, fontWeight:500, flex:1, marginRight:12, lineHeight:1.3 }}>{myIdeas[0].title}</div>
                    <span style={{ fontFamily:mono, fontSize:8, color:"rgba(255,255,255,0.28)", textTransform:"uppercase", flexShrink:0 }}>{myIdeas[0].stage}</span>
                  </div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)", lineHeight:1.6, marginBottom:12 }}>{myIdeas[0].desc || myIdeas[0].description || ""}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{(myIdeas[0].tags||[]).map(t=><Tag key={t} label={t}/>)}</div>
                    <Btn variant="ghost" onClick={()=>setSheet("myideas")} style={{ borderRadius:9, padding:"6px 12px", fontSize:10, flexShrink:0, display:"inline-flex", alignItems:"center", gap:4 }}>View all<ChevronRight size={12}/></Btn>
                  </div>
                </GlassCard>
              </>
            ) : (
              <div style={{ background:"rgba(255,255,255,0.02)", border:"1px dashed rgba(255,255,255,0.07)", borderRadius:20, padding:"28px 24px", textAlign:"center" }}>
                <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}><Lightbulb size={28} color="rgba(255,255,255,0.18)"/></div>
                <div style={{ fontSize:14, color:"rgba(255,255,255,0.35)", marginBottom:6 }}>No ideas posted yet</div>
                <div style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.18)", marginBottom:18, letterSpacing:"0.06em" }}>Share your first idea and get feedback from builders</div>
                <Btn variant="primary" onClick={onOpenPost} style={{ borderRadius:10, padding:"10px 20px", fontSize:12 }}>+ Post Your First Idea</Btn>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-sheets */}
      {sheet==="myideas"  && <MyIdeasSheet ideas={myIdeas} onDelete={onDeleteIdea} onClose={()=>setSheet(null)} onOpenPost={()=>{setSheet(null);onOpenPost();}} toast={toast}/>}
      {sheet==="saved"    && <SavedIdeasSheet onClose={()=>setSheet(null)} toast={toast}/>}
      {sheet==="notifs"   && <NotifSheet notifs={notifs} markRead={markRead} markAllRead={markAllRead} onClose={()=>setSheet(null)}/>}
      {sheet==="invite"   && <InviteSheet onClose={()=>setSheet(null)} toast={toast}/>}
      {sheet==="settings" && <SettingsSheet onClose={()=>setSheet(null)} toast={toast} onSignOut={onSignOut} userEmail={userEmail}/>}
    </>
  );
}

/* ══ PROFILE PAGE (wrapper that plugs into AppShell) ══ */
export default function ProfilePage({
  profile, profileLoading, onEdit,
  myIdeas, myIdeasLoading, onDeleteIdea,
  notifs, notifsLoading, likedCount,
  markRead, markAllRead,
  toast, lg, onOpenPost, onSignOut, userEmail,
}) {
  return (
    <ProfileTab
      profile={profile}
      profileLoading={profileLoading}
      onEdit={onEdit}
      myIdeas={myIdeas}
      myIdeasLoading={myIdeasLoading}
      onDeleteIdea={onDeleteIdea}
      notifs={notifs}
      notifsLoading={notifsLoading}
      likedCount={likedCount}
      markRead={markRead}
      markAllRead={markAllRead}
      toast={toast}
      lg={lg}
      onOpenPost={onOpenPost}
      onSignOut={onSignOut}
      userEmail={userEmail}
    />
  );
}