'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { FavoriteRoute } from '@/types'
import { loadFavorites, saveFavorites } from '@/lib/storage'

export default function FavoriteRoutes() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteRoute[]>([])

  useEffect(() => {
    const loaded = loadFavorites()
    setFavorites(loaded)
  }, [])

  const handleQuickSearch = (favorite: FavoriteRoute) => {
    const params = new URLSearchParams({
      from: favorite.departureStation.name,
      to: favorite.arrivalStation.name,
      date: format(new Date(), 'yyyy-MM-dd'),
    })

    router.push(`/results?${params.toString()}`)
  }

  const handleRemove = (id: string) => {
    const updated = favorites.filter(f => f.id !== id)
    setFavorites(updated)
    saveFavorites(updated)
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
            className="border border-gray-200 rounded-lg p-3 hover:border-sncf-red transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {favorite.nickname && (
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {favorite.nickname}
                  </p>
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
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button
              onClick={() => handleQuickSearch(favorite)}
              className="mt-3 text-sm text-sncf-red hover:text-red-700 font-medium"
            >
              Rechercher maintenant →
            </button>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-gray-500">
        💡 Les favoris sont sauvegardés localement
      </p>
    </div>
  )
}