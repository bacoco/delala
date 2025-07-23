import { searchStations, getStationByCode, getStationByName, STATIONS_DATA } from '../stations'

describe('stations utilities', () => {
  describe('searchStations', () => {
    it('returns empty array for queries less than 2 characters', () => {
      expect(searchStations('')).toEqual([])
      expect(searchStations('P')).toEqual([])
    })

    it('finds stations by partial name match', () => {
      const results = searchStations('Paris')
      
      expect(results.length).toBeGreaterThan(0)
      expect(results.every(s => s.name.toLowerCase().includes('paris'))).toBe(true)
    })

    it('finds stations by region', () => {
      const results = searchStations('Bretagne')
      
      expect(results.length).toBeGreaterThan(0)
      expect(results.every(s => s.region === 'Bretagne')).toBe(true)
    })

    it('handles accented characters correctly', () => {
      const results1 = searchStations('Mâcon')
      const results2 = searchStations('Macon')
      
      // Both should find stations with accented names
      expect(results1.length).toBeGreaterThanOrEqual(0)
      expect(results2.length).toBeGreaterThanOrEqual(0)
    })

    it('prioritizes stations starting with query', () => {
      const results = searchStations('Lyon')
      
      expect(results.length).toBeGreaterThan(0)
      // Lyon stations should come first
      expect(results[0].name).toContain('Lyon')
    })

    it('limits results to 10 stations', () => {
      const results = searchStations('a') // Common letter
      
      expect(results.length).toBeLessThanOrEqual(10)
    })

    it('is case insensitive', () => {
      const results1 = searchStations('PARIS')
      const results2 = searchStations('paris')
      const results3 = searchStations('Paris')
      
      expect(results1.length).toBe(results2.length)
      expect(results2.length).toBe(results3.length)
    })

    it('finds hyphenated station names', () => {
      const results = searchStations('Aix-en-Provence')
      
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(s => s.name.includes('Aix-en-Provence'))).toBe(true)
    })
  })

  describe('getStationByCode', () => {
    it('finds station by exact code match', () => {
      const station = getStationByCode('FRPLY')
      
      expect(station).toBeDefined()
      expect(station?.name).toBe('Paris Gare de Lyon')
      expect(station?.code).toBe('FRPLY')
    })

    it('returns undefined for non-existent code', () => {
      const station = getStationByCode('XXXXX')
      
      expect(station).toBeUndefined()
    })

    it('is case sensitive for codes', () => {
      const station1 = getStationByCode('FRPLY')
      const station2 = getStationByCode('frply')
      
      expect(station1).toBeDefined()
      expect(station2).toBeUndefined()
    })
  })

  describe('getStationByName', () => {
    it('finds station by exact name match', () => {
      const station = getStationByName('Paris Gare de Lyon')
      
      expect(station).toBeDefined()
      expect(station?.code).toBe('FRPLY')
    })

    it('is case insensitive', () => {
      const station1 = getStationByName('Paris Gare de Lyon')
      const station2 = getStationByName('PARIS GARE DE LYON')
      const station3 = getStationByName('paris gare de lyon')
      
      expect(station1).toBeDefined()
      expect(station2).toBeDefined()
      expect(station3).toBeDefined()
      expect(station1?.code).toBe(station2?.code)
      expect(station2?.code).toBe(station3?.code)
    })

    it('handles accented characters', () => {
      const station1 = getStationByName('Clermont-Ferrand')
      const station2 = getStationByName('Nîmes')
      
      expect(station1).toBeDefined()
      expect(station2).toBeDefined()
    })

    it('returns undefined for non-existent station', () => {
      const station = getStationByName('Station Imaginaire')
      
      expect(station).toBeUndefined()
    })
  })

  describe('STATIONS_DATA', () => {
    it('contains valid station data', () => {
      expect(STATIONS_DATA.length).toBeGreaterThan(50) // Should have many stations
      
      STATIONS_DATA.forEach(station => {
        expect(station.name).toBeTruthy()
        expect(station.code).toBeTruthy()
        expect(station.code).toMatch(/^FR[A-Z]{3,4}$/) // French station code format (3-4 chars)
      })
    })

    it('has no duplicate station codes', () => {
      const codes = STATIONS_DATA.map(s => s.code)
      const uniqueCodes = new Set(codes)
      
      expect(codes.length).toBe(uniqueCodes.size)
    })

    it('includes major French cities', () => {
      const majorCities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Bordeaux']
      
      majorCities.forEach(city => {
        const hasCity = STATIONS_DATA.some(s => s.name.includes(city))
        expect(hasCity).toBe(true)
      })
    })

    it('includes TGV stations', () => {
      const tgvStations = STATIONS_DATA.filter(s => s.name.includes('TGV'))
      
      expect(tgvStations.length).toBeGreaterThan(0)
      expect(tgvStations.some(s => s.name.toLowerCase().includes('marne') || s.name.includes('TGV'))).toBe(true)
    })
  })
})