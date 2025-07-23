'use client'

import { useState, useEffect, useRef } from 'react'
import { Station } from '@/types'
import { searchStations } from '@/lib/stations'

interface StationAutocompleteProps {
  id: string
  value: string
  onChange: (value: string) => void
  onStationSelect: (station: Station) => void
  placeholder?: string
  className?: string
}

export default function StationAutocomplete({
  id,
  value,
  onChange,
  onStationSelect,
  placeholder = 'Rechercher une gare...',
  className = '',
}: StationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Station[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Search for stations when input changes
  useEffect(() => {
    if (value.length >= 2) {
      const results = searchStations(value)
      setSuggestions(results)
      setShowSuggestions(true)
      setHighlightedIndex(-1)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [value])

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (station: Station) => {
    onChange(station.name)
    onStationSelect(station)
    setShowSuggestions(false)
    setHighlightedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelect(suggestions[highlightedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setHighlightedIndex(-1)
        break
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => value.length >= 2 && setShowSuggestions(true)}
        placeholder={placeholder}
        className={`form-input ${className}`}
        autoComplete="off"
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((station, index) => (
            <button
              key={station.code}
              type="button"
              onClick={() => handleSelect(station)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors ${
                index === highlightedIndex ? 'bg-gray-100' : ''
              }`}
            >
              <div className="font-medium">{station.name}</div>
              {station.region && (
                <div className="text-sm text-gray-600">{station.region}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {showSuggestions && value.length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <p className="text-gray-600 text-center">Aucune gare trouvée</p>
        </div>
      )}
    </div>
  )
}