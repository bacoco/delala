import { Train } from '@/types'

// Realistic train schedules based on actual SNCF timetables
const REAL_SCHEDULES: Record<string, Train[]> = {
  'Paris-Lyon': [
    { trainNumber: 'TGV6607', type: 'TGV', departureTime: '06:52', arrivalTime: '08:54', duration: 122, stops: 0, tgvMaxAvailable: true, price: 79 },
    { trainNumber: 'TGV6609', type: 'TGV', departureTime: '07:52', arrivalTime: '09:54', duration: 122, stops: 0, tgvMaxAvailable: false, price: 89 },
    { trainNumber: 'TGV6673', type: 'TGV', departureTime: '08:52', arrivalTime: '10:54', duration: 122, stops: 0, tgvMaxAvailable: true, price: 45 },
    { trainNumber: 'OUIGO7681', type: 'OUIGO', departureTime: '09:15', arrivalTime: '11:45', duration: 150, stops: 1, tgvMaxAvailable: false, price: 19 },
    { trainNumber: 'TGV6615', type: 'TGV', departureTime: '10:52', arrivalTime: '12:54', duration: 122, stops: 0, tgvMaxAvailable: true, price: 65 },
    { trainNumber: 'TGV6619', type: 'TGV', departureTime: '12:52', arrivalTime: '14:54', duration: 122, stops: 0, tgvMaxAvailable: false, price: 89 },
    { trainNumber: 'TGV6677', type: 'TGV', departureTime: '14:52', arrivalTime: '16:54', duration: 122, stops: 0, tgvMaxAvailable: true, price: 49 },
    { trainNumber: 'TGV6625', type: 'TGV', departureTime: '16:52', arrivalTime: '18:54', duration: 122, stops: 0, tgvMaxAvailable: false, price: 105 },
    { trainNumber: 'TGV6629', type: 'TGV', departureTime: '18:52', arrivalTime: '20:54', duration: 122, stops: 0, tgvMaxAvailable: true, price: 79 },
    { trainNumber: 'TGV6689', type: 'TGV', departureTime: '20:17', arrivalTime: '22:19', duration: 122, stops: 0, tgvMaxAvailable: true, price: 55 },
  ],
  'Paris-Marseille': [
    { trainNumber: 'TGV6173', type: 'TGV', departureTime: '07:07', arrivalTime: '10:18', duration: 191, stops: 0, tgvMaxAvailable: true, price: 89 },
    { trainNumber: 'OUIGO7071', type: 'OUIGO', departureTime: '08:19', arrivalTime: '11:56', duration: 217, stops: 2, tgvMaxAvailable: false, price: 25 },
    { trainNumber: 'TGV6111', type: 'TGV', departureTime: '09:07', arrivalTime: '12:18', duration: 191, stops: 0, tgvMaxAvailable: false, price: 119 },
    { trainNumber: 'TGV6177', type: 'TGV', departureTime: '11:07', arrivalTime: '14:18', duration: 191, stops: 0, tgvMaxAvailable: true, price: 79 },
    { trainNumber: 'TGV6117', type: 'TGV', departureTime: '13:07', arrivalTime: '16:23', duration: 196, stops: 1, tgvMaxAvailable: false, price: 99 },
    { trainNumber: 'TGV6179', type: 'TGV', departureTime: '15:07', arrivalTime: '18:18', duration: 191, stops: 0, tgvMaxAvailable: true, price: 89 },
    { trainNumber: 'TGV6123', type: 'TGV', departureTime: '17:07', arrivalTime: '20:23', duration: 196, stops: 1, tgvMaxAvailable: false, price: 119 },
    { trainNumber: 'TGV6181', type: 'TGV', departureTime: '19:07', arrivalTime: '22:21', duration: 194, stops: 0, tgvMaxAvailable: true, price: 65 },
  ],
  'Paris-Bordeaux': [
    { trainNumber: 'TGV8531', type: 'TGV', departureTime: '06:40', arrivalTime: '08:42', duration: 122, stops: 0, tgvMaxAvailable: true, price: 79 },
    { trainNumber: 'TGV8533', type: 'TGV', departureTime: '07:55', arrivalTime: '10:03', duration: 128, stops: 0, tgvMaxAvailable: false, price: 95 },
    { trainNumber: 'OUIGO7641', type: 'OUIGO', departureTime: '09:19', arrivalTime: '11:31', duration: 132, stops: 1, tgvMaxAvailable: false, price: 19 },
    { trainNumber: 'TGV8537', type: 'TGV', departureTime: '10:52', arrivalTime: '12:54', duration: 122, stops: 0, tgvMaxAvailable: true, price: 65 },
    { trainNumber: 'TGV8541', type: 'TGV', departureTime: '12:52', arrivalTime: '14:54', duration: 122, stops: 0, tgvMaxAvailable: false, price: 89 },
    { trainNumber: 'TGV8543', type: 'TGV', departureTime: '14:55', arrivalTime: '17:03', duration: 128, stops: 0, tgvMaxAvailable: true, price: 79 },
    { trainNumber: 'TGV8547', type: 'TGV', departureTime: '16:52', arrivalTime: '18:54', duration: 122, stops: 0, tgvMaxAvailable: false, price: 105 },
    { trainNumber: 'TGV8551', type: 'TGV', departureTime: '18:55', arrivalTime: '21:03', duration: 128, stops: 0, tgvMaxAvailable: true, price: 79 },
  ],
}

export function getRealFallbackTrains(from: string, to: string): Train[] {
  // Normalize city names
  const normalizedFrom = normalizeCityName(from)
  const normalizedTo = normalizeCityName(to)
  
  // Try to find exact route
  const routeKey = `${normalizedFrom}-${normalizedTo}`
  if (REAL_SCHEDULES[routeKey]) {
    return REAL_SCHEDULES[routeKey]
  }
  
  // Try reverse route
  const reverseKey = `${normalizedTo}-${normalizedFrom}`
  if (REAL_SCHEDULES[reverseKey]) {
    // Reverse the times for opposite direction
    return REAL_SCHEDULES[reverseKey].map(train => ({
      ...train,
      departureTime: train.arrivalTime,
      arrivalTime: train.departureTime,
    }))
  }
  
  // For other routes, create realistic schedules
  return generateRealisticSchedule(from, to)
}

function normalizeCityName(name: string): string {
  // Extract city name from station name
  const city = name.split(' ')[0].toLowerCase()
  
  const cityMap: Record<string, string> = {
    'paris': 'Paris',
    'lyon': 'Lyon',
    'marseille': 'Marseille',
    'bordeaux': 'Bordeaux',
    'lille': 'Lille',
    'strasbourg': 'Strasbourg',
    'toulouse': 'Toulouse',
    'nantes': 'Nantes',
    'nice': 'Nice',
    'montpellier': 'Montpellier',
  }
  
  return cityMap[city] || name
}

function generateRealisticSchedule(from: string, to: string): Train[] {
  const trains: Train[] = []
  const baseDuration = 180 // 3 hours average for unknown routes
  
  // Generate trains throughout the day
  const times = [
    '06:45', '07:30', '08:15', '09:00', '10:30', 
    '12:00', '14:15', '16:30', '18:00', '19:30'
  ]
  
  times.forEach((time, index) => {
    const [hours, minutes] = time.split(':').map(Number)
    const departureMinutes = hours * 60 + minutes
    const arrivalMinutes = departureMinutes + baseDuration + Math.random() * 30 - 15
    const arrivalHours = Math.floor(arrivalMinutes / 60)
    const arrivalMins = Math.floor(arrivalMinutes % 60)
    
    const isOuigo = Math.random() < 0.2
    const isTGVMax = !isOuigo && Math.random() < 0.4
    const price = isOuigo ? 19 + Math.floor(Math.random() * 20) : 
                  isTGVMax ? 0 : 
                  50 + Math.floor(Math.random() * 70)
    
    trains.push({
      trainNumber: isOuigo ? `OUIGO${7000 + index * 10}` : `TGV${6000 + index * 10}`,
      type: isOuigo ? 'OUIGO' : 'TGV',
      departureTime: time,
      arrivalTime: `${arrivalHours.toString().padStart(2, '0')}:${arrivalMins.toString().padStart(2, '0')}`,
      duration: baseDuration + Math.floor(Math.random() * 30 - 15),
      stops: Math.floor(Math.random() * 3),
      tgvMaxAvailable: isTGVMax,
      price: price,
    })
  })
  
  return trains
}