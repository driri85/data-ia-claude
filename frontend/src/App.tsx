import { useQuery } from '@tanstack/react-query'
import { BarChart3 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import PredictionForm from './PredictionForm'
import { getStats } from './api'

export default function App() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    enabled: true,
  })

  return (
    <main className="mx-auto max-w-4xl p-6 font-sans">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <BarChart3 className="h-6 w-6" /> Dashboard — Diabète (UCI)
      </h1>

      <section className="mt-6">
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

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Prédire</h2>
        <PredictionForm />
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Performance du modèle</h2>
        <p className="text-sm text-gray-500">
          Modèle : VotingRegressor (Ridge + Lasso + ElasticNet) — dataset Diabetes UCI (442 patients, 10 features).
        </p>
      </section>
    </main>
  )
}
