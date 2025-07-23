import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SaveRouteModal from '../SaveRouteModal'
import { Station } from '@/types'
import * as storage from '@/lib/storage'

// Mock the storage module
jest.mock('@/lib/storage')

describe('SaveRouteModal', () => {
  const mockOnClose = jest.fn()
  const mockOnSaved = jest.fn()
  const mockAddFavorite = storage.addFavorite as jest.MockedFunction<typeof storage.addFavorite>
  
  const mockDepartureStation: Station = {
    name: 'Paris Gare de Lyon',
    code: 'FRPLY',
  }
  
  const mockArrivalStation: Station = {
    name: 'Lyon Part-Dieu',
    code: 'FRLPD',
  }
  
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    departureStation: mockDepartureStation,
    arrivalStation: mockArrivalStation,
    onSaved: mockOnSaved,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when open', () => {
    render(<SaveRouteModal {...defaultProps} />)
    
    expect(screen.getByText('Sauvegarder ce trajet')).toBeInTheDocument()
    expect(screen.getByText('Paris Gare de Lyon → Lyon Part-Dieu')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<SaveRouteModal {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText('Sauvegarder ce trajet')).not.toBeInTheDocument()
  })

  it('allows entering a nickname', async () => {
    const user = userEvent.setup()
    render(<SaveRouteModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Ex: Trajet domicile-travail')
    await user.type(input, 'Mon trajet quotidien')
    
    expect(input).toHaveValue('Mon trajet quotidien')
  })

  it('saves favorite route with nickname', async () => {
    const user = userEvent.setup()
    render(<SaveRouteModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Ex: Trajet domicile-travail')
    await user.type(input, 'Trajet vacances')
    
    const saveButton = screen.getByText('Sauvegarder')
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(mockAddFavorite).toHaveBeenCalledWith(
        expect.objectContaining({
          departureStation: mockDepartureStation,
          arrivalStation: mockArrivalStation,
          nickname: 'Trajet vacances',
        })
      )
    })
    
    await waitFor(() => {
      expect(mockOnSaved).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    }, { timeout: 1000 })
  })

  it('saves favorite route without nickname', async () => {
    const user = userEvent.setup()
    render(<SaveRouteModal {...defaultProps} />)
    
    const saveButton = screen.getByText('Sauvegarder')
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(mockAddFavorite).toHaveBeenCalledWith(
        expect.objectContaining({
          departureStation: mockDepartureStation,
          arrivalStation: mockArrivalStation,
          nickname: undefined,
        })
      )
    })
  })

  it('closes when cancel button clicked', async () => {
    const user = userEvent.setup()
    render(<SaveRouteModal {...defaultProps} />)
    
    const cancelButton = screen.getByText('Annuler')
    await user.click(cancelButton)
    
    expect(mockOnClose).toHaveBeenCalled()
    expect(mockAddFavorite).not.toHaveBeenCalled()
  })

  it('closes when backdrop clicked', async () => {
    const user = userEvent.setup()
    const { container } = render(<SaveRouteModal {...defaultProps} />)
    
    // Click the backdrop (first element with bg-black class)
    const backdrop = container.querySelector('.bg-black')
    expect(backdrop).toBeInTheDocument()
    
    if (backdrop) {
      await user.click(backdrop)
    }
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows loading state while saving', async () => {
    const user = userEvent.setup()
    render(<SaveRouteModal {...defaultProps} />)
    
    const saveButton = screen.getByText('Sauvegarder')
    await user.click(saveButton)
    
    // Should show loading text briefly
    expect(screen.getByText('Sauvegarde...')).toBeInTheDocument()
    
    // Wait for save to complete
    await waitFor(() => {
      expect(mockOnSaved).toHaveBeenCalled()
    })
  })

  it('disables buttons while saving', async () => {
    const user = userEvent.setup()
    render(<SaveRouteModal {...defaultProps} />)
    
    const saveButton = screen.getByText('Sauvegarder')
    const cancelButton = screen.getByText('Annuler')
    
    await user.click(saveButton)
    
    expect(saveButton).toBeDisabled()
    expect(cancelButton).toBeDisabled()
    
    await waitFor(() => {
      expect(mockOnSaved).toHaveBeenCalled()
    })
  })

  it('enforces max length on nickname', () => {
    render(<SaveRouteModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Ex: Trajet domicile-travail')
    expect(input).toHaveAttribute('maxLength', '50')
  })
})