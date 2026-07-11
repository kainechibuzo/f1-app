import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getNextRace,
  getSeasonSchedule,
  getDriverStandings,
  getConstructorStandings,
} from '../lib/ergastF1.js'
import StarButton from '../components/StarButton.jsx'
import PitWall from '../components/PitWall.jsx'
import PredictionPoll from '../components/PredictionPoll.jsx'
import F1News from '../components/F1News.jsx'
import './F1Page.css'

function useCountdown(targetDate) {
  const [remaining, setRemaining] = useState(null)

  useEffect(() => {
    if (!targetDate) return undefined
    const tick = () => {
      const diff = new Date(targetDate) - new Date()
      if (diff <= 0) {
        setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, live: true })
        return
      }
      setRemaining({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff / 3_600_000) % 24),
        minutes: Math.floor((diff / 60_000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        live: false,
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return remaining
}

export default function F1Page() {
  const [nextRace, setNextRace] = useState(null)
  const [schedule, setSchedule] = useState([])
  const [drivers, setDrivers] = useState([])
  const [constructors, setConstructors] = useState([])
  const [error, setError] = useState(null)

  const raceDateTime = nextRace ? `${nextRace.date}T${nextRace.time || '00:00:00Z'}` : null
  const countdown = useCountdown(raceDateTime)

  useEffect(() => {
    Promise.all([getNextRace(), getSeasonSchedule(), getDriverStandings(), getConstructorStandings()])
      .then(([next, races, ds, cs]) => {
        setNextRace(next)
        setSchedule(races)
        setDrivers(ds)
        setConstructors(cs)
      })
      .catch((err) => {
        console.error(err)
        setError(err.message)
      })
  }, [])

  const isRaceWeekend =
    raceDateTime && Math.abs(new Date(raceDateTime) - new Date()) < 36 * 3_600_000

  const pitWallDrivers = drivers.slice(0, 10).map((d) => ({
    code: d.Driver.code || d.Driver.familyName.slice(0, 3).toUpperCase(),
    name: `${d.Driver.givenName} ${d.Driver.familyName}`,
    team: d.Constructors[0]?.name ?? '',
  }))

  return (
    <>
      <div className="page-header container">
        <span className="eyebrow">Formula 1</span>
        <h1>Race Hub</h1>
        <p>Next Grand Prix, the championship fight, and every headline from the paddock.</p>
      </div>

      {error && (
        <div className="container">
          <div className="f1-alert">
            <p>Couldn't reach the F1 data feed: {error}</p>
          </div>
        </div>
      )}

      <div className="container f1hub-grid">
        <div className="f1hub-next">
          {nextRace ? (
            <>
              <span className="eyebrow">Next race</span>
              <h2 className="section-title" style={{ fontSize: '1.6rem' }}>{nextRace.raceName}</h2>
              <p className="contact-note">
                {nextRace.Circuit.circuitName} · {nextRace.Circuit.Location.locality}, {nextRace.Circuit.Location.country}
              </p>
              {countdown && !countdown.live && (
                <div className="countdown">
                  <div><strong>{countdown.days}</strong><span>days</span></div>
                  <div><strong>{countdown.hours}</strong><span>hrs</span></div>
                  <div><strong>{countdown.minutes}</strong><span>min</span></div>
                  <div><strong>{countdown.seconds}</strong><span>sec</span></div>
                </div>
              )}
              {countdown?.live && <p className="race-live-badge">Race weekend is here</p>}

              {drivers.length >= 3 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <PredictionPoll
                    eventType="race"
                    eventId={nextRace.round}
                    question="Who wins the Grand Prix?"
                    options={drivers.slice(0, 5).map((d) => ({
                      value: d.Driver.driverId,
                      label: `${d.Driver.givenName} ${d.Driver.familyName}`,
                    }))}
                  />
                </div>
              )}
            </>
          ) : (
            <p className="contact-note">Loading next race…</p>
          )}
        </div>

        <div className="f1hub-schedule">
          <h3>Season schedule</h3>
          <ul className="schedule-list">
            {schedule.map((r) => (
              <li key={r.round} className={r.round === nextRace?.round ? 'is-next' : ''}>
                <span className="fee">R{r.round}</span>
                <span>{r.raceName}</span>
                <span className="contact-note">{r.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {pitWallDrivers.length > 0 && (
        <div className="container" style={{ paddingBottom: '2rem' }}>
          <h2 className="section-title" style={{ fontSize: '1.3rem' }}>
            Pit Wall {isRaceWeekend ? '· Race weekend' : '· Preview'}
          </h2>
          <PitWall drivers={pitWallDrivers} />
        </div>
      )}

      <div className="container f1hub-standings">
        <div>
          <h3>Driver standings</h3>
          <div className="table-wrap">
            <table className="transfers">
              <thead><tr><th>#</th><th>Driver</th><th>Team</th><th>Pts</th></tr></thead>
              <tbody>
                {drivers.map((d) => (
                  <tr key={d.Driver.driverId}>
                    <td className="fee">{d.position}</td>
                    <td className="player">
                      <StarButton
                        type="f1_driver"
                        id={d.Driver.driverId}
                        name={`${d.Driver.givenName} ${d.Driver.familyName}`}
                        size="sm"
                      />{' '}
                      <Link to={`/drivers/${d.Driver.driverId}`}>
                        {d.Driver.givenName} {d.Driver.familyName}
                      </Link>
                    </td>
                    <td>{d.Constructors[0]?.name}</td>
                    <td className="fee">{d.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3>Constructor standings</h3>
          <div className="table-wrap">
            <table className="transfers">
              <thead><tr><th>#</th><th>Team</th><th>Pts</th></tr></thead>
              <tbody>
                {constructors.map((c) => (
                  <tr key={c.Constructor.constructorId}>
                    <td className="fee">{c.position}</td>
                    <td className="player">
                      <StarButton type="f1_team" id={c.Constructor.constructorId} name={c.Constructor.name} size="sm" />{' '}
                      {c.Constructor.name}
                    </td>
                    <td className="fee">{c.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <F1News />
    </>
  )
}
