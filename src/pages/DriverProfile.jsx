import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getDriverStandingsHistory, getDriverRecentResults } from '../lib/ergastF1.js'
import StarButton from '../components/StarButton.jsx'
import FormBadges from '../components/FormBadges.jsx'
import './DriverProfile.css'

function resultToCode(result) {
  const status = result.status
  if (status === 'Finished' || status.includes('Lap')) return `P${result.position}`
  return 'DNF'
}

export default function DriverProfile() {
  const { driverId } = useParams()
  const [history, setHistory] = useState([])
  const [recent, setRecent] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([getDriverStandingsHistory(driverId), getDriverRecentResults(driverId, 6)])
      .then(([hist, races]) => {
        setHistory(hist)
        setRecent(races.map((r) => resultToCode(r.Results[0])))
      })
      .catch((err) => {
        console.error(err)
        setError(err.message)
      })
  }, [driverId])

  if (error) return <div className="container page-header"><p>Couldn't load this driver: {error}</p></div>
  if (!history.length) return <div className="container page-header"><p>Loading driver…</p></div>

  const latest = history[history.length - 1]?.DriverStandings?.[0]
  const driver = latest?.Driver
  const careerWins = history.reduce((sum, s) => sum + Number(s.DriverStandings[0]?.wins ?? 0), 0)
  const careerPoints = history.reduce((sum, s) => sum + Number(s.DriverStandings[0]?.points ?? 0), 0)

  return (
    <>
      <div className="driver-hero container">
        <div className="driver-hero__title">
          <h1>{driver?.givenName} {driver?.familyName}</h1>
          <StarButton
            type="f1_driver"
            id={driverId}
            name={`${driver?.givenName} ${driver?.familyName}`}
            size="lg"
          />
        </div>
        <p className="contact-note">
          {driver?.nationality} · Born {driver?.dateOfBirth}
        </p>

        <div className="stat-grid" style={{ maxWidth: 420, marginTop: '1.25rem' }}>
          <div><strong>{careerWins}</strong><span>Career wins</span></div>
          <div><strong>{Math.round(careerPoints)}</strong><span>Career points</span></div>
          <div><strong>{history.length}</strong><span>Seasons</span></div>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <p className="contact-note" style={{ marginBottom: '0.5rem' }}>Recent form</p>
          <FormBadges results={recent} />
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '4rem' }}>
        <h2 className="section-title" style={{ fontSize: '1.2rem' }}>Season history</h2>
        <div className="table-wrap">
          <table className="transfers">
            <thead><tr><th>Season</th><th>Team</th><th>Position</th><th>Points</th><th>Wins</th></tr></thead>
            <tbody>
              {[...history].reverse().map((s) => {
                const row = s.DriverStandings[0]
                return (
                  <tr key={s.season}>
                    <td className="player">{s.season}</td>
                    <td>{row.Constructors[0]?.name}</td>
                    <td className="fee">{row.position}</td>
                    <td className="fee">{row.points}</td>
                    <td className="fee">{row.wins}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
