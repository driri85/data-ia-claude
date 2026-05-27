import { useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, GitBranch } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import PredictionForm from './PredictionForm'
import ClusteringPage from './ClusteringPage'
import { getStats } from './api'
import { cn } from './lib/utils'

type Page = 'regression' | 'clustering'

const TABS: { id: Page; label: string; icon: ReactNode }[] = [
  { id: 'regression', label: 'Régression', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'clustering', label: 'Clustering', icon: <GitBranch className="h-4 w-4" /> },
]

export default function App() {
  const [page, setPage] = useState<Page>('regression')

  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    enabled: page === 'regression',
  })

  return (
    <main className="mx-auto max-w-4xl p-6 font-sans">
      <h1 className="text-2xl font-bold mb-6">Dashboard — Diabète (UCI)</h1>

      <nav className="flex gap-2 border-b mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setPage(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              page === tab.id
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-black',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {page === 'regression' && (
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold">Progression moyenne par tranche de BMI</h2>
            {isLoading && <p className="text-gray-400">Chargement…</p>}
            {stats && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats} margin={{ top: 8, right: 16, left: 0, bottom: 60 }}>
                  <XAxis dataKey="label" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb" name="Progression moyenne" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold">Prédire</h2>
            <PredictionForm />
          </section>

          <section>
            <h2 className="text-lg font-semibold">Performance du modèle</h2>
            <p className="text-sm text-gray-500">
              Modèle : VotingRegressor (Ridge + Lasso + ElasticNet) — dataset Diabetes UCI (442 patients, 10 features).
            </p>
          </section>
        </div>
      )}

      {page === 'clustering' && <ClusteringPage />}
    </main>
  )
}
