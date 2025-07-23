# API Integration Guide

This application now supports **real TGV MAX availability data** through web scraping! You can also integrate with various APIs for additional features.

## Option 0: Web Scraping (NEW! - Real TGV MAX Data)

Get actual TGV MAX availability directly from SNCF Connect website.

### Setup:
1. Copy `.env.example` to `.env`
2. Set `NEXT_PUBLIC_USE_MOCK_DATA=false`
3. Restart the application

### Configuration:
```env
# Enable real data scraping
NEXT_PUBLIC_USE_MOCK_DATA=false

# Scraper settings
SNCF_CONNECT_HEADLESS=true      # Run browser in headless mode
SNCF_CONNECT_TIMEOUT=30000      # Page load timeout (ms)
CACHE_TTL=300                   # Cache duration (seconds)
```

### Features:
- ✅ Real TGV MAX availability badges
- ✅ Actual train schedules and prices
- ✅ Automatic fallback to mock data on errors
- ✅ 5-minute result caching
- ✅ Docker support with Chromium included

### How it works:
1. Uses Puppeteer to automate a headless Chrome browser
2. Navigates to SNCF Connect and fills the search form
3. Extracts train data including TGV MAX availability
4. Caches results to minimize requests

### Limitations:
- Slower than API calls (10-15 seconds per search)
- May break if SNCF Connect changes their website
- Rate limiting recommended to avoid being blocked

## Option 1: Navitia.io (API Alternative)

Navitia provides comprehensive public transport data including real-time information.

### Setup:
1. Register at https://www.navitia.io/
2. Get your API token
3. Update `.env`:
   ```
   NAVITIA_API_KEY=your_token_here
   NAVITIA_API_URL=https://api.navitia.io/v1
   NEXT_PUBLIC_USE_MOCK_DATA=false
   ```

### Implementation:
Update `/app/api/sncf/route.ts` to use Navitia:

```typescript
const response = await fetch(
  `${process.env.NAVITIA_API_URL}/journeys?from=${fromCoord}&to=${toCoord}&datetime=${date}`,
  {
    headers: {
      'Authorization': process.env.NAVITIA_API_KEY
    }
  }
)
```

## Option 2: SNCF Open Data

Free access to SNCF timetable data.

### Setup:
1. Register at https://ressources.data.sncf.com/
2. Get your API key
3. Find the "Horaires des trains voyageurs" dataset

### Endpoints:
- Train schedules: `https://api.sncf.com/v1/coverage/sncf/journeys`
- Station data: `https://api.sncf.com/v1/coverage/sncf/stop_areas`

## Option 3: Official SNCF API

For commercial applications with SLA requirements.

### Setup:
1. Contact SNCF at https://numerique.sncf.com/startup/api/
2. Request API access (may require business agreement)
3. Implement OAuth2 authentication

## TGV MAX Availability

Unfortunately, **no public API provides TGV MAX availability**. The current detection is based on:
- Train type (TGV)
- Price patterns (lower prices often indicate TGV MAX)
- Time patterns (off-peak hours)

For accurate TGV MAX data, you would need to:
1. Web scrape the SNCF website (check legal terms)
2. Use the official SNCF mobile app API (reverse engineering required)
3. Partner directly with SNCF

## Quick Start with Real Data

1. Copy `.env.example` to `.env`
2. Add your API credentials
3. Update `/app/api/sncf/route.ts` to call the real API instead of `generateMockTrains()`
4. Map the API response to our `Train` interface
5. Test with: `npm run dev`

## Example API Response Mapping

```typescript
// Navitia response to our Train interface
function mapNavitiaToTrain(journey: any): Train {
  return {
    trainNumber: journey.sections[0].display_informations?.headsign || 'Unknown',
    type: journey.sections[0].display_informations?.commercial_mode || 'Train',
    departureTime: formatTime(journey.departure_date_time),
    arrivalTime: formatTime(journey.arrival_date_time),
    duration: journey.duration / 60, // Convert seconds to minutes
    stops: journey.nb_transfers,
    platform: journey.sections[0].stop_point_departure?.platform,
    tgvMaxAvailable: detectTGVMaxAvailability(journey),
    price: undefined, // Not provided by Navitia
  }
}
```

## Testing

After implementing real API:
1. Update tests to mock API responses
2. Add error handling for API limits
3. Implement caching to reduce API calls
4. Add retry logic for failed requests