'use client'

import { useState, useEffect } from 'react'
import { SearchFilters } from '@/types'
import { saveFilters } from '@/lib/storage'

interface FilterSidebarProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  trainCount: number
  filteredCount: number
}

export default function FilterSidebar({
  filters,
  onFiltersChange,
  trainCount,
  filteredCount,
}: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleTimeRangeChange = (type: 'start' | 'end', value: string) => {
    const newFilters = {
      ...localFilters,
      timeRange: {
        ...localFilters.timeRange,
        [type]: value,
      } as { start: string; end: string },
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
    saveFilters(newFilters)
  }

  const handleDurationChange = (value: string) => {
    const newFilters = {
      ...localFilters,
      maxDuration: value ? parseInt(value) : undefined,
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
    saveFilters(newFilters)
  }

  const handleConnectionsChange = (value: string) => {
    const newFilters = {
      ...localFilters,
      maxConnections: value ? parseInt(value) : undefined,
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
    saveFilters(newFilters)
  }

  const handleSortChange = (value: SearchFilters['sortBy']) => {
    const newFilters = {
      ...localFilters,
      sortBy: value,
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
    saveFilters(newFilters)
  }

  const resetFilters = () => {
    const defaultFilters: SearchFilters = {
      sortBy: 'earliest',
    }
    setLocalFilters(defaultFilters)
    onFiltersChange(defaultFilters)
    saveFilters(defaultFilters)
  }

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filtrer les résultats
          {filteredCount < trainCount && (
            <span className="bg-sncf-red text-white text-xs px-2 py-1 rounded-full">
              {filteredCount}/{trainCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Sidebar */}
      <div className={`
        fixed md:relative inset-0 z-40 md:z-auto
        ${isOpen ? 'block' : 'hidden md:block'}
      `}>
        {/* Mobile Overlay */}
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />

        {/* Filter Content */}
        <div className="fixed md:relative top-0 right-0 h-full md:h-auto w-80 md:w-full bg-white md:bg-transparent overflow-y-auto md:overflow-visible">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Filtres</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="md:hidden text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Sort Options */}
            <div className="mb-6">
              <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-2">
                Trier par
              </label>
              <select
                id="sort-select"
                value={localFilters.sortBy || 'earliest'}
                onChange={(e) => handleSortChange(e.target.value as SearchFilters['sortBy'])}
                className="form-input"
              >
                <option value="earliest">Plus tôt</option>
                <option value="fastest">Plus rapide</option>
                <option value="connections">Moins de correspondances</option>
              </select>
            </div>

            {/* Time Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de départ
              </label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={localFilters.timeRange?.start || ''}
                  onChange={(e) => handleTimeRangeChange('start', e.target.value)}
                  className="form-input flex-1"
                  placeholder="De"
                />
                <input
                  type="time"
                  value={localFilters.timeRange?.end || ''}
                  onChange={(e) => handleTimeRangeChange('end', e.target.value)}
                  className="form-input flex-1"
                  placeholder="À"
                />
              </div>
            </div>

            {/* Duration Filter */}
            <div className="mb-6">
              <label htmlFor="duration-select" className="block text-sm font-medium text-gray-700 mb-2">
                Durée maximale
              </label>
              <select
                id="duration-select"
                value={localFilters.maxDuration || ''}
                onChange={(e) => handleDurationChange(e.target.value)}
                className="form-input"
              >
                <option value="">Toutes les durées</option>
                <option value="120">Moins de 2h</option>
                <option value="180">Moins de 3h</option>
                <option value="240">Moins de 4h</option>
                <option value="300">Moins de 5h</option>
              </select>
            </div>

            {/* Connections Filter */}
            <div className="mb-6">
              <label htmlFor="connections-select" className="block text-sm font-medium text-gray-700 mb-2">
                Correspondances
              </label>
              <select
                id="connections-select"
                value={localFilters.maxConnections ?? ''}
                onChange={(e) => handleConnectionsChange(e.target.value)}
                className="form-input"
              >
                <option value="">Toutes</option>
                <option value="0">Direct uniquement</option>
                <option value="1">Maximum 1 correspondance</option>
                <option value="2">Maximum 2 correspondances</option>
              </select>
            </div>

            {/* Filter Summary */}
            {filteredCount < trainCount && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  {filteredCount} train{filteredCount > 1 ? 's' : ''} sur {trainCount} correspondent aux filtres
                </p>
              </div>
            )}

            {/* Reset Button */}
            <button
              onClick={resetFilters}
              className="btn-secondary w-full text-sm"
            >
              Réinitialiser les filtres
            </button>

            {/* TGV MAX Filter Tip */}
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700">
                💡 Les trains avec TGV MAX sont mis en évidence automatiquement
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}