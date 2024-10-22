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
import { StringToNumberMap } from 'types/Common'
import { SortOption } from 'lib/optimizer/sortOptions'
import { GpuConstants } from 'lib/gpu/webgpuTypes'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'

export function injectConditionals(wgsl: string, request: Form, context: OptimizerContext, gpuParams: GpuConstants) {
  const characterConditionals: CharacterConditional = CharacterConditionals.get(request) as CharacterConditional
  const lightConeConditionals: LightConeConditional = LightConeConditionals.get(request) as LightConeConditional

  // Actions
  const actionLength = context.resultSort == SortOption.COMBO.key ? context.actions.length : 1

  let conditionalsWgsl = `
switch (actionIndex) {
`
  for (let i = 0; i < actionLength; i++) {
    const action = context.actions[i]

    let characterConditionalWgsl = '  // Character conditionals\n'
    let lightConeConditionalWgsl = '  // Light cone conditionals\n'

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
    '/* INJECT ACTION CONDITIONALS */',
    indent(conditionalsWgsl, 3),
  )

  wgsl += generateDynamicConditionals(request, context)

  let actionsDefinition = `
const comboDot: f32 = ${context.comboDot};
const comboBreak: f32 = ${context.comboBreak};
const actions: array<Action, ${actionLength}> = array<Action, ${actionLength}>(`
  for (let i = 0; i < actionLength; i++) {
    const action = context.actions[i]

    actionsDefinition += `
  Action( // ${action.actionIndex}
    ${getActionTypeToWgslMapping(action.actionType)},
    SetConditionals(
      ${action.setConditionals.enabledHunterOfGlacialForest},${gpuParams.DEBUG ? ' // enabledHunterOfGlacialForest' : ''}
      ${action.setConditionals.enabledFiresmithOfLavaForging},${gpuParams.DEBUG ? ' // enabledFiresmithOfLavaForging' : ''}
      ${action.setConditionals.enabledGeniusOfBrilliantStars},${gpuParams.DEBUG ? ' // enabledGeniusOfBrilliantStars' : ''}
      ${action.setConditionals.enabledBandOfSizzlingThunder},${gpuParams.DEBUG ? ' // enabledBandOfSizzlingThunder' : ''}
      ${action.setConditionals.enabledMessengerTraversingHackerspace},${gpuParams.DEBUG ? ' // enabledMessengerTraversingHackerspace' : ''}
      ${action.setConditionals.enabledCelestialDifferentiator},${gpuParams.DEBUG ? ' // enabledCelestialDifferentiator' : ''}
      ${action.setConditionals.enabledWatchmakerMasterOfDreamMachinations},${gpuParams.DEBUG ? ' // enabledWatchmakerMasterOfDreamMachinations' : ''}
      ${action.setConditionals.enabledIzumoGenseiAndTakamaDivineRealm},${gpuParams.DEBUG ? ' // enabledIzumoGenseiAndTakamaDivineRealm' : ''}
      ${action.setConditionals.enabledForgeOfTheKalpagniLantern},${gpuParams.DEBUG ? ' // enabledForgeOfTheKalpagniLantern' : ''}
      ${action.setConditionals.enabledTheWindSoaringValorous},${gpuParams.DEBUG ? ' // enabledTheWindSoaringValorous' : ''}
      ${action.setConditionals.enabledTheWondrousBananAmusementPark},${gpuParams.DEBUG ? ' // enabledTheWondrousBananAmusementPark' : ''}
      ${action.setConditionals.enabledScholarLostInErudition},${gpuParams.DEBUG ? ' // enabledScholarLostInErudition' : ''}
      ${action.setConditionals.valueChampionOfStreetwiseBoxing},${gpuParams.DEBUG ? ' // valueChampionOfStreetwiseBoxing' : ''}
      ${action.setConditionals.valueWastelanderOfBanditryDesert},${gpuParams.DEBUG ? ' // valueWastelanderOfBanditryDesert' : ''}
      ${action.setConditionals.valueLongevousDisciple},${gpuParams.DEBUG ? ' // valueLongevousDisciple' : ''}
      ${action.setConditionals.valueTheAshblazingGrandDuke},${gpuParams.DEBUG ? ' // valueTheAshblazingGrandDuke' : ''}
      ${action.setConditionals.valuePrisonerInDeepConfinement},${gpuParams.DEBUG ? ' // valuePrisonerInDeepConfinement' : ''}
      ${action.setConditionals.valuePioneerDiverOfDeadWaters},${gpuParams.DEBUG ? ' // valuePioneerDiverOfDeadWaters' : ''}
      ${action.setConditionals.valueSigoniaTheUnclaimedDesolation},${gpuParams.DEBUG ? ' // valueSigoniaTheUnclaimedDesolation' : ''}
      ${action.setConditionals.valueDuranDynastyOfRunningWolves},${gpuParams.DEBUG ? ' // valueDuranDynastyOfRunningWolves' : ''}
      ${action.setConditionals.valueSacerdosRelivedOrdeal},${gpuParams.DEBUG ? ' // valueSacerdosRelivedOrdeal' : ''}
    ),
    ComputedStats(${injectPrecomputedStatsContext(action, gpuParams)}
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
const actionCount = ${actionLength};
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

function getRequestTeammateIndex(request: Form, conditional: DynamicConditional) {
  if (conditional.teammateIndex == 0) return request.teammate0
  else if (conditional.teammateIndex == 1) return request.teammate1
  else return request.teammate2
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
    .map((conditional) => {
      if (conditional.teammateIndex == null) {
        return conditional.gpu(request as unknown as OptimizerAction, context)
      } else {
        const teammate = getRequestTeammateIndex(request, conditional)
        return conditional.gpu(teammate as unknown as OptimizerAction, context)
      }
    }).join('\n') // TODO!!
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
  context: OptimizerContext,
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

const actionTypeToWgslMapping: StringToNumberMap = {
  BASIC: BASIC_TYPE,
  SKILL: SKILL_TYPE,
  ULT: ULT_TYPE,
  FUA: FUA_TYPE,
}

function getActionTypeToWgslMapping(actionType: string) {
  return actionTypeToWgslMapping[actionType] ?? 0
}
