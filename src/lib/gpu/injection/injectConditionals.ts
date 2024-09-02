import { Stats } from 'lib/constants'
import { indent } from 'lib/gpu/injection/wgslUtils'
import { Form } from 'types/Form'
import { CharacterConditionals } from 'lib/characterConditionals'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import { OptimizerParams } from 'lib/optimizer/calculateParams'
import { ConditionalRegistry } from 'lib/optimizer/calculateConditionals'
import { LightConeConditional } from 'types/LightConeConditionals'
import { CharacterConditional } from 'types/CharacterConditional'

export function injectConditionals(wgsl: string, request: Form, params: OptimizerParams) {
  const characterConditionals: CharacterConditional = CharacterConditionals.get(request) as CharacterConditional
  const lightConeConditionals: LightConeConditional = LightConeConditionals.get(request) as LightConeConditional

  const conditionalRegistry = params.conditionalRegistry

  if (lightConeConditionals.gpuFinalizeCalculations) wgsl = wgsl.replace(
    '/* INJECT LIGHT CONE CONDITIONALS */',
    indent(lightConeConditionals.gpuFinalizeCalculations(request, params), 2),
  )

  if (characterConditionals.gpuFinalizeCalculations) wgsl = wgsl.replace(
    '/* INJECT CHARACTER CONDITIONALS */',
    indent(characterConditionals.gpuFinalizeCalculations(request, params), 2),
  )

  wgsl += generateDynamicSetConditionals(conditionalRegistry, request, params)

  return wgsl
}

function generateDependencyCall(conditionalName: string) {
  return `evaluate${conditionalName}(p_x, p_state);`
}

function generateConditionalEvaluator(statName: string, conditionalCallsWgsl: string) {
  return `
fn evaluateDependencies${statName}(p_x: ptr<function, ComputedStats>, p_state: ptr<function, ConditionalState>) {
${indent(conditionalCallsWgsl, 1)}
}
  `
}

function generateConditionalNonRatioEvaluator(statName: string, conditionalCallsWgsl: string) {
  return `
fn evaluateNonRatioDependencies${statName}(p_x: ptr<function, ComputedStats>, p_state: ptr<function, ConditionalState>) {
${indent(conditionalCallsWgsl, 1)}
}
  `
}

function generateDependencyEvaluator(registeredConditionals: ConditionalRegistry, stat: string, statName: string, request: Form, params: OptimizerParams) {
  let conditionalEvaluators = ''
  let conditionalDefinitionsWgsl = ''
  let conditionalCallsWgsl = ''
  let conditionalNonRatioCallsWgsl = ''
  let conditionalStateDefinition = ''

  conditionalCallsWgsl += registeredConditionals[stat]
    .map((conditional) => generateDependencyCall(conditional.id)).join('\n')
  conditionalNonRatioCallsWgsl += registeredConditionals[stat]
    .filter((x) => !x.ratioConversion)
    .map((conditional) => generateDependencyCall(conditional.id)).join('\n')
  conditionalDefinitionsWgsl += registeredConditionals[stat]
    .map((conditional) => conditional.gpu(request, params)).join('\n')
  conditionalStateDefinition += registeredConditionals[stat]
    .map((x) => x.id + ': f32,\n').join('')
  conditionalEvaluators += generateConditionalEvaluator(statName, conditionalCallsWgsl)
  conditionalEvaluators += generateConditionalNonRatioEvaluator(statName, conditionalNonRatioCallsWgsl)

  return {
    conditionalEvaluators,
    conditionalDefinitionsWgsl,
    conditionalStateDefinition,
  }
}

function generateDynamicSetConditionals(registeredConditionals: ConditionalRegistry, request: Form, params: OptimizerParams) {
  let wgsl = ''

  let conditionalEvaluators = '\n'
  let conditionalDefinitionsWgsl = '\n'
  let conditionalStateDefinition = '\n'

  function inject(
    conditionalWgsl: {
      conditionalEvaluators: string
      conditionalDefinitionsWgsl: string
      conditionalStateDefinition: string
    },
  ) {
    conditionalEvaluators += conditionalWgsl.conditionalEvaluators
    conditionalDefinitionsWgsl += conditionalWgsl.conditionalDefinitionsWgsl
    conditionalStateDefinition += conditionalWgsl.conditionalStateDefinition
  }

  inject(generateDependencyEvaluator(registeredConditionals, Stats.HP, 'HP', request, params))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.ATK, 'ATK', request, params))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.DEF, 'DEF', request, params))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.SPD, 'SPD', request, params))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.CR, 'CR', request, params))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.CD, 'CD', request, params))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.EHR, 'EHR', request, params))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.RES, 'RES', request, params))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.BE, 'BE', request, params))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.OHB, 'OHB', request, params))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.ERR, 'ERR', request, params))

  wgsl += conditionalDefinitionsWgsl
  wgsl += conditionalEvaluators

  wgsl += `
struct ConditionalState {
${indent(conditionalStateDefinition, 1)}
}
  `

  return wgsl
}
