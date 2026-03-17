-- ============================================================
--  LaunchMate — Supabase Schema
--  Run this entire file in: Supabase → SQL Editor → New Query
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";


-- ══════════════════════════════════════════════════════════
--  PROFILES  (extends auth.users 1-to-1)
-- ══════════════════════════════════════════════════════════
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique,
  name          text,
  bio           text,
  role          text,
  location      text,
  website       text,
  twitter       text,
  linkedin      text,
  avatar_url    text,
  initials      text,
  skills        text[]   default '{}',
  looking_for   text[]   default '{}',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, initials)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    upper(left(coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 2))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();


-- ══════════════════════════════════════════════════════════
--  IDEAS
-- ══════════════════════════════════════════════════════════
create table if not exists public.ideas (
  id            uuid primary key default uuid_generate_v4(),
  author_id     uuid references public.profiles(id) on delete cascade,
  title         text not null,
  desc          text,
  problem       text,
  audience      text,
  stage         text check (stage in ('Idea','Validated','Building')) default 'Idea',
  category      text,
  tags          text[]   default '{}',
  traction      text,
  feedback_count int     default 0,
  match_count    int     default 0,
  is_archived   boolean  default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.ideas enable row level security;
create policy "Ideas are viewable by everyone"
  on public.ideas for select using (true);
create policy "Authenticated users can insert ideas"
  on public.ideas for insert with check (auth.uid() = author_id);
create policy "Authors can update their own ideas"
  on public.ideas for update using (auth.uid() = author_id);
create policy "Authors can delete their own ideas"
  on public.ideas for delete using (auth.uid() = author_id);

create trigger ideas_updated_at before update on public.ideas
  for each row execute procedure public.set_updated_at();


-- ══════════════════════════════════════════════════════════
--  FEEDBACK
-- ══════════════════════════════════════════════════════════
create table if not exists public.feedback (
  id          uuid primary key default uuid_generate_v4(),
  idea_id     uuid references public.ideas(id) on delete cascade,
  author_id   uuid references public.profiles(id) on delete cascade,
  body        text not null,
  created_at  timestamptz default now()
);

alter table public.feedback enable row level security;
create policy "Feedback viewable by everyone"
  on public.feedback for select using (true);
create policy "Authenticated users can give feedback"
  on public.feedback for insert with check (auth.role() = 'authenticated');

-- increment feedback_count on ideas
create or replace function public.increment_feedback_count()
returns trigger language plpgsql security definer as $$
begin
  update public.ideas set feedback_count = feedback_count + 1 where id = new.idea_id;
  return new;
end;
$$;
create trigger after_feedback_insert
  after insert on public.feedback
  for each row execute procedure public.increment_feedback_count();


-- ══════════════════════════════════════════════════════════
--  LIKES  (saved ideas)
-- ══════════════════════════════════════════════════════════
create table if not exists public.likes (
  user_id   uuid references public.profiles(id) on delete cascade,
  idea_id   uuid references public.ideas(id)    on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, idea_id)
);

alter table public.likes enable row level security;
create policy "Users can see their own likes"
  on public.likes for select using (auth.uid() = user_id);
create policy "Users can like ideas"
  on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike ideas"
  on public.likes for delete using (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════
--  TEAM / BUILDER PROFILES
-- ══════════════════════════════════════════════════════════
create table if not exists public.builders (
  id          uuid primary key references public.profiles(id) on delete cascade,
  role        text,
  skills      text[]  default '{}',
  availability text check (availability in ('Full-time','Part-time','Evenings')),
  experience  text,
  bio         text,
  open_to     text[]  default '{}',
  is_visible  boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.builders enable row level security;
create policy "Builders are viewable by everyone"
  on public.builders for select using (true);
create policy "Users can manage their own builder profile"
  on public.builders for all using (auth.uid() = id);

create trigger builders_updated_at before update on public.builders
  for each row execute procedure public.set_updated_at();


-- ══════════════════════════════════════════════════════════
--  CONNECT REQUESTS
-- ══════════════════════════════════════════════════════════
create table if not exists public.connect_requests (
  id           uuid primary key default uuid_generate_v4(),
  from_user_id uuid references public.profiles(id) on delete cascade,
  to_user_id   uuid references public.profiles(id) on delete cascade,
  message      text,
  status       text check (status in ('pending','accepted','declined')) default 'pending',
  created_at   timestamptz default now(),
  unique(from_user_id, to_user_id)
);

alter table public.connect_requests enable row level security;
create policy "Users can see their own connect requests"
  on public.connect_requests for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);
create policy "Users can send connect requests"
  on public.connect_requests for insert with check (auth.uid() = from_user_id);
create policy "Recipients can update status"
  on public.connect_requests for update using (auth.uid() = to_user_id);


-- ══════════════════════════════════════════════════════════
--  MENTOR SESSIONS
-- ══════════════════════════════════════════════════════════
create table if not exists public.mentor_sessions (
  id          uuid primary key default uuid_generate_v4(),
  mentor_id   uuid references public.profiles(id) on delete cascade,
  student_id  uuid references public.profiles(id) on delete cascade,
  status      text check (status in ('requested','confirmed','completed','cancelled')) default 'requested',
  notes       text,
  created_at  timestamptz default now()
);

alter table public.mentor_sessions enable row level security;
create policy "Session participants can view their sessions"
  on public.mentor_sessions for select
  using (auth.uid() = mentor_id or auth.uid() = student_id);
create policy "Students can request sessions"
  on public.mentor_sessions for insert with check (auth.uid() = student_id);
create policy "Mentors can update session status"
  on public.mentor_sessions for update using (auth.uid() = mentor_id);


-- ══════════════════════════════════════════════════════════
--  NOTIFICATIONS
-- ══════════════════════════════════════════════════════════
create table if not exists public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id) on delete cascade,
  type        text check (type in ('match','feedback','mentor','system')),
  text        text not null,
  sub         text,
  read        boolean default false,
  created_at  timestamptz default now()
);

alter table public.notifications enable row level security;
create policy "Users can see their own notifications"
  on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update their own notifications"
  on public.notifications for update using (auth.uid() = user_id);
-- system can insert notifications (service role)
create policy "Service role can insert notifications"
  on public.notifications for insert with check (true);


-- ══════════════════════════════════════════════════════════
--  WAITLIST
-- ══════════════════════════════════════════════════════════
create table if not exists public.waitlist (
  id         uuid primary key default uuid_generate_v4(),
  email      text unique not null,
  name       text,
  referred_by uuid references public.profiles(id),
  created_at  timestamptz default now()
);

alter table public.waitlist enable row level security;
create policy "Anyone can join the waitlist"
  on public.waitlist for insert with check (true);
create policy "Users can view their own waitlist entry"
  on public.waitlist for select using (true);


-- ══════════════════════════════════════════════════════════
--  REALTIME  (enable for live updates)
-- ══════════════════════════════════════════════════════════
alter publication supabase_realtime add table public.ideas;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.feedback;

-- ── Done! ───────────────────────────────────────────────────
