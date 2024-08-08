import { CharacterConditionals } from 'lib/characterConditionals'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import { Form } from "types/Form";
import { OptimizerParams } from "lib/optimizer/calculateParams";

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
}

export function calculatePostPrecomputeConditionals(request, params) {
  let characterConditionals = CharacterConditionals.get(request)
  let lightConeConditionals = LightConeConditionals.get(request)

  if (characterConditionals.postPreComputeMutualEffects) characterConditionals.postPreComputeMutualEffects(params.precomputedX, request)

  if (lightConeConditionals) {
    if (lightConeConditionals.postPreComputeMutualEffects) lightConeConditionals.postPreComputeMutualEffects(params.precomputedX, request)
  }
}
