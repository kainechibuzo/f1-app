import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { getPlayerStats } from '../lib/apiFootball.js'
import StarButton from '../components/StarButton.jsx'
import './PlayerProfile.css'

export default function PlayerProfile() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const season = searchParams.get('season') || new Date().getFullYear()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getPlayerStats(id, season)
      .then((res) => setData(res[0] ?? null))
      .catch((err) => {
        console.error(err)
        setError(err.message)
      })
  }, [id, season])

  if (error) return <div className="container page-header"><p>Couldn't load this player: {error}</p></div>
  if (!data) return <div className="container page-header"><p>Loading player…</p></div>

  const { player, statistics } = data

  return (
    <>
      <div className="player-hero container">
        <img src={player.photo} alt={player.name} className="player-hero__photo" />
        <div>
          <div className="player-hero__title">
            <h1>{player.name}</h1>
            <StarButton type="player" id={player.id} name={player.name} size="lg" />
          </div>
          <p className="contact-note">
            {player.nationality} · Age {player.age} · {player.height} · {player.weight}
          </p>
          <div className="season-switch">
            {[Number(season) - 1, Number(season), Number(season) + 1].map((yr) => (
              <button
                key={yr}
                className={`btn btn-ghost ${String(yr) === String(season) ? 'is-active' : ''}`}
                onClick={() => setSearchParams({ season: yr })}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container media-grid" style={{ paddingTop: '2rem' }}>
        {statistics.map((s, i) => (
          <div className="info-card" key={i}>
            <h3>{s.team.name} · {s.league.name}</h3>
            <div className="stat-grid">
              <div><strong>{s.games.appearences ?? 0}</strong><span>Apps</span></div>
              <div><strong>{s.goals.total ?? 0}</strong><span>Goals</span></div>
              <div><strong>{s.goals.assists ?? 0}</strong><span>Assists</span></div>
              <div><strong>{s.games.rating ? Number(s.games.rating).toFixed(1) : '—'}</strong><span>Rating</span></div>
              <div><strong>{s.passes.accuracy ?? '—'}</strong><span>Pass %</span></div>
              <div><strong>{s.shots.total ?? 0}</strong><span>Shots</span></div>
            </div>
          </div>
        ))}
        {statistics.length === 0 && <p className="contact-note">No stats available for {season}.</p>}
      </div>
    </>
  )
}
