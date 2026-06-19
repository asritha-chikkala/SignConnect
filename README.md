# SignConnect

Production-style AI accessibility platform for real-time Indian Sign Language communication.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS + Framer Motion
- Supabase Auth/PostgreSQL + Google OAuth
- Grok API + Deepgram + Neo4j AuraDB integration points
- Three.js + `@pixiv/three-vrm` avatar stage
- IndexedDB offline caching and `next-pwa`

## Key Features

- Futuristic landing experience and startup-grade UI
- Real-time translator (`/translator`) with hierarchical fallback:
  1. Dictionary lookup
  2. Semantic mapping
  3. Fingerspelling fallback
- Sentiment-aware avatar/UI behavior
- Offline emergency panel (`/emergency`)
- Practice recap mode (`/practice`)
- Scripted autoplay demo (`/demo`)
- Protected dashboard (`/dashboard`)

## Setup

1. Install dependencies:
   - `npm install`
2. Configure env:
   - create `.env.local` from `.env.example`
3. Run:
   - `npm run dev`

## Deployment (Vercel)

1. Import project in Vercel
2. Set env variables from `.env.example`
3. Deploy with default Next.js settings

## Structure

- `app` routes and API handlers
- `components` UI and avatar modules
- `lib` shared logic (fallback/auth clients)
- `services` external API adapters
- `hooks`, `types`, `data`, `docs`, `mobile`
