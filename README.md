# Belfast Cocktail Club — real shared-group MVP

A mobile-first, deployable **Next.js + Supabase** app for a **14-member WhatsApp group** attending Belfast Cocktail Week, 6–15 November 2026.

## Features

- Shared private invite URL; first name and optional style/food preference; no user accounts.
- Maximum 14 joined members (a basic count cap, not a transactional hard limit under simultaneous joins).
- 10 quick-pick cards from the **36 verified participating venue names**; members can change their selections.
- Votes stored centrally in Supabase, with an automatically refreshed group leaderboard (every 8 seconds).
- Organiser-only generation of a five-stop trail using the group votes; optionally uses OpenAI, with a deterministic vote-based fallback.
- Walking directions via Google Maps and WhatsApp-ready sharing using the phone's share sheet.
- Signed-in member sessions stored only on that device in `localStorage`.

## Deploy (requires your own accounts)

1. Create a Supabase project. In **SQL Editor**, execute `supabase/schema.sql`.
2. Copy your Supabase project URL and the server-side secret key from **Project Settings → API Keys**. For local development, create `.env.local` and set `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, a long random `GROUP_INVITE_CODE`, and a **different** long random `ADMIN_CODE`. Keep credentials and codes in environment variables. Optionally set `OPENAI_API_KEY` and `OPENAI_MODEL`.
3. Install dependencies with `npm install` and run `npm run dev`. Visit `http://localhost:3000/?invite=YOUR_GROUP_INVITE_CODE`.
4. Deploy the repository to Vercel as a Next.js project and add the same environment variables in Vercel project settings. Redeploy after changing env values.
5. Share `https://YOUR-DOMAIN/?invite=YOUR_GROUP_INVITE_CODE` in the WhatsApp group. Each friend opens the same URL, enters their first name and votes. The organiser opens the **Trail** tab and enters `ADMIN_CODE` to publish a group itinerary.

## Important operational points

- **This ZIP is source code, not a live deployed service**. Sharing a local HTML file will *not* create shared votes. A functioning hosted app needs Supabase and a Next.js host.
- A 14-person group is implemented as a best-effort limit for this personal MVP, not a robust concurrent reservation system. If two people join simultaneously as the last member, both could be accepted; add a transactional DB function for strict enforcement. There is no remove-member UI yet.
- The invite code is a bearer secret; anyone with the link can join until group capacity is reached. Rotate it if leaked. A member token on the device enables vote updates. For a public product, add proper sign-in, rate limiting and stronger abuse protection.
- The leaderboard counts **positive votes**, not unique members who have completed all ten choices. Guests may vote on any of the 36 only in future expanded UI; this MVP quickly votes on ten featured venues.
- The AI receives only allowed venue IDs, known area/address, and aggregated preferences/vote totals. The response is validated against the provided candidates. If the API fails or is unset, the app still generates a simple top-voted shortlist.
- Route order is **not** optimised against a walking-distance API. Google Maps calculates directions when opened. Do not promise a walk time or capacity based on this app.
- Exact signature drink names and prices are not universally available here: missing fields are identified as unverified rather than fabricated. Group capacity and opening times have not been checked.
- Venue names sourced from https://cocktailweekbelfast.co.uk/ (official November 2026 list); known venue addresses and attributes were cross-checked against Aircoach's Belfast Cocktail Week event guide. Selected cocktail names were reported by the event's Fatsoma listing.
- Only use for adults of legal drinking age. Consider a moderation-friendly/non-alcoholic option if expanding.

## Testing

- `npm run check` for TypeScript validation.
- `npm run build` for a production build once dependencies are installed.
- To test group behaviour: open two private browsers using the **same** invite link; join with different names, vote, and watch the results refresh automatically. Publish a trail with the admin code and verify it appears on the other device within 8 seconds.

## Security architecture

Supabase tables have RLS enabled with **no public access policies**. All reads/writes run through server-side Next.js API routes using the Supabase secret key. The routes validate a 256-bit random member token by comparing its SHA-256 digest with the database. Only aggregate vote totals are returned. No full list of member names is exposed via the leaderboard. In production, add per-IP and per-group request rate limiting, monitoring, recovery and removal workflows, and appropriate data-retention controls.
