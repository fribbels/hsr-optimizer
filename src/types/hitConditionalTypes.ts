import { ElementToResPenType } from 'lib/constants/constants'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ElementTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
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
  damageElement: ElementTag

  atkScaling: number
  hpScaling: number
  defScaling: number
  specialScaling: number

  toughnessDmg: number

  activeHit: boolean

  registerIndex: number
}

const ActionKey = {}

export interface DamageFunction {
  apply: (x: ComputedStatsContainer, action: OptimizerAction, hitIndex: number, context: OptimizerContext) => number
}

export const DefaultDamageFunction: DamageFunction = {
  apply: (x: ComputedStatsContainer, action: OptimizerAction, hitIndex: number, context: OptimizerContext) => 1,
}

function getElementSpecificDamageBoost(x: ComputedStatsContainer, hit: Hit) {
  return 0
}

export const DotDamageFunction: DamageFunction = {
  apply: (x: ComputedStatsContainer, action: OptimizerAction, hitIndex: number, context: OptimizerContext) => {
    const hit = action.hits![hitIndex]
    const eLevel = context.enemyLevel
    const a = x.a

    const baseDefPen = x.getHit(StatKey.DEF_PEN, hitIndex) + context.combatBuffs.DEF_PEN
    const baseUniversalMulti = a[StatKey.ENEMY_WEAKNESS_BROKEN] ? 1 : 0.9
    const baseResistance = context.enemyDamageResistance - x.getHit(StatKey.RES_PEN, hitIndex) - context.combatBuffs.RES_PEN
    // - getResPenType(x, context.elementalResPenType)

    const dotDmgBoostMulti = 1 + x.getHit(StatKey.DMG_BOOST, hitIndex)
    const dotDefMulti = calculateDefMulti(eLevel, baseDefPen + x.getHit(StatKey.DEF_PEN, hitIndex))
    const dotVulnerabilityMulti = 1 + x.getHit(StatKey.VULNERABILITY, hitIndex) + x.getHit(StatKey.VULNERABILITY, hitIndex)
    const dotResMulti = 1 - (baseResistance - x.getHit(StatKey.RES_PEN, hitIndex))
    const dotEhrMulti = calculateEhrMulti(x, hitIndex, context)
    const dotFinalDmgMulti = 1 + x.getHit(StatKey.FINAL_DMG_BOOST, hitIndex)

    const initialDmg = calculateInitial(
      a,
      context,
      0,
      hit.hpScaling,
      hit.defScaling,
      hit.atkScaling,
      x.getHit(StatKey.ATK_P_BOOST, hitIndex),
    )

    const dmg = initialDmg
      * baseUniversalMulti
      * dotDmgBoostMulti
      * dotDefMulti
      * dotVulnerabilityMulti
      * dotResMulti
      * dotEhrMulti
      * dotFinalDmgMulti

    return dmg
    // return instanceDmg * comboDotMulti
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
  hitIndex: number,
  context: OptimizerContext,
) {
  const a = x.a
  const enemyEffectRes = context.enemyEffectResistance

  // Dot calcs
  // For stacking dots where the first stack has extra value
  // c = dot chance, s = stacks => avg dmg = (full dmg) * (1 + 0.05 * c * (s-1)) / (1 + 0.05 * (s-1))
  const dotChance = x.getStat(StatKey.DOT_CHANCE, hitIndex)
  const ehr = x.getStat(StatKey.EHR, hitIndex)
  const effResPen = x.getStat(StatKey.EFFECT_RES_PEN, hitIndex)
  const dotSplit = x.getStat(StatKey.DOT_SPLIT, hitIndex)

  const effectiveDotChance = Math.min(1, dotChance * (1 + ehr) * (1 - enemyEffectRes + effResPen))

  if (dotSplit) {
    const dotStacks = x.getStat(StatKey.DOT_STACKS, hitIndex)
    return (1 + dotSplit * effectiveDotChance * (dotStacks - 1)) / (1 + dotSplit * (dotStacks - 1))
  }
  return effectiveDotChance
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
    + hpScaling * a[StatKey.HP]
    + defScaling * a[StatKey.DEF]
    + atkScaling * (a[StatKey.ATK] + atkBoostP * context.baseATK)
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
