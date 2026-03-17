// src/AppShell.jsx — layout shell for /app/* routes
// URL pattern: domain.com/app/discover | /app/team | /app/courses | /app/profile
import { useState, useEffect } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { supabase } from "./supabase";
import {
  useAuth, useProfile, useMyIdeas, useLikes,
  useBuilders, useNotifications, useIdeas,
} from "./hooks/useSupabase";
import { mono, sans, normalizeIdea, useWindowSize, useToast, Btn } from "./shared";
import Logo from "./Logo";
import PostIdeaSheet from "./components/PostIdeaSheet";
import DiscoverPage   from "./pages/Discover";
import TeamPage       from "./pages/Team";
import CoursesPage    from "./pages/Courses";
import ProfilePage    from "./pages/Profile";
import { Search, Users, Layers, User } from "lucide-react";

const TABS = ["discover", "team", "courses", "profile"];

export default function AppShell() {
  const navigate  = useNavigate();
  const { tab }   = useParams();           // /app/:tab
  const activeTab = TABS.includes(tab) ? tab : "discover";

  // Redirect unknown tabs
  if (tab && !TABS.includes(tab)) return <Navigate to="/app/discover" replace />;

  const w  = useWindowSize();
  const md = w >= 768;
  const lg = w >= 1100;
  const [toast, fireToast] = useToast();
  const [postModal,  setPostModal]  = useState(false);
  const [editProf,   setEditProf]   = useState(false);

  /* ── Auth ── */
  const { user, signOut } = useAuth();

  /* ── Profile ── */
  const { profile:dbProfile, loading:profileLoading, updateProfile } = useProfile(user?.id);
  const profile = {
    name:       dbProfile?.name        || user?.user_metadata?.name || "",
    username:   dbProfile?.username    || (user?.email?.split("@")[0] ?? ""),
    bio:        dbProfile?.bio         || "",
    role:       dbProfile?.role        || "",
    location:   dbProfile?.location    || "",
    avatar:     dbProfile?.avatar_url  || null,
    initials:   dbProfile?.initials    || (dbProfile?.name || user?.user_metadata?.name || "?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),
    skills:     Array.isArray(dbProfile?.skills)      ? dbProfile.skills      : [],
    lookingFor: Array.isArray(dbProfile?.looking_for) ? dbProfile.looking_for : [],
    website:    dbProfile?.website  || "",
    twitter:    dbProfile?.twitter  || "",
    linkedin:   dbProfile?.linkedin || "",
    email:      user?.email || "",
  };

  /* ── My Ideas ── */
  const { ideas:rawMyIdeas, loading:myIdeasLoading, deleteIdea } = useMyIdeas(user?.id);
  const myIdeas = rawMyIdeas.map(normalizeIdea);

  /* ── Ideas (for postIdea) ── */
  const { postIdea } = useIdeas({});

  /* ── Likes ── */
  const { liked } = useLikes(user?.id);

  /* ── Notifications ── */
  const { notifs:dbNotifs, markRead, markAllRead } = useNotifications(user?.id);
  const notifs   = dbNotifs || [];
  const unreadCt = notifs.filter(n=>!n.read).length;

  /* ── Handlers ── */
  const handlePost = async (idea) => {
    if (!user?.id) { fireToast("Please sign in to post an idea"); return; }
    const { error } = await postIdea(idea, user.id);
    if (error) { console.error(error); fireToast("Failed to post — please try again"); }
    else fireToast("🚀 Idea posted!");
  };

  const handleSaveProfile = async (updated) => {
    if (!user?.id) return;
    const initials = (updated.name || "").split(" ").filter(Boolean).map(w=>w[0].toUpperCase()).join("").slice(0,2) || "?";
    const { error } = await updateProfile({
      name: updated.name||null, username:updated.username||null, bio:updated.bio||null,
      role:updated.role||null, location:updated.location||null, avatar_url:updated.avatar||null,
      initials, skills:updated.skills||[], looking_for:updated.lookingFor||[],
      website:updated.website||null, twitter:updated.twitter||null, linkedin:updated.linkedin||null,
    });
    if (error) fireToast("Failed to save — please try again");
    else fireToast("Profile updated ✓");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace:true });
  };

  /* ── Nav items ── */
  const NAV = [
    { key:"discover", label:"Discover", icon:<Search  size={18}/> },
    { key:"team",     label:"Team",     icon:<Users   size={18}/> },
    { key:"courses",  label:"Courses",  icon:<Layers  size={18}/> },
    { key:"profile",  label:"Profile",  icon:<User    size={18}/>, badge:unreadCt },
  ];

  const go = (key) => navigate(`/app/${key}`);

  return (
    <div style={{ fontFamily:sans, background:"#080808", minHeight:"100vh", color:"#f0f0f0", width:"100%" }}>

      {/* ── HEADER ── */}
      <div style={{ position:"sticky", top:0, zIndex:50, width:"100%", background:"rgba(8,8,8,0.93)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth:1400, margin:"0 auto", padding:md?"16px 48px 0":"44px 16px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:14 }}>
            <div style={{ flexShrink:0, cursor:"pointer" }} onClick={()=>go("discover")}>
              <Logo size={28}/>
            </div>
            {md && (
              <div style={{ display:"flex", gap:4 }}>
                {NAV.map(n=>(
                  <button key={n.key} onClick={()=>go(n.key)} style={{ position:"relative", display:"flex", alignItems:"center", gap:7, background:activeTab===n.key?"rgba(255,255,255,0.07)":"transparent", border:"none", borderRadius:10, padding:"9px 16px", color:activeTab===n.key?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.3)", fontFamily:mono, fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer", transition:"all 0.2s" }}>
                    <span style={{ color:activeTab===n.key?"rgba(255,255,255,0.75)":"rgba(255,255,255,0.22)" }}>{n.icon}</span>
                    {n.label}
                    {n.badge>0 && <span style={{ position:"absolute", top:5, right:7, width:7, height:7, borderRadius:"50%", background:"rgba(240,240,240,0.9)" }}/>}
                  </button>
                ))}
              </div>
            )}
            <Btn onClick={()=>setPostModal(true)} variant="primary" style={{ borderRadius:10, padding:"9px 18px", fontSize:13, flexShrink:0 }}>+ Post Idea</Btn>
          </div>
          {/* Mobile tab bar */}
          {!md && (
            <div style={{ display:"flex", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
              {NAV.map(n=>(
                <button key={n.key} onClick={()=>go(n.key)} style={{ flex:1, position:"relative", background:"none", border:"none", borderBottom:activeTab===n.key?"2px solid rgba(255,255,255,0.75)":"2px solid transparent", padding:"11px 0", color:activeTab===n.key?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.25)", fontFamily:mono, fontSize:8, letterSpacing:"0.13em", textTransform:"uppercase", cursor:"pointer", transition:"all 0.2s" }}>
                  {n.label}
                  {n.badge>0 && <span style={{ position:"absolute", top:7, right:"calc(50% - 16px)", width:6, height:6, borderRadius:"50%", background:"rgba(240,240,240,0.9)" }}/>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth:1400, margin:"0 auto", padding:md?"36px 48px 60px":"20px 16px 110px" }}>
        {activeTab === "discover" && (
          <DiscoverPage lg={lg} onOpenPost={()=>setPostModal(true)} toast={fireToast}/>
        )}
        {activeTab === "team" && (
          <TeamPage lg={lg} toast={fireToast}/>
        )}
        {activeTab === "courses" && (
          <CoursesPage lg={lg} md={md} toast={fireToast}/>
        )}
        {activeTab === "profile" && (
          <ProfilePage
            profile={profile}
            profileLoading={profileLoading}
            onEdit={()=>setEditProf(true)}
            myIdeas={myIdeas}
            myIdeasLoading={myIdeasLoading}
            onDeleteIdea={deleteIdea}
            notifs={notifs}
            notifsLoading={!dbNotifs}
            likedCount={Object.keys(liked).length}
            markRead={markRead}
            markAllRead={markAllRead}
            toast={fireToast}
            lg={lg}
            onOpenPost={()=>setPostModal(true)}
            onSignOut={handleSignOut}
            userEmail={user?.email ?? ""}
          />
        )}
      </div>

      {/* ── MODALS ── */}
      {postModal && <PostIdeaSheet onClose={()=>setPostModal(false)} onPost={handlePost} toast={fireToast} userProfile={profile}/>}

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position:"fixed", bottom:md?36:90, left:"50%", transform:"translateX(-50%)", background:"rgba(240,240,240,0.96)", backdropFilter:"blur(12px)", color:"#080808", borderRadius:12, padding:"10px 22px", fontFamily:mono, fontSize:10, letterSpacing:"0.08em", whiteSpace:"nowrap", animation:"toastAnim 2.8s ease forwards", zIndex:400, boxShadow:"0 4px 28px rgba(0,0,0,0.5)" }}>{toast}</div>
      )}

      {/* ── MOBILE BOTTOM NAV ── */}
      {!md && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(8,8,8,0.97)", backdropFilter:"blur(24px)", borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", paddingBottom:20, zIndex:50 }}>
          {NAV.map(n=>(
            <button key={n.key} onClick={()=>go(n.key)} style={{ flex:1, position:"relative", background:"none", border:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:4, cursor:"pointer", padding:"12px 0 0", color:activeTab===n.key?"rgba(255,255,255,0.85)":"rgba(255,255,255,0.2)", transition:"color 0.2s" }}>
              {n.icon}
              {n.badge>0 && <span style={{ position:"absolute", top:9, right:"calc(50% - 13px)", width:7, height:7, borderRadius:"50%", background:"rgba(240,240,240,0.9)" }}/>}
              <span style={{ fontFamily:mono, fontSize:7, letterSpacing:"0.16em", textTransform:"uppercase", color:activeTab===n.key?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.15)", transition:"color 0.2s" }}>{n.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}