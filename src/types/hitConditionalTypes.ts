import {
  ElementName,
  ElementToResPenType,
} from 'lib/constants/constants'
import {
  ComputedStatsArray,
  DefaultActionDamageValues,
  Key,
} from 'lib/optimization/computedStatsArray'
import { StatsConfigByIndex } from 'lib/optimization/config/computedStatsConfig'
import {
  ActionKey,
  ComputedStatsContainer,
  HitKey,
} from 'lib/optimization/engine/computedStatsContainer'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import { ElementalResPenType } from 'types/metadata'
import {
  OptimizerAction,
  OptimizerContext,
} from './optimizer'

export interface HitAction {
  name: string
  hits: Hit[]
}

export type DamageFunctionName = string

export interface Hit {
  damageFunction: DamageFunction
  damageType: number
  damageElement: ElementName

  atkScaling: number
  hpScaling: number
  defScaling: number
  specialScaling: number

  toughnessDmg: number

  activeHit: boolean
}

export interface DamageFunction {
  apply: (x: ComputedStatsContainer, hit: HitAction, action: OptimizerAction, context: OptimizerContext) => number
}

export const DefaultDamageFunction: DamageFunction = {
  apply: (x: ComputedStatsContainer, hit: HitAction, action: OptimizerAction, context: OptimizerContext) => 1,
}

export const DotDamageFunction: DamageFunction = {
  apply: (x: ComputedStatsContainer, hit: HitAction, action: OptimizerAction, context: OptimizerContext) => {
    const eLevel = context.enemyLevel
    const a = x.a

    const baseDmgBoost = 1 + a[ActionKey.ELEMENTAL_DMG]
    const baseDefPen = a[HitKey.DEF_PEN] + context.combatBuffs.DEF_PEN
    const baseUniversalMulti = a[ActionKey.ENEMY_WEAKNESS_BROKEN] ? 1 : 0.9
    const baseResistance = context.enemyDamageResistance - a[HitKey.RES_PEN] - context.combatBuffs.RES_PEN - getResPenType(x, context.elementalResPenType)
    const baseBreakEfficiencyBoost = 1 + a[HitKey.BREAK_EFFICIENCY_BOOST]

    const dotDmgBoostMulti = baseDmgBoost + a[HitKey.DMG_BOOST]
    const dotDefMulti = calculateDefMulti(eLevel, baseDefPen + a[HitKey.DEF_PEN])
    const dotVulnerabilityMulti = 1 + a[HitKey.VULNERABILITY] + a[HitKey.VULNERABILITY]
    const dotResMulti = 1 - (baseResistance - a[HitKey.RES_PEN])
    const dotEhrMulti = calculateEhrMulti(x, context)
    // const dotTrueDmgMulti = a[HitKey.TRUE_DMG_MODIFIER] + a[ActionKey.DOT_TRUE_DMG_MODIFIER] // (1 +) dropped intentionally for dmg tracing
    const dotFinalDmgMulti = 1 + a[HitKey.FINAL_DMG_BOOST] //  + a[HitKey.DOT_FINAL_DMG_BOOST]

    const initialDmg = calculateInitial(
      a,
      context,
      a[HitKey.DMG],
      a[HitKey.HP_SCALING],
      a[HitKey.DEF_SCALING],
      a[HitKey.ATK_SCALING],
      a[HitKey.ATK_P_BOOST],
    )
    const instanceDmg = calculateDotDmg(
      x,
      action,
      Key.DOT_DMG,
      initialDmg,
      baseUniversalMulti,
      dotDmgBoostMulti,
      dotDefMulti,
      dotVulnerabilityMulti,
      dotResMulti,
      dotEhrMulti,
      // dotTrueDmgMulti,
      dotFinalDmgMulti,
    )
    // a[ActionKey.DOT_DMG] = instanceDmg

    return instanceDmg
  },
}

function calculateDotDmg(
  x: ComputedStatsContainer,
  action: OptimizerAction,
  abilityKey: number,
  baseDmg: number,
  universalMulti: number,
  dmgBoostMulti: number,
  defMulti: number,
  vulnerabilityMulti: number,
  resMulti: number,
  ehrMulti: number,
  // trueDmgMulti: number,
  finalDmgMulti: number,
) {
  const dotDmg = baseDmg
    * universalMulti
    * dmgBoostMulti
    * defMulti
    * vulnerabilityMulti
    * resMulti
    * ehrMulti
    * finalDmgMulti

  return dotDmg
}

const cLevelConst = 20 + 80

function calculateDefMulti(eLevel: number, defPen: number) {
  return cLevelConst / ((eLevel + 20) * Math.max(0, 1 - defPen) + cLevelConst)
}

function calculateEhrMulti(
  x: ComputedStatsContainer,
  context: OptimizerContext,
) {
  const a = x.a
  const enemyEffectRes = context.enemyEffectResistance

  // Dot calcs
  // For stacking dots where the first stack has extra value
  // c = dot chance, s = stacks => avg dmg = (full dmg) * (1 + 0.05 * c * (s-1)) / (1 + 0.05 * (s-1))
  const effectiveDotChance = Math.min(1, a[ActionKey.DOT_CHANCE] * (1 + a[ActionKey.EHR]) * (1 - enemyEffectRes + a[ActionKey.EFFECT_RES_PEN]))
  return a[ActionKey.DOT_SPLIT]
    ? (1 + a[ActionKey.DOT_SPLIT] * effectiveDotChance * (a[ActionKey.DOT_STACKS] - 1)) / (1 + a[ActionKey.DOT_SPLIT] * (a[ActionKey.DOT_STACKS] - 1))
    : effectiveDotChance
}

function calculateInitial(
  a: Float32Array,
  context: OptimizerContext,
  abilityDmg: number,
  hpScaling: number,
  defScaling: number,
  atkScaling: number,
  atkBoostP: number,
) {
  return abilityDmg
    + hpScaling * a[ActionKey.HP]
    + defScaling * a[ActionKey.DEF]
    + atkScaling * (a[ActionKey.ATK] + atkBoostP * context.baseATK)
}

export function getResPenType(x: ComputedStatsContainer, type: ElementalResPenType) {
  return x.a[ElementToResPenTypeToKey[type]]
}

const ElementToResPenTypeToKey = {
  [ElementToResPenType.Physical]: ActionKey.PHYSICAL_RES_PEN,
  [ElementToResPenType.Fire]: ActionKey.FIRE_RES_PEN,
  [ElementToResPenType.Ice]: ActionKey.ICE_RES_PEN,
  [ElementToResPenType.Lightning]: ActionKey.LIGHTNING_RES_PEN,
  [ElementToResPenType.Wind]: ActionKey.WIND_RES_PEN,
  [ElementToResPenType.Quantum]: ActionKey.QUANTUM_RES_PEN,
  [ElementToResPenType.Imaginary]: ActionKey.IMAGINARY_RES_PEN,
} as const
