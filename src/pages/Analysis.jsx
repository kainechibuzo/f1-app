const ANALYSES = [
  {
    tag: 'MAN CITY',
    title: "Manchester City's Struggles: A Tactical Breakdown",
    body: 'For years, City have been the gold standard of European football. This season tells a different story — more human, more vulnerable, and more predictable.',
  },
  {
    tag: 'LIVERPOOL',
    title: 'Liverpool: The Isak Effect',
    body: "Alexander Isak's arrival has reshaped Slot's frontline, adding height, composure, and link-up play.",
  },
  {
    tag: 'ARSENAL',
    title: 'Arsenal: Mastering the Low Block',
    body: "Arteta's side now combines defensive resilience with attacking efficiency, correcting last year's flaws.",
  },
  {
    tag: 'PSG',
    title: 'PSG: Dominance with Discipline',
    body: 'Enrique has forged a more structured PSG, built on pressing, intensity, and collective balance.',
  },
]

export default function Analysis() {
  return (
    <>
      <div className="page-header container">
        <span className="eyebrow">Tactical analysis</span>
        <h1>Analysis</h1>
        <p>Deep breakdowns of Europe's biggest clubs, from press triggers to build-up shape.</p>
      </div>

      <div className="container media-grid">
        {ANALYSES.map((a) => (
          <article className="media-card" key={a.title}>
            <div className="media-card__image">{a.tag}</div>
            <div className="media-card__body">
              <h3>{a.title}</h3>
              <p>{a.body}</p>
              <button className="btn btn-ghost">Read More</button>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
