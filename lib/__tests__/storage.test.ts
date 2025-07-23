import {
  loadFavorites,
  saveFavorites,
  addFavorite,
  removeFavorite,
  saveFilters,
  loadFilters,
  clearAllData,
} from '../storage'
import { FavoriteRoute, Station } from '@/types'

describe('storage utilities', () => {
  const mockStation1: Station = {
    name: 'Paris Gare de Lyon',
    code: 'FRPLY',
  }

  const mockStation2: Station = {
    name: 'Lyon Part-Dieu',
    code: 'FRLPD',
  }

  const mockFavorite: FavoriteRoute = {
    id: '123',
    departureStation: mockStation1,
    arrivalStation: mockStation2,
    nickname: 'Mon trajet quotidien',
    createdAt: new Date('2025-01-23'),
  }

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('loadFavorites', () => {
    it('returns empty array when no favorites exist', () => {
      const favorites = loadFavorites()
      expect(favorites).toEqual([])
    })

    it('returns parsed favorites from localStorage', () => {
      const favorites = [mockFavorite]
      localStorage.setItem('tgvmax_favorite_routes', JSON.stringify(favorites))
      
      const loaded = loadFavorites()
      expect(loaded).toHaveLength(1)
      expect(loaded[0].id).toBe('123')
      expect(loaded[0].departureStation.name).toBe('Paris Gare de Lyon')
    })

    it('handles corrupt localStorage data gracefully', () => {
      localStorage.setItem('tgvmax_favorite_routes', 'invalid json')
      
      const favorites = loadFavorites()
      expect(favorites).toEqual([])
    })

    it('converts date strings to Date objects', () => {
      const favorites = [mockFavorite]
      localStorage.setItem('tgvmax_favorite_routes', JSON.stringify(favorites))
      
      const loaded = loadFavorites()
      expect(loaded[0].createdAt).toBeInstanceOf(Date)
    })
  })

  describe('saveFavorites', () => {
    it('saves favorites to localStorage', () => {
      const favorites = [mockFavorite]
      saveFavorites(favorites)
      
      const stored = localStorage.getItem('tgvmax_favorite_routes')
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored!)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].id).toBe('123')
    })

    it('handles empty array', () => {
      saveFavorites([])
      
      const stored = localStorage.getItem('tgvmax_favorite_routes')
      expect(stored).toBe('[]')
    })
  })

  describe('addFavorite', () => {
    it('adds new favorite to empty list', () => {
      addFavorite(mockFavorite)
      
      const favorites = loadFavorites()
      expect(favorites).toHaveLength(1)
      expect(favorites[0].id).toBe('123')
    })

    it('adds new favorite to existing list', () => {
      const existing: FavoriteRoute = {
        ...mockFavorite,
        id: '456',
        departureStation: mockStation2,
        arrivalStation: mockStation1,
      }
      saveFavorites([existing])
      
      addFavorite(mockFavorite)
      
      const favorites = loadFavorites()
      expect(favorites).toHaveLength(2)
    })

    it('does not add duplicate routes', () => {
      saveFavorites([mockFavorite])
      
      // Try to add same route again
      addFavorite(mockFavorite)
      
      const favorites = loadFavorites()
      expect(favorites).toHaveLength(1)
    })

    it('identifies duplicates by station codes', () => {
      saveFavorites([mockFavorite])
      
      // Same route with different ID and nickname
      const duplicate: FavoriteRoute = {
        ...mockFavorite,
        id: '789',
        nickname: 'Different name',
      }
      
      addFavorite(duplicate)
      
      const favorites = loadFavorites()
      expect(favorites).toHaveLength(1)
    })
  })

  describe('removeFavorite', () => {
    it('removes favorite by id', () => {
      saveFavorites([mockFavorite])
      
      removeFavorite('123')
      
      const favorites = loadFavorites()
      expect(favorites).toHaveLength(0)
    })

    it('handles removing non-existent id', () => {
      saveFavorites([mockFavorite])
      
      removeFavorite('999')
      
      const favorites = loadFavorites()
      expect(favorites).toHaveLength(1)
    })

    it('removes correct favorite from multiple', () => {
      const favorite2 = { ...mockFavorite, id: '456' }
      saveFavorites([mockFavorite, favorite2])
      
      removeFavorite('123')
      
      const favorites = loadFavorites()
      expect(favorites).toHaveLength(1)
      expect(favorites[0].id).toBe('456')
    })
  })

  describe('filters', () => {
    const mockFilters = {
      timeRange: { start: '08:00', end: '18:00' },
      maxDuration: 180,
      sortBy: 'earliest',
    }

    it('saves filters to localStorage', () => {
      saveFilters(mockFilters)
      
      const stored = localStorage.getItem('tgvmax_search_filters')
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored!)
      expect(parsed.timeRange.start).toBe('08:00')
    })

    it('loads filters from localStorage', () => {
      localStorage.setItem('tgvmax_search_filters', JSON.stringify(mockFilters))
      
      const loaded = loadFilters()
      expect(loaded).toEqual(mockFilters)
    })

    it('returns null when no filters exist', () => {
      const filters = loadFilters()
      expect(filters).toBeNull()
    })
  })

  describe('clearAllData', () => {
    it('removes all stored data', () => {
      saveFavorites([mockFavorite])
      saveFilters({ sortBy: 'fastest' })
      
      clearAllData()
      
      expect(localStorage.getItem('tgvmax_favorite_routes')).toBeNull()
      expect(localStorage.getItem('tgvmax_search_filters')).toBeNull()
    })
  })
})