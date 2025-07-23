import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilterSidebar from '../FilterSidebar'
import { SearchFilters } from '@/types'
import * as storage from '@/lib/storage'

// Mock the storage module
jest.mock('@/lib/storage')

describe('FilterSidebar', () => {
  const mockOnFiltersChange = jest.fn()
  const mockSaveFilters = storage.saveFilters as jest.MockedFunction<typeof storage.saveFilters>
  
  const defaultProps = {
    filters: { sortBy: 'earliest' } as SearchFilters,
    onFiltersChange: mockOnFiltersChange,
    trainCount: 20,
    filteredCount: 20,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders filter options', () => {
    render(<FilterSidebar {...defaultProps} />)
    
    expect(screen.getByText('Filtres')).toBeInTheDocument()
    expect(screen.getByText('Trier par')).toBeInTheDocument()
    expect(screen.getByText('Heure de départ')).toBeInTheDocument()
    expect(screen.getByText('Durée maximale')).toBeInTheDocument()
    expect(screen.getByText('Correspondances')).toBeInTheDocument()
  })

  it('shows filter button on mobile', () => {
    render(<FilterSidebar {...defaultProps} />)
    
    const filterButton = screen.getByText('Filtrer les résultats')
    expect(filterButton).toBeInTheDocument()
  })

  it('handles sort change', async () => {
    const user = userEvent.setup()
    render(<FilterSidebar {...defaultProps} />)
    
    const sortSelect = screen.getByLabelText('Trier par')
    await user.selectOptions(sortSelect, 'fastest')
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      sortBy: 'fastest',
    })
    expect(mockSaveFilters).toHaveBeenCalled()
  })

  it('handles time range change', async () => {
    const user = userEvent.setup()
    render(<FilterSidebar {...defaultProps} />)
    
    const startTimeInput = screen.getAllByPlaceholderText('De')[0]
    await user.type(startTimeInput, '08:00')
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      sortBy: 'earliest',
      timeRange: { start: '08:00' },
    })
  })

  it('handles duration filter change', async () => {
    const user = userEvent.setup()
    render(<FilterSidebar {...defaultProps} />)
    
    const durationSelect = screen.getByLabelText('Durée maximale')
    await user.selectOptions(durationSelect, '120')
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      sortBy: 'earliest',
      maxDuration: 120,
    })
  })

  it('handles connections filter change', async () => {
    const user = userEvent.setup()
    render(<FilterSidebar {...defaultProps} />)
    
    const connectionsSelect = screen.getByLabelText('Correspondances')
    await user.selectOptions(connectionsSelect, '0')
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      sortBy: 'earliest',
      maxConnections: 0,
    })
  })

  it('shows filtered count when filters applied', () => {
    const props = {
      ...defaultProps,
      trainCount: 20,
      filteredCount: 5,
    }
    
    render(<FilterSidebar {...props} />)
    
    expect(screen.getByText('5 trains sur 20 correspondent aux filtres')).toBeInTheDocument()
  })

  it('resets filters when reset button clicked', async () => {
    const user = userEvent.setup()
    render(<FilterSidebar {...defaultProps} />)
    
    const resetButton = screen.getByText('Réinitialiser les filtres')
    await user.click(resetButton)
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      sortBy: 'earliest',
    })
    expect(mockSaveFilters).toHaveBeenCalled()
  })

  it('shows TGV MAX tip', () => {
    render(<FilterSidebar {...defaultProps} />)
    
    expect(screen.getByText(/Les trains avec TGV MAX sont mis en évidence/)).toBeInTheDocument()
  })

  it('toggles mobile sidebar', async () => {
    const user = userEvent.setup()
    render(<FilterSidebar {...defaultProps} />)
    
    // Initially hidden on mobile (we're testing the button is visible)
    const filterButton = screen.getByText('Filtrer les résultats')
    expect(filterButton).toBeInTheDocument()
    
    // Click to open
    await user.click(filterButton)
    
    // Should show close button in sidebar
    const closeButtons = screen.getAllByRole('button')
    const closeButton = closeButtons.find(btn => btn.querySelector('svg path[d="M6 18L18 6M6 6l12 12"]'))
    expect(closeButton).toBeInTheDocument()
  })

  it('shows filter count badge on mobile button', () => {
    const props = {
      ...defaultProps,
      trainCount: 20,
      filteredCount: 8,
    }
    
    render(<FilterSidebar {...props} />)
    
    const badge = screen.getByText('8/20')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-sncf-red')
  })
})