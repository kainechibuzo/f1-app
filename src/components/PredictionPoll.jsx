import { useEffect, useState, useCallback } from 'react'
import { supabase, getAnonymousId } from '../lib/supabaseClient.js'
import './PredictionPoll.css'

/**
 * eventType: 'fixture' | 'race'
 * eventId: unique id for the fixture/race
 * options: array of { value, label }
 */
export default function PredictionPoll({ eventType, eventId, options, question = 'Who wins?' }) {
  const [counts, setCounts] = useState({})
  const [myChoice, setMyChoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const ownerId = getAnonymousId()

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('predictions')
      .select('choice, owner_id')
      .eq('event_type', eventType)
      .eq('event_id', String(eventId))

    if (error) {
      console.error('Failed to load predictions:', error.message)
      setLoading(false)
      return
    }

    const tally = {}
    let mine = null
    for (const row of data) {
      tally[row.choice] = (tally[row.choice] || 0) + 1
      if (row.owner_id === ownerId) mine = row.choice
    }
    setCounts(tally)
    setMyChoice(mine)
    setLoading(false)
  }, [eventType, eventId, ownerId])

  useEffect(() => {
    load()
  }, [load])

  async function vote(value) {
    setMyChoice(value)
    const { error } = await supabase
      .from('predictions')
      .upsert(
        { owner_id: ownerId, event_type: eventType, event_id: String(eventId), choice: value },
        { onConflict: 'owner_id,event_type,event_id' },
      )
    if (error) {
      console.error('Failed to save prediction:', error.message)
    }
    load()
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="poll">
      <p className="poll__question">{question}</p>
      <div className="poll__options">
        {options.map((opt) => {
          const count = counts[opt.value] || 0
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          const picked = myChoice === opt.value
          return (
            <button
              key={opt.value}
              className={`poll__option ${picked ? 'poll__option--picked' : ''}`}
              onClick={() => vote(opt.value)}
              disabled={loading}
            >
              <span className="poll__option-fill" style={{ width: `${pct}%` }} />
              <span className="poll__option-label">{opt.label}</span>
              {total > 0 && <span className="poll__option-pct">{pct}%</span>}
            </button>
          )
        })}
      </div>
      <p className="poll__total">{total} prediction{total === 1 ? '' : 's'}</p>
    </div>
  )
}
