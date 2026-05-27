import { useState, type FormEvent } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ZAxis,
} from 'recharts'
import { clusterer, getClusterData, type ClusterPoint } from './api'

const FIELDS: { key: string; label: string; step: number }[] = [
  { key: 'age', label: 'Âge', step: 0.01 },
  { key: 'sex', label: 'Sexe', step: 0.01 },
  { key: 'bmi', label: 'BMI', step: 0.01 },
  { key: 'bp', label: 'Pression artérielle (bp)', step: 0.01 },
  { key: 's1', label: 'S1 (cholestérol total)', step: 0.01 },
  { key: 's2', label: 'S2 (LDL)', step: 0.01 },
  { key: 's3', label: 'S3 (HDL)', step: 0.01 },
  { key: 's4', label: 'S4 (TCH)', step: 0.01 },
  { key: 's5', label: 'S5 (LTG)', step: 0.01 },
  { key: 's6', label: 'S6 (glycémie)', step: 0.01 },
]

const defaultValues = Object.fromEntries(FIELDS.map(f => [f.key, '']))

const CLUSTER_COLORS = ['#2563eb', '#16a34a', '#dc2626', '#d97706']
const CLUSTER_NAMES = ['Cluster 0', 'Cluster 1', 'Cluster 2', 'Cluster 3']

export default function ClusteringPage() {
  const [valeurs, setValeurs] = useState<Record<string, string>>(defaultValues)

  const { data: clusterData, isLoading: isLoadingData } = useQuery({
    queryKey: ['cluster-data'],
    queryFn: getClusterData,
  })

  const mutation = useMutation({ mutationFn: clusterer })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const payload = Object.fromEntries(
      FIELDS.map(f => [f.key, Number.parseFloat(valeurs[f.key])])
    )
    mutation.mutate(payload)
  }

  const clusterNum = mutation.data?.cluster

  // Sépare les points par cluster pour Recharts Scatter
  const pointsByCluster: Record<number, ClusterPoint[]> = {}
  if (clusterData) {
    for (const pt of clusterData) {
      if (!pointsByCluster[pt.cluster]) pointsByCluster[pt.cluster] = []
      pointsByCluster[pt.cluster].push(pt)
    }
  }

  // Point de l'utilisateur sur le graphe
  const userPoint =
    clusterNum != null && valeurs['bmi'] && valeurs['s5']
      ? [{ bmi: Number.parseFloat(valeurs['bmi']), s5: Number.parseFloat(valeurs['s5']), cluster: clusterNum }]
      : []

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold">Distribution des clusters (BMI vs S5)</h2>
        <p className="mb-2 text-sm text-gray-500">
          Modèle : KMeans — dataset Diabetes UCI (442 patients, 10 features normalisées).
        </p>
        {isLoadingData && <p className="text-gray-400">Chargement…</p>}
        {clusterData && (
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <XAxis dataKey="bmi" name="BMI" type="number" domain={['auto', 'auto']} tick={{ fontSize: 11 }} label={{ value: 'BMI (normalisé)', position: 'insideBottom', offset: -4, fontSize: 11 }} />
              <YAxis dataKey="s5" name="S5 (LTG)" type="number" domain={['auto', 'auto']} tick={{ fontSize: 11 }} label={{ value: 'S5', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <ZAxis range={[20, 20]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v: number) => v.toFixed(4)} />
              <Legend />
              {Object.entries(pointsByCluster).map(([c, pts]) => (
                <Scatter
                  key={c}
                  name={CLUSTER_NAMES[Number(c)]}
                  data={pts}
                  fill={CLUSTER_COLORS[Number(c) % CLUSTER_COLORS.length]}
                  opacity={0.6}
                />
              ))}
              {userPoint.length > 0 && (
                <Scatter
                  name="Votre point"
                  data={userPoint}
                  fill="#000"
                  shape="star"
                  opacity={1}
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </section>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border border-gray-200 px-3 py-2">Cluster</th>
              <th className="border border-gray-200 px-3 py-2">Patients</th>
              <th className="border border-gray-200 px-3 py-2">Progression moy.</th>
              <th className="border border-gray-200 px-3 py-2">Profil</th>
            </tr>
          </thead>
          <tbody>
            {[
              { num: 0, color: '#2563eb', count: 125, target: 197, profil: 'Risque élevé — BMI, tension, cholestérol et LTG au-dessus de la moyenne' },
              { num: 1, color: '#16a34a', count: 159, target: 160, profil: 'Risque modéré — tous les indicateurs proches de la moyenne' },
              { num: 2, color: '#dc2626', count: 158, target: 108, profil: 'Risque faible — patients jeunes, BMI bas, bon profil lipidique (HDL élevé, LTG bas)' },
            ].map(row => (
              <tr key={row.num} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-3 py-2">
                  <span className="inline-block rounded-full px-2 py-0.5 text-white text-xs font-bold" style={{ backgroundColor: row.color }}>
                    Cluster {row.num}
                  </span>
                </td>
                <td className="border border-gray-200 px-3 py-2 text-gray-600">{row.count}</td>
                <td className="border border-gray-200 px-3 py-2 font-mono">{row.target}</td>
                <td className="border border-gray-200 px-3 py-2 text-gray-600">{row.profil}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-gray-400">Le modèle n'a jamais vu la variable cible pendant l'entraînement — la séparation sain/modéré/à risque émerge naturellement des caractéristiques biologiques.</p>
      </div>

      <section>
        <h2 className="text-lg font-semibold">Assigner un cluster</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map(({ key, label, step }) => (
              <label key={key} className="flex flex-col gap-1 text-sm">
                <span className="font-medium">{label}</span>
                <input
                  type="number"
                  step={step}
                  value={valeurs[key]}
                  onChange={e => setValeurs(prev => ({ ...prev, [key]: e.target.value }))}
                  className="rounded border border-gray-300 px-2 py-1"
                  required
                />
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? '…' : 'Assigner'}
          </button>
          {clusterNum != null && (
            <p className="flex items-center gap-2">
              Cluster assigné :{' '}
              <span
                className="rounded-full px-3 py-1 text-white font-bold"
                style={{ backgroundColor: CLUSTER_COLORS[clusterNum % CLUSTER_COLORS.length] }}
              >
                {clusterNum}
              </span>
            </p>
          )}
          {mutation.isError && (
            <p className="text-red-600">{(mutation.error as Error).message}</p>
          )}
        </form>
      </section>
    </div>
  )
}
