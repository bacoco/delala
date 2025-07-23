'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { FavoriteRoute } from '@/types'
import { loadFavorites, saveFavorites, removeFavorite } from '@/lib/storage'
import SaveRouteModal from './SaveRouteModal'

export default function FavoriteRoutes() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteRoute[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingNickname, setEditingNickname] = useState('')

  useEffect(() => {
    const loaded = loadFavorites()
    setFavorites(loaded)
  }, [])

  // Refresh favorites when modal saves
  const refreshFavorites = () => {
    const loaded = loadFavorites()
    setFavorites(loaded)
  }

  const handleQuickSearch = (favorite: FavoriteRoute, daysOffset: number = 0) => {
    const searchDate = addDays(new Date(), daysOffset)
    const params = new URLSearchParams({
      from: favorite.departureStation.name,
      to: favorite.arrivalStation.name,
      date: format(searchDate, 'yyyy-MM-dd'),
    })

    router.push(`/results?${params.toString()}`)
  }

  const handleEditNickname = (favorite: FavoriteRoute) => {
    setEditingId(favorite.id)
    setEditingNickname(favorite.nickname || '')
  }

  const handleSaveNickname = (id: string) => {
    const updated = favorites.map(f => 
      f.id === id ? { ...f, nickname: editingNickname.trim() || undefined } : f
    )
    saveFavorites(updated)
    setFavorites(updated)
    setEditingId(null)
    setEditingNickname('')
  }

  const handleRemove = (id: string) => {
    if (confirm('Supprimer ce trajet favori ?')) {
      removeFavorite(id)
      const updated = favorites.filter(f => f.id !== id)
      setFavorites(updated)
    }
  }

  if (favorites.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Trajets favoris</h3>
        <p className="text-gray-600 text-sm">
          Vos trajets favoris apparaîtront ici pour un accès rapide.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Trajets favoris</h3>
      <div className="space-y-3">
        {favorites.map((favorite) => (
          <div
            key={favorite.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-sncf-red transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                {editingId === favorite.id ? (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={editingNickname}
                      onChange={(e) => setEditingNickname(e.target.value)}
                      className="form-input text-sm flex-1"
                      placeholder="Nom du trajet"
                      maxLength={50}
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveNickname(favorite.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="mb-2">
                    {favorite.nickname ? (
                      <button
                        onClick={() => handleEditNickname(favorite)}
                        className="text-sm font-medium text-gray-900 hover:text-sncf-blue text-left"
                      >
                        {favorite.nickname} ✏️
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditNickname(favorite)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        + Ajouter un nom
                      </button>
                    )}
                  </div>
                )}
                <p className="text-sm text-gray-700">
                  {favorite.departureStation.name}
                </p>
                <p className="text-sm text-gray-700">
                  → {favorite.arrivalStation.name}
                </p>
              </div>
              <button
                onClick={() => handleRemove(favorite.id)}
                className="text-gray-400 hover:text-red-600 ml-2"
                aria-label="Supprimer ce favori"
                title="Supprimer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickSearch(favorite)}
                className="text-xs bg-sncf-red text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => handleQuickSearch(favorite, 1)}
                className="text-xs bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Demain
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-gray-500">
        💡 Les favoris sont sauvegardés localement
      </p>
    </div>
  )
}