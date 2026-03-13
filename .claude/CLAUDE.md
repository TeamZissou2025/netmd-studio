# CLAUDE.md — NetMD Studio

> **This is the single source of truth for the NetMD Studio project.**
> Claude Code: read this file in full before executing any task. Every architectural decision, schema definition, design token, API contract, and definition of done is specified here. Do not deviate. Do not improvise. If something is ambiguous, stop and ask — do not guess.

---

## Table of Contents

1. [Project Identity](#1-project-identity)
2. [Technology Stack](#2-technology-stack)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Design System](#4-design-system)
5. [Supabase Schema](#5-supabase-schema)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Pillar 1 — Label Studio](#7-pillar-1--label-studio)
8. [Pillar 2 — Transfer Studio](#8-pillar-2--transfer-studio)
9. [Pillar 3 — Device Library](#9-pillar-3--device-library)
10. [Pillar 4 — Marketplace](#10-pillar-4--marketplace)
11. [Stripe Connect Integration](#11-stripe-connect-integration)
12. [API Routes & Edge Functions](#12-api-routes--edge-functions)
13. [Environment Variables](#13-environment-variables)
14. [Git Conventions](#14-git-conventions)
15. [Testing Strategy](#15-testing-strategy)
16. [Deployment](#16-deployment)
17. [Build Sequence](#17-build-sequence)

---

## 1. Project Identity

| Key | Value |
|---|---|
| **Name** | NetMD Studio |
| **Domain** | `netmd.studio` |
| **Tagline** | The all-in-one MiniDisc platform |
| **Repository** | `github.com/TeamZissou2025/netmd-studio` |
| **License** | Proprietary (source-available TBD) |
| **Owner** | Squircle Labs (DJ) |

### Four Pillars

1. **Label Studio** — J-card and spine label designer with Discogs/MusicBrainz metadata integration. Evolves from the existing MiniDisc Cover Designer.
2. **Transfer Studio** — WebUSB + netmd-js + ATRAC WASM client-side audio transfer to Net MD / Hi-MD devices.
3. **Device Library** — Community-maintained compatibility database for Net MD portables, Hi-MD devices, and standalone MD decks.
4. **Marketplace** — Buy/sell MiniDiscs, decks, and accessories with Stripe Connect Express payments.

---

## 2. Technology Stack

### Core

| Layer | Technology | Version / Notes |
|---|---|---|
| **Framework** | React | 19.x |
| **Build** | Vite | 6.x |
| **Language** | TypeScript | 5.x, strict mode |
| **Styling** | Tailwind CSS | 4.x |
| **Monorepo** | Turborepo | Latest |
| **Package Manager** | pnpm | 9.x, workspace protocol |
| **Backend** | Supabase | Hosted (postgres, auth, storage, edge functions, realtime) |
| **Payments** | Stripe Connect Express | Destination charges |
| **Hosting** | Vercel | Per-app projects from monorepo |
| **CI/CD** | GitHub Actions | Lint, typecheck, test, deploy |
| **Dev Tool** | Claude Code | Autonomous via this CLAUDE.md |

### Key Libraries

| Library | Purpose | Package |
|---|---|---|
| `netmd-js` | Net MD USB protocol | `netmd-js@^4.4` |
| `@ffmpeg/ffmpeg` | Audio decode (WASM) | `@ffmpeg/ffmpeg@^0.12` |
| `atracdenc` | ATRAC encode (WASM, vendored) | `packages/atrac-wasm/` |
| `@supabase/supabase-js` | Supabase client | `@supabase/supabase-js@^2` |
| `stripe` | Stripe server SDK | `stripe@^17` |
| `@stripe/stripe-js` | Stripe client SDK | `@stripe/stripe-js@^4` |
| `react-router` | Routing | `react-router@^7` |
| `zustand` | State management | `zustand@^5` |
| `@tanstack/react-query` | Server state / caching | `@tanstack/react-query@^5` |
| `fabric` | Canvas rendering (Label Studio) | `fabric@^6` |
| `react-hot-toast` | Toast notifications | `react-hot-toast@^2` |
| `zod` | Schema validation | `zod@^3` |
| `lucide-react` | Icons | `lucide-react@^0.400` |

### WASM Dependencies (vendored in `packages/atrac-wasm/`)

The ATRAC encoding pipeline uses pre-built Emscripten WASM binaries from the atracdenc project. These are vendored (not npm-installed) because they require custom Emscripten compilation. The `packages/atrac-wasm/` package wraps them with TypeScript bindings and Web Worker management.

**Do not attempt to compile atracdenc from source.** Use the pre-built WASM binaries from the Web MiniDisc Pro project (`asivery/webminidisc`, `extra/` directory) as the starting point, then wrap with our own TypeScript interface.

---

## 3. Monorepo Structure

```
netmd-studio/
├── apps/
│   └── web/                          # Main application (all four pillars)
│       ├── src/
│       │   ├── app/                  # App shell, providers, router
│       │   ├── features/
│       │   │   ├── label-studio/     # Pillar 1
│       │   │   ├── transfer-studio/  # Pillar 2
│       │   │   ├── device-library/   # Pillar 3
│       │   │   ├── marketplace/      # Pillar 4
│       │   │   ├── auth/             # Auth flows
│       │   │   └── dashboard/        # User dashboard
│       │   ├── hooks/                # App-level hooks
│       │   ├── lib/                  # App-level utilities
│       │   └── styles/               # Global styles, Tailwind entry
│       ├── public/
│       │   └── wasm/                 # FFmpeg + atracdenc WASM binaries
│       ├── api/                      # Vercel API routes (serverless functions)
│       │   ├── webhooks/
│       │   │   └── stripe.ts         # Stripe webhook handler
│       │   ├── discogs/
│       │   │   └── search.ts         # Discogs proxy (hides API keys)
│       │   ├── musicbrainz/
│       │   │   └── search.ts         # MusicBrainz proxy (rate limit management)
│       │   └── stripe/
│       │       ├── create-checkout.ts
│       │       ├── create-account-link.ts
│       │       └── create-login-link.ts
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   ├── ui/                           # @netmd-studio/ui
│   │   ├── src/
│   │   │   ├── components/           # Shared React components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Tabs.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Slider.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── Skeleton.tsx
│   │   │   │   ├── DropdownMenu.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── types/                        # @netmd-studio/types
│   │   ├── src/
│   │   │   ├── database.ts           # Generated Supabase types
│   │   │   ├── device.ts             # Device interfaces
│   │   │   ├── label.ts              # Label/template types
│   │   │   ├── transfer.ts           # Transfer/audio types
│   │   │   ├── marketplace.ts        # Listing/order types
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── utils/                        # @netmd-studio/utils
│   │   ├── src/
│   │   │   ├── supabase.ts           # Supabase client factory
│   │   │   ├── format.ts             # Formatting helpers
│   │   │   ├── validation.ts         # Zod schemas
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── netmd/                        # @netmd-studio/netmd
│   │   ├── src/
│   │   │   ├── devices.ts            # Device ID registry (VID/PID table)
│   │   │   ├── connection.ts         # WebUSB connection manager
│   │   │   ├── commands.ts           # High-level command wrappers
│   │   │   ├── worker.ts             # Transfer Web Worker
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── atrac-wasm/                   # @netmd-studio/atrac-wasm
│   │   ├── src/
│   │   │   ├── encoder.ts            # ATRAC encoding wrapper
│   │   │   ├── decoder.ts            # FFmpeg decoding wrapper
│   │   │   ├── worker.ts             # Audio processing Web Worker
│   │   │   └── index.ts
│   │   ├── wasm/                     # Vendored WASM binaries
│   │   │   ├── atracdenc.wasm
│   │   │   ├── atracdenc.js
│   │   │   ├── ffmpeg-core.wasm
│   │   │   └── ffmpeg-core.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── tailwind-config/              # @netmd-studio/tailwind-config
│   │   ├── tailwind.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── typescript-config/            # @netmd-studio/typescript-config
│   │   ├── base.json
│   │   ├── react-app.json
│   │   └── react-library.json
│   └── eslint-config/               # @netmd-studio/eslint-config
│       ├── base.js
│       ├── react.js
│       └── package.json
├── supabase/
│   ├── migrations/                   # Numbered SQL migrations
│   │   └── 00001_initial_schema.sql
│   ├── functions/                    # Supabase Edge Functions (Deno)
│   │   └── stripe-webhook/
│   │       └── index.ts
│   ├── seed.sql                      # Seed data (device library)
│   └── config.toml
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── .env.example
├── .gitignore
├── CLAUDE.md                         # ← You are here
└── README.md
```

### pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### Root package.json scripts

```json
{
  "name": "netmd-studio",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "check-types": "turbo check-types",
    "test": "turbo test",
    "db:generate": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > packages/types/src/database.ts",
    "db:migrate": "supabase db push",
    "db:reset": "supabase db reset",
    "clean": "turbo clean && rm -rf node_modules"
  },
  "packageManager": "pnpm@9.15.0"
}
```

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "env": [
        "VITE_SUPABASE_URL",
        "VITE_SUPABASE_ANON_KEY",
        "VITE_STRIPE_PUBLIC_KEY",
        "VITE_APP_URL"
      ]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "check-types": {
      "dependsOn": ["^check-types"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### Package dependency graph

```
apps/web
  ├── @netmd-studio/ui
  ├── @netmd-studio/types
  ├── @netmd-studio/utils
  ├── @netmd-studio/netmd
  ├── @netmd-studio/atrac-wasm
  └── @netmd-studio/tailwind-config

packages/ui
  ├── @netmd-studio/types
  └── @netmd-studio/tailwind-config

packages/netmd
  └── @netmd-studio/types

packages/atrac-wasm
  └── @netmd-studio/types

packages/utils
  └── @netmd-studio/types
```

---

## 4. Design System

### Philosophy

Dark studio software aesthetic. Think Ableton Live meets a high-end audio equipment interface. Dense, information-rich, zero-waste layout. Every pixel earns its place.

### Color Tokens

Define these in `packages/tailwind-config/tailwind.config.ts` and use exclusively via Tailwind classes. Never use raw hex values in components.

```typescript
// packages/tailwind-config/tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: [
    '../../apps/*/src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces
        'studio-black': '#0a0a0b',        // App background
        'studio-surface': '#141417',       // Card/panel background
        'studio-surface-hover': '#1a1a1f', // Interactive surface hover
        'studio-surface-active': '#222228',// Active/selected surface
        'studio-border': '#2a2a32',        // Subtle borders
        'studio-border-bright': '#3a3a44', // Emphasized borders

        // Text
        'studio-text': '#e8e8ec',          // Primary text
        'studio-text-muted': '#8888a0',    // Secondary/muted text
        'studio-text-dim': '#555568',      // Tertiary/disabled text

        // Accent — Electric Cyan
        'studio-cyan': '#00d4ff',          // Primary accent
        'studio-cyan-hover': '#00bfe6',    // Accent hover
        'studio-cyan-muted': '#00d4ff1a',  // Accent at 10% opacity (backgrounds)
        'studio-cyan-border': '#00d4ff33', // Accent at 20% opacity (borders)

        // Secondary — Magenta
        'studio-magenta': '#ff0066',       // Secondary accent
        'studio-magenta-hover': '#e6005c', // Secondary hover
        'studio-magenta-muted': '#ff00661a',

        // Status
        'studio-success': '#00cc88',
        'studio-warning': '#ffaa00',
        'studio-error': '#ff3344',

        // Pillar identity colors (used for nav indicators, badges)
        'pillar-label': '#00d4ff',         // Cyan (matches primary accent)
        'pillar-transfer': '#ff0066',      // Magenta
        'pillar-device': '#ffaa00',        // Amber
        'pillar-market': '#00cc88',        // Green
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        // Compact scale for dense UI
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],  // 10px
        'xs': ['0.6875rem', { lineHeight: '1rem' }],      // 11px
        'sm': ['0.75rem', { lineHeight: '1.125rem' }],    // 12px
        'base': ['0.8125rem', { lineHeight: '1.25rem' }], // 13px
        'md': ['0.875rem', { lineHeight: '1.375rem' }],   // 14px
        'lg': ['1rem', { lineHeight: '1.5rem' }],         // 16px
        'xl': ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],        // 24px
        '3xl': ['2rem', { lineHeight: '2.5rem' }],        // 32px
      },
      borderRadius: {
        'studio': '6px',
        'studio-lg': '8px',
        'studio-xl': '12px',
      },
      boxShadow: {
        'studio': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'studio-lg': '0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)',
        'studio-glow-cyan': '0 0 20px rgba(0,212,255,0.15)',
        'studio-glow-magenta': '0 0 20px rgba(255,0,102,0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### Typography Rules

- **UI chrome** (buttons, labels, nav): `font-sans text-sm font-medium`
- **Body text** (descriptions, paragraphs): `font-sans text-base text-studio-text-muted`
- **Technical readouts** (device info, track times, file sizes, transfer speeds): `font-mono text-sm`
- **Headings**: `font-sans font-semibold` — use `text-lg` for section heads, `text-2xl` for page titles
- **Code/data**: `font-mono text-xs` — always cyan for emphasis: `text-studio-cyan`
- **Never use font weights below 400 or above 700.**

### Component Patterns

All shared components live in `packages/ui/`. They accept a `className` prop for composition. They use `cva` (class-variance-authority) or simple conditional classnames — **do not install a separate CSS-in-JS library**.

**Button variants**: `primary` (cyan bg), `secondary` (surface bg, cyan border), `danger` (magenta), `ghost` (transparent). All buttons: `h-8 px-3 text-sm rounded-studio font-medium transition-colors duration-150`.

**Card pattern**: `bg-studio-surface border border-studio-border rounded-studio-lg p-4`. Hover: add `hover:border-studio-border-bright`. Active/selected: `border-studio-cyan-border bg-studio-cyan-muted`.

**Input pattern**: `h-8 bg-studio-black border border-studio-border rounded-studio px-3 text-sm text-studio-text placeholder:text-studio-text-dim focus:border-studio-cyan focus:ring-1 focus:ring-studio-cyan-border outline-none`.

**Modal**: Fixed overlay `bg-black/60 backdrop-blur-sm`, centered card `bg-studio-surface border border-studio-border rounded-studio-xl shadow-studio-lg max-w-lg w-full`.

### Layout Rules

- **App shell**: Fixed sidebar (240px) + header (48px) + scrollable main content.
- **Sidebar**: `bg-studio-black border-r border-studio-border`. Pillar nav items with colored left-border indicators.
- **Header**: `h-12 bg-studio-surface border-b border-studio-border`. Contains breadcrumb, search, user menu.
- **Content area**: `p-6 bg-studio-black`. Use `max-w-7xl mx-auto` for centered content.
- **Grid**: Use CSS Grid (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`) for card layouts. Never use flexbox for grids of cards.
- **Responsive**: Mobile-first. Sidebar collapses to bottom tab bar on `< md`. All pillar views must be fully functional on mobile.

### Iconography

Use `lucide-react` exclusively. Size: `16px` for inline, `20px` for buttons, `24px` for empty states. Color: `text-studio-text-muted` default, `text-studio-cyan` for active/accent. **Never use emoji as icons in the UI.**

---

## 5. Supabase Schema

### CRITICAL: Migration file naming

All SQL lives in `supabase/migrations/`. Files are numbered sequentially: `00001_initial_schema.sql`, `00002_seed_devices.sql`, etc. **Never modify a migration that has been applied.** Create a new migration for changes.

### Complete Schema SQL

```sql
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
```

---

## 6. Authentication & Authorization

### Auth Configuration

- **Providers**: Email/password, Google OAuth, Magic Link
- **Email templates**: Custom branded templates in Supabase dashboard
- **Redirect URLs**: `https://netmd.studio/auth/callback`, `http://localhost:5173/auth/callback`
- **Session duration**: 1 hour access token, 7 day refresh token

### Supabase Auth Client Setup

```typescript
// packages/utils/src/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@netmd-studio/types';

export function createSupabaseClient() {
  return createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  );
}

// Server-side (API routes, edge functions)
export function createSupabaseAdmin() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
```

### RLS Policies

**Performance rule**: ALWAYS wrap `auth.uid()` in a SELECT subquery: `(SELECT auth.uid())`. This caches the value via Postgres initPlan instead of evaluating per-row.

```sql
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
```

### Supabase Storage Buckets

```sql
-- Public bucket: listing images, device images, label thumbnails
-- Policy: anyone can read, authenticated users upload to their own folder
INSERT INTO storage.buckets (id, name, public) VALUES ('public-assets', 'public-assets', true);

-- Private bucket: label design exports, user uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('private-assets', 'private-assets', false);
```

Storage policies (set in Supabase dashboard or via SQL):

- `public-assets` SELECT: allow all
- `public-assets` INSERT: `auth.uid()::text = (storage.foldername(name))[1]` (users upload to `{uid}/` prefix)
- `private-assets` SELECT: `auth.uid()::text = (storage.foldername(name))[1]`
- `private-assets` INSERT: `auth.uid()::text = (storage.foldername(name))[1]`

---

## 7. Pillar 1 — Label Studio

### Overview

A canvas-based J-card and spine label designer. Users search for an album via Discogs or MusicBrainz, auto-populate metadata and cover art, then customize the design on a template. Export to print-ready PDF.

### Feature Spec

#### 7.1 Template System

- **Template types**: `jcard_front` (front cover, 65mm × 104mm), `jcard_back` (back with tracklist, folds), `jcard_full` (front + back + spine as one print layout), `spine` (6.7mm × 104mm), `disc_label` (round, 64mm diameter)
- **Admin-curated templates** stored in `label_templates` table with Fabric.js canvas JSON
- **User starts** by choosing a template type, then optionally searching for an album to auto-populate
- **Canvas engine**: Fabric.js v6 — renders text, images, shapes, and custom clipPaths
- **Undo/redo**: Maintain a canvas state stack (max 50 states)

#### 7.2 Metadata Search

- **Search flow**: User types artist/album → client calls `/api/musicbrainz/search` → results displayed in dropdown → user selects → fetch release details + cover art from CAA → auto-populate title, artist, tracklist, cover image on canvas
- **Discogs fallback**: If MusicBrainz yields no results, search `/api/discogs/search` → same population flow
- **Tracklist auto-layout**: When tracklist is populated, auto-generate text objects on the back panel with track position, title, and duration formatted as `MM:SS`
- **Cover art**: Fetched via Cover Art Archive (no CORS issues, no auth needed). Image placed as background of front panel at template resolution.

#### 7.3 Canvas Tools

- **Text**: Add/edit text with font selection (Inter, JetBrains Mono, plus 4-6 additional display fonts loaded from Google Fonts). Control size, weight, color, alignment, letter-spacing, line-height.
- **Images**: Upload custom images, drag-and-drop positioning, crop via clipPath, opacity control
- **Shapes**: Rectangle, circle, line — filled or stroked, with color picker
- **Background**: Solid color, gradient, or image fill
- **Layers panel**: Reorder objects, toggle visibility, lock layers
- **Snap-to-grid**: Optional 1mm grid overlay with magnetic snapping
- **Print bleed**: Toggle 3mm bleed indicator on all edges

#### 7.4 Export

- **PDF export**: Using `jsPDF` + canvas rasterization at 300 DPI. Include crop marks if bleed is enabled.
- **PNG export**: High-resolution raster at 300 DPI
- **Save to account**: Serialize Fabric.js canvas to JSON, store in `label_designs.canvas_data`, generate thumbnail via canvas `toDataURL` at 400px width, upload to `public-assets/{uid}/labels/`
- **Share**: Public designs get a shareable URL `/labels/{id}`. Fork button creates a copy under the forking user's account.

#### 7.5 Community Gallery

- Route: `/labels/gallery`
- Grid of public label designs with thumbnail, title, artist, creator
- Filter by template type, sort by newest / most forked / most downloaded
- Click to preview (read-only canvas render), fork, or download

### Definition of Done — Label Studio

- [ ] Template selection screen with all 5 types rendering correctly at actual print dimensions
- [ ] MusicBrainz search returning results with cover art populated on canvas
- [ ] Discogs fallback search working when MusicBrainz returns no results
- [ ] All canvas tools functional: text, image, shapes, background, layers
- [ ] Undo/redo working (keyboard shortcuts: Cmd+Z / Cmd+Shift+Z)
- [ ] PDF export at 300 DPI with correct physical dimensions (verify by measuring printed output)
- [ ] PNG export at 300 DPI
- [ ] Save/load designs to/from Supabase (canvas JSON + thumbnail)
- [ ] Public gallery with filtering and sorting
- [ ] Fork functionality incrementing fork_count on original
- [ ] Mobile: gallery browsable, editor shows "desktop recommended" with basic preview
- [ ] Performance: canvas operations < 16ms for 60fps interaction

---

## 8. Pillar 2 — Transfer Studio

### Overview

Client-side audio transfer to MiniDisc via WebUSB. No server-side audio processing. All encoding happens in Web Workers using WASM. This is the most technically complex pillar.

### Feature Spec

#### 8.1 Device Connection

- **WebUSB flow**: User clicks "Connect Device" → `navigator.usb.requestDevice({ filters: DEVICE_FILTERS })` → browser shows device picker → `device.open()` → `device.selectConfiguration(1)` → `device.claimInterface(0)` → create `NetMD` instance
- **Auto-reconnect**: On page load, call `navigator.usb.getDevices()` to reconnect previously-authorized devices without a new gesture
- **Device identification**: Match `vendorId`/`productId` against `@netmd-studio/netmd` device registry to show device name, model, and capabilities
- **Connection status**: Persistent status bar showing device name, disc title, free space, track count
- **Disconnection handling**: Listen for `navigator.usb.ondisconnect`, show reconnect prompt, preserve transfer queue

#### 8.2 Device Filter Registry

This is the complete WebUSB filter array. Store in `packages/netmd/src/devices.ts`:

```typescript
export const NETMD_DEVICE_FILTERS: USBDeviceFilter[] = [
  // Sony portables
  { vendorId: 0x054c, productId: 0x0034 }, // MZ-N1
  { vendorId: 0x054c, productId: 0x0036 }, // MZ-N1
  { vendorId: 0x054c, productId: 0x0075 }, // MZ-N1
  { vendorId: 0x054c, productId: 0x007c }, // LAM-1
  { vendorId: 0x054c, productId: 0x0080 }, // LAM-3
  { vendorId: 0x054c, productId: 0x0081 }, // MDS-JE780/JB980/NT1
  { vendorId: 0x054c, productId: 0x0084 }, // MZ-N505
  { vendorId: 0x054c, productId: 0x0085 }, // MZ-S1
  { vendorId: 0x054c, productId: 0x0086 }, // MZ-N707
  { vendorId: 0x054c, productId: 0x008e }, // CMT-C7NT
  { vendorId: 0x054c, productId: 0x0097 }, // PCGA-MDN1
  { vendorId: 0x054c, productId: 0x00ad }, // CMT-L7HD
  { vendorId: 0x054c, productId: 0x00c6 }, // MZ-N10
  { vendorId: 0x054c, productId: 0x00c7 }, // MZ-N910
  { vendorId: 0x054c, productId: 0x00c8 }, // MZ-N710/NF810
  { vendorId: 0x054c, productId: 0x00c9 }, // MZ-N510/N610
  { vendorId: 0x054c, productId: 0x00ca }, // MZ-NE410/NF520D
  { vendorId: 0x054c, productId: 0x00e7 }, // CMT-M333NT/M373NT
  { vendorId: 0x054c, productId: 0x00eb }, // MZ-NE810/NE910
  { vendorId: 0x054c, productId: 0x0101 }, // LAM-10
  { vendorId: 0x054c, productId: 0x0113 }, // MDS-S500
  // Hi-MD
  { vendorId: 0x054c, productId: 0x0186 }, // MZ-NH600/NH600D
  { vendorId: 0x054c, productId: 0x0187 }, // MZ-NH700
  { vendorId: 0x054c, productId: 0x0188 }, // MZ-NH800
  { vendorId: 0x054c, productId: 0x018a }, // MZ-NH900
  { vendorId: 0x054c, productId: 0x0219 }, // MZ-NH1
  { vendorId: 0x054c, productId: 0x021b }, // MZ-NH3D
  { vendorId: 0x054c, productId: 0x022c }, // MZ-RH10
  { vendorId: 0x054c, productId: 0x023c }, // MZ-RH910
  { vendorId: 0x054c, productId: 0x0286 }, // MZ-RH1/M200
  { vendorId: 0x054c, productId: 0x0287 }, // MDS-JE480
  // Aiwa
  { vendorId: 0x054c, productId: 0x014c }, // AM-NX1
  { vendorId: 0x054c, productId: 0x017e }, // AM-NX9
  // Sharp
  { vendorId: 0x04dd, productId: 0x7202 }, // IM-MT880H/MT899H
  { vendorId: 0x04dd, productId: 0x9013 }, // IM-DR400/DR410
  { vendorId: 0x04dd, productId: 0x9014 }, // IM-DR80/DR420/DR580
  // Kenwood
  { vendorId: 0x0b28, productId: 0x1004 }, // MDX-J9
  // Panasonic
  { vendorId: 0x04da, productId: 0x23b3 }, // SJ-MR250
  { vendorId: 0x04da, productId: 0x23b6 }, // SJ-MR270
];
```

#### 8.3 Audio Pipeline

```
User drops files (MP3/FLAC/WAV/OGG/AAC/M4A)
  → Main thread: read File as ArrayBuffer
  → Post to Audio Worker
  → Audio Worker:
      → FFmpeg WASM: decode to raw PCM (44100Hz, 16-bit, stereo)
      → If SP mode: convert to s16be (big-endian) → return raw bytes
      → If LP2 mode: atracdenc WASM encode at 132kbps → return raw ATRAC3
      → If LP4 mode: atracdenc WASM encode at 66kbps → return raw ATRAC3
  → Post encoded data back to Main thread
  → Main thread: netmd-js sendTrack() with progress callback
  → Update UI progress bar
```

**Worker architecture**: A single dedicated Web Worker (`packages/atrac-wasm/src/worker.ts`) handles all audio processing. It loads FFmpeg WASM and atracdenc WASM on first use (lazy init). Communication via `postMessage` with typed message protocol:

```typescript
// Worker message types
type WorkerMessage =
  | { type: 'encode'; id: string; buffer: ArrayBuffer; format: TransferFormat; filename: string }
  | { type: 'cancel'; id: string };

type WorkerResponse =
  | { type: 'progress'; id: string; percent: number; stage: 'decoding' | 'encoding' }
  | { type: 'complete'; id: string; data: ArrayBuffer; format: TransferFormat }
  | { type: 'error'; id: string; message: string };
```

#### 8.4 Transfer Queue UI

- **Drag-and-drop zone**: Full-width area accepting audio files. Show file list with name, duration, estimated size per format.
- **Format selector**: SP / LP2 / LP4 radio buttons with capacity indicator (e.g., "LP2: 160 min total, 42 min remaining on disc")
- **Queue list**: Each track shows: filename, duration, format, encoding progress (blue bar), transfer progress (cyan bar), status icon (queued/encoding/transferring/done/error)
- **Disc TOC panel**: Show current disc contents (read from device via `getTrackCount()`, `getTrackTitle()`, `getTrackLength()`). Editable track titles (inline rename via `setTrackTitle()`).
- **Transfer controls**: Start All, Pause, Cancel. Progress shows track N of M, overall percentage, estimated time remaining, transfer speed.

#### 8.5 Browser Compatibility

- **Supported**: Chrome 61+, Edge 79+, Opera 48+ (any Chromium-based)
- **Unsupported**: Firefox, Safari (no WebUSB)
- **Detection**: Check `navigator.usb` existence on mount. If missing, show a clear message: "Transfer Studio requires a Chromium-based browser (Chrome, Edge, or Opera) for USB device access." with links to download Chrome.

### Definition of Done — Transfer Studio

- [ ] WebUSB device connection working with device identification display
- [ ] Auto-reconnect on page load for previously authorized devices
- [ ] Disc TOC read and displayed (track list with titles, durations)
- [ ] Track title editing (inline rename)
- [ ] Audio file drop zone accepting MP3, FLAC, WAV, OGG, AAC, M4A
- [ ] SP encoding and transfer working (PCM → s16be → device)
- [ ] LP2 encoding and transfer working (PCM → ATRAC3 132k → device)
- [ ] LP4 encoding and transfer working (PCM → ATRAC3 66k → device)
- [ ] Progress reporting: per-track encoding %, transfer %, overall progress
- [ ] Queue management: reorder, remove, cancel individual tracks
- [ ] Disc capacity indicator showing used/free space per format
- [ ] Transfer history saved to Supabase
- [ ] Browser compatibility check with clear unsupported browser message
- [ ] Disconnect/reconnect handling without losing queue state
- [ ] Performance: encoding progress updates at ≥ 10fps, no main thread blocking

---

## 9. Pillar 3 — Device Library

### Overview

A community-maintained database of MiniDisc hardware. Think "EveryMac.com but for MiniDisc." Users can browse, search, filter, and contribute device data. Linked to Transfer Studio (device capabilities) and Marketplace (listing device associations).

### Feature Spec

#### 9.1 Device Browsing

- **Route**: `/devices`
- **Layout**: Filterable grid/list view of device cards
- **Card**: Device image (or placeholder silhouette), name, manufacturer, year, type badge, key capability icons (MDLP, Type-S, optical, USB)
- **Filters** (sidebar on desktop, drawer on mobile):
  - Type: checkboxes for each `device_type` enum value
  - Manufacturer: Sony, Sharp, Kenwood, Panasonic, Aiwa, Denon, Tascam, TEAC, Onkyo
  - Features: MDLP, Hi-MD, Type-S, Optical In, Line In, USB, Recording
  - Year range: slider from 1992 to 2020
  - WebUSB compatible: toggle
- **Search**: Full-text search bar using `fts` column
- **Sort**: Name, year (newest/oldest), manufacturer

#### 9.2 Device Detail Page

- **Route**: `/devices/:id`
- **Sections**:
  - Hero: Large image, name, manufacturer, model number, type badge
  - Specifications table: All boolean flags displayed as checkmark/x grid
  - ATRAC version with explainer tooltip
  - USB info: VID/PID, compatible with netmd-js badge, "Use in Transfer Studio" link
  - Community reports: Aggregated WebUSB compatibility data from `device_reports`
  - Related listings: Active marketplace listings for this device
  - Notes: Community-submitted notes (markdown rendered)

#### 9.3 Device Submission

- **Route**: `/devices/submit` (authenticated only)
- **Form**: All device fields with smart defaults based on device_type selection
- **Submitted devices**: `verified = false` until admin review
- **Admin panel** (route `/admin/devices`): Queue of unverified submissions, approve/reject/edit

#### 9.4 Compatibility Reports

- Authenticated users can submit a report on any device: "I tested this device with WebUSB"
- Fields: works_with_webusb (yes/no/partial), OS, browser, browser version, notes
- Reports aggregated on device detail page: "85% success rate (17 of 20 reports)"

### Seed Data

The initial migration MUST include seed data for all known Net MD and Hi-MD devices from the device filter registry. This is `supabase/seed.sql`. Include at minimum: all devices listed in section 8.2 device filters with their known specs from minidisc.wiki. Mark all as `verified = true`, `submitted_by = null`.

### Definition of Done — Device Library

- [ ] Device grid view with all filters functional
- [ ] Full-text search working
- [ ] Device detail page with all spec sections
- [ ] Device submission form with validation
- [ ] Admin device review queue
- [ ] Compatibility report submission and aggregation
- [ ] Seed data for all known Net MD/Hi-MD devices
- [ ] "Use in Transfer Studio" deep link working
- [ ] Related marketplace listings showing on device page
- [ ] Mobile responsive: grid → single column, filters in drawer

---

## 10. Pillar 4 — Marketplace

### Overview

Buy and sell MiniDisc hardware, blank/prerecorded discs, and accessories. Peer-to-peer transactions via Stripe Connect Express. Platform takes a 10% fee.

### Feature Spec

#### 10.1 Listing Browsing

- **Route**: `/marketplace`
- **Layout**: Grid of listing cards (image, title, price, condition badge, seller name, favorite heart)
- **Filters**: Category, condition, price range (slider), shipping (domestic/international), sort (newest/price low-high/price high-low)
- **Search**: Full-text search via `fts` column
- **Favorites**: Heart icon toggle, count displayed. Requires auth.

#### 10.2 Listing Detail

- **Route**: `/marketplace/:id`
- **Sections**:
  - Image gallery: Swipeable/clickable images with zoom
  - Title, price, condition badge, category badge
  - Seller info: avatar, display name, rating, review count, "View seller's other listings"
  - Description (markdown rendered)
  - Linked device (if any): card linking to Device Library detail
  - Shipping info: price, domestic only flag
  - "Buy Now" button (disabled if not authenticated, or if viewer is the seller)
  - "Message Seller" button for order-related questions (creates a pending order context)

#### 10.3 Listing Creation

- **Route**: `/marketplace/sell` and `/marketplace/sell/:id` (edit)
- **Requires**: `seller` role + completed Stripe Connect onboarding
- **Seller onboarding flow**:
  1. User clicks "Start Selling" on marketplace
  2. If no `stripe_account_id`: create Express account via API route, redirect to Stripe onboarding
  3. On return: check `charges_enabled` via API route, update `profiles.stripe_onboarding_complete`
  4. If onboarding incomplete, show status and "Complete Onboarding" button
- **Form fields**: Title, description (rich text), category (select), condition (select), price (number + currency), shipping price, domestic only toggle, images (drag-drop up to 8, auto-resize to 1200px max, WebP conversion), optional device link (search and select from Device Library), tags
- **Status flow**: Draft → Active (publish) → Sold (auto on order completion) or Archived (manual)

#### 10.4 Purchase Flow

1. Buyer clicks "Buy Now" → API route creates Stripe PaymentIntent with destination charge
2. Buyer enters payment info via Stripe Elements (embedded, not redirect)
3. On `payment_intent.succeeded` webhook: create order record, update listing quantity, notify seller
4. Seller ships, enters tracking number → order status → shipped
5. Buyer confirms delivery → order status → delivered
6. Buyer can leave review after delivery

#### 10.5 Order Management

- **Route**: `/dashboard/orders` — shows orders as buyer and seller in separate tabs
- **Order detail** (`/dashboard/orders/:id`):
  - Status timeline: pending → paid → shipped → delivered
  - Tracking info with link
  - Message thread between buyer and seller
  - Review form (after delivery)

#### 10.6 Seller Dashboard

- **Route**: `/dashboard/selling`
- **Sections**:
  - Active listings count, total sales, pending orders
  - Listing management table: title, status, price, views, created date, actions (edit/archive)
  - Payout info: Stripe Express Dashboard link (via login link API)
  - Quick stats: items sold this month, revenue, average rating

### Platform Fee Structure

- **Platform fee**: 10% of subtotal (minimum $0.50)
- **Stripe processing**: ~2.9% + $0.30 (deducted from platform's share)
- **Seller receives**: 90% of subtotal
- **Shipping**: 100% to seller (not subject to platform fee)
- **Example**: $50 item + $10 shipping = $60 charge. Platform fee = $5.00. Seller receives $45.00 + $10.00 shipping = $55.00. Platform nets $5.00 minus Stripe fees (~$2.04) = ~$2.96.

### Definition of Done — Marketplace

- [ ] Listing grid with all filters and search working
- [ ] Listing detail page with image gallery, seller info, buy button
- [ ] Seller onboarding: Stripe Connect Express account creation and onboarding flow
- [ ] Listing creation form with image upload (max 8, resize, WebP)
- [ ] Listing status management (draft/active/archived)
- [ ] Purchase flow: Stripe Elements checkout, PaymentIntent with destination charge
- [ ] Webhook handler processing `payment_intent.succeeded` and creating orders
- [ ] Order management for buyers and sellers
- [ ] Order messaging between buyer and seller (real-time via Supabase Realtime)
- [ ] Review system after delivery
- [ ] Seller dashboard with stats and Stripe Express Dashboard link
- [ ] Favorite listings with count
- [ ] Platform fee calculated correctly (10%, min $0.50)
- [ ] Mobile responsive: listing grid, checkout flow, order management

---

## 11. Stripe Connect Integration

### Server-Side API Routes

All Stripe operations happen server-side via Vercel API routes (or Supabase Edge Functions). **Never expose `STRIPE_SECRET_KEY` to the client.**

#### `/api/stripe/create-account-link.ts`

Creates a Stripe Express account (if needed) and returns an onboarding URL.

```typescript
// Pseudocode — full implementation required
// 1. Verify auth (Supabase JWT from Authorization header)
// 2. Check if profile has stripe_account_id
// 3. If not: stripe.accounts.create({ controller config })
// 4. Save stripe_account_id to profile
// 5. Create account link: stripe.accountLinks.create({
//      account, return_url, refresh_url, type: 'account_onboarding'
//    })
// 6. Return { url: accountLink.url }
```

#### `/api/stripe/create-checkout.ts`

Creates a PaymentIntent for a listing purchase.

```typescript
// 1. Verify auth
// 2. Validate listing_id, check listing is active, check quantity > 0
// 3. Look up seller's stripe_account_id
// 4. Calculate platform fee
// 5. Create PaymentIntent:
//    stripe.paymentIntents.create({
//      amount: total_cents,
//      currency,
//      application_fee_amount: platform_fee_cents,
//      transfer_data: { destination: seller_stripe_account_id },
//      metadata: { listing_id, buyer_id, seller_id }
//    })
// 6. Return { clientSecret: paymentIntent.client_secret }
```

#### `/api/stripe/create-login-link.ts`

Returns a Stripe Express Dashboard login link for sellers.

```typescript
// 1. Verify auth
// 2. Get stripe_account_id from profile
// 3. stripe.accounts.createLoginLink(stripe_account_id)
// 4. Return { url: loginLink.url }
```

#### `/api/webhooks/stripe.ts`

Processes all Stripe webhook events. **This is the most critical server-side code.**

```typescript
// 1. Verify webhook signature (stripe.webhooks.constructEvent)
// 2. Check idempotency: INSERT INTO stripe_events, skip if duplicate
// 3. Switch on event.type:
//    - 'account.updated': sync charges_enabled → profiles.stripe_onboarding_complete
//    - 'payment_intent.succeeded': create order, decrement listing quantity,
//      set listing status to 'sold' if quantity = 0
//    - 'payment_intent.payment_failed': log, notify buyer
//    - 'charge.dispute.created': flag order as disputed, notify admin
//    - 'payout.paid': log for seller dashboard stats
//    - 'payout.failed': notify seller
// 4. Return 200 immediately
```

**Webhook configuration**: In Stripe Dashboard, create a Connect webhook endpoint pointing to `https://netmd.studio/api/webhooks/stripe` listening to: `account.updated`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.dispute.created`, `payout.paid`, `payout.failed`. Enable "Connect events" toggle.

---

## 12. API Routes & Edge Functions

### Vercel API Routes (in `apps/web/api/`)

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/discogs/search` | GET | Optional | Proxy Discogs search (hides API key, manages rate limit) |
| `/api/musicbrainz/search` | GET | Optional | Proxy MusicBrainz search (server-side rate limiting to 1 req/sec) |
| `/api/stripe/create-account-link` | POST | Required | Create Stripe Express account + onboarding link |
| `/api/stripe/create-checkout` | POST | Required | Create PaymentIntent for purchase |
| `/api/stripe/create-login-link` | POST | Required | Get Stripe Express Dashboard login URL |
| `/api/webhooks/stripe` | POST | Stripe signature | Process Stripe webhooks |

### Rate Limiting Strategy

- **Discogs proxy**: In-memory token bucket, 60 req/min per API key. Queue requests if limit approached.
- **MusicBrainz proxy**: Server-side 1 request per second enforced via `setTimeout` queue. MusicBrainz will 503 the entire app if this is violated.
- **Stripe API routes**: Auth-gated (must have valid Supabase session). No additional rate limiting needed — Stripe handles its own limits.

### API Route Auth Pattern

Every authenticated API route must:

1. Extract `Authorization: Bearer <token>` header
2. Verify with Supabase: `supabase.auth.getUser(token)`
3. Reject with 401 if invalid
4. Use `user.id` for all database operations

```typescript
// Shared helper in apps/web/api/_lib/auth.ts
import { createSupabaseAdmin } from '@netmd-studio/utils';

export async function getAuthUser(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const supabase = createSupabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}
```

---

## 13. Environment Variables

### `.env.example`

```bash
# ──────────────── Supabase ────────────────
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...                     # Public anon key (safe for client)
SUPABASE_URL=https://YOUR_PROJECT.supabase.co      # Server-side (same value)
SUPABASE_SERVICE_ROLE_KEY=eyJ...                   # Server-side only — NEVER prefix with VITE_
SUPABASE_PROJECT_ID=YOUR_PROJECT_ID                # For CLI type generation

# ──────────────── Stripe ────────────────
VITE_STRIPE_PUBLIC_KEY=pk_test_...                 # Publishable key (safe for client)
STRIPE_SECRET_KEY=sk_test_...                      # Server-side only — NEVER prefix with VITE_
STRIPE_WEBHOOK_SECRET=whsec_...                    # Server-side only

# ──────────────── Discogs ────────────────
DISCOGS_CONSUMER_KEY=...                           # Server-side only
DISCOGS_CONSUMER_SECRET=...                        # Server-side only

# ──────────────── App ────────────────
VITE_APP_URL=http://localhost:5173                 # Production: https://netmd.studio
```

### Variable Scoping Rules

- `VITE_` prefix: Bundled into client code. ONLY for truly public values (Supabase anon key, Stripe publishable key, app URL).
- No prefix: Server-side only (API routes, edge functions). NEVER accessible from client code.
- **If you are unsure whether a key should be public: it should NOT be. Do not add `VITE_` prefix.**

### Vercel Environment Variable Setup

Each environment variable must be set in the Vercel project dashboard under Settings → Environment Variables. Set separately for Production, Preview, and Development:

- Production: Real keys, `VITE_APP_URL=https://netmd.studio`
- Preview: Test keys, `VITE_APP_URL` = Vercel preview URL
- Development: Test keys, `VITE_APP_URL=http://localhost:5173`

---

## 14. Git Conventions

### Branch Strategy

- `main` — production. Protected. Requires PR review.
- `dev` — integration branch. All feature branches merge here first.
- `feature/*` — feature branches off `dev`. Named: `feature/label-studio-canvas`, `feature/transfer-webusb`, etc.
- `fix/*` — bug fixes. Named: `fix/listing-price-validation`
- `chore/*` — tooling, deps, config. Named: `chore/update-tailwind`

### Commit Message Format

```
type(scope): description

type: feat | fix | refactor | chore | docs | test | style
scope: label | transfer | device | market | ui | types | utils | netmd | atrac | auth | stripe | infra
```

Examples:
```
feat(label): add Fabric.js canvas with text tool
fix(transfer): handle WebUSB disconnect during active transfer
refactor(market): extract listing card to shared component
chore(infra): configure turbo remote caching
```

### PR Rules

- Title matches commit format
- Description includes: what changed, why, how to test
- Must pass CI (lint, typecheck, test)
- At least one approval (when team grows)
- Squash merge to `dev`, merge commit from `dev` to `main`

### Claude Code Commit Rule

**After completing any task, Claude Code must:**
1. Stage all changed files
2. Write a commit message following the format above
3. Push to the current branch
4. If deploying to Vercel: confirm the preview URL is accessible

---

## 15. Testing Strategy

### Unit Tests

- **Framework**: Vitest
- **Location**: Co-located `*.test.ts` files next to source
- **Coverage target**: 80% for `packages/*`, 60% for `apps/web/src/features/*`
- **What to test**: Utility functions, Zod schemas, state management logic, format conversions, price calculations

### Component Tests

- **Framework**: Vitest + React Testing Library
- **What to test**: Form validation, conditional rendering, user interactions, accessibility (aria attributes, keyboard navigation)

### Integration Tests

- **Stripe**: Use Stripe test mode with test card numbers
- **Supabase**: Use local Supabase instance (`supabase start`) for integration tests
- **WebUSB**: Mock `navigator.usb` — actual device testing is manual only

### E2E Tests (future phase)

- **Framework**: Playwright
- **Scope**: Critical flows only — auth, listing creation, purchase checkout
- **Not in initial build** — add after all four pillars are functional

---

## 16. Deployment

### Vercel Project Configuration

**Single Vercel project** for `apps/web`:

- **Root Directory**: `apps/web`
- **Framework Preset**: Vite
- **Build Command**: `cd ../.. && npx turbo build --filter=@netmd-studio/web`
- **Install Command**: `pnpm install`
- **Node.js Version**: 20.x

### Domain Configuration

- Production: `netmd.studio` (custom domain in Vercel)
- Preview: Auto-generated Vercel preview URLs on PRs

### Vercel Configuration File

```json
// apps/web/vercel.json
{
  "headers": [
    {
      "source": "/wasm/(.*)",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

**IMPORTANT**: The COOP/COEP headers are required for SharedArrayBuffer, which FFmpeg WASM needs. These headers must be set on the WASM files and potentially on the pages that load them. If this causes issues with third-party embeds (Stripe Elements), scope the headers narrowly to `/wasm/` paths only and load WASM in a cross-origin isolated iframe or worker.

---

## 17. Build Sequence

Execute these prompts in order. Each prompt represents a self-contained unit of work. **Do not skip prompts. Do not combine prompts.** Each prompt should result in a working, deployable state.

---

### Prompt 1: Monorepo Scaffold + Design System + Auth

**Objective**: Set up the complete Turborepo monorepo structure, install all dependencies, configure the shared design system, implement Supabase auth with profile sync, and deploy to Vercel.

**Tasks**:
1. Initialize Turborepo monorepo with pnpm workspaces
2. Create all packages: `ui`, `types`, `utils`, `netmd`, `atrac-wasm`, `tailwind-config`, `typescript-config`, `eslint-config`
3. Create `apps/web` with Vite + React + TypeScript
4. Configure shared Tailwind config with all design tokens from Section 4
5. Build the app shell: sidebar nav, header, main content area, router setup
6. Implement pillar nav with colored indicators (Label Studio = cyan, Transfer Studio = magenta, Device Library = amber, Marketplace = green)
7. Set up Supabase client in `packages/utils`
8. Implement auth flows: email/password signup, Google OAuth, magic link, sign out
9. Create auth callback route handler
10. Apply initial migration `00001_initial_schema.sql` (full schema from Section 5)
11. Apply `00003_rls_policies.sql` (all RLS policies from Section 6)
12. Create placeholder pages for all four pillars (empty states with pillar descriptions)
13. Deploy to Vercel, confirm working at preview URL

**Definition of Done**: App loads at Vercel preview URL showing the dark studio UI shell with navigation between four pillar placeholder pages. User can sign up, sign in, and sign out. Supabase schema is applied with all tables, indexes, and RLS policies.

Commit and push to the current branch. Deploy to the Vercel preview/test server and supply the preview URL.

---

### Prompt 2: Device Library (Pillar 3)

**Objective**: Build the complete Device Library with browsing, search, filtering, detail pages, submission, and seed data. Device Library is built first because it's referenced by Transfer Studio (device identification) and Marketplace (listing associations).

**Tasks**:
1. Create seed data migration (`00002_seed_devices.sql`) with all devices from the filter registry in Section 8.2, including full specs sourced from minidisc.wiki
2. Build device grid view at `/devices` with card layout
3. Implement all filters: type, manufacturer, features, year range, WebUSB compatible
4. Implement full-text search
5. Build device detail page at `/devices/:id` with all spec sections
6. Build device submission form at `/devices/submit`
7. Build admin device review page at `/admin/devices`
8. Build compatibility report submission UI
9. Implement aggregated compatibility stats on device detail page
10. Mobile responsive: grid → single column, filters in bottom sheet

**Definition of Done**: All items in "Definition of Done — Device Library" (Section 9) are checked off.

Commit and push to the current branch. Deploy to the Vercel preview/test server and supply the preview URL.

---

### Prompt 3: Label Studio (Pillar 1)

**Objective**: Build the complete Label Studio with canvas editor, metadata search, template system, export, and community gallery.

**Tasks**:
1. Create MusicBrainz and Discogs API proxy routes (`/api/musicbrainz/search`, `/api/discogs/search`)
2. Build template selection screen with all 5 template types
3. Integrate Fabric.js v6 canvas with correct physical dimensions per template type
4. Build metadata search: album search bar → API call → results dropdown → select → auto-populate canvas
5. Implement Cover Art Archive image fetching for canvas background
6. Build all canvas tools: text, image upload, shapes, background, layers panel
7. Implement undo/redo with keyboard shortcuts
8. Build snap-to-grid with toggle
9. Implement PDF export at 300 DPI with correct physical dimensions
10. Implement PNG export at 300 DPI
11. Build save/load: serialize canvas to JSON → Supabase, generate thumbnail → Storage
12. Build community gallery at `/labels/gallery` with filters and sorting
13. Implement fork functionality
14. Mobile: gallery browsable, editor shows "desktop recommended" overlay

**Definition of Done**: All items in "Definition of Done — Label Studio" (Section 7) are checked off.

Commit and push to the current branch. Deploy to the Vercel preview/test server and supply the preview URL.

---

### Prompt 4: Transfer Studio (Pillar 2)

**Objective**: Build the complete Transfer Studio with WebUSB device connection, audio encoding pipeline, transfer queue, and disc management.

**Tasks**:
1. Set up `@netmd-studio/netmd` package with device filter registry and WebUSB connection manager
2. Set up `@netmd-studio/atrac-wasm` package: vendor WASM binaries, create Worker with typed message protocol
3. Build device connection UI: "Connect Device" button, device picker, connection status bar
4. Implement auto-reconnect via `getDevices()` on mount
5. Build disc TOC reader: display current tracks with titles and durations
6. Implement inline track title editing
7. Build audio file drop zone with format validation
8. Implement full audio pipeline: FFmpeg decode → atracdenc encode → netmd-js transfer
9. Build transfer queue UI with encoding + transfer progress bars
10. Implement format selector (SP/LP2/LP4) with disc capacity indicator
11. Build queue controls: start all, pause, cancel, reorder
12. Save transfer history to Supabase
13. Implement browser compatibility check for non-Chromium browsers
14. Handle device disconnection during transfer
15. Configure COOP/COEP headers in vercel.json for SharedArrayBuffer

**Definition of Done**: All items in "Definition of Done — Transfer Studio" (Section 8) are checked off.

Commit and push to the current branch. Deploy to the Vercel preview/test server and supply the preview URL.

---

### Prompt 5: Marketplace + Stripe Connect (Pillar 4)

**Objective**: Build the complete Marketplace with listing browsing, seller onboarding, listing creation, Stripe Connect Express checkout, order management, messaging, and reviews.

**Tasks**:
1. Create all Stripe API routes: create-account-link, create-checkout, create-login-link
2. Create Stripe webhook handler at `/api/webhooks/stripe`
3. Build marketplace grid at `/marketplace` with all filters and search
4. Build listing detail page with image gallery, seller info, buy button
5. Implement seller onboarding flow: role upgrade → Stripe Express account creation → hosted onboarding → return and verify
6. Build listing creation form with image upload (resize, WebP, max 8)
7. Implement listing status management
8. Build purchase flow with Stripe Elements
9. Implement webhook processing: order creation on payment success, listing quantity management
10. Build order management pages for buyers and sellers
11. Implement order messaging with Supabase Realtime
12. Build review submission after delivery
13. Build seller dashboard with stats and Stripe Dashboard link
14. Implement favorites
15. Connect Device Library: link listings to devices, show related listings on device pages

**Definition of Done**: All items in "Definition of Done — Marketplace" (Section 10) are checked off.

Commit and push to the current branch. Deploy to the Vercel preview/test server and supply the preview URL.

---

### Prompt 6: Integration, Polish, and Launch Prep

**Objective**: Cross-pillar integration, performance optimization, error handling, and production readiness.

**Tasks**:
1. Cross-link all pillars: Transfer Studio → Device Library (auto-identify connected device), Marketplace → Device Library (device association on listings), Label Studio → Marketplace (design labels for purchased discs)
2. Build user dashboard at `/dashboard` with activity across all pillars
3. Implement global error boundary with fallback UI
4. Add loading states and skeleton screens for all data-fetching views
5. Implement toast notifications for all user actions (save, purchase, transfer complete, errors)
6. Performance audit: Lighthouse score > 90 on all pillar landing pages, code-split per pillar route
7. SEO: meta tags, OpenGraph images, structured data for marketplace listings
8. Accessibility audit: keyboard navigation, screen reader testing, ARIA labels, focus management
9. Add 404 page and error pages
10. Configure production environment variables in Vercel
11. Set up Stripe production mode (switch from test to live keys)
12. Final deployment to `netmd.studio`

**Definition of Done**: All four pillars functional and interconnected. Lighthouse performance > 90. No console errors. Production deployment live at `netmd.studio`.

Commit and push to the current branch. Deploy to the Vercel preview/test server and supply the preview URL.

---

## Appendix A: Key Reference Links

| Resource | URL |
|---|---|
| netmd-js GitHub | `https://github.com/cybercase/netmd-js` |
| Web MiniDisc Pro | `https://github.com/asivery/webminidisc` |
| atracdenc | `https://github.com/dcherednik/atracdenc` |
| Discogs API | `https://www.discogs.com/developers/` |
| MusicBrainz API | `https://musicbrainz.org/doc/MusicBrainz_API` |
| Cover Art Archive | `https://musicbrainz.org/doc/Cover_Art_Archive/API` |
| Supabase RLS | `https://supabase.com/docs/guides/database/postgres/row-level-security` |
| Stripe Connect Express | `https://docs.stripe.com/connect/end-to-end-marketplace` |
| Stripe Destination Charges | `https://docs.stripe.com/connect/destination-charges` |
| Stripe Webhooks | `https://docs.stripe.com/connect/webhooks` |
| Turborepo Structure | `https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository` |
| WebUSB API | `https://developer.chrome.com/docs/capabilities/usb` |
| MiniDisc Wiki | `https://www.minidisc.wiki` |
| Fabric.js | `https://fabricjs.com/` |

## Appendix B: ATRAC Format Quick Reference

| Mode | Codec | Bitrate | Capacity (80min disc) | Quality | netmd-js wireformat |
|---|---|---|---|---|---|
| SP | ATRAC1 | ~292 kbps | 80 min | Best (true CD-quality ATRAC) | `s16be` PCM |
| LP2 | ATRAC3 | 132 kbps | 160 min | Good (near-FM quality) | Raw ATRAC3 |
| LP4 | ATRAC3 | 66 kbps (joint stereo) | 320 min | Acceptable (joint stereo artifacts) | Raw ATRAC3 |

## Appendix C: MiniDisc J-Card Physical Dimensions

| Element | Width | Height | Notes |
|---|---|---|---|
| Front cover | 65 mm | 104 mm | — |
| Spine | 6.7 mm | 104 mm | Very narrow — use small type (6-8pt) |
| Back panel | 65 mm | 104 mm | Usually contains tracklist |
| Full J-card (unfolded) | 136.7 mm | 104 mm | Front + spine + back as one piece |
| Disc label | 64 mm diameter | — | Circle, hole at center |
| Print bleed | +3 mm | +3 mm | All edges |

---




**END OF CLAUDE.md**

*This document is the contract between the project owner and Claude Code. Every architectural decision is intentional. Every schema column is specified. Every feature has a definition of done. Build exactly what is described here.*
