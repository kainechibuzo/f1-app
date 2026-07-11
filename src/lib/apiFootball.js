const HOST = import.meta.env.VITE_API_FOOTBALL_HOST || 'v3.football.api-sports.io'
const KEY = import.meta.env.VITE_API_FOOTBALL_KEY
const BASE_URL = HOST.includes('rapidapi') ? `https://${HOST}` : `https://${HOST}`

const cache = new Map() // key -> { at: number, data: any }

function cacheKey(path, params) {
  return `${path}?${new URLSearchParams(params).toString()}`
}

/**
 * Thin fetch wrapper for API-Football (works with either the direct
 * api-sports.io host or the RapidAPI-proxied host — headers differ slightly).
 * `ttlMs` caches identical requests in memory so a busy screen (e.g. a live
 * match page polling every 60s) doesn't burn through the free daily quota
 * any faster than necessary.
 */
async function apiFootball(path, params = {}, ttlMs = 30_000) {
  if (!KEY) {
    throw new Error('Missing VITE_API_FOOTBALL_KEY — add it to your .env file.')
  }

  const key = cacheKey(path, params)
  const cached = cache.get(key)
  if (cached && Date.now() - cached.at < ttlMs) {
    return cached.data
  }

  const url = new URL(`${BASE_URL}${path}`)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
  })

  const headers = HOST.includes('rapidapi')
    ? { 'x-rapidapi-key': KEY, 'x-rapidapi-host': HOST }
    : { 'x-apisports-key': KEY }

  const res = await fetch(url.toString(), { headers })
  if (!res.ok) {
    throw new Error(`API-Football request failed (${res.status}) for ${path}`)
  }

  const json = await res.json()
  if (json.errors && Array.isArray(json.errors) ? json.errors.length : Object.keys(json.errors || {}).length) {
    throw new Error(`API-Football error: ${JSON.stringify(json.errors)}`)
  }

  cache.set(key, { at: Date.now(), data: json.response })
  return json.response
}

/** All fixtures currently live, across every league. Poll this on the Matches hub. */
export function getLiveFixtures() {
  return apiFootball('/fixtures', { live: 'all' }, 15_000)
}

/** Fixtures for a given calendar date (defaults to today, local ISO date). */
export function getFixturesByDate(date = new Date().toISOString().slice(0, 10)) {
  return apiFootball('/fixtures', { date }, 60_000)
}

/** A single fixture by id — score, status, venue, teams. */
export function getFixtureById(fixtureId) {
  return apiFootball('/fixtures', { id: fixtureId }, 15_000)
}

/** Goals, cards, subs, VAR — the live commentary timeline for a match. */
export function getFixtureEvents(fixtureId) {
  return apiFootball('/fixtures/events', { fixture: fixtureId }, 15_000)
}

/** Starting XI + formation for both sides. */
export function getFixtureLineups(fixtureId) {
  return apiFootball('/fixtures/lineups', { fixture: fixtureId }, 60_000)
}

/** Shots, possession, corners, xG (where available) for a fixture. */
export function getFixtureStatistics(fixtureId) {
  return apiFootball('/fixtures/statistics', { fixture: fixtureId }, 30_000)
}

/** League table for a competition + season. */
export function getStandings(leagueId, season) {
  return apiFootball('/standings', { league: leagueId, season }, 5 * 60_000)
}

/** Season stats for a single player (goals, assists, xG, pass accuracy, etc). */
export function getPlayerStats(playerId, season) {
  return apiFootball('/players', { id: playerId, season }, 5 * 60_000)
}

/** Search players/teams by name — used for the favorites picker. */
export function searchTeams(name) {
  return apiFootball('/teams', { search: name }, 5 * 60_000)
}

export function searchPlayers(name) {
  return apiFootball('/players/profiles', { search: name }, 5 * 60_000)
}

/** Recent finished fixtures for a team — powers the W-D-L form badge. */
export function getTeamForm(teamId, last = 5) {
  return apiFootball('/fixtures', { team: teamId, last }, 5 * 60_000)
}

/** Next N upcoming fixtures for a team — used on the favorites dashboard. */
export function getUpcomingFixturesForTeam(teamId, next = 3) {
  return apiFootball('/fixtures', { team: teamId, next }, 60_000)
}

/** Turn a finished fixture + team id into a 'W' | 'D' | 'L' code. */
export function resultCodeForTeam(fixture, teamId) {
  const homeId = fixture.teams.home.id
  const isHome = homeId === teamId
  const homeGoals = fixture.goals.home
  const awayGoals = fixture.goals.away
  if (homeGoals === null || awayGoals === null) return null
  if (homeGoals === awayGoals) return 'D'
  const teamWon = isHome ? homeGoals > awayGoals : awayGoals > homeGoals
  return teamWon ? 'W' : 'L'
}

export const COMMON_LEAGUES = [
  { id: 39, name: 'Premier League', country: 'England' },
  { id: 140, name: 'La Liga', country: 'Spain' },
  { id: 135, name: 'Serie A', country: 'Italy' },
  { id: 78, name: 'Bundesliga', country: 'Germany' },
  { id: 61, name: 'Ligue 1', country: 'France' },
  { id: 2, name: 'Champions League', country: 'Europe' },
]
