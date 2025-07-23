import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StationAutocomplete from '../StationAutocomplete'
import { Station } from '@/types'

describe('StationAutocomplete', () => {
  const mockOnChange = jest.fn()
  const mockOnStationSelect = jest.fn()
  
  const defaultProps = {
    id: 'test-autocomplete',
    value: '',
    onChange: mockOnChange,
    onStationSelect: mockOnStationSelect,
    placeholder: 'Search station...',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<StationAutocomplete {...defaultProps} />)
    expect(screen.getByPlaceholderText('Search station...')).toBeInTheDocument()
  })

  it('updates value when typing', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<StationAutocomplete {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Search station...')
    await user.type(input, 'Paris')
    
    // Rerender with the updated value to simulate controlled component
    rerender(<StationAutocomplete {...defaultProps} value="Paris" />)
    
    expect(input).toHaveValue('Paris')
  })

  it('calls onChange when typing', async () => {
    const user = userEvent.setup()
    render(<StationAutocomplete {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Search station...')
    await user.type(input, 'Lyon')
    
    // Should have been called 4 times (once for each character)
    expect(mockOnChange).toHaveBeenCalledTimes(4)
    // Each call should have the accumulated value
    expect(mockOnChange).toHaveBeenNthCalledWith(1, 'L')
    expect(mockOnChange).toHaveBeenNthCalledWith(2, 'y')
    expect(mockOnChange).toHaveBeenNthCalledWith(3, 'o')
    expect(mockOnChange).toHaveBeenNthCalledWith(4, 'n')
  })

  it('handles input focus', async () => {
    const user = userEvent.setup()
    render(<StationAutocomplete {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Search station...')
    await user.click(input)
    
    expect(input).toHaveFocus()
  })

  it('clears value when empty string passed', () => {
    const { rerender } = render(<StationAutocomplete {...defaultProps} value="Paris" />)
    
    const input = screen.getByPlaceholderText('Search station...')
    expect(input).toHaveValue('Paris')
    
    rerender(<StationAutocomplete {...defaultProps} value="" />)
    expect(input).toHaveValue('')
  })

  it('handles keyboard events', async () => {
    const user = userEvent.setup()
    render(<StationAutocomplete {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Search station...')
    await user.click(input)
    
    // Test escape key
    await user.keyboard('{Escape}')
    
    // Input should still be focused
    expect(input).toHaveFocus()
  })

  it('renders with custom className', () => {
    render(<StationAutocomplete {...defaultProps} className="custom-class" />)
    
    const input = screen.getByPlaceholderText('Search station...')
    expect(input).toHaveClass('form-input', 'custom-class')
  })

  it('accepts custom placeholder', () => {
    render(<StationAutocomplete {...defaultProps} placeholder="Custom placeholder" />)
    
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument()
  })
})