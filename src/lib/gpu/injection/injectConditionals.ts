import { Stats } from "lib/constants";
import { indent } from "lib/gpu/injection/wgslUtils";
import { Form } from "types/Form";
import { CharacterConditionals } from "lib/characterConditionals";
import { LightConeConditionals } from "lib/lightConeConditionals";
import { OptimizerParams } from "lib/optimizer/calculateParams";
import { ConditionalRegistry } from "lib/optimizer/calculateConditionals";


export function injectConditionals(wgsl: string, request: Form, params: OptimizerParams) {
  const characterConditionals = CharacterConditionals.get(request)
  const lightConeConditionals = LightConeConditionals.get(request)

  const conditionalRegistry = params.conditionalRegistry

  if (lightConeConditionals.gpu) wgsl = wgsl.replace('/* INJECT LIGHT CONE CONDITIONALS */', indent(lightConeConditionals.gpu(request, params), 1))
  if (characterConditionals.gpu) wgsl = wgsl.replace('/* INJECT CHARACTER CONDITIONALS */', indent(characterConditionals.gpu(request, params), 1))

  wgsl += generateDynamicSetConditionals(conditionalRegistry)

  return wgsl
}

function generateDependencyCall(conditionalName: string) {
  return `evaluate${conditionalName}(p_x, p_state, p_sets);`
}

function generateConditionalEvaluator(statName: string, conditionalCallsWgsl: string) {
  return `
fn evaluateDependencies${statName}(p_x: ptr<function, ComputedStats>, p_state: ptr<function, ConditionalState>, p_sets: ptr<function, Sets>) {
${indent(conditionalCallsWgsl, 1)}
}
  `
}

function generateDependencyEvaluator(registeredConditionals: ConditionalRegistry, stat: string, statName: string) {
  let conditionalEvaluators = ''
  let conditionalDefinitionsWgsl = ''
  let conditionalCallsWgsl = ''
  let conditionalStateDefinition = ''

  conditionalCallsWgsl += registeredConditionals[stat].map(conditional => generateDependencyCall(conditional.id)).join('\n')
  conditionalDefinitionsWgsl += registeredConditionals[stat].map(conditional => conditional.gpu()).join('\n')
  conditionalEvaluators += generateConditionalEvaluator(statName, conditionalCallsWgsl)
  conditionalStateDefinition += registeredConditionals[stat].map(x => x.id + ': f32,\n').join('')

  return {
    conditionalEvaluators,
    conditionalDefinitionsWgsl,
    conditionalCallsWgsl,
    conditionalStateDefinition,
  }
}

function generateDynamicSetConditionals(registeredConditionals: ConditionalRegistry) {
  let wgsl = ''

  let conditionalEvaluators = '\n'
  let conditionalDefinitionsWgsl = '\n'
  let conditionalCallsWgsl = '\n'
  let conditionalStateDefinition = '\n'

  function inject(
    conditionalWgsl: {
      conditionalEvaluators: string,
      conditionalDefinitionsWgsl: string,
      conditionalCallsWgsl: string,
      conditionalStateDefinition: string
    }
  ) {
    conditionalEvaluators += conditionalWgsl.conditionalEvaluators
    conditionalDefinitionsWgsl += conditionalWgsl.conditionalDefinitionsWgsl
    conditionalCallsWgsl += conditionalWgsl.conditionalCallsWgsl
    conditionalStateDefinition += conditionalWgsl.conditionalStateDefinition
  }

  inject(generateDependencyEvaluator(registeredConditionals, Stats.HP, 'HP'))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.ATK, 'ATK'))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.DEF, 'DEF'))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.SPD, 'SPD'))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.CR, 'CR'))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.CD, 'CD'))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.EHR, 'EHR'))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.RES, 'RES'))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.BE, 'BE'))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.OHB, 'OHB'))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.ERR, 'ERR'))

  wgsl += conditionalDefinitionsWgsl
  wgsl += conditionalEvaluators

  wgsl += `
struct ConditionalState {
${indent(conditionalStateDefinition, 1)}
}
  `

  return wgsl
}