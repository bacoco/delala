'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { TrainSearchResponse, ApiError } from '@/types'
import { searchTrains, formatApiError } from '@/lib/api'
import TrainCard from '@/components/TrainCard'
import LoadingResults from '@/components/LoadingResults'

function SearchResults() {
  const searchParams = useSearchParams()
  const [results, setResults] = useState<TrainSearchResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''
  const date = searchParams.get('date') || ''

  useEffect(() => {
    if (!from || !to || !date) {
      setError('Paramètres de recherche manquants')
      setLoading(false)
      return
    }

    fetchTrains()
  }, [from, to, date])

  const fetchTrains = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await searchTrains(from, to, date)
      setResults(response)
    } catch (err) {
      const errorMessage = err && typeof err === 'object' && 'code' in err
        ? formatApiError(err as ApiError)
        : 'Une erreur est survenue lors de la recherche'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingResults />
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Erreur</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="btn-secondary inline-block">
            Nouvelle recherche
          </Link>
        </div>
      </div>
    )
  }

  if (!results || results.trains.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">
            Aucun train trouvé
          </h2>
          <p className="text-yellow-600 mb-4">
            Aucun train n'a été trouvé pour cette recherche. Essayez une autre date ou un autre trajet.
          </p>
          <Link href="/" className="btn-secondary inline-block">
            Nouvelle recherche
          </Link>
        </div>
      </div>
    )
  }

  const tgvMaxTrains = results.trains.filter(train => train.tgvMaxAvailable)
  const searchDate = new Date(date)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-sncf-red hover:underline mb-4 inline-block">
          ← Nouvelle recherche
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {from} → {to}
        </h1>
        <p className="text-gray-600">
          {format(searchDate, 'EEEE d MMMM yyyy', { locale: fr })}
        </p>
      </div>

      {tgvMaxTrains.length > 0 && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 font-medium">
            ✅ {tgvMaxTrains.length} train{tgvMaxTrains.length > 1 ? 's' : ''} avec TGV MAX disponible{tgvMaxTrains.length > 1 ? 's' : ''}
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {results.trains.map((train, index) => (
          <TrainCard
            key={`${train.trainNumber}-${index}`}
            train={train}
            route={results.route}
          />
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          💡 Les disponibilités TGV MAX sont données à titre indicatif et peuvent changer rapidement.
        </p>
        <p className="mt-1">
          Réservez directement sur l'application SNCF pour confirmer la disponibilité.
        </p>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingResults />}>
      <SearchResults />
    </Suspense>
  )
}