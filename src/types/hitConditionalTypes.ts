import {
  ElementName,
  ElementNames,
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
  ActionKeyValue,
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
  apply: (x: ComputedStatsContainer, hit: Hit, action: OptimizerAction, context: OptimizerContext) => number
}

export const DefaultDamageFunction: DamageFunction = {
  apply: (x: ComputedStatsContainer, hit: Hit, action: OptimizerAction, context: OptimizerContext) => 1,
}

const actionElementDamageKeyByElement: Record<ElementName, ActionKeyValue> = {
  [ElementNames.Physical]: ActionKey.PHYSICAL_DMG_BOOST,
  [ElementNames.Quantum]: ActionKey.QUANTUM_DMG_BOOST,
  [ElementNames.Imaginary]: ActionKey.IMAGINARY_DMG_BOOST,
  [ElementNames.Ice]: ActionKey.ICE_DMG_BOOST,
  [ElementNames.Wind]: ActionKey.WIND_DMG_BOOST,
  [ElementNames.Fire]: ActionKey.FIRE_DMG_BOOST,
  [ElementNames.Lightning]: ActionKey.LIGHTNING_DMG_BOOST,
} as const

function getElementSpecificDamageBoost(x: ComputedStatsContainer, hit: Hit) {
  const actionKey = actionElementDamageKeyByElement[hit.damageElement]
  const value = actionKey ? x.a[actionKey] : 0

  return value
}

export const DotDamageFunction: DamageFunction = {
  apply: (x: ComputedStatsContainer, hit: Hit, action: OptimizerAction, context: OptimizerContext) => {
    const eLevel = context.enemyLevel
    const a = x.a

    const baseDmgBoost = 1 + a[ActionKey.ELEMENTAL_DMG]
    const baseDefPen = x.getHit(HitKey.DEF_PEN, hit) + context.combatBuffs.DEF_PEN
    const baseUniversalMulti = a[ActionKey.ENEMY_WEAKNESS_BROKEN] ? 1 : 0.9
    const baseResistance = context.enemyDamageResistance - x.getHit(HitKey.RES_PEN, hit) - context.combatBuffs.RES_PEN
      - getResPenType(x, context.elementalResPenType)
    const baseBreakEfficiencyBoost = 1 + x.getHit(HitKey.BREAK_EFFICIENCY_BOOST, hit)

    const dotDmgBoostMulti = baseDmgBoost + x.getHit(HitKey.DMG_BOOST, hit) + getElementSpecificDamageBoost(x, hit)
    const dotDefMulti = calculateDefMulti(eLevel, baseDefPen + x.getHit(HitKey.DEF_PEN, hit))
    const dotVulnerabilityMulti = 1 + x.getHit(HitKey.VULNERABILITY, hit) + x.getHit(HitKey.VULNERABILITY, hit)
    const dotResMulti = 1 - (baseResistance - x.getHit(HitKey.RES_PEN, hit))
    const dotEhrMulti = calculateEhrMulti(x, context)
    const dotFinalDmgMulti = 1 + x.getHit(HitKey.FINAL_DMG_BOOST, hit)

    const initialDmg = calculateInitial(
      a,
      context,
      x.getHit(HitKey.DMG, hit),
      hit.hpScaling,
      hit.defScaling,
      hit.atkScaling,
      x.getHit(HitKey.ATK_P_BOOST, hit),
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

    // TODO
    const comboDotMulti = context.comboDot / Math.max(1, context.dotAbilities)

    return instanceDmg * comboDotMulti
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
