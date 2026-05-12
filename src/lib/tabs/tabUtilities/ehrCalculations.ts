export interface EhrCalcInputs {
  effectRes: number
  debuffRes: number
  effectHitRate: number
  baseChance: number
  attempts: number
}

export function calculateApplicationRate(inputs: EhrCalcInputs): number {
  const { baseChance, effectHitRate, effectRes, debuffRes } = inputs
  const attempts = Math.max(1, Math.round(inputs.attempts))
  const hitRate = (baseChance / 100)
    * (1 + effectHitRate / 100)
    * (1 - effectRes / 100)
    * (1 - debuffRes / 100)
  return 100 * (1 - Math.pow(Math.max(0, 1 - hitRate), attempts))
}

export function calculateRequiredEhr(inputs: EhrCalcInputs & { desiredHitRate: number }): number {
  const { baseChance, effectRes, debuffRes, desiredHitRate } = inputs
  const attempts = Math.max(1, Math.round(inputs.attempts))
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
