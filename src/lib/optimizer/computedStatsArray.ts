import { baseComputedStatsObject } from 'lib/conditionals/conditionalConstants'

type Buff = {
  value: number
  source: string
}

class ComputedStatsArray {
  values: Float32Array
  buffs: Buff[]
  trace: boolean

  constructor(trace: boolean = false) {
    this.values = new Float32Array(Object.keys(baseComputedStatsObject).length)
    this.buffs = []
    this.trace = trace
  }

  buff(key: number, value: number, source: string) {
    this.values[key] += value

    if (this.trace) {
      this.buffs.push({ value, source })
    }
  }
}

type KeysType = keyof typeof baseComputedStatsObject

export const Keys: Record<KeysType, number> = Object.keys(baseComputedStatsObject).reduce((acc, key, index) => {
  acc[key as KeysType] = index
  return acc
}, {} as Record<KeysType, number>)
