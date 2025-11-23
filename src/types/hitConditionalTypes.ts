import { StatKey } from 'lib/optimization/engine/config/keys'
import { ElementTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  OptimizerAction,
  OptimizerContext,
} from './optimizer'

export interface AbilityDefinition {
  hits: HitDefinition[]
}

export type DamageFunctionName = string

export interface Hit extends HitDefinition {
  registerIndex: number
  sourceEntityIndex: number
}

export interface HitDefinition {
  sourceEntity?: string
  referenceHit?: Hit

  damageFunction: DamageFunction
  damageType: number
  damageElement: ElementTag

  atkScaling?: number
  hpScaling?: number
  defScaling?: number
  specialScaling?: number

  toughnessDmg?: number

  activeHit: boolean
}

export interface EntityDefinition {
  primary: boolean
  summon: boolean
  memosprite: boolean

  memoBaseAtkFlat?: number
  memoBaseHpFlat?: number
  memoBaseDefFlat?: number
  memoBaseSpdFlat?: number

  memoBaseAtkScaling?: number
  memoBaseHpScaling?: number
  memoBaseDefScaling?: number
  memoBaseSpdScaling?: number
}

const ActionKey = {}

export interface DamageFunction {
  apply: (x: ComputedStatsContainer, action: OptimizerAction, hitIndex: number, context: OptimizerContext) => number
}

export const DefaultDamageFunction: DamageFunction = {
  apply: (x: ComputedStatsContainer, action: OptimizerAction, hitIndex: number, context: OptimizerContext) => 1,
}

export const CritDamageFunction: DamageFunction = {
  apply: (x: ComputedStatsContainer, action: OptimizerAction, hitIndex: number, context: OptimizerContext) => {
    const hit = action.hits![hitIndex]
    const sourceEntityIndex = hit.sourceEntityIndex ?? 0
    const eLevel = context.enemyLevel

    const cr = x.getValue(StatKey.CR, hitIndex)
    const crBoost = x.getValue(StatKey.CR_BOOST, hitIndex)
    const cd = x.getValue(StatKey.CD, hitIndex)
    const cdBoost = x.getValue(StatKey.CD_BOOST, hitIndex)

    const abilityCr = Math.min(1, cr + crBoost)
    const abilityCd = cd + cdBoost
    const abilityCritMulti = abilityCr * (1 + abilityCd) + (1 - abilityCr)

    const defPen = x.getValue(StatKey.DEF_PEN, hitIndex)
    const resPen = x.getValue(StatKey.RES_PEN, hitIndex)
    const vulnerability = x.getValue(StatKey.VULNERABILITY, hitIndex)
    const finalDmg = x.getValue(StatKey.FINAL_DMG_BOOST, hitIndex)
    const dmgBoost = x.getValue(StatKey.DMG_BOOST, hitIndex)

    const baseUniversalMulti = x.a[StatKey.ENEMY_WEAKNESS_BROKEN] ? 1 : 0.9
    const dmgBoostMulti = 1 + dmgBoost
    const defMulti = calculateDefMulti(eLevel, context.combatBuffs.DEF_PEN + defPen)
    const vulnerabilityMulti = 1 + vulnerability
    const resMulti = 1 - (context.enemyDamageResistance - context.combatBuffs.RES_PEN - resPen)
    const finalDmgMulti = 1 + finalDmg

    const atkBoost = x.getValue(StatKey.ATK_P_BOOST, hitIndex)

    const initialDmg = calculateInitial(
      x,
      hitIndex,
      sourceEntityIndex,
      context,
      0,
      hit.hpScaling ?? 0,
      hit.defScaling ?? 0,
      hit.atkScaling ?? 0,
      atkBoost,
    )

    const dmg = initialDmg
      * baseUniversalMulti
      * dmgBoostMulti
      * defMulti
      * vulnerabilityMulti
      * resMulti
      * abilityCritMulti
      * finalDmgMulti

    return dmg
  },
}

export const DotDamageFunction: DamageFunction = {
  apply: (x: ComputedStatsContainer, action: OptimizerAction, hitIndex: number, context: OptimizerContext) => {
    const hit = action.hits![hitIndex]
    const sourceEntityIndex = hit.sourceEntityIndex ?? 0
    const eLevel = context.enemyLevel

    const baseUniversalMulti = x.a[StatKey.ENEMY_WEAKNESS_BROKEN] ? 1 : 0.9
    const dotDmgBoostMulti = 1 + x.getValue(StatKey.DMG_BOOST, hitIndex)
    const dotDefMulti = calculateDefMulti(eLevel, context.combatBuffs.DEF_PEN + x.getValue(StatKey.DEF_PEN, hitIndex))
    const dotVulnerabilityMulti = 1 + x.getValue(StatKey.VULNERABILITY, hitIndex) + x.getValue(StatKey.VULNERABILITY, hitIndex)
    const dotResMulti = 1 - (context.enemyDamageResistance - context.combatBuffs.RES_PEN - x.getValue(StatKey.RES_PEN, hitIndex))
    const dotEhrMulti = calculateEhrMulti(x, hitIndex, context)
    const dotFinalDmgMulti = 1 + x.getValue(StatKey.FINAL_DMG_BOOST, hitIndex)

    const atkBoost = x.getValue(StatKey.ATK_P_BOOST, hitIndex)

    const initialDmg = calculateInitial(
      x,
      hitIndex,
      sourceEntityIndex,
      context,
      0,
      hit.hpScaling ?? 0,
      hit.defScaling ?? 0,
      hit.atkScaling ?? 0,
      atkBoost,
    )

    return initialDmg
      * baseUniversalMulti
      * dotDmgBoostMulti
      * dotDefMulti
      * dotVulnerabilityMulti
      * dotResMulti
      * dotEhrMulti
      * dotFinalDmgMulti
  },
}

export const BreakDamageFunction: DamageFunction = {
  apply: (x: ComputedStatsContainer, action: OptimizerAction, hitIndex: number, context: OptimizerContext) => {
    const hit = action.hits![hitIndex]
    const eLevel = context.enemyLevel
    const a = x.a

    const be = x.getValue(StatKey.BE, hitIndex)

    const defPen = x.getValue(StatKey.DEF_PEN, hitIndex)
    const resPen = x.getValue(StatKey.RES_PEN, hitIndex)
    const vulnerability = x.getValue(StatKey.VULNERABILITY, hitIndex)
    const finalDmg = x.getValue(StatKey.FINAL_DMG_BOOST, hitIndex)

    // Break only benefits from Break type DMG boost
    const dmgBoost = x.getHitValue(StatKey.DMG_BOOST, hitIndex)

    const baseUniversalMulti = a[StatKey.ENEMY_WEAKNESS_BROKEN] ? 1 : 0.9
    const dmgBoostMulti = 1 + dmgBoost
    const defMulti = calculateDefMulti(eLevel, context.combatBuffs.DEF_PEN + defPen)
    const vulnerabilityMulti = 1 + vulnerability
    const resMulti = 1 - (context.enemyDamageResistance - context.combatBuffs.RES_PEN - resPen)
    const finalDmgMulti = 1 + finalDmg
    const beMulti = 1 + be

    const breakFixedMulti = 3767.5533

    const dmg = baseUniversalMulti
      * breakFixedMulti
      * context.elementalBreakScaling
      * defMulti
      * (0.5 + context.enemyMaxToughness / 120)
      * vulnerabilityMulti
      * resMulti
      * beMulti
      * dmgBoostMulti
      * finalDmgMulti

    return dmg
    // return instanceDmg * comboDotMulti
  },
}

export const SuperBreakDamageFunction: DamageFunction = {
  apply: (x: ComputedStatsContainer, action: OptimizerAction, hitIndex: number, context: OptimizerContext) => {
    const hit = action.hits![hitIndex]
    const eLevel = context.enemyLevel

    const toughnessDmg = hit.referenceHit?.toughnessDmg ?? 0
    if (toughnessDmg === 0) return 0

    const superBreakModifier = x.getValue(StatKey.SUPER_BREAK_MODIFIER, hitIndex)
    if (superBreakModifier === 0) return 0

    const be = x.getValue(StatKey.BE, hitIndex)
    const defPen = x.getValue(StatKey.DEF_PEN, hitIndex)
    const resPen = x.getValue(StatKey.RES_PEN, hitIndex)
    const vulnerability = x.getValue(StatKey.VULNERABILITY, hitIndex)
    const dmgBoost = x.getHitValue(StatKey.DMG_BOOST, hitIndex)
    const breakEfficiencyBoost = x.getValue(StatKey.BREAK_EFFICIENCY_BOOST, hitIndex)

    const baseUniversalMulti = x.a[StatKey.ENEMY_WEAKNESS_BROKEN] ? 1 : 0.9
    const defMulti = calculateDefMulti(eLevel, context.combatBuffs.DEF_PEN + defPen)
    const vulnerabilityMulti = 1 + vulnerability
    const resMulti = 1 - (context.enemyDamageResistance - context.combatBuffs.RES_PEN - resPen)
    const beMulti = 1 + be
    const dmgBoostMulti = 1 + dmgBoost

    const baseSuperBreakInstanceDmg = baseUniversalMulti
      * 3767.5533 / 10
      * defMulti
      * vulnerabilityMulti
      * resMulti
      * beMulti
      * dmgBoostMulti

    const dmg = baseSuperBreakInstanceDmg
      * superBreakModifier
      * (1 + breakEfficiencyBoost)
      * toughnessDmg

    return dmg
  },
}

export const AdditionalDamageFunction: DamageFunction = {
  apply: (x: ComputedStatsContainer, action: OptimizerAction, hitIndex: number, context: OptimizerContext) => {
    const hit = action.hits![hitIndex]
    const sourceEntityIndex = hit.sourceEntityIndex ?? 0
    const eLevel = context.enemyLevel

    const cr = x.getValue(StatKey.CR, hitIndex)
    const crBoost = x.getValue(StatKey.CR_BOOST, hitIndex)
    const cd = x.getValue(StatKey.CD, hitIndex)
    const cdBoost = x.getValue(StatKey.CD_BOOST, hitIndex)

    const abilityCr = Math.min(1, cr + crBoost)
    const abilityCd = cd + cdBoost
    const abilityCritMulti = abilityCr * (1 + abilityCd) + (1 - abilityCr)

    const defPen = x.getValue(StatKey.DEF_PEN, hitIndex)
    const resPen = x.getValue(StatKey.RES_PEN, hitIndex)
    const vulnerability = x.getValue(StatKey.VULNERABILITY, hitIndex)
    const finalDmg = x.getValue(StatKey.FINAL_DMG_BOOST, hitIndex)
    const dmgBoost = x.getValue(StatKey.DMG_BOOST, hitIndex)

    const baseUniversalMulti = x.a[StatKey.ENEMY_WEAKNESS_BROKEN] ? 1 : 0.9
    const dmgBoostMulti = 1 + dmgBoost
    const defMulti = calculateDefMulti(eLevel, context.combatBuffs.DEF_PEN + defPen)
    const vulnerabilityMulti = 1 + vulnerability
    const resMulti = 1 - (context.enemyDamageResistance - context.combatBuffs.RES_PEN - resPen)
    const finalDmgMulti = 1 + finalDmg

    const atkBoost = x.getValue(StatKey.ATK_P_BOOST, hitIndex)

    const initialDmg = calculateInitial(
      x,
      hitIndex,
      sourceEntityIndex,
      context,
      0,
      hit.hpScaling ?? 0,
      hit.defScaling ?? 0,
      hit.atkScaling ?? 0,
      atkBoost,
    )

    const dmg = initialDmg
      * baseUniversalMulti
      * dmgBoostMulti
      * defMulti
      * vulnerabilityMulti
      * resMulti
      * abilityCritMulti
      * finalDmgMulti

    return dmg
  },
}

const cLevelConst = 20 + 80

function calculateDefMulti(eLevel: number, defPen: number) {
  return cLevelConst / ((eLevel + 20) * Math.max(0, 1 - defPen) + cLevelConst)
}

function calculateEhrMulti(
  x: ComputedStatsContainer,
  hitIndex: number,
  context: OptimizerContext,
) {
  const a = x.a
  const enemyEffectRes = context.enemyEffectResistance

  // Dot calcs
  // For stacking dots where the first stack has extra value
  // c = dot chance, s = stacks => avg dmg = (full dmg) * (1 + 0.05 * c * (s-1)) / (1 + 0.05 * (s-1))
  const dotChance = x.getValue(StatKey.DOT_CHANCE, hitIndex)
  const ehr = x.getValue(StatKey.EHR, hitIndex)
  const effResPen = x.getValue(StatKey.EFFECT_RES_PEN, hitIndex)
  const dotSplit = x.getValue(StatKey.DOT_SPLIT, hitIndex)

  const effectiveDotChance = Math.min(1, dotChance * (1 + ehr) * (1 - enemyEffectRes + effResPen))

  if (dotSplit) {
    const dotStacks = x.getValue(StatKey.DOT_STACKS, hitIndex)
    return (1 + dotSplit * effectiveDotChance * (dotStacks - 1)) / (1 + dotSplit * (dotStacks - 1))
  }
  return effectiveDotChance
}

function calculateInitial(
  x: ComputedStatsContainer,
  hitIndex: number,
  sourceEntityIndex: number,
  context: OptimizerContext,
  abilityDmg: number,
  hpScaling: number,
  defScaling: number,
  atkScaling: number,
  atkBoostP: number,
) {
  const hp = x.getValue(StatKey.HP, hitIndex)
  const def = x.getValue(StatKey.DEF, hitIndex)
  const atk = x.getValue(StatKey.ATK, hitIndex)

  return abilityDmg
    + hpScaling * hp
    + defScaling * def
    + atkScaling * (atk + atkBoostP * context.baseATK)
}
