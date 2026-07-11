import { useEffect, useRef, useState } from 'react'
import './PitWall.css'

const COMPOUNDS = ['S', 'M', 'H']
const COMPOUND_LABEL = { S: 'Soft', M: 'Medium', H: 'Hard' }

function seedGrid(drivers) {
  return drivers.map((d, i) => ({
    code: d.code,
    name: d.name,
    team: d.team,
    position: i + 1,
    gap: i === 0 ? '—' : `+${(i * 1.4 + Math.random() * 2).toFixed(1)}s`,
    interval: i === 0 ? '—' : `+${(0.3 + Math.random() * 1.5).toFixed(1)}s`,
    compound: COMPOUNDS[Math.floor(Math.random() * COMPOUNDS.length)],
    lap: 0,
  }))
}

function jitter(grid) {
  return grid.map((row) => ({
    ...row,
    gap: row.position === 1 ? '—' : `+${Math.max(0.1, parseFloat(row.gap.replace(/[+s]/g, '')) + (Math.random() - 0.4)).toFixed(1)}s`,
    interval: row.position === 1 ? '—' : `+${Math.max(0.1, parseFloat(row.interval.replace(/[+s]/g, '')) + (Math.random() - 0.5) * 0.6).toFixed(1)}s`,
    lap: row.lap + 1,
  }))
}

/**
 * There is no free, legal, real-time F1 telemetry feed — timing data is
 * licensed by F1/Liberty Media. This renders a clearly-labeled simulated
 * pit wall so the layout and interaction model are ready to plug a real
 * feed into (e.g. a paid F1 live timing API) later.
 */
export default function PitWall({ drivers }) {
  const [grid, setGrid] = useState(() => seedGrid(drivers))
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setGrid((g) => jitter(g))
    }, 3000)
    return () => clearInterval(intervalRef.current)
  }, [])

  return (
    <div className="pitwall">
      <div className="pitwall__banner">SIMULATED — demo data, not live telemetry</div>
      <div className="table-wrap">
        <table className="transfers pitwall__table">
          <thead>
            <tr>
              <th>Pos</th><th>Driver</th><th>Team</th><th>Gap</th><th>Interval</th><th>Tire</th><th>Lap</th>
            </tr>
          </thead>
          <tbody>
            {grid.map((row) => (
              <tr key={row.code}>
                <td className="fee">{row.position}</td>
                <td className="player">{row.code} — {row.name}</td>
                <td>{row.team}</td>
                <td className="fee">{row.gap}</td>
                <td className="fee">{row.interval}</td>
                <td><span className={`tire tire--${row.compound}`}>{COMPOUND_LABEL[row.compound]}</span></td>
                <td className="fee">{row.lap}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
