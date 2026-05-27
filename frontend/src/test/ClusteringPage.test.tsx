import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ClusteringPage from '../ClusteringPage'
import * as api from '../api'

vi.mock('../api', () => ({
  getClusterData: vi.fn(),
  clusterer: vi.fn(),
}))

// Recharts ResponsiveContainer a besoin d'une taille pour s'afficher
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 500, height: 320 }}>{children}</div>
    ),
  }
})

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>
}

beforeEach(() => vi.clearAllMocks())

describe('ClusteringPage', () => {
  it('affiche le formulaire et le tableau de légende', async () => {
    vi.mocked(api.getClusterData).mockResolvedValue([])

    render(<ClusteringPage />, { wrapper })

    expect(screen.getByText('Assigner un cluster')).toBeInTheDocument()
    expect(screen.getByText('Risque élevé — BMI, tension, cholestérol et LTG au-dessus de la moyenne')).toBeInTheDocument()
    expect(screen.getByText('Risque faible — patients jeunes, BMI bas, bon profil lipidique (HDL élevé, LTG bas)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Assigner' })).toBeInTheDocument()
  })

  it('affiche le cluster assigné avec la bonne couleur', async () => {
    vi.mocked(api.getClusterData).mockResolvedValue([])
    vi.mocked(api.clusterer).mockResolvedValue({ cluster: 2 })

    render(<ClusteringPage />, { wrapper })

    const inputs = screen.getAllByRole('spinbutton')
    inputs.forEach(input => fireEvent.change(input, { target: { value: '0.05' } }))

    fireEvent.click(screen.getByRole('button', { name: 'Assigner' }))

    await waitFor(() => {
      const badge = screen.getByText('2')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveStyle({ backgroundColor: '#dc2626' })
    })
  })

  it('affiche une erreur si l\'API échoue', async () => {
    vi.mocked(api.getClusterData).mockResolvedValue([])
    vi.mocked(api.clusterer).mockRejectedValue(new Error('Erreur API /cluster'))

    render(<ClusteringPage />, { wrapper })

    const inputs = screen.getAllByRole('spinbutton')
    inputs.forEach(input => fireEvent.change(input, { target: { value: '0.05' } }))

    fireEvent.click(screen.getByRole('button', { name: 'Assigner' }))

    await waitFor(() => expect(screen.getByText('Erreur API /cluster')).toBeInTheDocument())
  })
})
