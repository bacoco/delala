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
      console.log('Navigating to SNCF Connect...')
      const response = await this.page.goto('https://www.sncf-connect.com/', {
        waitUntil: 'domcontentloaded',
        timeout: this.options.timeout,
      })

      if (!response || response.status() !== 200) {
        throw new Error(`Failed to load SNCF Connect: ${response?.status()}`)
      }

      // Wait a bit for dynamic content to load
      await this.page.waitForTimeout(3000)

      // Handle cookie consent - try multiple selectors
      const cookieSelectors = [
        '#onetrust-accept-btn-handler',
        '#didomi-notice-agree-button',
        'button[aria-label*="accepter"]',
        'button:has-text("Accepter")',
        '.cookie-banner button.accept'
      ]
      
      for (const selector of cookieSelectors) {
        try {
          const cookieBtn = await this.page.$(selector)
          if (cookieBtn) {
            await cookieBtn.click()
            await this.page.waitForTimeout(1000)
            break
          }
        } catch (e) {
          // Continue trying other selectors
        }
      }

      // Try different approaches to find and fill the search form
      console.log('Looking for search form...')
      
      // Approach 1: Look for station inputs by common patterns
      const stationSelectors = {
        departure: [
          'input[placeholder*="départ" i]',
          'input[placeholder*="gare de départ" i]',
          'input[placeholder*="from" i]',
          'input[name*="origin" i]',
          'input[name*="departure" i]',
          'input[aria-label*="départ" i]',
          '#origin',
          '.departure-station input',
          'form input:first-of-type[type="text"]'
        ],
        arrival: [
          'input[placeholder*="arrivée" i]',
          'input[placeholder*="gare d\'arrivée" i]',
          'input[placeholder*="to" i]',
          'input[name*="destination" i]',
          'input[name*="arrival" i]',
          'input[aria-label*="arrivée" i]',
          '#destination',
          '.arrival-station input',
          'form input:nth-of-type(2)[type="text"]'
        ]
      }

      // Find departure input
      let departureInput = null
      for (const selector of stationSelectors.departure) {
        try {
          departureInput = await this.page.$(selector)
          if (departureInput) {
            console.log(`Found departure input with selector: ${selector}`)
            break
          }
        } catch (e) {}
      }

      if (!departureInput) {
        // Take screenshot for debugging
        await this.page.screenshot({ path: 'sncf-error.png' })
        throw new Error('Could not find departure station input')
      }

      // Fill departure station
      await departureInput.click()
      await this.page.keyboard.type(departureStation.name, { delay: 100 })
      await this.page.waitForTimeout(2000)
      
      // Try to click first suggestion
      const suggestionSelectors = [
        '[role="option"]:first-child',
        '.autocomplete-suggestion:first-child',
        '.suggestion-item:first-child',
        'ul[role="listbox"] li:first-child',
        '.search-results li:first-child'
      ]
      
      for (const selector of suggestionSelectors) {
        try {
          const suggestion = await this.page.$(selector)
          if (suggestion) {
            await suggestion.click()
            break
          }
        } catch (e) {}
      }

      // Find arrival input
      let arrivalInput = null
      for (const selector of stationSelectors.arrival) {
        try {
          arrivalInput = await this.page.$(selector)
          if (arrivalInput) {
            console.log(`Found arrival input with selector: ${selector}`)
            break
          }
        } catch (e) {}
      }

      if (!arrivalInput) {
        throw new Error('Could not find arrival station input')
      }

      // Fill arrival station
      await arrivalInput.click()
      await this.page.keyboard.type(arrivalStation.name, { delay: 100 })
      await this.page.waitForTimeout(2000)
      
      // Click suggestion
      for (const selector of suggestionSelectors) {
        try {
          const suggestion = await this.page.$(selector)
          if (suggestion) {
            await suggestion.click()
            break
          }
        } catch (e) {}
      }

      // Date selection - try multiple selectors
      const dateSelectors = [
        'input[type="date"]',
        'input[placeholder*="date" i]',
        'input[name*="date" i]',
        '.date-picker input',
        'input[aria-label*="date" i]'
      ]

      let dateInput = null
      for (const selector of dateSelectors) {
        try {
          dateInput = await this.page.$(selector)
          if (dateInput) {
            console.log(`Found date input with selector: ${selector}`)
            break
          }
        } catch (e) {}
      }

      if (dateInput) {
        const formattedDate = date.toISOString().split('T')[0]
        await dateInput.click()
        await this.page.keyboard.type(formattedDate)
      }

      // Submit search - try multiple selectors
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Rechercher")',
        'button:has-text("Search")',
        'button[aria-label*="rechercher" i]',
        '.search-button',
        'form button.primary',
        'button.btn-primary'
      ]

      let submitButton = null
      for (const selector of submitSelectors) {
        try {
          submitButton = await this.page.$(selector)
          if (submitButton) {
            console.log(`Found submit button with selector: ${selector}`)
            break
          }
        } catch (e) {}
      }

      if (!submitButton) {
        throw new Error('Could not find search submit button')
      }

      await submitButton.click()

      // Wait for navigation with a shorter timeout
      console.log('Waiting for results...')
      await this.page.waitForTimeout(5000) // Give time for results to load
      
      // Check if we're on results page by looking for common patterns
      const currentUrl = this.page.url()
      console.log(`Current URL: ${currentUrl}`)
      
      // Extract train data using more flexible selectors
      const html = await this.page.content()
      const $ = cheerio.load(html)
      const trains: SNCFTrain[] = []

      // Try multiple selectors for journey cards
      const journeySelectors = [
        '.journey-card',
        '.train-result',
        '.search-result-item',
        '[class*="journey"]',
        '[class*="result-card"]',
        '.offer-card',
        'article[class*="train"]'
      ]

      let journeyCards = null
      for (const selector of journeySelectors) {
        const cards = $(selector)
        if (cards.length > 0) {
          console.log(`Found ${cards.length} journey cards with selector: ${selector}`)
          journeyCards = cards
          break
        }
      }

      if (!journeyCards || journeyCards.length === 0) {
        console.log('No journey cards found, trying alternative approach...')
        
        // Look for any time patterns that might indicate train departures
        const timePattern = /\b([0-2]?[0-9])[h:]([0-5][0-9])\b/g
        const possibleTrains = []
        
        // Find all elements containing time patterns
        $('*').each((i, elem) => {
          const text = $(elem).text()
          if (timePattern.test(text)) {
            possibleTrains.push(elem)
          }
        })
        
        console.log(`Found ${possibleTrains.length} elements with time patterns`)
      }

      // Parse journey cards if found
      if (journeyCards) {
        journeyCards.each((index, element) => {
          const $card = $(element)
          
          // Extract times - look for HH:MM patterns
          const timeTexts = $card.text().match(/\b([0-2]?[0-9])[h:]([0-5][0-9])\b/g) || []
          const departureTime = timeTexts[0] ? timeTexts[0].replace('h', ':') : ''
          const arrivalTime = timeTexts[1] ? timeTexts[1].replace('h', ':') : ''
          
          // Extract duration - look for patterns like "2h30"
          const durationMatch = $card.text().match(/(\d+)h(\d+)?/)
          const duration = durationMatch ? 
            parseInt(durationMatch[1]) * 60 + (durationMatch[2] ? parseInt(durationMatch[2]) : 0) : 
            120 // Default 2 hours
          
          // Extract train type
          const trainTypeMatch = $card.text().match(/\b(TGV|TER|OUIGO|Intercités|INTERCITES)\b/i)
          const trainType = trainTypeMatch ? trainTypeMatch[1].toUpperCase() : 'Train'
          
          // Extract train number
          const trainNumberMatch = $card.text().match(/\b(TGV|TER|OUIGO)\s*(\d+)\b/i)
          const trainNumber = trainNumberMatch ? `${trainType}${trainNumberMatch[2]}` : `${trainType}${index}`
          
          // Check for TGV MAX availability - look for specific indicators
          const cardText = $card.text().toLowerCase()
          const tgvMaxAvailable = 
            cardText.includes('tgv max') || 
            cardText.includes('0€') ||
            cardText.includes('0 €') ||
            $card.find('.tgvmax, [class*="tgvmax"], [class*="max-jeune"]').length > 0
          
          // Extract price
          const priceMatch = $card.text().match(/(\d+)\s*€/)
          const price = priceMatch ? parseInt(priceMatch[1]) : undefined
          
          // Count stops/transfers
          const transferMatch = $card.text().match(/(\d+)\s*(correspondance|changement|transfer)/i)
          const stops = transferMatch ? parseInt(transferMatch[1]) : 0

          // Only add if we have valid departure and arrival times
          if (departureTime && arrivalTime) {
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
          }
        })
      }

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