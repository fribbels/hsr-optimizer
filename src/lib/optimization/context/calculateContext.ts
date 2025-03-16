import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { ElementToDamage, ElementToResPenType, Stats } from 'lib/constants/constants'
import { calculateCustomTraces } from 'lib/optimization/calculateTraces'
import { emptyLightCone } from 'lib/optimization/optimizerUtils'
import { transformComboState } from 'lib/optimization/rotation/comboStateTransform'
import { StatCalculator } from 'lib/relics/statCalculator'
import DB from 'lib/state/db'
import { generateConditionalResolverMetadata } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { Form, Teammate } from 'types/form'
import { DBMetadata } from 'types/metadata'
import { CharacterMetadata, CharacterStatsBreakdown, OptimizerContext } from 'types/optimizer'

export function generateContext(request: Form): OptimizerContext {
  const context: OptimizerContext = {} as OptimizerContext

  generateEnemyContext(request, context)
  generateBaseStatsContext(request, context)
  generateCharacterMetadataContext(request, context)
  generateCombatBuffsContext(request, context)
  generateFiltersContext(request, context)

  calculateConditionals(request, context)

  return context
}

function generateCombatBuffsContext(request: Form, context: OptimizerContext) {
  context.combatBuffs = {
    ATK: request.combatBuffs.ATK,
    ATK_P: request.combatBuffs.ATK_P,
    HP: request.combatBuffs.HP,
    HP_P: request.combatBuffs.HP_P,
    DEF: request.combatBuffs.DEF,
    DEF_P: request.combatBuffs.DEF_P,
    CR: request.combatBuffs.CR,
    CD: request.combatBuffs.CD,
    SPD: request.combatBuffs.SPD,
    SPD_P: request.combatBuffs.SPD_P,
    BE: request.combatBuffs.BE,
    DMG_BOOST: request.combatBuffs.DMG_BOOST,
    DEF_PEN: request.combatBuffs.DEF_PEN,
    RES_PEN: request.combatBuffs.RES_PEN,
    EFFECT_RES_PEN: request.combatBuffs.EFFECT_RES_PEN,
    VULNERABILITY: request.combatBuffs.VULNERABILITY,
    BREAK_EFFICIENCY: request.combatBuffs.BREAK_EFFICIENCY,
  }
}

function generateFiltersContext(request: Form, context: OptimizerContext) {
  context.resultSort = request.resultSort!
}

function calculateConditionals(request: Form, context: OptimizerContext) {
  context.characterConditionalController = CharacterConditionalsResolver.get(context)
  context.lightConeConditionalController = LightConeConditionalsResolver.get(context)

  transformComboState(request, context)
}

export const ElementToBreakScaling = {
  Physical: 2.0,
  Fire: 2.0,
  Ice: 1.0,
  Lightning: 1.0,
  Wind: 1.5,
  Quantum: 0.5,
  Imaginary: 0.5,
}

function generateCharacterMetadataContext(request: Form, context: Partial<OptimizerContext>) {
  const dbMetadata = DB.getMetadata()
  const characterMetadata = dbMetadata.characters[request.characterId]
  const path = characterMetadata.path
  const element = characterMetadata.element

  context.characterId = request.characterId
  context.characterEidolon = request.characterEidolon
  context.lightCone = request.lightCone
  context.lightConeSuperimposition = request.lightConeSuperimposition
  context.lightConePath = dbMetadata.lightCones[request.lightCone]?.path

  context.path = path
  context.element = element
  context.elementalDamageType = ElementToDamage[element]
  context.elementalResPenType = ElementToResPenType[element]
  context.elementalBreakScaling = ElementToBreakScaling[element]

  context.teammate0Metadata = generateTeammateMetadata(dbMetadata, request.teammate0)!
  context.teammate1Metadata = generateTeammateMetadata(dbMetadata, request.teammate1)!
  context.teammate2Metadata = generateTeammateMetadata(dbMetadata, request.teammate2)!

  context.deprioritizeBuffs = request.deprioritizeBuffs
}

function generateTeammateMetadata(dbMetadata: DBMetadata, teammate: Teammate): CharacterMetadata | null {
  if (!teammate) return null

  return teammate.characterId
    ? generateConditionalResolverMetadata(teammate, dbMetadata)
    : null
}

function generateEnemyContext(request: Form, context: Partial<OptimizerContext>) {
  context.enemyLevel = request.enemyLevel
  context.enemyCount = request.enemyCount
  context.enemyMaxToughness = request.enemyMaxToughness
  context.enemyDamageResistance = request.enemyElementalWeak ? 0 : request.enemyResistance
  context.enemyEffectResistance = request.enemyEffectResistance
  context.enemyElementalWeak = request.enemyElementalWeak
  context.enemyWeaknessBroken = request.enemyWeaknessBroken
  context.weaknessBrokenMultiplier = request.enemyWeaknessBroken ? 1 : 0.9 // TODO: Remove?
}

function generateBaseStatsContext(request: Form, context: Partial<OptimizerContext>) {
  const characterMetadata = DB.getMetadata().characters[request.characterId]
  const characterStats = characterMetadata.stats

  const lightConeMetadata = DB.getMetadata().lightCones[request.lightCone]
  const lightConeStats = lightConeMetadata?.stats || emptyLightCone()
  const lightConeSuperimposition = characterMetadata.path == lightConeMetadata?.path
    ? (lightConeMetadata?.superimpositions[request.lightConeSuperimposition] || {})
    : {}

  const statsBreakdown: CharacterStatsBreakdown = {
    base: {
      ...StatCalculator.getZeroes(),
      ...characterStats,
    },
    traces: {
      ...StatCalculator.getZeroes(),
      ...calculateCustomTraces(characterMetadata),
    },
    lightCone: {
      ...StatCalculator.getZeroes(),
      ...lightConeStats,
      ...lightConeSuperimposition,
    },
  }

  context.characterStatsBreakdown = statsBreakdown

  context.baseHP = sumCharacterBase(Stats.HP, statsBreakdown.base, statsBreakdown.lightCone)
  context.baseATK = sumCharacterBase(Stats.ATK, statsBreakdown.base, statsBreakdown.lightCone)
  context.baseDEF = sumCharacterBase(Stats.DEF, statsBreakdown.base, statsBreakdown.lightCone)
  context.baseSPD = sumCharacterBase(Stats.SPD, statsBreakdown.base, statsBreakdown.lightCone)
  context.baseEnergy = characterMetadata.max_sp
}

function sumCharacterBase(stat: string, base: { [key: string]: number }, lc: { [key: string]: number }) {
  return base[stat] + lc[stat]
}
