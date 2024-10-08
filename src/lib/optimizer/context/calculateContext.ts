import { Form } from 'types/Form'
import { CharacterStatsBreakdown, OptimizerContext } from 'types/Optimizer'
import DB from 'lib/db'
import { emptyLightCone } from 'lib/optimizer/optimizerUtils'
import { ElementToDamage, ElementToResPenType, Stats } from 'lib/constants'
import { CharacterStats } from 'lib/characterStats'
import { transformComboState } from 'lib/optimizer/rotation/comboStateTransform'

export function generateContext(request: Form): OptimizerContext {
  const context: OptimizerContext = {} as OptimizerContext

  generateEnemyContext(request, context)
  generateBaseStatsContext(request, context)
  generateCharacterMetadataContext(request, context)

  calculateConditionals(request, context)

  return context as OptimizerContext
}

function calculateConditionals(request: Form, context: OptimizerContext) {
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
  const characterMetadata = DB.getMetadata().characters[request.characterId]
  const element = characterMetadata.element

  context.characterId = request.characterId
  context.characterEidolon = request.characterEidolon
  context.lightCone = request.lightCone
  context.lightConeSuperimposition = request.lightConeSuperimposition

  context.element = element
  context.elementalDamageType = ElementToDamage[element]
  context.elementalResPenType = ElementToResPenType[element]
  context.elementalBreakScaling = ElementToBreakScaling[element]
}

function generateEnemyContext(request: Form, context: Partial<OptimizerContext>) {
  context.enemyLevel = request.enemyLevel
  context.enemyCount = request.enemyCount
  context.enemyMaxToughness = request.enemyMaxToughness
  context.enemyDamageResistance = request.enemyElementalWeak ? 0 : request.enemyResistance
  context.enemyEffectResistance = request.enemyEffectResistance
  context.enemyElementalWeak = request.enemyElementalWeak
  context.enemyWeaknessBroken = request.enemyElementalWeak
  context.weaknessBrokenMultiplier = request.enemyWeaknessBroken ? 1 : 0.9 // TODO: Remove?
}

function generateBaseStatsContext(request: Form, context: Partial<OptimizerContext>) {
  const lightConeMetadata = DB.getMetadata().lightCones[request.lightCone]
  const lightConeStats = lightConeMetadata?.stats || emptyLightCone()
  const lightConeSuperimposition = lightConeMetadata?.superimpositions[request.lightConeSuperimposition] || {}

  const characterMetadata = DB.getMetadata().characters[request.characterId]
  const characterStats = characterMetadata.stats

  context.element = characterMetadata.element

  const statsBreakdown: CharacterStatsBreakdown = {
    base: {
      ...CharacterStats.getZeroes(),
      ...characterStats,
    },
    traces: {
      ...CharacterStats.getZeroes(),
      ...characterMetadata.traces,
    },
    lightCone: {
      ...CharacterStats.getZeroes(),
      ...lightConeStats,
      ...lightConeSuperimposition,
    },
  }

  context.characterStatsBreakdown = statsBreakdown

  context.baseHP = sumCharacterBase(Stats.HP, statsBreakdown.base, statsBreakdown.lightCone)
  context.baseATK = sumCharacterBase(Stats.ATK, statsBreakdown.base, statsBreakdown.lightCone)
  context.baseDEF = sumCharacterBase(Stats.DEF, statsBreakdown.base, statsBreakdown.lightCone)
  context.baseSPD = sumCharacterBase(Stats.SPD, statsBreakdown.base, statsBreakdown.lightCone)
}

function sumCharacterBase(stat: string, base: { [key: string]: number }, lc: { [key: string]: number }) {
  return base[stat] + lc[stat]
}
