export function speedToContributionMultiplier(rank: number) {
  return 1 / (5 * Math.pow(2, Math.min(rank, 3)))
}

export function calculateAhaSpeed(speeds: Array<number>, ahaBase: number): number {
  const sorted = [...speeds].sort((a, b) => b - a)
  return sorted.reduce((acc, cur, idx) => acc + cur * speedToContributionMultiplier(idx), ahaBase)
}

export function calculateNextTeammateSpeed(target: number | '', speeds: Array<number>, ahaBase: number): number | null {
  if (target === '') return null
  if (!speeds.length) return (target - ahaBase) / speedToContributionMultiplier(0)
  const sorted = [...speeds].sort((a, b) => b - a)

  for (let pivotIndex = sorted.length - 1; pivotIndex >= 0; pivotIndex--) {
    if (calculateAhaSpeed([...sorted, sorted[pivotIndex]], ahaBase) >= target) {
      const remaining = sorted.reduce((acc, cur, idx) => {
        const newIdx = idx > pivotIndex ? idx + 1 : idx
        return acc - cur * speedToContributionMultiplier(newIdx)
      }, target - ahaBase)
      return remaining / speedToContributionMultiplier(pivotIndex + 1)
    }
  }

  const remaining = sorted.reduce((acc, cur, idx) => {
    return acc - cur * speedToContributionMultiplier(idx + 1)
  }, target - ahaBase)
  return remaining / speedToContributionMultiplier(0)
}
