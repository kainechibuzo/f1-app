import { useFavorites } from '../context/FavoritesContext.jsx'
import './StarButton.css'

export default function StarButton({ type, id, name, meta, size = 'md' }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const active = isFavorite(type, id)

  return (
    <button
      className={`star-btn star-btn--${size} ${active ? 'star-btn--active' : ''}`}
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(type, id, name, meta)
      }}
      title={active ? 'Remove from favorites' : 'Add to favorites'}
    >
      {active ? '★' : '☆'}
    </button>
  )
}
