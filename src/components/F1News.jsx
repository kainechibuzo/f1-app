import { useEffect, useState, useCallback } from 'react'
import './F1News.css'

const RSS_URL =
  'https://news.google.com/rss/search?q=Formula+1+news&hl=en-US&gl=US&ceid=US:en'
const PROXY_URL = 'https://api.allorigins.win/get?url='
const ARTICLE_LIMIT = 30
const INITIAL_VISIBLE = 6

/**
 * Fetches the Google News RSS feed for Formula 1 through a CORS proxy,
 * parses the returned XML with DOMParser, and returns a clean array of
 * { id, title, link, pubDate, source } objects capped at ARTICLE_LIMIT.
 */
async function fetchF1News() {
  const target = encodeURIComponent(RSS_URL)
  const res = await fetch(`${PROXY_URL}${target}`)

  if (!res.ok) {
    throw new Error(`Proxy request failed with status ${res.status}`)
  }

  const payload = await res.json()
  const xmlString = payload.contents

  if (!xmlString) {
    throw new Error('Empty RSS payload received from proxy')
  }

  const parser = new DOMParser()
  const xml = parser.parseFromString(xmlString, 'text/xml')

  const parserError = xml.querySelector('parsererror')
  if (parserError) {
    throw new Error('Could not parse the RSS feed XML')
  }

  const items = Array.from(xml.querySelectorAll('item')).slice(0, ARTICLE_LIMIT)

  return items.map((item, index) => {
    const rawTitle = item.querySelector('title')?.textContent?.trim() ?? 'Untitled'
    const link = item.querySelector('link')?.textContent?.trim() ?? '#'
    const pubDate = item.querySelector('pubDate')?.textContent?.trim() ?? ''
    const sourceTag = item.querySelector('source')?.textContent?.trim()

    // Google News titles are usually "Headline - Source Name". Prefer the
    // <source> tag, but fall back to splitting the title if it's missing.
    let title = rawTitle
    let source = sourceTag
    if (!source) {
      const parts = rawTitle.split(' - ')
      if (parts.length > 1) {
        source = parts.pop().trim()
        title = parts.join(' - ').trim()
      } else {
        source = 'Google News'
      }
    } else {
      title = rawTitle.replace(new RegExp(`\\s*-\\s*${source}$`), '').trim()
    }

    return {
      id: `${index}-${link}`,
      title,
      link,
      pubDate,
      source,
    }
  })
}

function formatTimestamp(pubDate) {
  if (!pubDate) return '--:--'
  const date = new Date(pubDate)
  if (Number.isNaN(date.getTime())) return '--:--'

  const now = new Date()
  const diffMs = now - date
  const diffHrs = diffMs / 36e5

  if (diffHrs < 1) {
    const mins = Math.max(1, Math.round(diffMs / 60000))
    return `${mins}m ago`
  }
  if (diffHrs < 24) {
    return `${Math.round(diffHrs)}h ago`
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function NewsCardSkeleton() {
  return (
    <div className="f1card f1card--skeleton" aria-hidden="true">
      <div className="f1card__bar" />
      <div className="skeleton-line skeleton-line--tag" />
      <div className="skeleton-line skeleton-line--title" />
      <div className="skeleton-line skeleton-line--title short" />
      <div className="skeleton-line skeleton-line--meta" />
    </div>
  )
}

function NewsCard({ article, index }) {
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="f1card"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <span className="f1card__bar" />
      <div className="f1card__meta">
        <span className="f1card__source">{article.source}</span>
        <span className="f1card__time">{formatTimestamp(article.pubDate)}</span>
      </div>
      <h3 className="f1card__title">{article.title}</h3>
      <span className="f1card__cta">Read article →</span>
    </a>
  )
}

export default function F1News() {
  const [articles, setArticles] = useState([])
  const [status, setStatus] = useState('loading') // loading | success | error
  const [expanded, setExpanded] = useState(false)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const data = await fetchF1News()
      setArticles(data)
      setStatus('success')
    } catch (err) {
      console.error('F1 news fetch failed:', err)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const visible = expanded ? articles : articles.slice(0, INITIAL_VISIBLE)
  const hasMore = articles.length > INITIAL_VISIBLE

  return (
    <section className="f1-section" id="f1-news">
      <div className="container">
        <div className="f1-section__head">
          <span className="eyebrow">Live feed &middot; Google News</span>
          <h2 className="section-title">F1 News</h2>
          <p className="section-sub">
            The latest Formula 1 headlines, pulled straight from the grid every time you load the page.
          </p>
        </div>

        {status === 'error' && (
          <div className="f1-alert">
            <p>The feed didn't respond in time. The proxy or source may be temporarily unavailable.</p>
            <button className="btn btn-ghost" onClick={load}>Try again</button>
          </div>
        )}

        <div id="f1-news-container" className="f1-grid">
          {status === 'loading' &&
            Array.from({ length: INITIAL_VISIBLE }).map((_, i) => <NewsCardSkeleton key={i} />)}

          {status === 'success' &&
            visible.map((article, i) => <NewsCard key={article.id} article={article} index={i} />)}
        </div>

        {status === 'success' && articles.length === 0 && (
          <p className="f1-empty">No articles came back from the feed right now. Check back shortly.</p>
        )}

        {status === 'success' && hasMore && (
          <div className="f1-more">
            <button className="btn btn-primary" onClick={() => setExpanded((e) => !e)}>
              {expanded ? 'Show less' : `View more (${articles.length - INITIAL_VISIBLE})`}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
