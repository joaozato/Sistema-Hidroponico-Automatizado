import { describe, expect, it } from 'vitest'
import type { SensorSnapshot } from '@/services/api'
import { sortSnapshotsAscending } from './historyData'

const snapshot = (id: number, timestamp: string): SensorSnapshot => ({
  id,
  timestamp,
  temperature: null,
  humidity: null,
  water_level: null,
  product_level: null,
  central_water_level: null,
  central_product_level: null,
  lines: [],
})

describe('sortSnapshotsAscending', () => {
  it('ordena os snapshots do mais antigo para o mais recente', () => {
    const snapshots = [
      snapshot(2, '2026-09-02T10:00:00Z'),
      snapshot(1, '2026-09-01T10:00:00Z'),
    ]

    expect(sortSnapshotsAscending(snapshots).map((item) => item.id)).toEqual([1, 2])
  })
})
