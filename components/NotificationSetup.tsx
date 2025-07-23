'use client'

import { useState, useEffect } from 'react'
import { FavoriteRoute, NotificationPreference } from '@/types'
import { loadFavorites } from '@/lib/storage'

export default function NotificationSetup() {
  const [favorites, setFavorites] = useState<FavoriteRoute[]>([])
  const [notifications, setNotifications] = useState<NotificationPreference[]>([])
  const [showSetup, setShowSetup] = useState(false)
  const [email, setEmail] = useState('')
  const [selectedRouteId, setSelectedRouteId] = useState('')
  const [frequency, setFrequency] = useState<NotificationPreference['frequency']>('daily')

  useEffect(() => {
    const loaded = loadFavorites()
    setFavorites(loaded)
    
    // Load saved notifications from localStorage
    const savedNotifications = localStorage.getItem('tgvmax_notifications')
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications))
    }
  }, [])

  const handleAddNotification = () => {
    if (!selectedRouteId || !email) {
      alert('Veuillez sélectionner un trajet et entrer votre email')
      return
    }

    const selectedRoute = favorites.find(f => f.id === selectedRouteId)
    if (!selectedRoute) return

    const newNotification: NotificationPreference = {
      id: `${Date.now()}-${Math.random()}`,
      route: selectedRoute,
      frequency,
      enabled: true,
      lastSent: undefined,
    }

    const updated = [...notifications, newNotification]
    setNotifications(updated)
    localStorage.setItem('tgvmax_notifications', JSON.stringify(updated))
    localStorage.setItem('tgvmax_notification_email', email)

    // Reset form
    setSelectedRouteId('')
    setFrequency('daily')
    setShowSetup(false)
    
    // Show success message
    alert('Notification configurée ! (Prototype - les emails ne sont pas réellement envoyés)')
  }

  const handleToggleNotification = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, enabled: !n.enabled } : n
    )
    setNotifications(updated)
    localStorage.setItem('tgvmax_notifications', JSON.stringify(updated))
  }

  const handleDeleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id)
    setNotifications(updated)
    localStorage.setItem('tgvmax_notifications', JSON.stringify(updated))
  }

  useEffect(() => {
    // Load saved email
    const savedEmail = localStorage.getItem('tgvmax_notification_email')
    if (savedEmail) {
      setEmail(savedEmail)
    }
  }, [])

  if (favorites.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Notifications de disponibilité</h3>
        <p className="text-gray-600 text-sm">
          Ajoutez d'abord des trajets favoris pour configurer des notifications.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
          Prototype
        </span>
      </div>

      {notifications.length === 0 && !showSetup ? (
        <div className="text-center py-4">
          <p className="text-gray-600 text-sm mb-4">
            Recevez des alertes quand des places TGV MAX se libèrent
          </p>
          <button
            onClick={() => setShowSetup(true)}
            className="btn-primary text-sm"
          >
            Configurer des notifications
          </button>
        </div>
      ) : (
        <>
          {notifications.length > 0 && (
            <div className="space-y-3 mb-4">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {notif.route.departureStation.name} → {notif.route.arrivalStation.name}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Fréquence : {
                          notif.frequency === 'immediate' ? 'Immédiate' :
                          notif.frequency === 'hourly' ? 'Toutes les heures' :
                          'Quotidienne'
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notif.enabled}
                          onChange={() => handleToggleNotification(notif.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sncf-red"></div>
                      </label>
                      <button
                        onClick={() => handleDeleteNotification(notif.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showSetup ? (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Nouvelle notification</h4>
              
              <div className="space-y-3">
                <div>
                  <label htmlFor="notification-email" className="block text-sm text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="notification-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="form-input text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="notification-route" className="block text-sm text-gray-700 mb-1">
                    Trajet
                  </label>
                  <select
                    id="notification-route"
                    value={selectedRouteId}
                    onChange={(e) => setSelectedRouteId(e.target.value)}
                    className="form-input text-sm"
                  >
                    <option value="">Sélectionnez un trajet</option>
                    {favorites.map((fav) => (
                      <option key={fav.id} value={fav.id}>
                        {fav.nickname || `${fav.departureStation.name} → ${fav.arrivalStation.name}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="notification-frequency" className="block text-sm text-gray-700 mb-1">
                    Fréquence
                  </label>
                  <select
                    id="notification-frequency"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as NotificationPreference['frequency'])}
                    className="form-input text-sm"
                  >
                    <option value="immediate">Immédiate (dès qu'une place se libère)</option>
                    <option value="hourly">Toutes les heures</option>
                    <option value="daily">Une fois par jour</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleAddNotification}
                    className="btn-primary text-sm flex-1"
                  >
                    Activer
                  </button>
                  <button
                    onClick={() => setShowSetup(false)}
                    className="btn-secondary text-sm flex-1"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowSetup(true)}
              className="text-sm text-sncf-red hover:text-red-700 font-medium"
            >
              + Ajouter une notification
            </button>
          )}
        </>
      )}

      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
        <p className="text-xs text-yellow-700">
          ⚠️ Ceci est un prototype. Les notifications par email ne sont pas réellement envoyées.
          Dans une version complète, un serveur backend vérifierait régulièrement les disponibilités.
        </p>
      </div>
    </div>
  )
}