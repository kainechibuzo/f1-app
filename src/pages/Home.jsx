import { Link } from 'react-router-dom'
import F1News from '../components/F1News.jsx'

const HIGHLIGHTS = [
  {
    title: 'Transfer News',
    body: 'Liverpool sign Alexander Isak for £125m — a new Premier League record.',
  },
  {
    title: 'Match Reports',
    body: 'Manchester City edge Arsenal 2-1 in a thrilling clash at the Etihad.',
  },
  {
    title: 'Exclusive Insights',
    body: "Inside Chelsea's rebuild: how the Blues are planning for the future.",
  },
]

const LATEST_NEWS = [
  {
    title: 'Barcelona confirm signing of young star',
    body: 'The Catalan giants have secured a rising talent for €60m after months of negotiations.',
  },
  {
    title: 'Champions League fixtures announced',
    body: "The group stage draw sets up exciting clashes between Europe's elite clubs.",
  },
  {
    title: 'Premier League Player of the Month',
    body: "Arsenal midfielder earns September's award after a string of excellent performances.",
  },
]

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <span className="eyebrow">We bring the game to you</span>
          <h1>Every transfer, every result, <span>as it happens.</span></h1>
          <p>
            Stay ahead of the game with live transfer updates, match reports, and exclusive
            insights from around the world of football — plus a real-time Formula 1 feed.
          </p>
          <div className="hero__actions">
            <Link to="/matches" className="btn btn-primary">Live Matches</Link>
            <Link to="/transfers" className="btn btn-ghost">View Transfers</Link>
            <Link to="/f1" className="btn btn-ghost">F1 Hub</Link>
          </div>
        </div>
      </section>

      <section className="highlights">
        <div className="container">
          <span className="eyebrow">Today on the site</span>
          <h2 className="section-title">Latest highlights</h2>
          <div className="highlights__grid">
            {HIGHLIGHTS.map((h) => (
              <div className="info-card" key={h.title}>
                <h3>{h.title}</h3>
                <p>{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <F1News />

      <section className="highlights" style={{ paddingTop: 0 }}>
        <div className="container">
          <span className="eyebrow">Editor's picks</span>
          <h2 className="section-title">Latest news</h2>
          <div className="highlights__grid">
            {LATEST_NEWS.map((n) => (
              <div className="info-card" key={n.title}>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '2rem' }}>
            <Link to="/news" className="btn btn-ghost">See all news →</Link>
          </div>
        </div>
      </section>
    </>
  )
}
