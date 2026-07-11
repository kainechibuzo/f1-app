const ARTICLES = [
  { tag: 'AL HILAL', title: 'Aymeric Laporte Returns to Athletic Club', body: 'Laporte has completed a free transfer move from Al Hilal back to his boyhood club, Athletic Bilbao.' },
  { tag: 'ASTON VILLA', title: 'Harvey Elliott Joins Aston Villa on Loan', body: "Liverpool's midfielder Harvey Elliott has secured a one-year loan to Aston Villa." },
  { tag: 'CAMP NOU', title: 'Barcelona Confirm New Stadium Opening', body: 'The renovated Camp Nou will officially reopen this month after years of construction.' },
  { tag: 'UEFA', title: 'UEFA Nations League Fixtures Released', body: 'UEFA has confirmed the full schedule for the 2025/26 Nations League campaign.' },
]

export default function News() {
  return (
    <>
      <div className="page-header container">
        <span className="eyebrow">Newsroom</span>
        <h1>News</h1>
        <p>Transfers, stadiums, and competitions — the stories shaping football right now.</p>
      </div>

      <div className="container media-grid">
        {ARTICLES.map((a) => (
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
