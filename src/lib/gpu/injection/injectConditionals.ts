import { NewConditional, SetConditionals } from "lib/gpu/conditionals/newConditionals";
import { Stats } from "lib/constants";
import { indent } from "lib/gpu/injection/wgslUtils";
import { Form } from "types/Form";
import { CharacterConditionals } from "lib/characterConditionals";
import { LightConeConditionals } from "lib/lightConeConditionals";

type ConditionalRegistry = {
  [key: string]: NewConditional[]
}

export function injectConditionals(wgsl: string, request: Form) {
  const characterConditionals = CharacterConditionals.get(request)
  const lightConeConditionals = LightConeConditionals.get(request)

  const conditionalRegistry: ConditionalRegistry = {
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

  for (const conditional of SetConditionals) {
    for (const stat of conditional.statDependencies) {
      conditionalRegistry[stat].push(conditional)
    }
  }

  if (lightConeConditionals.gpu) wgsl = wgsl.replace('/* INJECT LIGHT CONE CONDITIONALS */', lightConeConditionals.gpu())
  if (characterConditionals.gpu) wgsl = wgsl.replace('/* INJECT CHARACTER CONDITIONALS */', characterConditionals.gpu())

  registerConditionals(conditionalRegistry, lightConeConditionals.gpuConditionals || [])
  registerConditionals(conditionalRegistry, characterConditionals.gpuConditionals || [])
  registerConditionals(conditionalRegistry, SetConditionals || [])

  for (const [stat, conditionals] of Object.entries(conditionalRegistry)) {
    for (const conditional of conditionals) {
      wgsl += conditional.gpu()
    }
  }

  generateDynamicSetConditionals(conditionalRegistry, wgsl)

  // wgsl += lightConeConditionals.gpuConditionals().map(x => x.gpu()).join('\n')
  // if (characterConditionals.gpuConditionals) wgsl += characterConditionals.gpuConditionals().map(x => x.gpu()).join('\n')

  return wgsl
}

function registerConditionals(registeredConditionals: ConditionalRegistry, conditionals: NewConditional[]) {
  for (const conditional of conditionals) {
    for (const stat of conditional.statDependencies) {
      registeredConditionals[stat].push(conditional)
    }
  }
}

function generateDependencyCall(conditionalName: string) {
  return `evaluate${conditionalName}(p_x, p_state);`
}

function generateConditionalEvaluator(statName: string, conditionalCallsWgsl: string) {
  return `
fn evaluateDependencies${statName}(p_x: ptr<function, ComputedStats>, p_state: ptr<function, ConditionalState>) {
${indent(conditionalCallsWgsl, 2)}
}
  `
}

function generateDependencyEvaluator(registeredConditionals: ConditionalRegistry, stat: string, statName: string) {
  let conditionalEvaluators = ''
  let conditionalDefinitionsWgsl = ''
  let conditionalCallsWgsl = ''

  conditionalCallsWgsl += registeredConditionals[stat].map(conditional => generateDependencyCall(conditional.id)).join('\n')
  conditionalDefinitionsWgsl += registeredConditionals[stat].map(conditional => conditional.gpu()).join('\n')
  conditionalEvaluators += generateConditionalEvaluator(statName, conditionalCallsWgsl)

  return {
    conditionalEvaluators,
    conditionalDefinitionsWgsl,
    conditionalCallsWgsl,
  }
}

function generateDynamicSetConditionals(registeredConditionals: ConditionalRegistry, wgsl: string) {
  let conditionalEvaluators = '\n'
  let conditionalDefinitionsWgsl = '\n'
  let conditionalCallsWgsl = '\n'

  function inject(conditionalWgsl: { conditionalEvaluators: string, conditionalDefinitionsWgsl: string, conditionalCallsWgsl: string }) {
    conditionalEvaluators += conditionalWgsl.conditionalEvaluators
    conditionalDefinitionsWgsl += conditionalWgsl.conditionalDefinitionsWgsl
    conditionalCallsWgsl += conditionalWgsl.conditionalCallsWgsl
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

  return wgsl
}