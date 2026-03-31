import type { ConvertibleStatsType } from 'lib/conditionals/evaluation/statConversionConfig'
import { Stats } from 'lib/constants/constants'
import type { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { indent } from 'lib/gpu/injection/wgslUtils'
import type { ConditionalRegistry } from 'lib/optimization/calculateConditionals'
import type {
  Form,
  Teammate,
} from 'types/form'
import type {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

function getRequestTeammateIndex(request: Form, conditional: DynamicConditional): Teammate {
  if (conditional.teammateIndex === 0) return request.teammate0
  if (conditional.teammateIndex === 1) return request.teammate1
  return request.teammate2
}

function generateDependencyEvaluator(
  registeredConditionals: ConditionalRegistry,
  stat: ConvertibleStatsType,
  statName: string,
  request: Form,
  context: OptimizerContext,
) {
  let conditionalDefinitionsWgsl = ''
  let conditionalStateDefinition = ''

  for (const action of context.allActions) {
    conditionalDefinitionsWgsl += registeredConditionals[stat]
      .map((conditional) => {
        if (conditional.teammateIndex == null) {
          return conditional.gpu(action, context)
        } else {
          const requestTeammate = getRequestTeammateIndex(request, conditional)
          const teammate = {
            ...action,
            ...requestTeammate,
            teammateCharacterConditionals: requestTeammate.characterConditionals,
            teammateLightConeConditionals: requestTeammate.lightConeConditionals,
          }
          return conditional.gpu(teammate as unknown as OptimizerAction, context)
        }
      }).join('\n') // TODO!!
    conditionalStateDefinition += registeredConditionals[stat]
      .flatMap((conditional) => {
        return [
          conditional.id,
          ...(conditional.supplementalState ?? []),
        ].map((id) => id + action.actionIdentifier + ': f32,\n')
      }).join('')
  }

  return {
    conditionalDefinitionsWgsl,
    conditionalStateDefinition,
  }
}

export function generateDynamicConditionals(
  request: Form,
  context: OptimizerContext,
) {
  let wgsl = ''

  let conditionalDefinitionsWgsl = '\n'
  let conditionalStateDefinition = '\n'

  function inject(
    conditionalWgsl: {
      conditionalDefinitionsWgsl: string,
      conditionalStateDefinition: string,
    },
  ) {
    conditionalDefinitionsWgsl += conditionalWgsl.conditionalDefinitionsWgsl
    conditionalStateDefinition += conditionalWgsl.conditionalStateDefinition
  }

  const registeredConditionals = context.defaultActions[0].conditionalRegistry

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
  inject(generateDependencyEvaluator(registeredConditionals, Stats.Elation, 'Elation', request, context))

  wgsl += conditionalDefinitionsWgsl

  wgsl += `
struct ConditionalState {
${indent('actionIndex: i32,', 1)}
${indent(conditionalStateDefinition, 1)}
}
  `

  return wgsl
}
