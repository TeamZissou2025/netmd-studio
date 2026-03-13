-- ============================================================
-- 00003_rls_policies.sql
-- ============================================================

-- ---------- Profiles ----------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view profiles
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING ((SELECT auth.uid()) = id);

-- ---------- Devices ----------
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Anyone can view verified devices
CREATE POLICY "devices_select_verified" ON public.devices
  FOR SELECT USING (verified = TRUE);

-- Authenticated users can submit devices
CREATE POLICY "devices_insert_auth" ON public.devices
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- Submitter can update their unverified submissions
CREATE POLICY "devices_update_own" ON public.devices
  FOR UPDATE USING (
    (SELECT auth.uid()) = submitted_by AND verified = FALSE
  );

-- Admins can do anything with devices
CREATE POLICY "devices_admin_all" ON public.devices
  FOR ALL USING (public.has_role('admin'));

-- ---------- Device Reports ----------
ALTER TABLE public.device_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "device_reports_select_all" ON public.device_reports
  FOR SELECT USING (true);

CREATE POLICY "device_reports_insert_auth" ON public.device_reports
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "device_reports_update_own" ON public.device_reports
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "device_reports_delete_own" ON public.device_reports
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- ---------- Label Designs ----------
ALTER TABLE public.label_designs ENABLE ROW LEVEL SECURITY;

-- Public labels visible to all; private labels visible to owner
CREATE POLICY "labels_select" ON public.label_designs
  FOR SELECT USING (
    is_public = TRUE OR (SELECT auth.uid()) = user_id
  );

-- Users can create their own labels
CREATE POLICY "labels_insert_own" ON public.label_designs
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can update their own labels
CREATE POLICY "labels_update_own" ON public.label_designs
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- Users can delete their own labels
CREATE POLICY "labels_delete_own" ON public.label_designs
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- ---------- Label Templates ----------
ALTER TABLE public.label_templates ENABLE ROW LEVEL SECURITY;

-- Anyone can view active templates
CREATE POLICY "templates_select_active" ON public.label_templates
  FOR SELECT USING (is_active = TRUE);

-- Only admins can manage templates
CREATE POLICY "templates_admin_all" ON public.label_templates
  FOR ALL USING (public.has_role('admin'));

-- ---------- Transfer History ----------
ALTER TABLE public.transfer_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transfers_select_own" ON public.transfer_history
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "transfers_insert_own" ON public.transfer_history
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- ---------- Listings ----------
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Active listings visible to all; sellers see their own drafts
CREATE POLICY "listings_select" ON public.listings
  FOR SELECT USING (
    status = 'active' OR (SELECT auth.uid()) = seller_id
  );

-- Sellers can create listings
CREATE POLICY "listings_insert_seller" ON public.listings
  FOR INSERT WITH CHECK (
    (SELECT auth.uid()) = seller_id
    AND public.has_role('seller')
  );

-- Sellers can update their own listings
CREATE POLICY "listings_update_seller" ON public.listings
  FOR UPDATE USING (
    (SELECT auth.uid()) = seller_id
  );

-- Admins can manage all listings
CREATE POLICY "listings_admin_all" ON public.listings
  FOR ALL USING (public.has_role('admin'));

-- ---------- Favorites ----------
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favorites_select_own" ON public.favorites
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "favorites_insert_own" ON public.favorites
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "favorites_delete_own" ON public.favorites
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- ---------- Orders ----------
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Buyer and seller can view their orders
CREATE POLICY "orders_select_participant" ON public.orders
  FOR SELECT USING (
    (SELECT auth.uid()) IN (buyer_id, seller_id)
  );

-- Authenticated users can create orders (as buyer)
CREATE POLICY "orders_insert_buyer" ON public.orders
  FOR INSERT WITH CHECK (
    (SELECT auth.uid()) = buyer_id
  );

-- Seller can update order status (shipping info)
CREATE POLICY "orders_update_seller" ON public.orders
  FOR UPDATE USING (
    (SELECT auth.uid()) = seller_id
  );

-- ---------- Reviews ----------
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_all" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "reviews_insert_own" ON public.reviews
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = reviewer_id);

-- ---------- Messages ----------
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Participants of the order can view messages
CREATE POLICY "messages_select_participant" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = messages.order_id
      AND (SELECT auth.uid()) IN (orders.buyer_id, orders.seller_id)
    )
  );

-- Participants can send messages
CREATE POLICY "messages_insert_participant" ON public.messages
  FOR INSERT WITH CHECK (
    (SELECT auth.uid()) = sender_id
    AND EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_id
      AND (SELECT auth.uid()) IN (orders.buyer_id, orders.seller_id)
    )
  );

-- ---------- Stripe Events ----------
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- No client access — only service role key via edge functions
CREATE POLICY "stripe_events_deny_all" ON public.stripe_events
  FOR ALL USING (false);

-- ---------- Storage Buckets ----------

-- Public bucket: listing images, device images, label thumbnails
-- Policy: anyone can read, authenticated users upload to their own folder
INSERT INTO storage.buckets (id, name, public) VALUES ('public-assets', 'public-assets', true);

-- Private bucket: label design exports, user uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('private-assets', 'private-assets', false);
