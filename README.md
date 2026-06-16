# MINDBLOOM

A full-stack personal habit analytics web application built as a portfolio project. Track daily habits, log your mood and journal entries, and surface behavioral patterns through interactive data visualisations.

---

## Table of Contents

- [Overview](#overview)
- [Demo](#demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Python Analytics Layer](#python-analytics-layer)
- [Design System](#design-system)

---

## Overview

MINDBLOOM is a self-improvement dashboard where users can:

- Build and maintain daily habits with target day scheduling
- Check off habits each day and visualise weekly progress via dot indicators
- Write dated journal entries with mood ratings and tags
- Log standalone mood scores with optional notes
- View analytics — completion rates by category, day-of-week patterns, habit × mood correlation, and a monthly completion heatmap
- Read auto-generated weekly reports with a performance score

---

## Demo

Want to explore without setting anything up? Use the demo account to sign in:

| Field | Value |
|---|---|
| Email | `alex@mindbloom.app` |
| Password | `password123` |

The demo account comes pre-loaded with habits, journal entries, mood logs, and analytics data so every page has real content to explore.

---

## Features

### Dashboard
- Greeting header with live date and habit count
- **4 stat cards** — streak, today's progress (live), mood average, weekly journal count
- **Today's habits** card with a progress ring and weekly dot indicators (Sun–Sat), live toggle without page reload
- **Mood trend** sparkline (last 7 days)
- **Completion heatmap** — habit × day-of-week grid for the current month; opacity maps to completion rate; single sage-green colour scheme

### Habits
- **Today** tab — habits scheduled for the current day of the week, with live check/uncheck
- **All habits** tab — full habit list with 28-day completion rate and weekly streak
- **Add habit** form — name, icon, colour, category, frequency, target days
- Navigation-safe state: tabs stay mounted via CSS `hidden` so checked state survives tab switches; `usePathname` triggers re-fetch on page navigation

### Journal
- Daily prompt (rotates by day of week)
- Mood selector (1–5 scale with emoji)
- Freeform text entry with live word count
- Tag support (comma-separated)
- **Archive heatmap** — one row per year, 12 monthly cells; opacity encodes entry density (0 → 0.07, 10+ → 1.0); click a cell to expand that month's entries

### Mood
- Quick mood log with optional note
- **30-day mood trend** area chart
- **Mood calendar** — daily mood dots for the current month
- **Habit–mood correlation** — Done vs Skip average mood bars per habit; habits with < 0.3 difference are hidden with a count footer

### Analytics
- Habit completion rate by category (bar chart)
- Day-of-week pattern chart
- **Habit × day of week** heatmap — aggregated completion rate per habit per DOW; single sage-green colour, opacity = rate
- Key insights (auto-generated from data patterns)

### Reports
- Weekly performance summary (habits %, mood avg, journal days, letter grade)
- Highlights section
- Habit breakdown — this week vs last week comparison bars

### Auth
- Email / password registration and sign-in (bcrypt hashed)
- **Google OAuth** sign-in (NextAuth + Google provider)
- JWT sessions

---

## Tech Stack

### Frontend / Full-Stack
| Technology | Purpose |
|---|---|
| [Next.js 14](https://nextjs.org/) (App Router) | Framework — SSR, routing, API routes |
| [React 18](https://react.dev/) | UI layer |
| [TypeScript 5](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS 3](https://tailwindcss.com/) | Utility-first styling |
| [Recharts 2](https://recharts.org/) | Mood sparkline and trend charts |
| [date-fns 4](https://date-fns.org/) | Date arithmetic and formatting |

### Backend / Data
| Technology | Purpose |
|---|---|
| [Prisma 5](https://www.prisma.io/) | ORM and schema management |
| [PostgreSQL](https://www.postgresql.org/) | Primary database (Supabase hosted) |
| [NextAuth 4](https://next-auth.js.org/) | Authentication (credentials + Google OAuth) |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing |
| [Zod 3](https://zod.dev/) | Runtime validation |

### Python Analytics (offline / scripted)
| Library | Purpose |
|---|---|
| pandas, numpy | Data manipulation |
| scikit-learn | Predictive modelling |
| matplotlib, seaborn | Visualisation |
| SQLAlchemy + psycopg2 | Direct DB queries |
| reportlab | PDF report generation |
| scipy | Statistical analysis |

---

## Project Structure

```
mindbloom/
├── analytics/                  # Python analytics scripts (offline)
│   ├── data_pipeline.py        # ETL — DB → pandas DataFrames
│   ├── eda.py                  # Exploratory data analysis
│   ├── predictions.py          # Habit consistency predictions
│   ├── reports.py              # Automated PDF report generation
│   └── requirements.txt
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Demo data seeder
│
├── src/
│   ├── app/
│   │   ├── (auth)/             # Auth route group
│   │   │   ├── login/          # Sign-in page
│   │   │   └── register/       # Registration page
│   │   ├── (dashboard)/        # Protected app route group
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── habits/         # Habit tracker
│   │   │   ├── journal/        # Journal + archive
│   │   │   ├── mood/           # Mood logger + trend
│   │   │   ├── analytics/      # Analytics charts
│   │   │   └── reports/        # Weekly report
│   │   ├── api/                # REST API routes
│   │   │   ├── auth/           # NextAuth + register
│   │   │   ├── habits/         # CRUD + stats
│   │   │   ├── completions/    # Daily toggle
│   │   │   ├── journal/        # Entry CRUD
│   │   │   ├── mood/           # Mood log CRUD
│   │   │   ├── analytics/      # Aggregated analytics
│   │   │   └── reports/        # Weekly report generation
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing / redirect
│   │
│   ├── components/
│   │   ├── analytics/          # CompletionBars, DowChart, MoodCorrelation
│   │   ├── dashboard/          # StatCard, HabitChecklist, CalendarHeatmap, Heatmap, MoodSparkline, DashboardLiveSection
│   │   ├── habits/             # HabitCard, AddHabitModal
│   │   ├── layout/             # Sidebar, Header
│   │   ├── mood/               # MoodSelector, MoodCalendar
│   │   ├── reports/            # ReportCard, HabitBreakdown
│   │   └── ui/                 # Button, Card, Input, Label, Modal
│   │
│   ├── lib/
│   │   ├── analytics.ts        # Server-side data aggregation functions
│   │   ├── auth.ts             # NextAuth config (credentials + Google)
│   │   ├── prisma.ts           # Prisma client singleton
│   │   └── utils.ts            # Date helpers, cn(), moodEmoji(), completionRate()
│   │
│   ├── styles/
│   │   └── globals.css         # Tailwind base + custom CSS variables
│   │
│   └── types/
│       └── index.ts            # Shared TypeScript interfaces
│
├── middleware.ts                # Route protection (NextAuth)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── .env.example
```

---

## Database Schema

```
User
├── id, name, email, password? (nullable — Google OAuth users have no password)
├── avatar?, bio?
└── → Habit[], HabitCompletion[], JournalEntry[], MoodLog[], Report[]

Habit
├── id, name, description?, icon, color, category, frequency
├── targetDays  Int[]   (0=Sun … 6=Sat — days the habit is scheduled)
├── isActive    Boolean
└── → HabitCompletion[]

HabitCompletion
├── habitId, userId, date (yyyy-MM-dd string), notes?
└── @@unique([habitId, date])   — one completion per habit per day

JournalEntry
├── userId, content, mood?, tags String[], wordCount, date, prompt?
└── @@unique([userId, date])    — one entry per user per day

MoodLog
├── userId, mood (1–5), note?, date
└── (multiple logs per day allowed)

AnalyticsCache
└── userId, type, period, data Json, expiresAt

Report
└── userId, type, period, data Json, insights String[], score Float?
```

---

## API Reference

All routes require an active session (JWT cookie) except `/api/auth/*`.

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account (email + password) |
| `GET/POST` | `/api/auth/[...nextauth]` | NextAuth (credentials + Google) |
| `GET/POST` | `/api/habits` | List habits with stats / create habit |
| `PATCH/DELETE` | `/api/habits/[id]` | Update or delete a habit |
| `GET/POST/DELETE` | `/api/completions` | Get completions by date range / toggle |
| `GET/POST` | `/api/journal` | List entries / create entry |
| `GET/POST` | `/api/mood` | List mood logs / create log |
| `GET` | `/api/analytics` | Aggregated analytics (categories, DOW, correlation, insights) |
| `GET` | `/api/reports` | Weekly report (habit breakdown, score, highlights) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or [Supabase](https://supabase.com))
- (Optional) Google Cloud project for OAuth

### 1. Clone and install

```bash
git clone https://github.com/your-username/mindbloom.git
cd mindbloom
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#environment-variables) below).

### 3. Set up the database

```bash
npm run db:push      # Push schema to your database
npm run db:seed      # Load demo data (Alex Chen account + habits)
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo account** (after seeding):
- Email: `alex@mindbloom.app`
- Password: `password123`

---

## Environment Variables

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/mindbloom?schema=public"

# NextAuth — generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional — see below for setup)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → **APIs & Services** → **OAuth consent screen** → External
3. **Credentials** → **Create OAuth client ID** → Web application
4. Add authorised redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy the Client ID and Client Secret into `.env`

For production, also add `https://yourdomain.com/api/auth/callback/google` to the redirect URIs.

---

## Scripts

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint

npm run db:push      # Sync Prisma schema → database (no migration history)
npm run db:migrate   # Create and apply a named migration
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:seed      # Seed demo data
npm run db:reset     # Drop all data, re-migrate, re-seed
```

---

## Python Analytics Layer

The `analytics/` directory contains standalone Python scripts for offline analysis and reporting. These connect directly to the PostgreSQL database via SQLAlchemy.

```bash
cd analytics
pip install -r requirements.txt
```

| Script | What it does |
|---|---|
| `data_pipeline.py` | Pulls raw data from DB into structured pandas DataFrames |
| `eda.py` | Exploratory analysis — completion trends, mood distributions, correlations |
| `predictions.py` | Habit consistency prediction using scikit-learn |
| `reports.py` | Generates PDF weekly reports using reportlab |

These scripts read `DATABASE_URL` from the root `.env` file (via `python-dotenv`).

---

## Design System

### Colour Palette

| Token | Hex | Usage |
|---|---|---|
| `sage` | `#3EC9A7` | Primary accent, CTAs, completion indicators |
| `violet` | `#7B61FF` | Mood, secondary accent |
| `coral` | `#F0634A` | Errors, skip/negative states |
| `amber` | `#F5A623` | Warnings, streak indicators |
| `ink` | `#1A1A2E` | Primary text |
| `muted` | `#4A4A6A` | Secondary text |
| `ghost` | `#9EA5B3` | Placeholder, meta text |
| `surface` | `#F5F5F0` | Card backgrounds, hover states |

### Typography

- **Display font** — used for headings and the wordmark (`font-display`)
- **Body** — system sans-serif stack
- Base size: 13px (UI labels), 14px (body), 11px (meta/badges)

### Component Conventions

- Cards use `rounded-xl border border-[#E8E8E2] bg-white shadow-card`
- Badges: `.badge-sage` (green), `.badge-violet` (purple) utility classes
- All interactive elements have `transition-all` and hover states
- Stat cards, rings, and heatmap cells animate via CSS transitions — no external animation library
