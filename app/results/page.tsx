'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { TrainSearchResponse, ApiError, SearchFilters, Train } from '@/types'
import { searchTrains, formatApiError } from '@/lib/api'
import { loadFilters } from '@/lib/storage'
import TrainCard from '@/components/TrainCard'
import LoadingResults from '@/components/LoadingResults'
import FilterSidebar from '@/components/FilterSidebar'

function SearchResults() {
  const searchParams = useSearchParams()
  const [results, setResults] = useState<TrainSearchResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<SearchFilters>(() => loadFilters() || { sortBy: 'earliest' })

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

  // Apply filters to trains
  const filteredTrains = applyFilters(results.trains, filters)
  const tgvMaxTrains = filteredTrains.filter(train => train.tgvMaxAvailable)
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

      {/* Mock data warning - only show if using mock data */}
      {process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-amber-800">Données de démonstration</h3>
              <p className="text-sm text-amber-700 mt-1">
                Ces horaires sont <strong>fictifs</strong>. Pour obtenir de vraies données TGV MAX :
              </p>
              <ol className="list-decimal list-inside mt-2 text-sm text-amber-700 space-y-1">
                <li>Copiez <code className="bg-amber-100 px-1 rounded">.env.example</code> vers <code className="bg-amber-100 px-1 rounded">.env</code></li>
                <li>Définissez <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_USE_MOCK_DATA=false</code></li>
                <li>Redémarrez l'application avec <code className="bg-amber-100 px-1 rounded">npm run dev</code></li>
              </ol>
              <p className="text-xs text-amber-600 mt-2">
                ℹ️ L'application utilisera alors le scraping web pour obtenir les vraies disponibilités TGV MAX depuis SNCF Connect.
              </p>
            </div>
          </div>
        </div>
      )}

      {tgvMaxTrains.length > 0 && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 font-medium">
            ✅ {tgvMaxTrains.length} train{tgvMaxTrains.length > 1 ? 's' : ''} avec TGV MAX disponible{tgvMaxTrains.length > 1 ? 's' : ''}
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <FilterSidebar
            filters={filters}
            onFiltersChange={setFilters}
            trainCount={results.trains.length}
            filteredCount={filteredTrains.length}
          />
        </div>
        
        <div className="md:col-span-3">
          {filteredTrains.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-gray-600 mb-4">
                Aucun train ne correspond aux filtres sélectionnés.
              </p>
              <button
                onClick={() => setFilters({ sortBy: 'earliest' })}
                className="btn-secondary"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTrains.map((train, index) => (
                <TrainCard
                  key={`${train.trainNumber}-${index}`}
                  train={train}
                  route={results.route}
                />
              ))}
            </div>
          )}
        </div>
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

// Filter and sort trains
function applyFilters(trains: Train[], filters: SearchFilters): Train[] {
  let filtered = [...trains]

  // Time range filter
  if (filters.timeRange?.start || filters.timeRange?.end) {
    filtered = filtered.filter(train => {
      const departureTime = train.departureTime
      if (filters.timeRange?.start && departureTime < filters.timeRange.start) {
        return false
      }
      if (filters.timeRange?.end && departureTime > filters.timeRange.end) {
        return false
      }
      return true
    })
  }

  // Duration filter
  if (filters.maxDuration) {
    filtered = filtered.filter(train => train.duration <= filters.maxDuration!)
  }

  // Connections filter
  if (filters.maxConnections !== undefined) {
    filtered = filtered.filter(train => {
      const connections = train.connections?.length || 0
      return connections <= filters.maxConnections!
    })
  }

  // Sort
  switch (filters.sortBy) {
    case 'fastest':
      filtered.sort((a, b) => a.duration - b.duration)
      break
    case 'connections':
      filtered.sort((a, b) => {
        const aConnections = a.connections?.length || 0
        const bConnections = b.connections?.length || 0
        return aConnections - bConnections
      })
      break
    case 'earliest':
    default:
      filtered.sort((a, b) => a.departureTime.localeCompare(b.departureTime))
      break
  }

  return filtered
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingResults />}>
      <SearchResults />
    </Suspense>
  )
}