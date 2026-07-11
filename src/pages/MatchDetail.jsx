import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
  getFixtureById,
  getFixtureEvents,
  getFixtureLineups,
} from '../lib/apiFootball.js'
import StarButton from '../components/StarButton.jsx'
import PredictionPoll from '../components/PredictionPoll.jsx'
import './MatchDetail.css'

const EVENT_ICON = {
  Goal: '⚽',
  Card: '🟨',
  subst: '🔁',
  Var: '📺',
}

export default function MatchDetail() {
  const { id } = useParams()
  const [fixture, setFixture] = useState(null)
  const [events, setEvents] = useState([])
  const [lineups, setLineups] = useState([])
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const [fixtureRes, eventsRes] = await Promise.all([
        getFixtureById(id),
        getFixtureEvents(id),
      ])
      setFixture(fixtureRes[0] ?? null)
      setEvents(eventsRes)
      setError(null)
    } catch (err) {
      console.error(err)
      setError(err.message)
    }
  }, [id])

  useEffect(() => {
    load()
    getFixtureLineups(id).then(setLineups).catch((err) => console.error('Lineups failed:', err.message))
  }, [id, load])

  useEffect(() => {
    if (!fixture) return undefined
    const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(fixture.fixture.status.short)
    if (!isLive) return undefined
    const interval = setInterval(load, 20_000)
    return () => clearInterval(interval)
  }, [fixture, load])

  if (error) {
    return (
      <div className="container page-header">
        <p>Couldn't load this match: {error}</p>
      </div>
    )
  }

  if (!fixture) {
    return <div className="container page-header"><p>Loading match…</p></div>
  }

  const { teams, goals, fixture: meta, league } = fixture
  const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(meta.status.short)
  const isUpcoming = meta.status.short === 'NS'

  return (
    <>
      <div className="match-hero container">
        <span className="eyebrow">{league.name} &middot; {league.round}</span>
        <div className="match-hero__score">
          <div className="match-hero__team">
            <StarButton type="team" id={teams.home.id} name={teams.home.name} />
            <span>{teams.home.name}</span>
          </div>
          <div className="match-hero__center">
            <span className="match-hero__goals">{goals.home ?? '–'} : {goals.away ?? '–'}</span>
            <span className={`match-hero__status ${isLive ? 'is-live' : ''}`}>
              {isLive ? `LIVE · ${meta.status.elapsed}'` : meta.status.long}
            </span>
          </div>
          <div className="match-hero__team match-hero__team--away">
            <span>{teams.away.name}</span>
            <StarButton type="team" id={teams.away.id} name={teams.away.name} />
          </div>
        </div>
      </div>

      <div className="container match-grid">
        <div className="match-timeline">
          <h2 className="section-title" style={{ fontSize: '1.2rem' }}>Commentary</h2>
          {events.length === 0 && <p className="contact-note">No events yet — check back once kickoff happens.</p>}
          <ul className="timeline">
            {[...events].reverse().map((ev, i) => (
              <li key={i} className="timeline__item">
                <span className="timeline__minute">{ev.time.elapsed}'</span>
                <span className="timeline__icon">{EVENT_ICON[ev.type] ?? '•'}</span>
                <span className="timeline__body">
                  <strong>{ev.player?.name ?? ev.type}</strong> — {ev.detail} ({ev.team.name})
                </span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="match-side">
          {(isUpcoming || isLive) && (
            <PredictionPoll
              eventType="fixture"
              eventId={meta.id}
              question="Who wins this one?"
              options={[
                { value: 'home', label: teams.home.name },
                { value: 'draw', label: 'Draw' },
                { value: 'away', label: teams.away.name },
              ]}
            />
          )}

          {lineups.length > 0 && (
            <div className="lineups">
              <h3>Lineups</h3>
              {lineups.map((side) => (
                <div key={side.team.id} className="lineup-side">
                  <p className="lineup-side__team">{side.team.name} · {side.formation}</p>
                  <ul>
                    {side.startXI.map(({ player }) => (
                      <li key={player.id}>{player.number}. {player.name}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
