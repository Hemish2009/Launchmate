// src/hooks/useSupabase.js
// All data-fetching and mutation hooks for LaunchMate
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";

/* ══════════════════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════════════════ */
export function useAuth() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    // listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name } },
    });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signUp, signIn, signOut };
}


/* ══════════════════════════════════════════════════════════
   PROFILE
══════════════════════════════════════════════════════════ */
export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateProfile = async (updates) => {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();
    if (!error) setProfile(data);
    return { data, error };
  };

  return { profile, loading, refetch: fetch, updateProfile };
}


/* ══════════════════════════════════════════════════════════
   IDEAS
══════════════════════════════════════════════════════════ */
export function useIdeas({ stage = null, search = "" } = {}) {
  const [ideas,   setIdeas]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("ideas")
      .select("*, author:profiles!ideas_author_id_fkey(id,name,initials,avatar_url)")
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (stage) q = q.eq("stage", stage);
    if (search.trim()) {
      q = q.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await q;
    if (!error) setIdeas(data ?? []);
    setLoading(false);
  }, [stage, search]);

  useEffect(() => { fetch(); }, [fetch]);

  // realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("ideas-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "ideas" }, fetch)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetch]);

  const postIdea = async (idea, authorId) => {
    // 1. Ensure profile row exists (FK guard — trigger may not have run)
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", authorId)
      .single();

    if (!existingProfile) {
      const { data: { user } } = await supabase.auth.getUser();
      const fallbackName = user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
      await supabase.from("profiles").upsert({
        id:       authorId,
        name:     fallbackName,
        initials: fallbackName.slice(0, 2).toUpperCase(),
      }, { onConflict: "id" });
    }

    // 2. Build insert row — map form fields to DB columns exactly
    const row = {
      title:       idea.title    || null,
      description: idea.problem  || idea.description || null,
      problem:     idea.problem  || null,
      audience:    idea.audience || null,
      stage:       idea.stage    || "Idea",
      tags:        Array.isArray(idea.tags) ? idea.tags : [],
      author_id:   authorId,
    };

    console.log("Posting idea row:", row);

    const { data, error } = await supabase
      .from("ideas")
      .insert(row)
      .select("*, author:profiles!ideas_author_id_fkey(id,name,initials,avatar_url)")
      .single();

    if (error) {
      console.error("postIdea error:", JSON.stringify(error));
    } else {
      setIdeas(prev => [data, ...prev]);
    }
    return { data, error };
  };

  const updateIdea = async (id, updates) => {
    const { data, error } = await supabase
      .from("ideas")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (!error) setIdeas(prev => prev.map(i => i.id === id ? data : i));
    return { data, error };
  };

  const archiveIdea = async (id) => {
    return updateIdea(id, { is_archived: true });
  };

  return { ideas, loading, refetch: fetch, postIdea, updateIdea, archiveIdea };
}

export function useMyIdeas(userId) {
  const [ideas,   setIdeas]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("ideas")
      .select("*, author:profiles!ideas_author_id_fkey(id,name,initials,avatar_url)")
      .eq("author_id", userId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });
    if (error) console.error("useMyIdeas fetch error:", error);
    setIdeas(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  // Realtime — re-fetch when user posts/deletes an idea
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("my-ideas-" + userId)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "ideas",
        filter: `author_id=eq.${userId}`,
      }, () => fetch())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [userId, fetch]);

  const deleteIdea = async (id) => {
    const { error } = await supabase
      .from("ideas")
      .delete()
      .eq("id", id)
      .eq("author_id", userId);
    if (!error) setIdeas(prev => prev.filter(i => i.id !== id));
    return { error };
  };

  return { ideas, loading, refetch: fetch, deleteIdea };
}


/* ══════════════════════════════════════════════════════════
   LIKES
══════════════════════════════════════════════════════════ */
export function useLikes(userId) {
  const [liked, setLiked] = useState({});   // { ideaId: true }

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("likes")
      .select("idea_id")
      .eq("user_id", userId)
      .then(({ data }) => {
        const map = {};
        data?.forEach(r => { map[r.idea_id] = true; });
        setLiked(map);
      });
  }, [userId]);

  const toggleLike = async (ideaId) => {
    if (!userId) return;
    if (liked[ideaId]) {
      await supabase.from("likes").delete()
        .eq("user_id", userId).eq("idea_id", ideaId);
      setLiked(prev => { const n = { ...prev }; delete n[ideaId]; return n; });
    } else {
      await supabase.from("likes").insert({ user_id: userId, idea_id: ideaId });
      setLiked(prev => ({ ...prev, [ideaId]: true }));
    }
  };

  return { liked, toggleLike };
}


/* ══════════════════════════════════════════════════════════
   BUILDERS  (Team tab)
══════════════════════════════════════════════════════════ */
export function useBuilders({ availability = null, search = "" } = {}) {
  const [builders, setBuilders] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("builders")
      .select("*, profile:profiles(id,name,initials,avatar_url)")
      .eq("is_visible", true);

    if (availability) q = q.eq("availability", availability);

    const { data, error } = await q;
    if (!error) {
      let list = data ?? [];
      if (search.trim()) {
        const s = search.toLowerCase();
        list = list.filter(b =>
          [b.profile?.name, b.role, b.bio, ...(b.skills||[]), ...(b.open_to||[])]
            .join(" ").toLowerCase().includes(s)
        );
      }
      setBuilders(list);
    }
    setLoading(false);
  }, [availability, search]);

  useEffect(() => { fetch(); }, [fetch]);

  const sendConnectRequest = async (fromId, toId, message = "") => {
    const { data, error } = await supabase
      .from("connect_requests")
      .insert({ from_user_id: fromId, to_user_id: toId, message });
    return { data, error };
  };

  return { builders, loading, refetch: fetch, sendConnectRequest };
}


/* ══════════════════════════════════════════════════════════
   NOTIFICATIONS
══════════════════════════════════════════════════════════ */
export function useNotifications(userId) {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    setNotifs(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  // realtime
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`notifs-${userId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "notifications",
        filter: `user_id=eq.${userId}`,
      }, payload => {
        setNotifs(prev => [payload.new, ...prev]);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [userId]);

  const markRead = async (id) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await supabase.from("notifications")
      .update({ read: true }).eq("user_id", userId).eq("read", false);
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  return { notifs, loading, markRead, markAllRead, refetch: fetch };
}


/* ══════════════════════════════════════════════════════════
   WAITLIST
══════════════════════════════════════════════════════════ */
export async function joinWaitlist({ email, name, referredBy = null }) {
  const { data, error } = await supabase
    .from("waitlist")
    .insert({ email, name, referred_by: referredBy });
  return { data, error };
}


/* ══════════════════════════════════════════════════════════
   FEEDBACK
══════════════════════════════════════════════════════════ */
export async function submitFeedback({ ideaId, authorId, body }) {
  const { data, error } = await supabase
    .from("feedback")
    .insert({ idea_id: ideaId, author_id: authorId, body });
  return { data, error };
}

export function useFeedback(ideaId) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const fetch = useCallback(async () => {
    if (!ideaId) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("feedback")
      .select("*, author:profiles!feedback_author_id_fkey(id,name,initials,avatar_url)")
      .eq("idea_id", ideaId)
      .order("created_at", { ascending: false });
    if (error) console.error("useFeedback error:", error);
    setFeedbacks(data ?? []);
    setLoading(false);
  }, [ideaId]);

  useEffect(() => { fetch(); }, [fetch]);

  // Realtime — new feedback appears instantly
  useEffect(() => {
    if (!ideaId) return;
    const channel = supabase
      .channel("feedback-" + ideaId)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "feedback",
        filter: `idea_id=eq.${ideaId}`,
      }, payload => {
        // Optimistically append — refetch for full author join
        fetch();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [ideaId, fetch]);

  return { feedbacks, loading, refetch: fetch };
}


/* ══════════════════════════════════════════════════════════
   MENTOR SESSIONS
══════════════════════════════════════════════════════════ */
export async function requestMentorSession({ mentorId, studentId, notes = "" }) {
  const { data, error } = await supabase
    .from("mentor_sessions")
    .insert({ mentor_id: mentorId, student_id: studentId, notes });
  return { data, error };
}