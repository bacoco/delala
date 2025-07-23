import axios from 'axios'
import { Train, Station } from '@/types'

// Alternative approach using SNCF's public APIs
export async function fetchTrainsFromAPI(
  departureStation: Station,
  arrivalStation: Station,
  date: Date
): Promise<Train[]> {
  try {
    // Try different SNCF API endpoints
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
    
    // Option 1: Try the public SNCF API
    const endpoints = [
      // SNCF Open Data API
      `https://api.sncf.com/v1/coverage/sncf/journeys?from=stop_area:SNCF:${departureStation.code}&to=stop_area:SNCF:${arrivalStation.code}&datetime=${dateStr}`,
      // Alternative endpoint
      `https://www.sncf.com/api/journeys/search?origin=${departureStation.code}&destination=${arrivalStation.code}&date=${dateStr}`,
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint, {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'TGVMaxChecker/1.0',
          }
        })

        if (response.data && response.data.journeys) {
          return parseJourneys(response.data.journeys)
        }
      } catch (e) {
        console.log(`API endpoint failed: ${endpoint}`)
      }
    }

    // If all APIs fail, return empty array
    return []
  } catch (error) {
    console.error('API fetch error:', error)
    return []
  }
}

function parseJourneys(journeys: any[]): Train[] {
  return journeys.map((journey, index) => {
    const departure = new Date(journey.departure_date_time || journey.departure)
    const arrival = new Date(journey.arrival_date_time || journey.arrival)
    const duration = Math.round((arrival.getTime() - departure.getTime()) / 60000) // minutes

    return {
      trainNumber: journey.sections?.[0]?.display_informations?.headsign || `Train${index}`,
      type: journey.sections?.[0]?.display_informations?.commercial_mode || 'Train',
      departureTime: departure.toTimeString().slice(0, 5),
      arrivalTime: arrival.toTimeString().slice(0, 5),
      duration,
      stops: journey.nb_transfers || 0,
      platform: journey.sections?.[0]?.stop_point_departure?.platform,
      tgvMaxAvailable: checkTGVMaxFromJourney(journey),
      price: journey.price?.value || journey.fare?.price,
    }
  })
}

function checkTGVMaxFromJourney(journey: any): boolean {
  // Check various indicators for TGV MAX
  const mode = journey.sections?.[0]?.display_informations?.commercial_mode?.toLowerCase() || ''
  const price = journey.price?.value || journey.fare?.price || 999
  
  return mode.includes('tgv') && (price === 0 || journey.tags?.includes('TGV_MAX'))
}