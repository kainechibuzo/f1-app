import { useMemo, useState } from 'react'

const TRANSFERS = [
  { player: 'Alexander Isak', from: 'Newcastle United', to: 'Liverpool', fee: 125, contract: '6 years', pos: 'FW', status: 'Official', date: '2025-08-01', notes: 'Record Premier League fee' },
  { player: 'Benjamin Šeško', from: 'RB Leipzig', to: 'Manchester United', fee: 66.2, contract: '5 years', pos: 'FW', status: 'Official', date: '2025-08-01', notes: '' },
  { player: 'Florian Wirtz', from: 'Bayer Leverkusen', to: 'Liverpool', fee: 100, contract: '5 years', pos: 'MF', status: 'Official', date: '2025-08-02', notes: 'Highly sought after' },
  { player: 'Rayan Aït-Nouri', from: 'Wolves', to: 'Manchester City', fee: 31.8, contract: '5 years', pos: 'DF', status: 'Official', date: '2025-08-02', notes: '' },
  { player: 'Bryan Mbeumo', from: 'Brentford', to: 'Manchester United', fee: 65, contract: '5 years', pos: 'FW', status: 'Official', date: '2025-08-02', notes: '' },
  { player: 'Hugo Ekitike', from: 'Eintracht Frankfurt', to: 'Liverpool', fee: 69, contract: '5 years', pos: 'FW', status: 'Official', date: '2025-08-03', notes: 'Promising striker' },
  { player: 'Rayan Cherki', from: 'Lyon', to: 'Manchester City', fee: 34, contract: '5 years', pos: 'MF', status: 'Official', date: '2025-08-03', notes: '' },
  { player: 'Anthony Elanga', from: 'Nottingham Forest', to: 'Newcastle United', fee: 55, contract: '5 years', pos: 'FW', status: 'Official', date: '2025-08-03', notes: '' },
  { player: 'Viktor Gyökeres', from: 'Sporting Lisbon', to: 'Arsenal', fee: 64, contract: '5 years', pos: 'FW', status: 'Official', date: '2025-08-03', notes: '' },
  { player: 'Eberechi Eze', from: 'Crystal Palace', to: 'Arsenal', fee: 67.5, contract: '5 years', pos: 'MF', status: 'Official', date: '2025-08-04', notes: '' },
]

const POSITIONS = ['All pos', 'FW', 'MF', 'DF', 'GK']
const STATUSES = ['All status', 'Official', 'Rumoured', 'Medical']

export default function Transfers() {
  const [query, setQuery] = useState('')
  const [pos, setPos] = useState('All pos')
  const [status, setStatus] = useState('All status')
  const [sort, setSort] = useState('newest')

  const rows = useMemo(() => {
    let list = TRANSFERS.filter((t) => {
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q || t.player.toLowerCase().includes(q) || t.from.toLowerCase().includes(q) || t.to.toLowerCase().includes(q)
      const matchesPos = pos === 'All pos' || t.pos === pos
      const matchesStatus = status === 'All status' || t.status === status
      return matchesQuery && matchesPos && matchesStatus
    })

    list = [...list].sort((a, b) => {
      if (sort === 'newest') return b.date.localeCompare(a.date)
      if (sort === 'oldest') return a.date.localeCompare(b.date)
      if (sort === 'fee-high') return b.fee - a.fee
      if (sort === 'fee-low') return a.fee - b.fee
      return 0
    })

    return list
  }, [query, pos, status, sort])

  return (
    <>
      <div className="page-header container">
        <span className="eyebrow">Transfer tracker</span>
        <h1>Transfers</h1>
        <p>Search, filter, and sort every confirmed move across Europe's top leagues this window.</p>
      </div>

      <div className="container">
        <div className="transfers-toolbar">
          <input
            type="text"
            placeholder="Search player or club"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select value={pos} onChange={(e) => setPos(e.target.value)}>
            {POSITIONS.map((p) => <option key={p}>{p}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="fee-high">Fee: high to low</option>
            <option value="fee-low">Fee: low to high</option>
          </select>
        </div>

        <div className="table-wrap">
          <table className="transfers">
            <thead>
              <tr>
                <th>Player</th>
                <th>From</th>
                <th>To</th>
                <th>Fee (€m)</th>
                <th>Contract</th>
                <th>Pos</th>
                <th>Status</th>
                <th>Date</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.player}>
                  <td className="player">{t.player}</td>
                  <td>{t.from}</td>
                  <td>{t.to}</td>
                  <td className="fee">£{t.fee}m</td>
                  <td>{t.contract}</td>
                  <td>{t.pos}</td>
                  <td><span className="status-pill">{t.status}</span></td>
                  <td className="fee">{t.date}</td>
                  <td>{t.notes}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={9} style={{ padding: '2rem', textAlign: 'center' }}>No transfers match those filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
