import { FavoriteRoute } from '@/types'

const FAVORITES_KEY = 'tgvmax_favorite_routes'
const FILTERS_KEY = 'tgvmax_search_filters'

// Favorite routes management
export function loadFavorites(): FavoriteRoute[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    if (!stored) return []
    
    const favorites = JSON.parse(stored)
    // Convert date strings back to Date objects
    return favorites.map((fav: any) => ({
      ...fav,
      createdAt: new Date(fav.createdAt),
    }))
  } catch (error) {
    console.error('Error loading favorites:', error)
    return []
  }
}

export function saveFavorites(favorites: FavoriteRoute[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  } catch (error) {
    console.error('Error saving favorites:', error)
  }
}

export function addFavorite(favorite: FavoriteRoute): void {
  const favorites = loadFavorites()
  
  // Check if route already exists
  const exists = favorites.some(
    f =>
      f.departureStation.code === favorite.departureStation.code &&
      f.arrivalStation.code === favorite.arrivalStation.code
  )
  
  if (!exists) {
    favorites.push(favorite)
    saveFavorites(favorites)
  }
}

export function removeFavorite(id: string): void {
  const favorites = loadFavorites()
  const filtered = favorites.filter(f => f.id !== id)
  saveFavorites(filtered)
}

// Search filters persistence
export function saveFilters(filters: any): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters))
  } catch (error) {
    console.error('Error saving filters:', error)
  }
}

export function loadFilters(): any {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(FILTERS_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('Error loading filters:', error)
    return null
  }
}

// Clear all stored data
export function clearAllData(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(FAVORITES_KEY)
  localStorage.removeItem(FILTERS_KEY)
}