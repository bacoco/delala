'use client'

import { useState } from 'react'
import { Station, FavoriteRoute } from '@/types'
import { addFavorite } from '@/lib/storage'

interface SaveRouteModalProps {
  isOpen: boolean
  onClose: () => void
  departureStation: Station
  arrivalStation: Station
  onSaved: () => void
}

export default function SaveRouteModal({
  isOpen,
  onClose,
  departureStation,
  arrivalStation,
  onSaved,
}: SaveRouteModalProps) {
  const [nickname, setNickname] = useState('')
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    setSaving(true)
    
    const favorite: FavoriteRoute = {
      id: `${Date.now()}-${Math.random()}`,
      departureStation,
      arrivalStation,
      nickname: nickname.trim() || undefined,
      createdAt: new Date(),
    }
    
    addFavorite(favorite)
    
    // Simulate save delay for UX
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setSaving(false)
    setNickname('')
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold mb-4">
          Sauvegarder ce trajet
        </h3>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            {departureStation.name} → {arrivalStation.name}
          </p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
            Donner un nom à ce trajet (optionnel)
          </label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Ex: Trajet domicile-travail"
            className="form-input"
            maxLength={50}
          />
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex-1"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            className="btn-secondary flex-1"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}