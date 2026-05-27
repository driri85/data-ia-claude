import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PredictionForm from '../PredictionForm'
import * as api from '../api'

vi.mock('../api', () => ({
  predire: vi.fn(),
}))

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
}

beforeEach(() => vi.clearAllMocks())

describe('PredictionForm', () => {
  it('affiche tous les champs', () => {
    render(<PredictionForm />, { wrapper })
    expect(screen.getByText('Âge')).toBeInTheDocument()
    expect(screen.getByText('BMI')).toBeInTheDocument()
    expect(screen.getByText('S6 (glycémie)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Prédire' })).toBeInTheDocument()
  })

  it('affiche le résultat après soumission', async () => {
    vi.mocked(api.predire).mockResolvedValue({ prediction: 175.5 })

    render(<PredictionForm />, { wrapper })

    const inputs = screen.getAllByRole('spinbutton')
    inputs.forEach(input => fireEvent.change(input, { target: { value: '0.05' } }))

    fireEvent.click(screen.getByRole('button', { name: 'Prédire' }))

    await waitFor(() => expect(screen.getByText(/175\.5/)).toBeInTheDocument())
  })

  it('affiche une erreur si l\'API échoue', async () => {
    vi.mocked(api.predire).mockRejectedValue(new Error('Erreur API /predict'))

    render(<PredictionForm />, { wrapper })

    const inputs = screen.getAllByRole('spinbutton')
    inputs.forEach(input => fireEvent.change(input, { target: { value: '0.05' } }))

    fireEvent.click(screen.getByRole('button', { name: 'Prédire' }))

    await waitFor(() => expect(screen.getByText('Erreur API /predict')).toBeInTheDocument())
  })
})
