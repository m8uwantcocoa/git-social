-- SQL schema for Git Social application



-- 1. Create table: profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    github_username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT,
    public_repos INTEGER DEFAULT 0,
    total_private_repos INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create table: follows
CREATE TABLE public.follows (
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (follower_id, following_id)
);

-- 3. Create table: events
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    github_username TEXT NOT NULL,
    event_type TEXT NOT NULL,
    repo_name TEXT NOT NULL,
    message TEXT,
    avatar_url TEXT,
    github_event_id TEXT UNIQUE,
    payload JSONB -- Använder JSONB eftersom din payload innehåller JSON-data
);

-- 4. Create table: event_likes
CREATE TABLE public.event_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    github_username TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(event_id, github_username) -- En användare kan bara gilla samma event en gång
);

-- 5. Create table: comments
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    github_username TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- If you want to enable Row Level Security (RLS) for better security, you can do so with the following commands. This will allow you to define policies later to control who can access or modify the data.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Default policies for testing. In production, you should replace these with proper authentication and authorization policies.
CREATE POLICY "Allow public read access on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read access on follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Allow public read access on events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow public read access on event_likes" ON public.event_likes FOR SELECT USING (true);
CREATE POLICY "Allow public read access on comments" ON public.comments FOR SELECT USING (true);