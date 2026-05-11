export interface EhrCalcInputs {
  effectRes: number
  debuffRes: number
  effectHitRate: number
  baseChance: number
  attempts: number
}

export function calculateApplicationRate(inputs: EhrCalcInputs): number {
  const { baseChance, effectHitRate, effectRes, debuffRes, attempts } = inputs
  const hitRate = (baseChance / 100)
    * (1 + effectHitRate / 100)
    * (1 - effectRes / 100)
    * (1 - debuffRes / 100)
  return 100 * (1 - Math.pow(Math.max(0, 1 - hitRate), attempts))
}

export function calculateRequiredEhr(inputs: EhrCalcInputs & { desiredHitRate: number }): number {
  const { baseChance, effectRes, debuffRes, attempts, desiredHitRate } = inputs
  const canCompute = baseChance > 0 && effectRes < 100 && debuffRes < 100
  if (!canCompute) return NaN

  return 100 * (
    (1 - Math.pow(1 - desiredHitRate / 100, 1 / attempts))
      / (1 - debuffRes / 100)
      / (1 - effectRes / 100)
      / (baseChance / 100)
    - 1
  )
}
