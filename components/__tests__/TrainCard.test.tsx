import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TrainCard from '../TrainCard'
import { Train, Route, Station } from '@/types'
import * as storage from '@/lib/storage'

// Mock the storage module
jest.mock('@/lib/storage')

describe('TrainCard', () => {
  const mockStation1: Station = {
    name: 'Paris Gare de Lyon',
    code: 'FRPLY',
    region: 'Île-de-France',
  }

  const mockStation2: Station = {
    name: 'Lyon Part-Dieu',
    code: 'FRLPD',
    region: 'Auvergne-Rhône-Alpes',
  }

  const mockRoute: Route = {
    departureStation: mockStation1,
    arrivalStation: mockStation2,
    date: new Date('2025-01-25'),
  }

  const mockTrain: Train = {
    trainNumber: 'TGV6543',
    type: 'TGV',
    departureTime: '08:30',
    arrivalTime: '10:35',
    duration: 125,
    stops: 0,
    platform: '12',
    tgvMaxAvailable: true,
    price: 65,
  }

  const mockAddFavorite = storage.addFavorite as jest.MockedFunction<typeof storage.addFavorite>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders train information correctly', () => {
    render(<TrainCard train={mockTrain} route={mockRoute} />)
    
    expect(screen.getByText('TGV')).toBeInTheDocument()
    expect(screen.getByText('TGV6543')).toBeInTheDocument()
    expect(screen.getByText('08:30')).toBeInTheDocument()
    expect(screen.getByText('10:35')).toBeInTheDocument()
    expect(screen.getByText('2h05')).toBeInTheDocument()
    expect(screen.getByText('Direct')).toBeInTheDocument()
    expect(screen.getByText('Voie 12')).toBeInTheDocument()
    expect(screen.getByText('Paris Gare de Lyon')).toBeInTheDocument()
    expect(screen.getByText('Lyon Part-Dieu')).toBeInTheDocument()
  })

  it('shows TGV MAX badge when available', () => {
    render(<TrainCard train={mockTrain} route={mockRoute} />)
    
    expect(screen.getByText('TGV MAX ✓')).toBeInTheDocument()
    expect(screen.getByText('Réserver')).toBeInTheDocument()
  })

  it('does not show TGV MAX badge when unavailable', () => {
    const trainWithoutTGVMax = { ...mockTrain, tgvMaxAvailable: false }
    render(<TrainCard train={trainWithoutTGVMax} route={mockRoute} />)
    
    expect(screen.queryByText('TGV MAX ✓')).not.toBeInTheDocument()
    expect(screen.getByText('65€')).toBeInTheDocument()
  })

  it('handles saving route to favorites', async () => {
    const user = userEvent.setup()
    render(<TrainCard train={mockTrain} route={mockRoute} />)
    
    const saveButton = screen.getByText('Sauvegarder')
    await user.click(saveButton)
    
    expect(mockAddFavorite).toHaveBeenCalledWith(
      expect.objectContaining({
        departureStation: mockStation1,
        arrivalStation: mockStation2,
      })
    )
    
    // Should show saved state
    expect(screen.getByText('✓ Sauvegardé')).toBeInTheDocument()
  })

  it('displays connections when present', () => {
    const trainWithConnections = {
      ...mockTrain,
      connections: [
        {
          station: { name: 'Mâcon', code: 'FRMAC' },
          arrivalTime: '09:45',
          departureTime: '10:00',
          duration: 15,
        },
      ],
    }
    
    render(<TrainCard train={trainWithConnections} route={mockRoute} />)
    
    expect(screen.getByText('Correspondances:')).toBeInTheDocument()
    expect(screen.getByText('Mâcon - Attente 15 min')).toBeInTheDocument()
  })

  it('shows correct stop count', () => {
    const trainWithStops = { ...mockTrain, stops: 3 }
    render(<TrainCard train={trainWithStops} route={mockRoute} />)
    
    expect(screen.getByText('3 arrêts')).toBeInTheDocument()
  })

  it('shows singular form for 1 stop', () => {
    const trainWithOneStop = { ...mockTrain, stops: 1 }
    render(<TrainCard train={trainWithOneStop} route={mockRoute} />)
    
    expect(screen.getByText('1 arrêt')).toBeInTheDocument()
  })

  it('applies special styling for TGV MAX trains', () => {
    const { container } = render(<TrainCard train={mockTrain} route={mockRoute} />)
    
    const card = container.querySelector('.card')
    expect(card).toHaveClass('ring-2', 'ring-green-500')
  })

  it('shows correct styling for TGV vs other train types', () => {
    render(<TrainCard train={mockTrain} route={mockRoute} />)
    
    const trainTypeBadge = screen.getByText('TGV')
    expect(trainTypeBadge).toHaveClass('bg-sncf-blue', 'text-white')
    
    // Test with TER
    const terTrain = { ...mockTrain, type: 'TER', tgvMaxAvailable: false }
    const { rerender } = render(<TrainCard train={terTrain} route={mockRoute} />)
    
    const terBadge = screen.getByText('TER')
    expect(terBadge).toHaveClass('bg-gray-200', 'text-gray-700')
  })

  it('opens SNCF website when clicking reserve button', () => {
    render(<TrainCard train={mockTrain} route={mockRoute} />)
    
    const reserveLink = screen.getByText('Réserver')
    expect(reserveLink).toHaveAttribute('href', 'https://www.sncf-connect.com/')
    expect(reserveLink).toHaveAttribute('target', '_blank')
    expect(reserveLink).toHaveAttribute('rel', 'noopener noreferrer')
  })
})