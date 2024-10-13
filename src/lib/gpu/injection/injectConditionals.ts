import { Stats } from 'lib/constants'
import { indent } from 'lib/gpu/injection/wgslUtils'
import { Form } from 'types/Form'
import { CharacterConditionals } from 'lib/characterConditionals'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import { ConditionalRegistry } from 'lib/optimizer/calculateConditionals'
import { LightConeConditional } from 'types/LightConeConditionals'
import { CharacterConditional } from 'types/CharacterConditional'
import { injectPrecomputedStatsContext } from 'lib/gpu/injection/injectPrecomputedStats'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'
import { BASIC_TYPE, FUA_TYPE, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'

export function injectConditionals(wgsl: string, request: Form, context: OptimizerContext) {
  const characterConditionals: CharacterConditional = CharacterConditionals.get(request) as CharacterConditional
  const lightConeConditionals: LightConeConditional = LightConeConditionals.get(request) as LightConeConditional

  let conditionalsWgsl = `
switch i {
`
  for (let i = 0; i < context.actions.length; i++) {
    const action = context.actions[i]

    let characterConditionalWgsl = '  // Character conditionals\n'
    let lightConeConditionalWgsl = '  // LightCone conditionals\n'

    if (characterConditionals.gpuFinalizeCalculations) {
      characterConditionalWgsl += indent(characterConditionals.gpuFinalizeCalculations(action, context), 1)
    }
    if (lightConeConditionals.gpuFinalizeCalculations) {
      lightConeConditionalWgsl += indent(lightConeConditionals.gpuFinalizeCalculations(action, context), 1)
    }

    conditionalsWgsl += indent(`
case ${i}: {

${characterConditionalWgsl}
${lightConeConditionalWgsl}
}
`, 1)
  }

  conditionalsWgsl += `
  default: {
  
  }
}
`

  wgsl = wgsl.replace(
    '/* INJECT CHARACTER CONDITIONALS */',
    indent(conditionalsWgsl, 3),
  )


  wgsl += generateDynamicConditionals(request, context)

  // Actions
  const length = context.actions.length

  let actionsDefinition = `
const comboDot: f32 = ${context.comboDot};
const comboBreak: f32 = ${context.comboBreak};
const actions: array<Action, ${length}> = array<Action, ${length}>(`
  for (const action of context.actions) {
    actionsDefinition += `
  Action( // ${action.actionIndex}
    ${getActionTypeToWgslMapping(action.actionType)},
    SetConditionals(
      ${action.setConditionals.enabledHunterOfGlacialForest}, // enabledHunterOfGlacialForest
      ${action.setConditionals.enabledFiresmithOfLavaForging}, // enabledFiresmithOfLavaForging
      ${action.setConditionals.enabledGeniusOfBrilliantStars}, // enabledGeniusOfBrilliantStars
      ${action.setConditionals.enabledBandOfSizzlingThunder}, // enabledBandOfSizzlingThunder
      ${action.setConditionals.enabledMessengerTraversingHackerspace}, // enabledMessengerTraversingHackerspace
      ${action.setConditionals.enabledCelestialDifferentiator}, // enabledCelestialDifferentiator
      ${action.setConditionals.enabledWatchmakerMasterOfDreamMachinations}, // enabledWatchmakerMasterOfDreamMachinations
      ${action.setConditionals.enabledIzumoGenseiAndTakamaDivineRealm}, // enabledIzumoGenseiAndTakamaDivineRealm
      ${action.setConditionals.enabledForgeOfTheKalpagniLantern}, // enabledForgeOfTheKalpagniLantern
      ${action.setConditionals.enabledTheWindSoaringValorous}, // enabledTheWindSoaringValorous
      ${action.setConditionals.enabledTheWondrousBananAmusementPark}, // enabledTheWondrousBananAmusementPark
      ${action.setConditionals.enabledScholarLostInErudition}, // enabledScholarLostInErudition
      ${action.setConditionals.valueChampionOfStreetwiseBoxing}, // valueChampionOfStreetwiseBoxing
      ${action.setConditionals.valueWastelanderOfBanditryDesert}, // valueWastelanderOfBanditryDesert
      ${action.setConditionals.valueLongevousDisciple}, // valueLongevousDisciple
      ${action.setConditionals.valueTheAshblazingGrandDuke}, // valueTheAshblazingGrandDuke
      ${action.setConditionals.valuePrisonerInDeepConfinement}, // valuePrisonerInDeepConfinement
      ${action.setConditionals.valuePioneerDiverOfDeadWaters}, // valuePioneerDiverOfDeadWaters
      ${action.setConditionals.valueSigoniaTheUnclaimedDesolation}, // valueSigoniaTheUnclaimedDesolation
      ${action.setConditionals.valueDuranDynastyOfRunningWolves}, // valueDuranDynastyOfRunningWolves
    ),
    ComputedStats(${injectPrecomputedStatsContext(action)}
    ),
    ConditionalState(
    ),
  ),`
  }

  actionsDefinition += `
);
  `

  wgsl = wgsl.replace('/* INJECT ACTIONS DEFINITION */', actionsDefinition)

  wgsl += `
const actionCount = ${context.actions.length};
`

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

function generateDependencyEvaluator(registeredConditionals: ConditionalRegistry, stat: string, statName: string, request: Form, context: OptimizerContext) {
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
    .map((conditional) => conditional.gpu(request as unknown as OptimizerAction, context)).join('\n') // TODO!!
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

function generateDynamicConditionals(
  request: Form,
  context: OptimizerContext
) {
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

  const registeredConditionals = context.actions[0].conditionalRegistry

  inject(generateDependencyEvaluator(registeredConditionals, Stats.HP, 'HP', request, context))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.ATK, 'ATK', request, context))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.DEF, 'DEF', request, context))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.SPD, 'SPD', request, context))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.CR, 'CR', request, context))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.CD, 'CD', request, context))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.EHR, 'EHR', request, context))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.RES, 'RES', request, context))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.BE, 'BE', request, context))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.OHB, 'OHB', request, context))
  inject(generateDependencyEvaluator(registeredConditionals, Stats.ERR, 'ERR', request, context))

  wgsl += conditionalDefinitionsWgsl
  wgsl += conditionalEvaluators

  wgsl += `
struct ConditionalState {
${indent('actionIndex: i32,', 1)}
${indent(conditionalStateDefinition, 1)}
}
  `

  return wgsl
}

const actionTypeToWgslMapping = {
  'BASIC': BASIC_TYPE,
  'SKILL': SKILL_TYPE,
  'ULT': ULT_TYPE,
  'FUA': FUA_TYPE,
}

function getActionTypeToWgslMapping(actionType: string) {
  return actionTypeToWgslMapping[actionType] ?? 0
}