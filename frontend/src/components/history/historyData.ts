import type { SensorSnapshot } from '@/services/api'

export const sortSnapshotsAscending = (snapshots: SensorSnapshot[]) =>
  [...snapshots].sort((left, right) => {
    const leftTime = Date.parse(left.timestamp)
    const rightTime = Date.parse(right.timestamp)
    const normalizedLeft = Number.isNaN(leftTime) ? Number.POSITIVE_INFINITY : leftTime
    const normalizedRight = Number.isNaN(rightTime) ? Number.POSITIVE_INFINITY : rightTime

    return normalizedLeft - normalizedRight
  })
