import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getStats, getClusterData, predire, clusterer } from '../api'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => mockFetch.mockReset())

describe('getStats', () => {
  it('retourne les données BMI', async () => {
    const payload = [{ label: '(-0.09, -0.04]', value: 100.2 }]
    mockFetch.mockResolvedValue({ ok: true, json: async () => payload })

    const result = await getStats()

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/stats')
    expect(result).toEqual(payload)
  })

  it('lève une erreur si la réponse est ko', async () => {
    mockFetch.mockResolvedValue({ ok: false })
    await expect(getStats()).rejects.toThrow('Erreur API /stats')
  })
})

describe('getClusterData', () => {
  it('retourne les points de clustering', async () => {
    const payload = [{ bmi: 0.06, s5: 0.02, cluster: 1 }]
    mockFetch.mockResolvedValue({ ok: true, json: async () => payload })

    const result = await getClusterData()

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/cluster-data')
    expect(result).toEqual(payload)
  })

  it('lève une erreur si la réponse est ko', async () => {
    mockFetch.mockResolvedValue({ ok: false })
    await expect(getClusterData()).rejects.toThrow('Erreur API /cluster-data')
  })
})

describe('predire', () => {
  const features = { age: 0.03, sex: 0.05, bmi: 0.06, bp: 0.02, s1: -0.04, s2: -0.03, s3: -0.04, s4: -0.003, s5: 0.02, s6: -0.02 }

  it('retourne une prédiction numérique', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ prediction: 200.2 }) })

    const result = await predire(features)

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/predict',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(features) }),
    )
    expect(result.prediction).toBe(200.2)
  })

  it('lève une erreur si la réponse est ko', async () => {
    mockFetch.mockResolvedValue({ ok: false })
    await expect(predire(features)).rejects.toThrow('Erreur API /predict')
  })
})

describe('clusterer', () => {
  const features = { age: 0.03, sex: 0.05, bmi: 0.06, bp: 0.02, s1: -0.04, s2: -0.03, s3: -0.04, s4: -0.003, s5: 0.02, s6: -0.02 }

  it('retourne un numéro de cluster valide', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ cluster: 1 }) })

    const result = await clusterer(features)

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/cluster',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(features) }),
    )
    expect([0, 1, 2]).toContain(result.cluster)
  })

  it('lève une erreur si la réponse est ko', async () => {
    mockFetch.mockResolvedValue({ ok: false })
    await expect(clusterer(features)).rejects.toThrow('Erreur API /cluster')
  })
})
