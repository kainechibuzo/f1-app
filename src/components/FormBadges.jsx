import './FormBadge.css'

const FOOTBALL_COLOR = { W: 'good', D: 'neutral', L: 'bad' }

function resultTone(result) {
  if (FOOTBALL_COLOR[result]) return FOOTBALL_COLOR[result]
  if (result === 'DNF' || result === 'DNS') return 'bad'
  const pos = parseInt(result.replace('P', ''), 10)
  if (Number.isNaN(pos)) return 'neutral'
  if (pos === 1) return 'good'
  if (pos <= 3) return 'good'
  if (pos <= 10) return 'neutral'
  return 'bad'
}

/** results: array of short codes, e.g. ['W','W','D','L','W'] or ['P1','P3','DNF','P2'] */
export default function FormBadges({ results = [] }) {
  if (!results.length) return null
  return (
    <div className="form-badges">
      {results.map((r, i) => (
        <span key={i} className={`form-badge form-badge--${resultTone(r)}`}>
          {r}
        </span>
      ))}
    </div>
  )
}
