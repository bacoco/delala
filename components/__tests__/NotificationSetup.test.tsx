import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotificationSetup from '../NotificationSetup'
import * as storage from '@/lib/storage'

// Mock the storage module
jest.mock('@/lib/storage')

describe('NotificationSetup', () => {
  const mockLoadFavorites = storage.loadFavorites as jest.MockedFunction<typeof storage.loadFavorites>
  const mockSetItem = jest.fn()
  const mockGetItem = jest.fn()
  
  const mockFavorites = [
    {
      id: '123',
      departureStation: { name: 'Paris Gare de Lyon', code: 'FRPLY' },
      arrivalStation: { name: 'Lyon Part-Dieu', code: 'FRLPD' },
      createdAt: new Date(),
    },
    {
      id: '456',
      departureStation: { name: 'Paris Montparnasse', code: 'FRPMO' },
      arrivalStation: { name: 'Bordeaux Saint-Jean', code: 'FRBOJ' },
      nickname: 'Weekend trip',
      createdAt: new Date(),
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockGetItem,
        setItem: mockSetItem,
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    })
    mockGetItem.mockReturnValue(null)
    mockLoadFavorites.mockReturnValue([])
  })

  it('shows empty state when no favorites', () => {
    render(<NotificationSetup />)
    
    expect(screen.getByText('Notifications de disponibilité')).toBeInTheDocument()
    expect(screen.getByText(/Ajoutez d'abord des trajets favoris/)).toBeInTheDocument()
  })

  it('shows setup button when favorites exist', () => {
    mockLoadFavorites.mockReturnValue(mockFavorites)
    render(<NotificationSetup />)
    
    expect(screen.getByText('Configurer des notifications')).toBeInTheDocument()
  })

  it('shows notification form when setup clicked', async () => {
    const user = userEvent.setup()
    mockLoadFavorites.mockReturnValue(mockFavorites)
    render(<NotificationSetup />)
    
    const setupButton = screen.getByText('Configurer des notifications')
    await user.click(setupButton)
    
    expect(screen.getByText('Nouvelle notification')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('votre@email.com')).toBeInTheDocument()
    expect(screen.getByText('Sélectionnez un trajet')).toBeInTheDocument()
  })

  it('shows favorite routes in dropdown', async () => {
    const user = userEvent.setup()
    mockLoadFavorites.mockReturnValue(mockFavorites)
    render(<NotificationSetup />)
    
    await user.click(screen.getByText('Configurer des notifications'))
    
    const select = screen.getByLabelText('Trajet')
    expect(select).toBeInTheDocument()
    
    // Get options within the route select only
    const routeOptions = select.querySelectorAll('option')
    expect(routeOptions).toHaveLength(3) // Default + 2 favorites
    expect(screen.getByText('Paris Gare de Lyon → Lyon Part-Dieu')).toBeInTheDocument()
    expect(screen.getByText('Weekend trip')).toBeInTheDocument()
  })

  it('validates form before adding notification', async () => {
    const user = userEvent.setup()
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation()
    mockLoadFavorites.mockReturnValue(mockFavorites)
    
    render(<NotificationSetup />)
    
    await user.click(screen.getByText('Configurer des notifications'))
    await user.click(screen.getByText('Activer'))
    
    expect(alertSpy).toHaveBeenCalledWith('Veuillez sélectionner un trajet et entrer votre email')
    alertSpy.mockRestore()
  })

  it('saves notification to localStorage', async () => {
    const user = userEvent.setup()
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation()
    mockLoadFavorites.mockReturnValue(mockFavorites)
    
    render(<NotificationSetup />)
    
    await user.click(screen.getByText('Configurer des notifications'))
    
    // Fill form
    await user.type(screen.getByPlaceholderText('votre@email.com'), 'test@example.com')
    await user.selectOptions(screen.getByLabelText('Trajet'), '123')
    await user.selectOptions(screen.getByLabelText('Fréquence'), 'hourly')
    
    await user.click(screen.getByText('Activer'))
    
    expect(mockSetItem).toHaveBeenCalledWith('tgvmax_notification_email', 'test@example.com')
    expect(mockSetItem).toHaveBeenCalledWith(
      'tgvmax_notifications',
      expect.stringContaining('"frequency":"hourly"')
    )
    
    alertSpy.mockRestore()
  })

  it('shows prototype warning', () => {
    mockLoadFavorites.mockReturnValue(mockFavorites)
    render(<NotificationSetup />)
    
    expect(screen.getByText(/Ceci est un prototype/)).toBeInTheDocument()
  })

  it('toggles notification enabled state', async () => {
    const user = userEvent.setup()
    mockLoadFavorites.mockReturnValue(mockFavorites)
    
    // Set up existing notification
    const existingNotif = {
      id: '999',
      route: mockFavorites[0],
      frequency: 'daily',
      enabled: true,
    }
    mockGetItem.mockImplementation((key) => {
      if (key === 'tgvmax_notifications') {
        return JSON.stringify([existingNotif])
      }
      return null
    })
    
    render(<NotificationSetup />)
    
    const toggle = screen.getByRole('checkbox')
    expect(toggle).toBeChecked()
    
    await user.click(toggle)
    
    expect(mockSetItem).toHaveBeenCalledWith(
      'tgvmax_notifications',
      expect.stringContaining('"enabled":false')
    )
  })

  it('deletes notification', async () => {
    const user = userEvent.setup()
    mockLoadFavorites.mockReturnValue(mockFavorites)
    
    // Set up existing notification
    const existingNotif = {
      id: '999',
      route: mockFavorites[0],
      frequency: 'daily',
      enabled: true,
    }
    mockGetItem.mockImplementation((key) => {
      if (key === 'tgvmax_notifications') {
        return JSON.stringify([existingNotif])
      }
      return null
    })
    
    render(<NotificationSetup />)
    
    const deleteButton = screen.getByRole('button', { name: '' })
    await user.click(deleteButton)
    
    expect(mockSetItem).toHaveBeenCalledWith('tgvmax_notifications', '[]')
  })
})