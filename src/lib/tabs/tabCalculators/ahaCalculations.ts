export const AHA_BASE_SPEED = 80

export function speedToContributionMultiplier(rank: number) {
  return 1 / (5 * Math.pow(2, Math.min(rank, 3)))
}

export function calculateAhaSpeed(speeds: Array<number>): number {
  const sorted = [...speeds].sort((a, b) => b - a)
  return sorted.reduce((acc, cur, idx) => acc + cur * speedToContributionMultiplier(idx), AHA_BASE_SPEED)
}

export function calculateNextTeammateSpeed(target: number | '', speeds: Array<number>): number | null {
  if (target === '') return null
  if (!speeds.length) return (target - AHA_BASE_SPEED) / speedToContributionMultiplier(0)
  const sorted = [...speeds].sort((a, b) => b - a)

  for (let pivotIndex = sorted.length - 1; pivotIndex >= 0; pivotIndex--) {
    if (calculateAhaSpeed([...sorted, sorted[pivotIndex]]) >= target) {
      const remaining = sorted.reduce((acc, cur, idx) => {
        const newIdx = idx > pivotIndex ? idx + 1 : idx
        return acc - cur * speedToContributionMultiplier(newIdx)
      }, target - AHA_BASE_SPEED)
      return remaining / speedToContributionMultiplier(pivotIndex + 1)
    }
  }

  const remaining = sorted.reduce((acc, cur, idx) => {
    return acc - cur * speedToContributionMultiplier(idx + 1)
  }, target - AHA_BASE_SPEED)
  return remaining / speedToContributionMultiplier(0)
}
