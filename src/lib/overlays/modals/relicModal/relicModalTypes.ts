import type { MainStats, Parts, Sets, SubStats } from 'lib/constants/constants'
import type { RelicEnhance, RelicGrade } from 'types/relic'

export type RelicUpgradeValues = {
  low: number | undefined | null
  mid: number | undefined | null
  high: number | undefined | null
}

export type RelicForm = Partial<{
  part: Parts
  mainStatType: MainStats
  mainStatValue: number
  set: Sets
  enhance: RelicEnhance
  grade: RelicGrade
  substatType0: SubStats
  substatType1: SubStats
  substatType2: SubStats
  substatType3: SubStats
  substatValue0: string
  substatValue1: string
  substatValue2: string
  substatValue3: string
  substat0IsPreview: false | number
  substat1IsPreview: false | number
  substat2IsPreview: false | number
  substat3IsPreview: false | number
  equippedBy: string
}>

export type MainStatOption = {
  label: string
  value: string
  icon?: string
}

export type SubstatValues = Pick<
  RelicForm,
  `substatType${0 | 1 | 2 | 3}` | `substatValue${0 | 1 | 2 | 3}` | `substat${0 | 1 | 2 | 3}IsPreview`
>

export type RelicFormStat = {
  stat: string | undefined
  value: string | undefined
  isPreview: false | number | undefined
}
