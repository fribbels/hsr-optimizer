import { CharacterConditionals } from 'lib/characterConditionals'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import { Form } from 'types/Form'
import { OptimizerParams } from 'lib/optimizer/calculateParams'
import { Stats } from 'lib/constants'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { ConditionalSets } from 'lib/gpu/conditionals/setConditionals'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { CharacterConditional } from 'types/CharacterConditional'
import { LightConeConditional } from 'types/LightConeConditionals'

export function calculateConditionals(request: Form, params: Partial<OptimizerParams>) {
  const characterConditionals: CharacterConditional = CharacterConditionals.get(request)
  const lightConeConditionals: LightConeConditional = LightConeConditionals.get(request)
  if (!request.characterConditionals) {
    request.characterConditionals = characterConditionals.defaults()
  }
  if (!request.lightConeConditionals) {
    request.lightConeConditionals = lightConeConditionals.defaults()
  }

  const x: ComputedStatsObject = Object.assign({}, baseComputedStatsObject)

  // Configuration stage
  lightConeConditionals.initializeConfigurations?.(x, request)
  characterConditionals.initializeConfigurations?.(x, request)

  const teammates = [
    request.teammate0,
    request.teammate1,
    request.teammate2,
  ].filter((x) => !!x && !!x.characterId)
  for (let i = 0; i < teammates.length; i++) {
    const teammateRequest = Object.assign({}, request, teammates[i])

    const teammateCharacterConditionals = CharacterConditionals.get(teammateRequest) as CharacterConditional
    const teammateLightConeConditionals = LightConeConditionals.get(teammateRequest) as LightConeConditional

    teammateCharacterConditionals.initializeTeammateConfigurations?.(x, teammateRequest)
    teammateLightConeConditionals.initializeTeammateConfigurations?.(x, teammateRequest)
  }

  // Precompute stage
  lightConeConditionals.precomputeEffects?.(x, request)
  characterConditionals.precomputeEffects?.(x, request)

  // Precompute mutual stage
  lightConeConditionals.precomputeMutualEffects?.(x, request)
  characterConditionals.precomputeMutualEffects?.(x, request)

  // If the conditionals forced weakness break, keep it. Otherwise use the request's broken status
  x.ENEMY_WEAKNESS_BROKEN = x.ENEMY_WEAKNESS_BROKEN || (request.enemyWeaknessBroken ? 1 : 0)

  params.precomputedX = x

  return x
}

export function calculateConditionalRegistry(request: Form, params: Partial<OptimizerParams>) {
  const characterConditionals: CharacterConditional = CharacterConditionals.get(request)
  const lightConeConditionals: LightConeConditional = LightConeConditionals.get(request)

  const conditionalRegistry: ConditionalRegistry = emptyRegistry()

  registerConditionals(conditionalRegistry, lightConeConditionals.dynamicConditionals ?? [])
  registerConditionals(conditionalRegistry, characterConditionals.dynamicConditionals ?? [])
  registerConditionals(conditionalRegistry, ConditionalSets || [])

  params.conditionalRegistry = conditionalRegistry
  params.conditionalState = {}
}

export type ConditionalRegistry = {
  [key: string]: DynamicConditional[]
}

function emptyRegistry() {
  return {
    [Stats.HP]: [],
    [Stats.ATK]: [],
    [Stats.DEF]: [],
    [Stats.SPD]: [],
    [Stats.CR]: [],
    [Stats.CD]: [],
    [Stats.EHR]: [],
    [Stats.RES]: [],
    [Stats.BE]: [],
    [Stats.OHB]: [],
    [Stats.ERR]: [],
  }
}

function registerConditionals(registeredConditionals: { [key: string]: DynamicConditional[] }, conditionals: DynamicConditional[]) {
  for (const conditional of conditionals) {
    for (const stat of conditional.dependsOn) {
      registeredConditionals[stat].push(conditional)
    }
  }
}
