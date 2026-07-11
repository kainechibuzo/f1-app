import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, getAnonymousId } from '../lib/supabaseClient.js'

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const ownerId = getAnonymousId()

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load favorites:', error.message)
      setFavorites([])
    } else {
      setFavorites(data)
    }
    setLoading(false)
  }, [ownerId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const isFavorite = useCallback(
    (entityType, entityId) =>
      favorites.some((f) => f.entity_type === entityType && f.entity_id === String(entityId)),
    [favorites],
  )

  const addFavorite = useCallback(
    async (entityType, entityId, entityName, entityMeta = {}) => {
      const optimistic = {
        id: `pending-${entityId}`,
        owner_id: ownerId,
        entity_type: entityType,
        entity_id: String(entityId),
        entity_name: entityName,
        entity_meta: entityMeta,
      }
      setFavorites((prev) => [optimistic, ...prev])

      const { error } = await supabase.from('favorites').insert({
        owner_id: ownerId,
        entity_type: entityType,
        entity_id: String(entityId),
        entity_name: entityName,
        entity_meta: entityMeta,
      })
      if (error) {
        console.error('Failed to add favorite:', error.message)
        setFavorites((prev) => prev.filter((f) => f.id !== optimistic.id))
      } else {
        refresh()
      }
    },
    [ownerId, refresh],
  )

  const removeFavorite = useCallback(
    async (entityType, entityId) => {
      setFavorites((prev) =>
        prev.filter((f) => !(f.entity_type === entityType && f.entity_id === String(entityId))),
      )
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('owner_id', ownerId)
        .eq('entity_type', entityType)
        .eq('entity_id', String(entityId))
      if (error) console.error('Failed to remove favorite:', error.message)
    },
    [ownerId],
  )

  const toggleFavorite = useCallback(
    (entityType, entityId, entityName, entityMeta) => {
      if (isFavorite(entityType, entityId)) {
        return removeFavorite(entityType, entityId)
      }
      return addFavorite(entityType, entityId, entityName, entityMeta)
    },
    [isFavorite, addFavorite, removeFavorite],
  )

  return (
    <FavoritesContext.Provider
      value={{ favorites, loading, isFavorite, addFavorite, removeFavorite, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within a FavoritesProvider')
  return ctx
}
