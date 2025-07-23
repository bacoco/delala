'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DatePicker from 'react-datepicker'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import StationAutocomplete from './StationAutocomplete'
import SaveRouteModal from './SaveRouteModal'
import type { Station, SearchFormData } from '@/types'
import 'react-datepicker/dist/react-datepicker.css'

export default function SearchForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [departureStation, setDepartureStation] = useState<Station | null>(null)
  const [arrivalStation, setArrivalStation] = useState<Station | null>(null)
  const [formData, setFormData] = useState<SearchFormData>({
    departure: '',
    arrival: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  })
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const handleStationSelect = (station: Station, type: 'departure' | 'arrival') => {
    setFormData(prev => ({
      ...prev,
      [type]: station.name,
    }))
    
    if (type === 'departure') {
      setDepartureStation(station)
    } else {
      setArrivalStation(station)
    }
  }

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date)
      setFormData(prev => ({
        ...prev,
        date: format(date, 'yyyy-MM-dd'),
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.departure || !formData.arrival) {
      alert('Veuillez sélectionner une gare de départ et d\'arrivée')
      return
    }

    setIsLoading(true)

    // Navigate to results page with search params
    const params = new URLSearchParams({
      from: formData.departure,
      to: formData.arrival,
      date: formData.date,
    })

    router.push(`/results?${params.toString()}`)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Rechercher un train</h3>
          {departureStation && arrivalStation && (
            <button
              type="button"
              onClick={() => setShowSaveModal(true)}
              className="text-sm text-sncf-red hover:text-red-700 font-medium"
            >
              ⭐ Sauvegarder ce trajet
            </button>
          )}
        </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="departure" className="block text-sm font-medium text-gray-700 mb-2">
            Gare de départ
          </label>
          <StationAutocomplete
            id="departure"
            placeholder="Paris, Lyon, Marseille..."
            value={formData.departure}
            onChange={(value) => setFormData(prev => ({ ...prev, departure: value }))}
            onStationSelect={(station) => handleStationSelect(station, 'departure')}
          />
        </div>

        <div>
          <label htmlFor="arrival" className="block text-sm font-medium text-gray-700 mb-2">
            Gare d'arrivée
          </label>
          <StationAutocomplete
            id="arrival"
            placeholder="Nice, Bordeaux, Lille..."
            value={formData.arrival}
            onChange={(value) => setFormData(prev => ({ ...prev, arrival: value }))}
            onStationSelect={(station) => handleStationSelect(station, 'arrival')}
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Date de voyage
          </label>
          <DatePicker
            id="date"
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            locale={fr}
            minDate={new Date()}
            maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)} // 90 days
            className="form-input w-full"
            placeholderText="Sélectionnez une date"
            wrapperClassName="w-full"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !formData.departure || !formData.arrival}
        className="btn-primary w-full mt-6"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <span className="spinner mr-2"></span>
            Recherche en cours...
          </span>
        ) : (
          'Rechercher des trains'
        )}
      </button>

        <div className="mt-4 text-sm text-gray-600">
          <p>💡 Astuce : Les places TGV MAX sont limitées et s'ouvrent 30 jours avant le départ.</p>
        </div>
      </form>
      
      {departureStation && arrivalStation && (
        <SaveRouteModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          departureStation={departureStation}
          arrivalStation={arrivalStation}
          onSaved={() => {
            // Could trigger a toast notification here
            console.log('Route saved!')
          }}
        />
      )}
    </>
  )
}