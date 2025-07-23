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
const cache = new Map<string, { data: any; timestamp: number; duration?: number }>()
const CACHE_DURATION = (parseInt(process.env.CACHE_TTL || '300') * 1000) || 5 * 60 * 1000 // Default 5 minutes

export function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key)
  
  if (!cached) {
    return null
  }
  
  const cacheDuration = cached.duration || CACHE_DURATION
  if (Date.now() - cached.timestamp > cacheDuration) {
    cache.delete(key)
    return null
  }
  
  return cached.data as T
}

export function setCachedData(key: string, data: any, duration?: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    duration: duration || CACHE_DURATION,
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
    case 'SCRAPING_ERROR':
      return 'Impossible de récupérer les données depuis SNCF Connect. Le site est peut-être temporairement indisponible.'
    case 'INTERNAL_ERROR':
    default:
      return error.message || 'Une erreur est survenue. Veuillez réessayer.'
  }
}