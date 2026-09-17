# Our Lists

### A scrapbook for our Adventures.

A private life planner for Nicholas and Mae Frost. Built with Next.js, React, TypeScript, Supabase and Vercel. Forest green, parchment, warm brown, personal photographs, and interactive maps.

## Local preview

Install dependencies with `npm install`, then `npm run dev`. Open http://127.0.0.1:3000. Personalized `data/initial-store.json`, `data/inspirations.json`, and `supabase/seed.sql` are private local files excluded from Git. A fresh clone starts with an empty scrapbook until the private data is restored or Supabase is connected. Local mode saves changes to `data/local-store.json` and photos to `private/photos/`. Both are excluded from Git. This mode only accepts requests to loopback hosts; it is not a substitute for remote authentication.

## Private online setup

1. Create a Supabase project. Create or invite exactly two Authentication users (Nicholas and Mae). Disable public signups. Add the deployed URL to the Auth site URL and redirect allowlist.
2. Run `supabase/schema.sql`; insert each user's UUID into `members` using the commented example. Row-level security protects the scrapbook and private photo bucket.
3. With the local preview running, run `node scripts/prepare-seed.mjs`. Review and run the generated `supabase/seed.sql`. This snapshots current local data and uses `ON CONFLICT DO NOTHING` to avoid replacing existing remote memories.
4. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` temporarily in your terminal, then run `node scripts/upload-photos.mjs` to migrate optimized photos. Never commit this key or add it to browser variables. Clear it afterward.
5. Import the GitHub repository into Vercel. Set `SUPABASE_URL`, `SUPABASE_ANON_KEY` (anon/publishable key only), and `REQUIRE_AUTH=true`. Deploy. Hosted instances fail closed when authentication is unconfigured.
6. Sign in with each invited email and verify saving from both devices. API writes use revision checks to protect concurrent updates; the interface refreshes every 20 seconds. Same-record editing should be coordinated between the two of you.

## What works

- Phone home-screen icon and standalone display metadata (online use; no offline sync).
- Quick add, editable categories and statuses, personal/shared goals, source links, dates, photos, favorites and linked plans.
- Countdown to October 10, 2026 at 4:30 p.m. America/Chicago (UTC−05:00 at that date), then elapsed married time.
- Interactive state and world maps, national park checklist, dated visit notes, before/after wedding filters.
- Five Colorado 14ers, hiking logs that count repeat visits, AllTrails/external map links.
- White-through-black BJJ belt milestones, strength logs, Mae's customizable goals.
- Recipe notes, wines, restaurant and accommodation ideas, savings contributions and monthly targets.
- Scrapbook with supplied photographs and nine undated prior adventure chapters.
- JSON export for lists; original photos remain in storage and should be backed up separately.

## Content provenance and current limitations

48 unique Instagram URLs were supplied after repairing one combined URL and removing duplicates. All links were opened for review. 46 were categorized from accessible captions and, where useful, visible reel content. Two originals redirected to unrelated reels; those remain in the inspiration inbox marked unavailable. Entries retain the original links, creator attribution and short summaries. A reviewed caption is not verification of current prices, availability, trail conditions or every video detail. Unnamed properties and routes are explicitly left unidentified. Personal imports live in ignored data/inspirations.json. External recipe/AllTrails pages are linked, not scraped automatically.
National parks: NPS National Park System list, https://www.nps.gov/aboutus/national-park-system.htm (63 main national parks, retrieved 2026-09-16). Map shapes: world-atlas (Natural Earth) and us-atlas (US Census), generated with d3-geo; map datasets include the source's geographic entities and boundaries, not a definitive political country count. Trails: https://www.14ers.com/easiest-14ers. Approximate distances assume listed trailhead access and dry summer routes. Personal photo dates and locations are not inferred.

## Checks

`npm run typecheck` and `npm run build`. Cloud credentials, production RLS, authentication email delivery and cross-device sync must be verified against the actual Supabase project before calling the online version complete.
