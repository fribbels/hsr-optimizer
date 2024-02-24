import { CharacterConditionals } from 'lib/characterConditionals'
import { LightConeConditionals } from 'lib/lightConeConditionals'

export function generateConditionals(request, params) {
  let characterConditionals = CharacterConditionals.get(request)
  let lightConeConditionals = LightConeConditionals.get(request)

  let precomputedX = characterConditionals.precomputeEffects(request)
  if (characterConditionals.precomputeMutualEffects) characterConditionals.precomputeMutualEffects(precomputedX, request)

  lightConeConditionals.precomputeEffects(precomputedX, request)
  if (lightConeConditionals.precomputeMutualEffects) lightConeConditionals.precomputeMutualEffects(precomputedX, request)

  params.precomputedX = precomputedX
  params.characterConditionals = characterConditionals
  params.lightConeConditionals = lightConeConditionals
}
