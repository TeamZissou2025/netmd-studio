-- ============================================================
-- 00001_initial_schema.sql
-- NetMD Studio: complete database schema
-- ============================================================

-- ---------- Extensions ----------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ---------- Enums ----------
CREATE TYPE public.user_role AS ENUM ('user', 'seller', 'admin', 'moderator');
CREATE TYPE public.listing_status AS ENUM ('draft', 'active', 'sold', 'archived', 'flagged');
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded', 'disputed');
CREATE TYPE public.listing_category AS ENUM ('portable', 'deck', 'disc_blank', 'disc_prerecorded', 'disc_custom', 'accessory', 'remote', 'cable', 'other');
CREATE TYPE public.listing_condition AS ENUM ('new', 'like_new', 'excellent', 'good', 'fair', 'poor', 'for_parts');
CREATE TYPE public.device_type AS ENUM ('portable_netmd', 'portable_himd', 'portable_standard', 'deck_netmd', 'deck_standard', 'deck_es', 'shelf_system', 'car_unit', 'professional');
CREATE TYPE public.atrac_type AS ENUM ('v1', 'v2', 'v3', 'v3.5', 'v4', 'v4.5', 'type_r', 'type_s');
CREATE TYPE public.label_template_type AS ENUM ('jcard_front', 'jcard_back', 'jcard_full', 'spine', 'disc_label');
CREATE TYPE public.transfer_format AS ENUM ('sp', 'lp2', 'lp4');

-- ---------- Profiles ----------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  role public.user_role NOT NULL DEFAULT 'user',
  stripe_customer_id TEXT,
  stripe_account_id TEXT,
  stripe_onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  seller_rating NUMERIC(3,2),
  seller_review_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_stripe_account ON public.profiles(stripe_account_id) WHERE stripe_account_id IS NOT NULL;
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- ---------- Devices ----------
CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  manufacturer TEXT NOT NULL DEFAULT 'Sony',
  model_number TEXT NOT NULL,
  device_type public.device_type NOT NULL,
  usb_vid TEXT,                          -- hex string, e.g. '054c'
  usb_pid TEXT,                          -- hex string, e.g. '0075'
  year_released INTEGER,
  year_discontinued INTEGER,
  atrac_version public.atrac_type,
  has_mdlp BOOLEAN NOT NULL DEFAULT FALSE,
  has_himd BOOLEAN NOT NULL DEFAULT FALSE,
  has_type_s BOOLEAN NOT NULL DEFAULT FALSE,
  has_optical_in BOOLEAN NOT NULL DEFAULT FALSE,
  has_optical_out BOOLEAN NOT NULL DEFAULT FALSE,
  has_line_in BOOLEAN NOT NULL DEFAULT FALSE,
  has_line_out BOOLEAN NOT NULL DEFAULT FALSE,
  has_mic_in BOOLEAN NOT NULL DEFAULT FALSE,
  has_usb BOOLEAN NOT NULL DEFAULT FALSE,
  has_recording BOOLEAN NOT NULL DEFAULT FALSE,
  usb_speed TEXT,                        -- '1.1' or '2.0'
  transfer_speed TEXT,                   -- e.g. '32x LP4', '64x LP4'
  battery_type TEXT,
  display_type TEXT,
  weight_grams INTEGER,
  image_url TEXT,
  description TEXT,
  notes TEXT,                            -- Community notes
  netmd_js_compatible BOOLEAN NOT NULL DEFAULT FALSE,
  webusb_filter JSONB,                   -- {vendorId, productId} for navigator.usb.requestDevice
  submitted_by UUID REFERENCES public.profiles(id),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Full-text search
  fts TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(manufacturer, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(model_number, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(notes, '')), 'C')
  ) STORED
);

CREATE INDEX idx_devices_type ON public.devices(device_type);
CREATE INDEX idx_devices_manufacturer ON public.devices(manufacturer);
CREATE INDEX idx_devices_usb ON public.devices(usb_vid, usb_pid) WHERE usb_vid IS NOT NULL;
CREATE INDEX idx_devices_netmd ON public.devices(netmd_js_compatible) WHERE netmd_js_compatible = TRUE;
CREATE INDEX idx_devices_fts ON public.devices USING GIN(fts);

-- ---------- Device User Reports ----------
-- Community reports: "I have this device and it works/doesn't work with WebUSB"
CREATE TABLE public.device_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  works_with_webusb BOOLEAN,
  works_with_netmd_js BOOLEAN,
  operating_system TEXT,
  browser TEXT,
  browser_version TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(device_id, user_id)
);

CREATE INDEX idx_device_reports_device ON public.device_reports(device_id);

-- ---------- Labels (Label Studio) ----------
CREATE TABLE public.label_designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  template_type public.label_template_type NOT NULL DEFAULT 'jcard_front',
  canvas_data JSONB NOT NULL,            -- Fabric.js serialized canvas
  thumbnail_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  -- Metadata from Discogs/MusicBrainz
  discogs_release_id INTEGER,
  musicbrainz_release_id TEXT,
  artist_name TEXT,
  album_title TEXT,
  tracklist JSONB,                       -- [{position, title, duration}]
  cover_art_url TEXT,
  tags TEXT[],
  fork_of UUID REFERENCES public.label_designs(id),
  fork_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_labels_user ON public.label_designs(user_id);
CREATE INDEX idx_labels_public ON public.label_designs(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_labels_discogs ON public.label_designs(discogs_release_id) WHERE discogs_release_id IS NOT NULL;
CREATE INDEX idx_labels_musicbrainz ON public.label_designs(musicbrainz_release_id) WHERE musicbrainz_release_id IS NOT NULL;

-- ---------- Label Templates (admin-curated) ----------
CREATE TABLE public.label_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  template_type public.label_template_type NOT NULL,
  canvas_data JSONB NOT NULL,
  thumbnail_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- Transfer History ----------
CREATE TABLE public.transfer_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.devices(id),
  device_name TEXT NOT NULL,
  disc_title TEXT,
  tracks JSONB NOT NULL,                 -- [{title, format, duration_seconds, size_bytes}]
  transfer_format public.transfer_format NOT NULL,
  total_tracks INTEGER NOT NULL,
  total_duration_seconds INTEGER NOT NULL,
  total_bytes BIGINT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  success BOOLEAN
);

CREATE INDEX idx_transfers_user ON public.transfer_history(user_id);

-- ---------- Marketplace: Listings ----------
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category public.listing_category NOT NULL,
  condition public.listing_condition NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  shipping_price_cents INTEGER NOT NULL DEFAULT 0,
  shipping_domestic_only BOOLEAN NOT NULL DEFAULT FALSE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  status public.listing_status NOT NULL DEFAULT 'draft',
  images TEXT[] NOT NULL DEFAULT '{}',   -- Array of storage paths
  -- Optional device linkage
  device_id UUID REFERENCES public.devices(id),
  -- Metadata
  brand TEXT,
  model TEXT,
  tags TEXT[],
  view_count INTEGER NOT NULL DEFAULT 0,
  favorite_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Full-text search
  fts TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(brand, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(model, '')), 'A')
  ) STORED
);

CREATE INDEX idx_listings_seller ON public.listings(seller_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_listings_condition ON public.listings(condition);
CREATE INDEX idx_listings_price ON public.listings(price_cents);
CREATE INDEX idx_listings_created ON public.listings(created_at DESC);
CREATE INDEX idx_listings_fts ON public.listings USING GIN(fts);
CREATE INDEX idx_listings_active ON public.listings(status, created_at DESC)
  WHERE status = 'active';

-- ---------- Marketplace: Favorites ----------
CREATE TABLE public.favorites (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, listing_id)
);

CREATE INDEX idx_favorites_listing ON public.favorites(listing_id);

-- ---------- Marketplace: Orders ----------
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id),
  seller_id UUID NOT NULL REFERENCES public.profiles(id),
  listing_id UUID NOT NULL REFERENCES public.listings(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal_cents INTEGER NOT NULL,
  shipping_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status public.order_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_transfer_id TEXT,
  -- Shipping
  shipping_address JSONB,
  tracking_number TEXT,
  tracking_url TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  -- Messaging
  buyer_notes TEXT,
  seller_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX idx_orders_seller ON public.orders(seller_id);
CREATE INDEX idx_orders_listing ON public.orders(listing_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_stripe_pi ON public.orders(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- ---------- Marketplace: Reviews ----------
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) UNIQUE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_reviewee ON public.reviews(reviewee_id);

-- ---------- Marketplace: Messages ----------
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_order ON public.messages(order_id, created_at);

-- ---------- Stripe Events (idempotency) ----------
CREATE TABLE public.stripe_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- Helper Functions ----------

-- Profile sync trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_devices_updated_at BEFORE UPDATE ON public.devices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_labels_updated_at BEFORE UPDATE ON public.label_designs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_listings_updated_at BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Role check function (used in RLS policies)
CREATE OR REPLACE FUNCTION public.has_role(required_role public.user_role)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = required_role
  );
$$;

-- Platform fee calculation (10% of subtotal)
CREATE OR REPLACE FUNCTION public.calculate_platform_fee(subtotal_cents INTEGER)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT GREATEST(CEIL(subtotal_cents * 0.10)::INTEGER, 50); -- Minimum 50 cents
$$;
