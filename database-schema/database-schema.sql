-- SQL schema for the Git Social application.

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
    payload JSONB
);

-- 4. Create table: event_likes
CREATE TABLE public.event_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    github_username TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(event_id, github_username)
);

-- 5. Create table: comments
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    github_username TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Row Level Security policies define who can read or modify each table.
-- Public data shown in the feed, search, and profile pages.
CREATE POLICY "Profiles are readable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Events are readable by everyone"
ON public.events FOR SELECT
USING (true);

CREATE POLICY "Likes are readable by everyone"
ON public.event_likes FOR SELECT
USING (true);

CREATE POLICY "Comments are readable by everyone"
ON public.comments FOR SELECT
USING (true);

CREATE POLICY "Follows are readable by everyone"
ON public.follows FOR SELECT
USING (true);

-- Users may create and update their own profile row after GitHub sign-in.
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- The current app stores follows in localStorage, but these policies keep the
-- table ready for authenticated database-backed follows.
CREATE POLICY "Users can follow from their own profile"
ON public.follows FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow from their own profile"
ON public.follows FOR DELETE
USING (auth.uid() = follower_id);

-- GitHub events are synchronized by signed-in users or trusted server routes.
CREATE POLICY "Authenticated users can insert events"
ON public.events FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update events"
ON public.events FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Likes and comments must be written as the signed-in user's GitHub username.
CREATE POLICY "Users can like as themselves"
ON public.event_likes FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE profiles.id = auth.uid()
          AND profiles.github_username = event_likes.github_username
    )
);

CREATE POLICY "Users can remove their own likes"
ON public.event_likes FOR DELETE
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE profiles.id = auth.uid()
          AND profiles.github_username = event_likes.github_username
    )
);

CREATE POLICY "Users can comment as themselves"
ON public.comments FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE profiles.id = auth.uid()
          AND profiles.github_username = comments.github_username
    )
);

CREATE POLICY "Users can delete their own comments"
ON public.comments FOR DELETE
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE profiles.id = auth.uid()
          AND profiles.github_username = comments.github_username
    )
);
