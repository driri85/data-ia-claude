import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { predire } from './api'

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

export default function PredictionForm() {
  const [valeurs, setValeurs] = useState<Record<string, string>>(defaultValues)

  const mutation = useMutation({ mutationFn: predire })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const payload = Object.fromEntries(
      FIELDS.map(f => [f.key, Number.parseFloat(valeurs[f.key])])
    )
    mutation.mutate(payload)
  }

  return (
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
        {mutation.isPending ? '…' : 'Prédire'}
      </button>
      {mutation.data?.prediction != null && (
        <p>Prédiction : <strong>{mutation.data.prediction.toFixed(1)}</strong></p>
      )}
      {mutation.isError && <p className="text-red-600">{(mutation.error as Error).message}</p>}
    </form>
  )
}
