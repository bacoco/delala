import { NextRequest, NextResponse } from 'next/server'
import { Train, TrainSearchResponse, ApiError } from '@/types'
import { getStationByName } from '@/lib/stations'

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
    
    // TGV MAX availability (more realistic: only some TGVs have availability)
    const tgvMaxAvailable = trainType === 'TGV' && Math.random() > 0.7 // 30% of TGVs
    
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

    // In production, make actual API call here
    // For now, simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Generate mock data
    const trains = generateMockTrains(from, to, date)

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