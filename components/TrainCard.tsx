'use client'

import { useState } from 'react'
import { Train, Route, FavoriteRoute } from '@/types'
import { addFavorite } from '@/lib/storage'
import clsx from 'clsx'

interface TrainCardProps {
  train: Train
  route: Route
}

export default function TrainCard({ train, route }: TrainCardProps) {
  const [saved, setSaved] = useState(false)

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h${mins.toString().padStart(2, '0')}`
  }

  const handleSaveRoute = () => {
    const favorite: FavoriteRoute = {
      id: `${Date.now()}-${Math.random()}`,
      departureStation: route.departureStation,
      arrivalStation: route.arrivalStation,
      createdAt: new Date(),
    }
    
    addFavorite(favorite)
    setSaved(true)
    
    // Reset after animation
    setTimeout(() => setSaved(false), 2000)
  }

  const isTGV = train.type === 'TGV'
  const hasTGVMax = train.tgvMaxAvailable

  return (
    <div className={clsx(
      'card hover:shadow-xl transition-all duration-200',
      hasTGVMax && 'ring-2 ring-green-500 ring-opacity-50'
    )}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Train Information */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={clsx(
              'px-3 py-1 rounded-full text-sm font-semibold',
              isTGV ? 'bg-sncf-blue text-white' : 'bg-gray-200 text-gray-700'
            )}>
              {train.type}
            </span>
            <span className="text-gray-600 text-sm">{train.trainNumber}</span>
            {hasTGVMax && (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                TGV MAX ✓
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">{train.departureTime}</p>
              <p className="text-sm text-gray-600">{route.departureStation.name}</p>
              {train.platform && (
                <p className="text-xs text-gray-500">Voie {train.platform}</p>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">{formatDuration(train.duration)}</p>
              <div className="flex items-center justify-center mt-1">
                <div className="h-px bg-gray-300 flex-1"></div>
                <span className="mx-2 text-gray-400">→</span>
                <div className="h-px bg-gray-300 flex-1"></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {train.stops === 0 ? 'Direct' : `${train.stops} arrêt${train.stops > 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{train.arrivalTime}</p>
              <p className="text-sm text-gray-600">{route.arrivalStation.name}</p>
            </div>
          </div>

          {train.connections && train.connections.length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">Correspondances:</p>
              {train.connections.map((conn, idx) => (
                <p key={idx} className="text-xs text-gray-600">
                  {conn.station.name} - Attente {conn.duration} min
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Price and Actions */}
        <div className="flex flex-col items-end gap-3">
          {train.price && !hasTGVMax && (
            <p className="text-xl font-semibold text-gray-700">
              {train.price}€
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSaveRoute}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                saved
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
              disabled={saved}
            >
              {saved ? '✓ Sauvegardé' : 'Sauvegarder'}
            </button>
            
            {hasTGVMax && (
              <a
                href="https://www.sncf-connect.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm"
              >
                Réserver
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}