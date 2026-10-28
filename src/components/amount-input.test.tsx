import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AmountInput } from './amount-input'

describe('AmountInput', () => {
  it('renders the label, symbol, and optional USD hint', () => {
    render(
      <AmountInput
        id="amount"
        label="Amount"
        value="1"
        onChange={() => undefined}
        symbol="ETH"
        usdHint="$2,500.00"
      />,
    )

    expect(screen.getByRole('textbox')).toHaveValue('1')
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByText('ETH')).toBeInTheDocument()
    expect(screen.getByText(/≈/)).toHaveTextContent('≈ $2,500.00')
  })

  it('allows valid decimal edits and blocks invalid characters', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <AmountInput id="amount" label="Amount" value="" onChange={onChange} />,
    )

    const input = screen.getByRole('textbox')
    await user.type(input, '1.5')
    expect(onChange).toHaveBeenCalled()
    expect(onChange.mock.calls.map((call) => call[0])).toContain('1')

    onChange.mockClear()
    await user.type(input, 'abc')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows a validation error when provided', () => {
    render(
      <AmountInput
        id="amount"
        label="Amount"
        value="0"
        onChange={() => undefined}
        error="Amount must be greater than zero"
      />,
    )

    expect(
      screen.getByText('Amount must be greater than zero'),
    ).toBeInTheDocument()
  })
})
