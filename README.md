# CampaignOS

AI-powered creative suite for fashion and lifestyle brands. Generate copy, create image prompts, manage assets, and plan content — all in one place.

## Features

- **Brand Profiles** — Store tone of voice, keywords, and brand identity for multiple brands
- **Copy Studio** — AI-generated copy for Instagram, Stories, Reels, LinkedIn, TikTok, Facebook, Email, and Ads — in any language
- **Image Studio** — Generate detailed prompts for Gemini Imagen, Midjourney, or DALL-E from scene briefs and outfit references
- **Asset Library** — Save and filter all generated copy and image prompts
- **Content Calendar** — Plan and schedule posts by platform and day

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Auth**: Clerk (email + social login)
- **Database**: PostgreSQL + Prisma ORM
- **AI**: Anthropic Claude (copy + image prompt generation)
- **Hosting**: Vercel + Supabase/Neon (recommended)

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/campaign-os.git
cd campaign-os
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | [Supabase](https://supabase.com) or [Neon](https://neon.tech) — free tier available |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [clerk.com](https://clerk.com) → Create application |
| `CLERK_SECRET_KEY` | Same as above |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |

### 3. Set up the database

```bash
npm run db:generate
npm run db:push
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add all environment variables from `.env.example`
4. Deploy

---

## Clerk Setup

In your Clerk dashboard:
- Enable **Google** and **Apple** social login (optional)
- Set **Redirect URLs**:
  - Sign-in: `https://your-domain.vercel.app/sign-in`
  - After sign-in: `https://your-domain.vercel.app/dashboard`
  - After sign-up: `https://your-domain.vercel.app/dashboard`

---

## Database Setup (Supabase recommended)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database → Connection string** → copy the URI
3. Paste into `DATABASE_URL` in `.env.local`
4. Run `npm run db:push`

---

## Roadmap

- [ ] Direct Gemini API integration for in-app image generation
- [ ] Campaign folders (bundle copy + images per drop)
- [ ] Export assets in platform-specific dimensions
- [ ] Hashtag generator
- [ ] A/B copy variants
- [ ] Multi-user team support
