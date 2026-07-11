// Ergast doesn't send CORS headers for browser fetches, so we route through
// the same allorigins proxy used for the F1 News RSS feed. The `raw`
// endpoint (rather than `get`) passes the JSON straight through.
const ERGAST_BASE = 'https://ergast.com/api/f1'
const PROXY = 'https://api.allorigins.win/raw?url='

async function ergast(path) {
  const target = encodeURIComponent(`${ERGAST_BASE}${path}?format=json`)
  const res = await fetch(`${PROXY}${target}`)
  if (!res.ok) {
    throw new Error(`Ergast request failed (${res.status}) for ${path}`)
  }
  const json = await res.json()
  return json.MRData
}

/** Full current-season race calendar. */
export async function getSeasonSchedule() {
  const data = await ergast('/current')
  return data.RaceTable.Races
}

/** The next race on the calendar, or null if the season has finished. */
export async function getNextRace() {
  const races = await getSeasonSchedule()
  const now = new Date()
  return races.find((r) => new Date(`${r.date}T${r.time || '00:00:00Z'}`) > now) ?? null
}

/** Current driver standings. */
export async function getDriverStandings() {
  const data = await ergast('/current/driverStandings')
  return data.StandingsTable.StandingsLists[0]?.DriverStandings ?? []
}

/** Current constructor standings. */
export async function getConstructorStandings() {
  const data = await ergast('/current/constructorStandings')
  return data.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? []
}

/** A driver's last N race results — powers the P3-P1-DNF form badge. */
export async function getDriverRecentResults(driverId, limit = 5) {
  const data = await ergast(`/drivers/${driverId}/results`)
  const races = data.RaceTable.Races
  return races.slice(-limit).reverse()
}

/** Full career summary for a driver: wins, podiums, poles, points. */
export async function getDriverStandingsHistory(driverId) {
  const data = await ergast(`/drivers/${driverId}/driverStandings`)
  return data.StandingsTable.StandingsLists
}

/** Results for a specific completed race (season + round). */
export async function getRaceResults(season, round) {
  const data = await ergast(`/${season}/${round}/results`)
  return data.RaceTable.Races[0] ?? null
}
