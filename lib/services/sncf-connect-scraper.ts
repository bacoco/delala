import puppeteer, { Browser, Page } from 'puppeteer'
import * as cheerio from 'cheerio'
import { Train, Station } from '@/types'

interface ScraperOptions {
  headless?: boolean
  timeout?: number
}

interface SNCFTrain {
  trainNumber: string
  departureTime: string
  arrivalTime: string
  duration: number
  type: string
  price?: number
  tgvMaxAvailable: boolean
  platform?: string
  stops: number
}

class SNCFConnectScraper {
  private browser: Browser | null = null
  private page: Page | null = null
  private options: ScraperOptions

  constructor(options: ScraperOptions = {}) {
    this.options = {
      headless: options.headless ?? true,
      timeout: options.timeout ?? 30000,
    }
  }

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: this.options.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ],
      })
    }
    if (!this.page) {
      this.page = await this.browser.newPage()
      await this.page.setViewport({ width: 1920, height: 1080 })
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
      
      // Set French language and location
      await this.page.setExtraHTTPHeaders({
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'
      })
    }
  }

  async searchTrains(
    departureStation: Station,
    arrivalStation: Station,
    date: Date
  ): Promise<SNCFTrain[]> {
    try {
      await this.initialize()
      if (!this.page) throw new Error('Page not initialized')

      // Navigate to SNCF Connect
      await this.page.goto('https://www.sncf-connect.com/', {
        waitUntil: 'networkidle2',
        timeout: this.options.timeout,
      })

      // Wait for and handle cookie consent if present
      try {
        await this.page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 5000 })
        await this.page.click('#onetrust-accept-btn-handler')
        await this.page.waitForTimeout(1000)
      } catch (e) {
        // Cookie banner might not appear, continue
      }

      // Fill in the search form
      // Departure station
      await this.page.waitForSelector('input[data-testid="departure-input"]', { timeout: 10000 })
      await this.page.click('input[data-testid="departure-input"]')
      await this.page.type('input[data-testid="departure-input"]', departureStation.name)
      await this.page.waitForTimeout(1000)
      
      // Select first suggestion
      await this.page.waitForSelector('[data-testid="autocomplete-suggestion"]', { timeout: 5000 })
      await this.page.click('[data-testid="autocomplete-suggestion"]')

      // Arrival station
      await this.page.waitForSelector('input[data-testid="arrival-input"]', { timeout: 10000 })
      await this.page.click('input[data-testid="arrival-input"]')
      await this.page.type('input[data-testid="arrival-input"]', arrivalStation.name)
      await this.page.waitForTimeout(1000)
      
      // Select first suggestion
      await this.page.waitForSelector('[data-testid="autocomplete-suggestion"]', { timeout: 5000 })
      await this.page.click('[data-testid="autocomplete-suggestion"]')

      // Date selection
      const formattedDate = date.toISOString().split('T')[0]
      await this.page.waitForSelector('input[data-testid="date-input"]', { timeout: 10000 })
      await this.page.click('input[data-testid="date-input"]')
      await this.page.evaluate((dateStr) => {
        const input = document.querySelector('input[data-testid="date-input"]') as HTMLInputElement
        if (input) {
          input.value = dateStr
          input.dispatchEvent(new Event('change', { bubbles: true }))
        }
      }, formattedDate)

      // Submit search
      await this.page.waitForSelector('button[data-testid="search-button"]', { timeout: 10000 })
      await this.page.click('button[data-testid="search-button"]')

      // Wait for results page
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: this.options.timeout })
      await this.page.waitForSelector('[data-testid="journey-card"]', { timeout: 15000 })

      // Extract train data
      const html = await this.page.content()
      const $ = cheerio.load(html)
      const trains: SNCFTrain[] = []

      $('[data-testid="journey-card"]').each((index, element) => {
        const $card = $(element)
        
        // Extract train details
        const departureTime = $card.find('[data-testid="departure-time"]').text().trim()
        const arrivalTime = $card.find('[data-testid="arrival-time"]').text().trim()
        const duration = this.parseDuration($card.find('[data-testid="duration"]').text().trim())
        const trainType = $card.find('[data-testid="train-type"]').text().trim() || 'Train'
        const trainNumber = $card.find('[data-testid="train-number"]').text().trim() || `${trainType}${index}`
        
        // Check for TGV MAX availability
        const tgvMaxElement = $card.find('[data-testid="tgvmax-badge"], .tgvmax-available, [aria-label*="TGV MAX"]')
        const priceText = $card.find('[data-testid="price"]').text().trim()
        const tgvMaxAvailable = tgvMaxElement.length > 0 || priceText.includes('0€') || priceText.includes('TGV MAX')
        
        // Extract price if available
        const priceMatch = priceText.match(/(\d+)€/)
        const price = priceMatch ? parseInt(priceMatch[1]) : undefined
        
        // Count stops (transfers)
        const stops = $card.find('[data-testid="transfer-count"]').length

        trains.push({
          trainNumber,
          departureTime,
          arrivalTime,
          duration,
          type: trainType,
          price,
          tgvMaxAvailable,
          stops,
        })
      })

      return trains
    } catch (error) {
      console.error('Scraping error:', error)
      throw new Error(`Failed to scrape SNCF Connect: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private parseDuration(durationText: string): number {
    // Parse duration like "2h30" to minutes
    const match = durationText.match(/(\d+)h(\d+)?/)
    if (match) {
      const hours = parseInt(match[1])
      const minutes = match[2] ? parseInt(match[2]) : 0
      return hours * 60 + minutes
    }
    return 120 // Default 2 hours
  }

  async close() {
    if (this.page) {
      await this.page.close()
      this.page = null
    }
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}

// Singleton instance for reuse
let scraperInstance: SNCFConnectScraper | null = null

export async function scrapeTrains(
  departureStation: Station,
  arrivalStation: Station,
  date: Date
): Promise<Train[]> {
  try {
    // Use singleton scraper for better performance
    if (!scraperInstance) {
      scraperInstance = new SNCFConnectScraper({
        headless: process.env.SNCF_CONNECT_HEADLESS !== 'false',
        timeout: parseInt(process.env.SNCF_CONNECT_TIMEOUT || '30000'),
      })
    }

    const sncfTrains = await scraperInstance.searchTrains(departureStation, arrivalStation, date)
    
    // Convert to our Train interface
    return sncfTrains.map(train => ({
      trainNumber: train.trainNumber,
      type: train.type,
      departureTime: train.departureTime,
      arrivalTime: train.arrivalTime,
      duration: train.duration,
      stops: train.stops,
      platform: train.platform,
      tgvMaxAvailable: train.tgvMaxAvailable,
      price: train.price,
    }))
  } catch (error) {
    console.error('Failed to scrape trains:', error)
    throw error
  }
}

// Cleanup function to close browser on process exit
process.on('SIGINT', async () => {
  if (scraperInstance) {
    await scraperInstance.close()
  }
  process.exit()
})

process.on('SIGTERM', async () => {
  if (scraperInstance) {
    await scraperInstance.close()
  }
  process.exit()
})