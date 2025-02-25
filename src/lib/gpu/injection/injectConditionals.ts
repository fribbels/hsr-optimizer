import {
  BASIC_ABILITY_TYPE,
  FUA_ABILITY_TYPE,
  MEMO_SKILL_ABILITY_TYPE,
  MEMO_TALENT_ABILITY_TYPE,
  SKILL_ABILITY_TYPE,
  ULT_ABILITY_TYPE,
} from 'lib/conditionals/conditionalConstants'
import { evaluateDependencyOrder } from 'lib/conditionals/evaluation/dependencyEvaluator'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { Stats } from 'lib/constants/constants'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { injectPrecomputedStatsContext } from 'lib/gpu/injection/injectPrecomputedStats'
import { indent } from 'lib/gpu/injection/wgslUtils'
import { GpuConstants } from 'lib/gpu/webgpuTypes'
import { ConditionalRegistry } from 'lib/optimization/calculateConditionals'
import { SortOption } from 'lib/optimization/sortOptions'
import { StringToNumberMap } from 'types/common'
import { CharacterConditionalsController, LightConeConditionalsController } from 'types/conditionals'
import { Form, Teammate } from 'types/form'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export function injectConditionals(wgsl: string, request: Form, context: OptimizerContext, gpuParams: GpuConstants) {
  const characterConditionals: CharacterConditionalsController = CharacterConditionalsResolver.get(request)
  const lightConeConditionals: LightConeConditionalsController = LightConeConditionalsResolver.get(request)

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

  // Basic conditionals

  let basicConditionalsWgsl = ``
  if (characterConditionals.gpuCalculateBasicEffects) {
    basicConditionalsWgsl += indent(characterConditionals.gpuCalculateBasicEffects(context.actions[0], context), 1)
  }
  if (lightConeConditionals.gpuCalculateBasicEffects) {
    basicConditionalsWgsl += indent(lightConeConditionals.gpuCalculateBasicEffects(context.actions[0], context), 1)
  }
  wgsl = wgsl.replace(
    '/* INJECT BASIC CONDITIONALS */',
    indent(basicConditionalsWgsl, 2),
  )

  // Combat conditionals

  const { conditionalSequence, terminalConditionals } = evaluateDependencyOrder(context.actions[0].conditionalRegistry)
  let conditionalSequenceWgsl = '\n'
  conditionalSequenceWgsl += conditionalSequence.map(generateConditionalExecution).map((wgsl) => indent(wgsl, 3)).join('\n') + '\n'

  conditionalSequenceWgsl += '\n'
  conditionalSequenceWgsl += terminalConditionals.map(generateConditionalExecution).map((wgsl) => indent(wgsl, 3)).join('\n') + '\n'

  wgsl = wgsl.replace(
    '/* INJECT COMBAT CONDITIONALS */',
    conditionalSequenceWgsl,
  )

  // Dynamic conditionals

  wgsl += generateDynamicConditionals(request, context)

  let actionsDefinition = `
const comboDot: f32 = ${context.comboDot};
const comboBreak: f32 = ${context.comboBreak};
`
  for (let i = 0; i < actionLength; i++) {
    const action = context.actions[i]

    actionsDefinition += `
  const action${i} = Action( // ${action.actionIndex}
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
      ${action.setConditionals.enabledHeroOfTriumphantSong},${gpuParams.DEBUG ? ' // enabledHeroOfTriumphantSong' : ''}
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
  );`
  }
  for (let i = 0; i < actionLength; i++) {
    const action = context.actions[i]

    actionsDefinition += `
  const computedStatsX${i} = ComputedStats(${injectPrecomputedStatsContext(action.precomputedX, gpuParams)}
    );`
  }
  for (let i = 0; i < actionLength; i++) {
    const action = context.actions[i]

    actionsDefinition += `
  const computedStatsM${i} = ComputedStats(${injectPrecomputedStatsContext(action.precomputedM, gpuParams)}
    );`
  }

  wgsl = wgsl.replace('/* INJECT ACTIONS DEFINITION */', actionsDefinition)

  wgsl += `
const actionCount = ${actionLength};
`

  return wgsl
}

function generateConditionalExecution(conditional: DynamicConditional) {
  return `evaluate${conditional.id}(p_x, p_m, p_sets, p_state);`
}

function getRequestTeammateIndex(request: Form, conditional: DynamicConditional) {
  let teammate: Teammate
  if (conditional.teammateIndex == 0) teammate = request.teammate0
  else if (conditional.teammateIndex == 1) teammate = request.teammate1
  else teammate = request.teammate2

  // @ts-ignore
  teammate.teammateCharacterConditionals = teammate.characterConditionals
  // @ts-ignore
  teammate.teammateLightConeConditionals = teammate.lightConeConditionals

  return teammate
}

function generateDependencyEvaluator(registeredConditionals: ConditionalRegistry, stat: string, statName: string, request: Form, context: OptimizerContext) {
  const conditionalEvaluators = ''
  let conditionalDefinitionsWgsl = ''
  let conditionalStateDefinition = ''

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
    .flatMap((conditional) => {
      return [
        conditional.id,
        ...(conditional.supplementalState ?? []),
      ].map((id) => id + ': f32,\n')
    }).join('')

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
  BASIC: BASIC_ABILITY_TYPE,
  SKILL: SKILL_ABILITY_TYPE,
  ULT: ULT_ABILITY_TYPE,
  FUA: FUA_ABILITY_TYPE,
  MEMO_SKILL: MEMO_SKILL_ABILITY_TYPE,
  MEMO_TALENT: MEMO_TALENT_ABILITY_TYPE,
}

function getActionTypeToWgslMapping(actionType: string) {
  return actionTypeToWgslMapping[actionType] ?? 0
}
