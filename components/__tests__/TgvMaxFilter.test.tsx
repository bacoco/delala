import { render, screen, fireEvent } from '@testing-library/react'
import { SearchFilters, Train } from '@/types'

// Test the filter logic directly
function applyFilters(trains: Train[], filters: SearchFilters): Train[] {
  let filtered = [...trains]
  
  if (filters.tgvMaxOnly) {
    filtered = filtered.filter(train => train.tgvMaxAvailable === true)
  }
  
  return filtered
}

describe('TGV MAX Filter', () => {
  const mockTrains: Train[] = [
    {
      trainNumber: 'TGV6000',
      type: 'TGV',
      departureTime: '08:00',
      arrivalTime: '10:00',
      duration: 120,
      stops: 0,
      tgvMaxAvailable: true,
      price: 0,
    },
    {
      trainNumber: 'TGV6001',
      type: 'TGV',
      departureTime: '09:00',
      arrivalTime: '11:00',
      duration: 120,
      stops: 0,
      tgvMaxAvailable: false,
      price: 89,
    },
    {
      trainNumber: 'TGV6002',
      type: 'TGV',
      departureTime: '10:00',
      arrivalTime: '12:00',
      duration: 120,
      stops: 0,
      tgvMaxAvailable: true,
      price: 0,
    },
    {
      trainNumber: 'OUIGO7000',
      type: 'OUIGO',
      departureTime: '11:00',
      arrivalTime: '13:30',
      duration: 150,
      stops: 1,
      tgvMaxAvailable: false,
      price: 25,
    },
  ]

  it('shows all trains when tgvMaxOnly is false', () => {
    const filters: SearchFilters = { tgvMaxOnly: false }
    const filtered = applyFilters(mockTrains, filters)
    expect(filtered).toHaveLength(4)
  })

  it('shows only TGV MAX trains when tgvMaxOnly is true', () => {
    const filters: SearchFilters = { tgvMaxOnly: true }
    const filtered = applyFilters(mockTrains, filters)
    expect(filtered).toHaveLength(2)
    expect(filtered.every(train => train.tgvMaxAvailable)).toBe(true)
    expect(filtered[0].trainNumber).toBe('TGV6000')
    expect(filtered[1].trainNumber).toBe('TGV6002')
  })

  it('returns empty array when no TGV MAX trains available', () => {
    const noMaxTrains: Train[] = mockTrains.map(train => ({
      ...train,
      tgvMaxAvailable: false,
    }))
    const filters: SearchFilters = { tgvMaxOnly: true }
    const filtered = applyFilters(noMaxTrains, filters)
    expect(filtered).toHaveLength(0)
  })

  it('combines with other filters', () => {
    const filters: SearchFilters = {
      tgvMaxOnly: true,
      timeRange: { start: '09:30', end: '11:00' },
    }
    
    // Apply time filter first
    let filtered = mockTrains.filter(train => {
      return train.departureTime >= '09:30' && train.departureTime <= '11:00'
    })
    
    // Then apply TGV MAX filter
    if (filters.tgvMaxOnly) {
      filtered = filtered.filter(train => train.tgvMaxAvailable === true)
    }
    
    expect(filtered).toHaveLength(1)
    expect(filtered[0].trainNumber).toBe('TGV6002')
  })
})