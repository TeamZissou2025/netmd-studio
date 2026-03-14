-- ============================================================
-- 00004_waitlist.sql
-- Email waitlist for launch notifications
-- ============================================================

CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (signup from landing page), no auth required
CREATE POLICY "waitlist_insert_anon" ON public.waitlist
  FOR INSERT WITH CHECK (true);

-- Only admins can read the waitlist (privacy)
CREATE POLICY "waitlist_select_admin" ON public.waitlist
  FOR SELECT USING (public.has_role('admin'));
