import { NextRequest, NextResponse } from 'next/server'
import { Train, TrainSearchResponse, ApiError } from '@/types'
import { getStationByName } from '@/lib/stations'
import { detectTGVMaxAvailability, setCachedData, getCachedData } from '@/lib/api'
import { scrapeTrains } from '@/lib/services/sncf-connect-scraper'

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

// Mock train data for prototype
// In production, this would call actual SNCF API
function generateMockTrains(from: string, to: string, date: string): Train[] {
  const trains: Train[] = []
  const baseTime = new Date(`${date}T06:00:00`)
  
  // Generate 10-15 trains throughout the day
  const trainCount = Math.floor(Math.random() * 6) + 10
  
  for (let i = 0; i < trainCount; i++) {
    const departureTime = new Date(baseTime.getTime() + i * 60 * 60 * 1000) // Every hour
    const duration = Math.floor(Math.random() * 180) + 120 // 2-5 hours
    const arrivalTime = new Date(departureTime.getTime() + duration * 60 * 1000)
    
    const trainTypes = ['TGV', 'TGV', 'TGV', 'TER', 'Intercités'] // More TGVs
    const trainType = trainTypes[Math.floor(Math.random() * trainTypes.length)]
    
    // Enhanced TGV MAX detection
    const tgvMaxAvailable = detectTGVMaxAvailability(
      { type: trainType, trainNumber: `${trainType}${Math.floor(Math.random() * 9000) + 1000}`, departureTime: departureTime.toTimeString().slice(0, 5) },
      { from, to }
    )
    
    trains.push({
      trainNumber: `${trainType}${Math.floor(Math.random() * 9000) + 1000}`,
      type: trainType,
      departureTime: departureTime.toTimeString().slice(0, 5),
      arrivalTime: arrivalTime.toTimeString().slice(0, 5),
      duration,
      stops: Math.floor(Math.random() * 4),
      platform: Math.random() > 0.5 ? `${Math.floor(Math.random() * 20) + 1}` : undefined,
      tgvMaxAvailable,
      price: trainType === 'TGV' ? Math.floor(Math.random() * 80) + 40 : Math.floor(Math.random() * 40) + 20,
    })
  }
  
  return trains.sort((a, b) => a.departureTime.localeCompare(b.departureTime))
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
    
    let trains: Train[] = []
    
    // Use real data if not in mock mode
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'true') {
      try {
        console.log('Scraping real data from SNCF Connect...')
        trains = await scrapeTrains(departureStation, arrivalStation, new Date(date))
        console.log(`Found ${trains.length} trains with real TGV MAX availability`)
      } catch (scrapingError) {
        console.error('Scraping failed, falling back to mock data:', scrapingError)
        // Fall back to mock data on error
        trains = generateMockTrains(from, to, date)
      }
    } else {
      // Use mock data in development/prototype mode
      await new Promise(resolve => setTimeout(resolve, 800))
      trains = generateMockTrains(from, to, date)
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
      message: 'Une erreur est survenue lors de la recherche des trains.',
      code: 'INTERNAL_ERROR',
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