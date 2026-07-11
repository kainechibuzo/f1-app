# James Sports Official — React

A rebuilt version of the James Sports Official site: Home, Transfers (searchable/sortable table),
News, Analysis, Contact, and a new **live F1 News** feed.

## F1 News feature

`src/components/F1News.jsx` is the piece you asked for, rewritten the React way:

- Fetches `https://news.google.com/rss/search?q=Formula+1+news&hl=en-US&gl=US&ceid=US:en`
  through the `api.allorigins.win` CORS proxy.
- Parses the XML response with `DOMParser` and extracts `title`, `link`, `pubDate`, and `source`
  for up to 30 items.
- Renders into `<div id="f1-news-container">`, showing the first 6 articles with a **View more**
  button that reveals the rest (and collapses back down).
- Handles loading (skeleton cards), empty, and error states (with a retry button), since the
  public proxy can occasionally rate-limit or time out.

If you outgrow the free proxy, swap `PROXY_URL` in `F1News.jsx` for your own small serverless
function that fetches and returns the RSS XML — same shape (`{ contents: "<xml>" }`), same parsing
code.

## New: live data, profiles, favorites, predictions

- **Matches hub** (`/matches`) — live scores (polls every 20s), today's fixtures, a league table
  browser. Fixture rows link to a full match page.
- **Match detail** (`/matches/:id`) — score, a live commentary timeline (goals/cards/subs),
  starting lineups, and a home/draw/away prediction poll.
- **F1 Race Hub** (`/f1`) — next-race countdown, season schedule, driver + constructor
  standings, a race-winner prediction poll, and the F1 News feed. All from the free **Ergast API**
  (no key needed), proxied through allorigins the same way as the news feed.
- **Pit Wall** — a simulated live-timing board (positions, gaps, tire compounds) on the F1 hub.
  **This is demo data, clearly labeled in the UI.** No free/legal real-time F1 telemetry feed
  exists — that data is licensed by F1/Liberty Media. Swap `src/components/PitWall.jsx`'s
  `seedGrid`/`jitter` functions for a real feed if you get access to one.
- **Player profiles** (`/players/:id`) and **driver profiles** (`/drivers/:driverId`) — season
  stats, career totals, and recent form badges (W-D-L / P1-P3-DNF).
- **Favorites** (`/favorites`, the ★ star buttons everywhere) — backed by Supabase, keyed to an
  anonymous device id in `localStorage` (swap for real auth later, see `supabaseClient.js`).
- **Prediction polls** — vote on match/race outcomes, results stored and tallied in Supabase.

### Data sources at a glance

| Feature | Source | Auth |
|---|---|---|
| Live scores, events, lineups, standings, player stats | API-Football | `VITE_API_FOOTBALL_KEY` |
| F1 schedule, results, driver/constructor standings | Ergast API (via allorigins proxy) | none |
| F1 News | Google News RSS (via allorigins proxy) | none |
| Favorites, predictions | Supabase | `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` |
| Pit Wall | Simulated — no live source exists for free | — |

### Setup

1. `cp .env.example .env` and fill in your API-Football key and Supabase project URL/anon key.
2. In the Supabase SQL editor, run `supabase/schema.sql` to create the `favorites` and
   `predictions` tables (with permissive RLS policies suited to anonymous device ids — tighten
   these once you add real user auth).
3. `npm install && npm run dev`.

### API-Football rate limits

The free tier is roughly 100 requests/day. `src/lib/apiFootball.js` caches identical requests in
memory (15s–5min TTLs depending on how fast the data changes) so a page sitting open polling live
scores doesn't burn through your quota faster than it needs to. If you're testing heavily, bump
the TTLs up.

## Running locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
```

## Structure

```
src/
  components/   Navbar, Footer, F1News, StarButton, FormBadges, PredictionPoll, PitWall
  context/      FavoritesContext (Supabase-backed)
  lib/          apiFootball.js, ergastF1.js, supabaseClient.js
  pages/        Home, Matches, MatchDetail, Transfers, News, F1Page (Race Hub),
                PlayerProfile, DriverProfile, Analysis, Favorites, Contact
  App.jsx       Routes
  index.css     Design tokens (dark background, crimson accent, mono for data/timestamps)
supabase/
  schema.sql    Run in the Supabase SQL editor
```
