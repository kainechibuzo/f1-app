import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext.jsx'
import { getUpcomingFixturesForTeam } from '../lib/apiFootball.js'
import StarButton from '../components/StarButton.jsx'
import './Favorites.css'

const GROUP_LABEL = {
  team: 'Football clubs',
  league: 'Leagues',
  player: 'Players',
  f1_driver: 'F1 drivers',
  f1_team: 'F1 teams',
}

function TeamUpcoming({ teamId }) {
  const [fixtures, setFixtures] = useState(null)

  useEffect(() => {
    getUpcomingFixturesForTeam(teamId, 2)
      .then(setFixtures)
      .catch(() => setFixtures([]))
  }, [teamId])

  if (fixtures === null) return <p className="contact-note">Loading fixtures…</p>
  if (fixtures.length === 0) return <p className="contact-note">No upcoming fixtures found.</p>

  return (
    <ul className="fav-fixtures">
      {fixtures.map((f) => (
        <li key={f.fixture.id}>
          <Link to={`/matches/${f.fixture.id}`}>
            {f.teams.home.name} vs {f.teams.away.name}
          </Link>
          <span className="contact-note">
            {new Date(f.fixture.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function Favorites() {
  const { favorites, loading, removeFavorite } = useFavorites()

  const grouped = favorites.reduce((acc, f) => {
    acc[f.entity_type] = acc[f.entity_type] || []
    acc[f.entity_type].push(f)
    return acc
  }, {})

  return (
    <>
      <div className="page-header container">
        <span className="eyebrow">Your dashboard</span>
        <h1>My Team</h1>
        <p>Everything you've starred across clubs, players, and F1, in one feed.</p>
      </div>

      <div className="container" style={{ paddingBottom: '4rem' }}>
        {loading && <p className="contact-note">Loading your favorites…</p>}

        {!loading && favorites.length === 0 && (
          <div className="info-card" style={{ marginTop: '2rem' }}>
            <h3>Nothing starred yet</h3>
            <p>
              Tap the ☆ next to any team, player, or driver on the Matches, F1, or profile pages to
              add it here.
            </p>
          </div>
        )}

        {Object.entries(grouped).map(([type, items]) => (
          <section key={type} className="fav-group">
            <h2 className="section-title" style={{ fontSize: '1.2rem' }}>{GROUP_LABEL[type] ?? type}</h2>
            <div className="fav-list">
              {items.map((f) => (
                <div className="info-card fav-card" key={f.id}>
                  <div className="fav-card__head">
                    <h3>{f.entity_name}</h3>
                    <StarButton type={f.entity_type} id={f.entity_id} name={f.entity_name} size="sm" />
                  </div>
                  {f.entity_type === 'team' && <TeamUpcoming teamId={f.entity_id} />}
                  {f.entity_type === 'f1_driver' && (
                    <Link to={`/drivers/${f.entity_id}`} className="btn btn-ghost" style={{ marginTop: '0.5rem' }}>
                      View driver →
                    </Link>
                  )}
                  {f.entity_type === 'player' && (
                    <Link to={`/players/${f.entity_id}`} className="btn btn-ghost" style={{ marginTop: '0.5rem' }}>
                      View player →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
