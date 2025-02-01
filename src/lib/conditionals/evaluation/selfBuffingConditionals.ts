import { Stats } from 'lib/constants/constants'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { ComputedStatsArray, Key, Source } from 'lib/optimization/computedStatsArray'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export function selfBuffingStat(
  stat: AllowedStats,
  percentage: number,
  conditional: DynamicConditional,
  x: ComputedStatsArray,
  action: OptimizerAction,
  context: OptimizerContext,
) {
  const statProperty = statToStatProperty[stat]
  const ratioProperty = statToRatioProperty[stat]
  const percentageRatioBasedBuff = getPercentageRatioBasedBuff(x, stat, context)
  const ratioKey = Key[ratioProperty]
  const statKey = StatToKey[stat]

  const stateValue = action.conditionalState[conditional.id] || 0
  const convertibleValue = x.a[statKey] - x.a[ratioKey] - percentageRatioBasedBuff

  const buffValue = percentage * convertibleValue
  const finalBuffValue = buffValue - stateValue

  action.conditionalState[conditional.id] = (action.conditionalState[conditional.id] ?? 0) + finalBuffValue

  x[ratioProperty].buff(finalBuffValue, Source.NONE)
  x[statProperty].buffDynamic(finalBuffValue, Source.NONE, action, context)
}

const allowedStats = [
  Stats.HP,
  Stats.ATK,
  Stats.DEF,
  Stats.SPD,
  Stats.CD,
] as const

function getPercentageRatioBasedBuff(x: ComputedStatsArray, stat: AllowedStats, context: OptimizerContext) {
  switch (stat) {
    case Stats.HP:
      return x.a[Key.RATIO_BASED_HP_P_BUFF] * context.baseHP
    case Stats.ATK:
      return x.a[Key.RATIO_BASED_ATK_P_BUFF] * context.baseATK
    case Stats.DEF:
      return x.a[Key.RATIO_BASED_DEF_P_BUFF] * context.baseDEF
    default:
      return 0
  }
}

type AllowedStats = (typeof allowedStats)[number]

export const StatToKey = {
  [Stats.ATK_P]: Key.ATK_P,
  [Stats.ATK]: Key.ATK,
  [Stats.BE]: Key.BE,
  [Stats.CD]: Key.CD,
  [Stats.CR]: Key.CR,
  [Stats.DEF_P]: Key.DEF_P,
  [Stats.DEF]: Key.DEF,
  [Stats.EHR]: Key.EHR,
  [Stats.ERR]: Key.ERR,
  [Stats.Fire_DMG]: Key.FIRE_DMG_BOOST,
  [Stats.HP_P]: Key.HP_P,
  [Stats.HP]: Key.HP,
  [Stats.Ice_DMG]: Key.ICE_DMG_BOOST,
  [Stats.Imaginary_DMG]: Key.IMAGINARY_DMG_BOOST,
  [Stats.Lightning_DMG]: Key.LIGHTNING_DMG_BOOST,
  [Stats.OHB]: Key.OHB,
  [Stats.Physical_DMG]: Key.PHYSICAL_DMG_BOOST,
  [Stats.Quantum_DMG]: Key.QUANTUM_DMG_BOOST,
  [Stats.RES]: Key.RES,
  [Stats.SPD_P]: Key.SPD_P,
  [Stats.SPD]: Key.SPD,
  [Stats.Wind_DMG]: Key.WIND_DMG_BOOST,
}

const statToRatioProperty = {
  [Stats.HP]: 'RATIO_BASED_HP_BUFF',
  [Stats.HP_P]: 'RATIO_BASED_HP_P_BUFF',
  [Stats.ATK]: 'RATIO_BASED_ATK_BUFF',
  [Stats.ATK_P]: 'RATIO_BASED_ATK_P_BUFF',
  [Stats.DEF]: 'RATIO_BASED_DEF_BUFF',
  [Stats.DEF_P]: 'RATIO_BASED_DEF_P_BUFF',
  [Stats.SPD]: 'RATIO_BASED_SPD_BUFF',
  [Stats.CD]: 'RATIO_BASED_CD_BUFF',
} as const

const statToStatProperty = {
  [Stats.HP]: 'HP',
  [Stats.HP_P]: 'HP_P',
  [Stats.ATK]: 'ATK',
  [Stats.ATK_P]: 'ATK_P',
  [Stats.DEF]: 'DEF',
  [Stats.DEF_P]: 'DEF_P',
  [Stats.SPD]: 'SPD',
  [Stats.CD]: 'CD',
} as const
