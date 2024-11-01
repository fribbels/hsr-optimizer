import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

type Buff = {
  key: number
  value: number
  source: string
}

export class ComputedStatsArray {
  static array = new Float32Array(Object.keys(baseComputedStatsObject).length)

  values: Float32Array
  buffs: Buff[]
  trace: boolean

  constructor(trace: boolean = false) {
    ComputedStatsArray.array.fill(0)
    this.values = ComputedStatsArray.array
    this.buffs = []
    this.trace = false
  }

  add(key: number, value: number, source?: string) {
    this.values[key] += value
  }

  set(key: number, value: number, source: string) {
    this.values[key] = value
  }

  get(key: number) {
    return this.values[key]
  }

  toComputedStatsObject() {
    const result: Partial<ComputedStatsObject> = {}

    for (const key in Keys) {
      result[key as keyof KeysType] = this.values[Keys[key as KeysType]]
    }

    return result as ComputedStatsObject
  }
}

type KeysType = keyof typeof baseComputedStatsObject

export const Keys: Record<KeysType, number> = Object.keys(baseComputedStatsObject).reduce((acc, key, index) => {
  acc[key as KeysType] = index
  return acc
}, {} as Record<KeysType, number>)
