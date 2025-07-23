import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchForm from '../SearchForm'
import { useRouter } from 'next/navigation'

// Mock the router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock StationAutocomplete since it's tested separately
jest.mock('../StationAutocomplete', () => {
  return function MockStationAutocomplete({ value, onChange, onStationSelect, placeholder, id }: any) {
    return (
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid={`station-${id}`}
      />
    )
  }
})

describe('SearchForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all form elements', () => {
    render(<SearchForm />)
    
    expect(screen.getByText('Rechercher un train')).toBeInTheDocument()
    expect(screen.getByText('Gare de départ')).toBeInTheDocument()
    expect(screen.getByText('Gare d\'arrivée')).toBeInTheDocument()
    expect(screen.getByText('Date de voyage')).toBeInTheDocument()
    expect(screen.getByText('Rechercher des trains')).toBeInTheDocument()
  })

  it('does not navigate when submitting without stations', async () => {
    const user = userEvent.setup()
    
    render(<SearchForm />)
    
    const submitButton = screen.getByText('Rechercher des trains')
    await user.click(submitButton)
    
    // Should not navigate if fields are empty
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('navigates to results page with correct params', async () => {
    const user = userEvent.setup()
    render(<SearchForm />)
    
    // Fill in departure station
    const departureInput = screen.getByTestId('station-departure')
    await user.type(departureInput, 'Paris Gare de Lyon')
    
    // Fill in arrival station
    const arrivalInput = screen.getByTestId('station-arrival')
    await user.type(arrivalInput, 'Lyon Part-Dieu')
    
    // Submit form
    const submitButton = screen.getByText('Rechercher des trains')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/results?from=Paris+Gare+de+Lyon&to=Lyon+Part-Dieu&date=')
      )
    })
  })

  it('disables submit button when loading', async () => {
    const user = userEvent.setup()
    render(<SearchForm />)
    
    // Fill in stations
    const departureInput = screen.getByTestId('station-departure')
    await user.type(departureInput, 'Paris')
    
    const arrivalInput = screen.getByTestId('station-arrival')
    await user.type(arrivalInput, 'Lyon')
    
    const submitButton = screen.getByText('Rechercher des trains')
    await user.click(submitButton)
    
    // Button should show loading state
    expect(screen.getByText('Recherche en cours...')).toBeInTheDocument()
  })

  it('shows loading spinner when searching', async () => {
    const user = userEvent.setup()
    render(<SearchForm />)
    
    // Fill in required fields
    const departureInput = screen.getByTestId('station-departure')
    await user.type(departureInput, 'Paris')
    
    const arrivalInput = screen.getByTestId('station-arrival')
    await user.type(arrivalInput, 'Lyon')
    
    // Submit form
    const submitButton = screen.getByText('Rechercher des trains')
    await user.click(submitButton)
    
    // Check for spinner
    const spinner = document.querySelector('.spinner')
    expect(spinner).toBeInTheDocument()
  })

  it('shows tip about TGV MAX availability', () => {
    render(<SearchForm />)
    
    expect(screen.getByText(/Les places TGV MAX sont limitées/)).toBeInTheDocument()
  })
})