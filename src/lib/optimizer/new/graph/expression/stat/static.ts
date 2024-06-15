import { Expression, TODO } from '..'

// All Expression that is constant through the whole process
export type StaticStatExpression = Expression<StaticStat, TODO>
export type StaticStat = {
  lv: number

  atkBase: number
  defBase: number
  hpBase: number
  speedBase: number
}
