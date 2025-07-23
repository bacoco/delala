import { NextRequest, NextResponse } from 'next/server'
import { TrainSearchResponse, ApiError, Train } from '@/types'
import { getStationByName } from '@/lib/stations'
import { setCachedData, getCachedData } from '@/lib/api'
import { scrapeTrains } from '@/lib/services/sncf-connect-scraper'
import { fetchTrainsFromAPI } from '@/lib/services/sncf-api-service'
import { getRealFallbackTrains } from '@/lib/services/fallback-data'

// Rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10 // requests per minute
const RATE_WINDOW = 60 * 1000 // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const userLimit = requestCounts.get(ip)
  
  if (!userLimit || now > userLimit.resetTime) {
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + RATE_WINDOW,
    })
    return true
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false
  }
  
  userLimit.count++
  return true
}


export async function GET(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      const error: ApiError = {
        message: 'Trop de requêtes. Veuillez patienter avant de réessayer.',
        code: 'RATE_LIMIT',
      }
      return NextResponse.json(error, { status: 429 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const date = searchParams.get('date')

    // Validate parameters
    if (!from || !to || !date) {
      const error: ApiError = {
        message: 'Paramètres manquants. Veuillez fournir from, to et date.',
        code: 'MISSING_PARAMS',
      }
      return NextResponse.json(error, { status: 400 })
    }

    // Get station information
    const departureStation = getStationByName(from)
    const arrivalStation = getStationByName(to)

    if (!departureStation || !arrivalStation) {
      const error: ApiError = {
        message: 'Gare non trouvée. Veuillez vérifier les noms des gares.',
        code: 'STATION_NOT_FOUND',
      }
      return NextResponse.json(error, { status: 404 })
    }

    // Check cache first
    const cacheKey = `trains:${from}:${to}:${date}`
    const cachedResponse = getCachedData<TrainSearchResponse>(cacheKey)
    
    if (cachedResponse) {
      return NextResponse.json(cachedResponse)
    }
    
    // Try multiple approaches to get real data
    let trains: Train[] = []
    let dataSource = 'unknown'
    
    // Approach 1: Try web scraping
    try {
      console.log('Attempting to scrape data from SNCF Connect...')
      trains = await scrapeTrains(departureStation, arrivalStation, new Date(date))
      dataSource = 'scraper'
      console.log(`Scraper found ${trains.length} trains`)
    } catch (scrapingError) {
      console.error('Scraping failed:', scrapingError)
      
      // Approach 2: Try API endpoints
      try {
        console.log('Falling back to API endpoints...')
        trains = await fetchTrainsFromAPI(departureStation, arrivalStation, new Date(date))
        dataSource = 'api'
        console.log(`API found ${trains.length} trains`)
      } catch (apiError) {
        console.error('API fetch also failed:', apiError)
      }
    }
    
    // If we still have no trains, use realistic fallback data
    if (trains.length === 0) {
      console.log('Using fallback train schedules...')
      trains = getRealFallbackTrains(from, to)
      dataSource = 'fallback'
      
      // Add a warning to the response
      if (trains.length > 0) {
        // Add metadata to indicate this is fallback data
        const response: TrainSearchResponse = {
          trains,
          searchDate: new Date(date),
          route: {
            departureStation,
            arrivalStation,
            date: new Date(date),
          },
          totalResults: trains.length,
          warning: 'Attention : Les données en temps réel ne sont pas disponibles. Ces horaires sont basés sur les grilles horaires habituelles et peuvent ne pas refléter la disponibilité actuelle.',
        }
        
        // Don't cache fallback data for long
        setCachedData(cacheKey, response, 60000) // Only 1 minute cache
        
        return NextResponse.json(response)
      }
    }

    const response: TrainSearchResponse = {
      trains,
      searchDate: new Date(date),
      route: {
        departureStation,
        arrivalStation,
        date: new Date(date),
      },
      totalResults: trains.length,
    }

    // Cache the response
    setCachedData(cacheKey, response)

    return NextResponse.json(response)
  } catch (error) {
    console.error('API Error:', error)
    const apiError: ApiError = {
      message: error instanceof Error && error.message.includes('Failed to scrape') 
        ? 'Impossible de récupérer les données depuis SNCF Connect. Veuillez réessayer dans quelques instants.'
        : 'Une erreur est survenue lors de la recherche des trains.',
      code: error instanceof Error && error.message.includes('Failed to scrape') ? 'SCRAPING_ERROR' : 'INTERNAL_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error',
    }
    return NextResponse.json(apiError, { status: 500 })
  }
}

// Future: POST endpoint for creating notifications
export async function POST(request: NextRequest) {
  const error: ApiError = {
    message: 'Les notifications ne sont pas encore implémentées.',
    code: 'NOT_IMPLEMENTED',
  }
  return NextResponse.json(error, { status: 501 })
}