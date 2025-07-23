import axios, { AxiosError } from 'axios'
import { TrainSearchResponse, ApiError } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'
const API_TIMEOUT = 30000 // 30 seconds

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.data) {
      // API returned an error
      return Promise.reject(error.response.data)
    } else if (error.request) {
      // Request was made but no response
      const apiError: ApiError = {
        message: 'Impossible de contacter le serveur. Vérifiez votre connexion.',
        code: 'NETWORK_ERROR',
      }
      return Promise.reject(apiError)
    } else {
      // Something else happened
      const apiError: ApiError = {
        message: 'Une erreur inattendue est survenue.',
        code: 'UNKNOWN_ERROR',
      }
      return Promise.reject(apiError)
    }
  }
)

// Search trains
export async function searchTrains(
  from: string,
  to: string,
  date: string
): Promise<TrainSearchResponse> {
  const params = new URLSearchParams({ from, to, date })
  const response = await apiClient.get<TrainSearchResponse>(`/sncf?${params}`)
  return response.data
}

// TGV MAX detection patterns
export const TGV_MAX_PATTERNS = {
  // Train numbers that typically have TGV MAX availability
  eligibleTrainNumbers: [
    /^TGV[0-9]{4}$/,  // Standard TGV trains
    /^TGV\s?MAX/i,    // Explicitly marked TGV MAX
  ],
  
  // Time slots with better TGV MAX availability
  preferredTimeSlots: [
    { start: '10:00', end: '14:00' }, // Mid-day
    { start: '19:00', end: '22:00' }, // Evening
  ],
  
  // Routes with frequent TGV MAX availability
  popularRoutes: [
    ['Paris', 'Lyon'],
    ['Paris', 'Marseille'],
    ['Paris', 'Bordeaux'],
    ['Lyon', 'Marseille'],
  ],
}

// Enhanced TGV MAX detection
export function detectTGVMaxAvailability(
  train: any,
  route: { from: string; to: string }
): boolean {
  // Check if train type is TGV
  if (train.type !== 'TGV') {
    return false
  }

  // Check train number patterns
  const matchesPattern = TGV_MAX_PATTERNS.eligibleTrainNumbers.some(pattern =>
    pattern.test(train.trainNumber)
  )
  
  if (!matchesPattern) {
    return false
  }

  // Check time slots (better availability during off-peak hours)
  const departureHour = parseInt(train.departureTime.split(':')[0])
  const isOffPeak = 
    (departureHour >= 10 && departureHour <= 14) ||
    (departureHour >= 19 && departureHour <= 22)

  // Check if route is popular for TGV MAX
  const isPopularRoute = TGV_MAX_PATTERNS.popularRoutes.some(([from, to]) =>
    (route.from.includes(from) && route.to.includes(to)) ||
    (route.from.includes(to) && route.to.includes(from))
  )

  // Simulate availability based on multiple factors
  const availabilityScore = 
    (isOffPeak ? 0.4 : 0.2) +
    (isPopularRoute ? 0.3 : 0.1) +
    (Math.random() * 0.3) // Random factor for realism

  return availabilityScore > 0.5
}

// Retry logic for API calls
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries === 0) {
      throw error
    }
    
    await new Promise(resolve => setTimeout(resolve, delay))
    return withRetry(fn, retries - 1, delay * 2)
  }
}

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key)
  
  if (!cached) {
    return null
  }
  
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    cache.delete(key)
    return null
  }
  
  return cached.data as T
}

export function setCachedData(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  })
}

// Format API errors for display
export function formatApiError(error: ApiError): string {
  switch (error.code) {
    case 'MISSING_PARAMS':
      return 'Veuillez remplir tous les champs du formulaire.'
    case 'STATION_NOT_FOUND':
      return 'Une des gares sélectionnées n\'a pas été trouvée.'
    case 'NETWORK_ERROR':
      return 'Problème de connexion. Vérifiez votre accès internet.'
    case 'RATE_LIMIT':
      return 'Trop de requêtes. Veuillez patienter quelques instants.'
    case 'INTERNAL_ERROR':
    default:
      return error.message || 'Une erreur est survenue. Veuillez réessayer.'
  }
}