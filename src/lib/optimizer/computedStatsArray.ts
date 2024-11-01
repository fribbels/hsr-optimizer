import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

type Buff = {
  key: number
  value: number
  source: string
}

export class ComputedStatsArray {
  values: number[]
  buffs: Buff[]
  trace: boolean

  constructor(trace: boolean = false) {
    this.values = []
    this.buffs = []
    this.trace = false
  }

  add(key: number, value: number, source?: string) {
    this.values[key] = (this.values[key] ?? 0) + value

    if (this.trace) {
      if (source) {
        this.buffs.push({ key, value, source })
      }
    }
  }

  set(key: number, value: number, source: string) {
    this.values[key] = value

    if (this.trace) {
      this.buffs.push({ key, value, source })
    }
  }

  get(key: number) {
    return this.values[key]
  }

  toComputedStatsObject() {
    const result: Partial<ComputedStatsObject> = {}

    for (const key in Keys) {
      result[key as keyof KeysType] = this.values[Keys[key as KeysType]] ?? 0
    }

    return result as ComputedStatsObject
  }
}

type KeysType = keyof typeof baseComputedStatsObject

export const Keys: Record<KeysType, number> = Object.keys(baseComputedStatsObject).reduce((acc, key, index) => {
  acc[key as KeysType] = index
  return acc
}, {} as Record<KeysType, number>)
