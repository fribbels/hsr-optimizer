import { CharacterConditionals } from 'lib/characterConditionals'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import { Form } from "types/Form";
import { OptimizerParams } from "lib/optimizer/calculateParams";
import { Stats } from "lib/constants";
import { NewConditional, SetConditionals } from "lib/gpu/conditionals/newConditionals";

export function calculateConditionals(request: Form, params: Partial<OptimizerParams>) {
  let characterConditionals = CharacterConditionals.get(request)
  let lightConeConditionals = LightConeConditionals.get(request)
  if (!request.characterConditionals) {
    request.characterConditionals = characterConditionals.defaults()
  }
  if (!request.lightConeConditionals) {
    request.lightConeConditionals = lightConeConditionals.defaults()
  }

  let precomputedX = characterConditionals.precomputeEffects(request)

  // If the conditionals forced weakness break, keep it. Otherwise use the request's broken status
  precomputedX.ENEMY_WEAKNESS_BROKEN = precomputedX.ENEMY_WEAKNESS_BROKEN || (request.enemyWeaknessBroken ? 1 : 0)

  if (characterConditionals.precomputeMutualEffects) characterConditionals.precomputeMutualEffects(precomputedX, request)

  if (lightConeConditionals) {
    if (lightConeConditionals.precomputeEffects) lightConeConditionals.precomputeEffects(precomputedX, request, params)
    if (lightConeConditionals.precomputeMutualEffects) lightConeConditionals.precomputeMutualEffects(precomputedX, request)
  }

  params.precomputedX = precomputedX

  return precomputedX
}

export function calculateConditionalRegistry(request: Form, params: Partial<OptimizerParams>) {
  const characterConditionals = CharacterConditionals.get(request)
  const lightConeConditionals = LightConeConditionals.get(request)

  const conditionalRegistry: ConditionalRegistry = emptyRegistry()

  registerConditionals(conditionalRegistry, lightConeConditionals.gpuConditionals || [])
  registerConditionals(conditionalRegistry, characterConditionals.gpuConditionals || [])
  registerConditionals(conditionalRegistry, SetConditionals || [])

  params.conditionalRegistry = conditionalRegistry
}

export type ConditionalRegistry = {
  [key: string]: NewConditional[]
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

function registerConditionals(registeredConditionals: { [key: string]: NewConditional[] }, conditionals: NewConditional[]) {
  for (const conditional of conditionals) {
    for (const stat of conditional.statDependencies) {
      registeredConditionals[stat].push(conditional)
    }
  }
}

export function calculatePostPrecomputeConditionals(request: Form, params: OptimizerParams) {
  let characterConditionals = CharacterConditionals.get(request)
  let lightConeConditionals = LightConeConditionals.get(request)

  if (characterConditionals.postPreComputeMutualEffects) characterConditionals.postPreComputeMutualEffects(params.precomputedX, request)

  if (lightConeConditionals) {
    if (lightConeConditionals.postPreComputeMutualEffects) lightConeConditionals.postPreComputeMutualEffects(params.precomputedX, request)
  }
}
