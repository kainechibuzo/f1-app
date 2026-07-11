import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getLiveFixtures, getFixturesByDate, getStandings, COMMON_LEAGUES } from '../lib/apiFootball.js'
import StarButton from '../components/StarButton.jsx'
import './Matches.css'

const LIVE_POLL_MS = 20_000

function FixtureRow({ fixture }) {
  const { fixture: meta, teams, goals, league } = fixture
  const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(meta.status.short)
  const isFinished = meta.status.short === 'FT'

  return (
    <Link to={`/matches/${meta.id}`} className={`fixture-row ${isLive ? 'fixture-row--live' : ''}`}>
      <span className="fixture-row__league">{league.name}</span>
      <div className="fixture-row__main">
        <div className="fixture-row__team">
          <StarButton type="team" id={teams.home.id} name={teams.home.name} size="sm" />
          <span>{teams.home.name}</span>
        </div>
        <div className="fixture-row__score">
          {isFinished || isLive ? (
            <span>{goals.home ?? 0} – {goals.away ?? 0}</span>
          ) : (
            <span className="fixture-row__time">
              {new Date(meta.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <div className="fixture-row__team fixture-row__team--away">
          <span>{teams.away.name}</span>
          <StarButton type="team" id={teams.away.id} name={teams.away.name} size="sm" />
        </div>
      </div>
      <span className={`fixture-row__status ${isLive ? 'is-live' : ''}`}>
        {isLive ? `● ${meta.status.elapsed}'` : meta.status.short}
      </span>
    </Link>
  )
}

export default function Matches() {
  const [live, setLive] = useState([])
  const [today, setToday] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [leagueId, setLeagueId] = useState(COMMON_LEAGUES[0].id)
  const [standings, setStandings] = useState([])

  const loadFixtures = useCallback(async () => {
    try {
      const [liveData, todayData] = await Promise.all([getLiveFixtures(), getFixturesByDate()])
      setLive(liveData)
      setToday(todayData)
      setError(null)
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFixtures()
    const id = setInterval(loadFixtures, LIVE_POLL_MS)
    return () => clearInterval(id)
  }, [loadFixtures])

  useEffect(() => {
    const season = new Date().getFullYear()
    getStandings(leagueId, season)
      .then((res) => setStandings(res[0]?.league?.standings?.[0] ?? []))
      .catch((err) => console.error('Standings failed:', err.message))
  }, [leagueId])

  return (
    <>
      <div className="page-header container">
        <span className="eyebrow">Match center</span>
        <h1>Matches</h1>
        <p>Live scores refresh automatically. Tap any fixture for commentary, lineups, and stats.</p>
      </div>

      <div className="container">
        {error && (
          <div className="f1-alert">
            <p>Couldn't reach API-Football: {error}</p>
            <button className="btn btn-ghost" onClick={loadFixtures}>Retry</button>
          </div>
        )}

        <section className="matches-section">
          <h2 className="section-title" style={{ fontSize: '1.3rem' }}>
            {live.length > 0 ? `Live now (${live.length})` : 'Live now'}
          </h2>
          <div className="fixture-list">
            {loading && <p className="contact-note">Loading fixtures…</p>}
            {!loading && live.length === 0 && <p className="contact-note">Nothing kicking off right this second.</p>}
            {live.map((f) => <FixtureRow key={f.fixture.id} fixture={f} />)}
          </div>
        </section>

        <section className="matches-section">
          <h2 className="section-title" style={{ fontSize: '1.3rem' }}>Today</h2>
          <div className="fixture-list">
            {!loading && today.length === 0 && <p className="contact-note">No fixtures scheduled today.</p>}
            {today.slice(0, 12).map((f) => <FixtureRow key={f.fixture.id} fixture={f} />)}
          </div>
        </section>

        <section className="matches-section">
          <div className="standings-head">
            <h2 className="section-title" style={{ fontSize: '1.3rem' }}>League table</h2>
            <select value={leagueId} onChange={(e) => setLeagueId(Number(e.target.value))}>
              {COMMON_LEAGUES.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="table-wrap">
            <table className="transfers">
              <thead>
                <tr>
                  <th>#</th><th>Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row) => (
                  <tr key={row.team.id}>
                    <td className="fee">{row.rank}</td>
                    <td className="player">
                      <StarButton type="team" id={row.team.id} name={row.team.name} size="sm" /> {row.team.name}
                    </td>
                    <td>{row.all.played}</td>
                    <td>{row.all.win}</td>
                    <td>{row.all.draw}</td>
                    <td>{row.all.lose}</td>
                    <td>{row.goalsDiff}</td>
                    <td className="fee">{row.points}</td>
                  </tr>
                ))}
                {standings.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: '1.5rem', textAlign: 'center' }}>Loading table…</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  )
}
