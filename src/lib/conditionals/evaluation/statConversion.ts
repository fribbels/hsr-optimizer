import {
  ConvertibleStatsType,
  statConversionConfig,
} from 'lib/conditionals/evaluation/statConversionConfig'
import {
  DynamicConditional,
  newConditionalWgslWrapper,
} from 'lib/gpu/conditionals/dynamicConditionals'
import {
  containerActionVal,
  p_containerActionVal,
} from 'lib/gpu/injection/injectUtils'
import { BuffSource } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export function dynamicStatConversion(
  sourceStat: ConvertibleStatsType,
  destinationStat: ConvertibleStatsType,
  conditional: DynamicConditional,
  x: ComputedStatsArray,
  action: OptimizerAction,
  context: OptimizerContext,
  source: BuffSource,
  buffFn: (convertibleValue: number) => number,
) {
  const statConfig = statConversionConfig[sourceStat]
  const destConfig = statConversionConfig[destinationStat]

  const statValue = x.a[statConfig.key]
  const unconvertibleValue = x.a[statConfig.unconvertibleKey] ?? 0

  const stateValue = action.conditionalState[conditional.id] ?? 0
  const convertibleValue = statValue - unconvertibleValue

  if (convertibleValue <= 0) return

  const buffFull = Math.max(0, buffFn(convertibleValue))
  const buffDelta = buffFull - stateValue

  action.conditionalState[conditional.id] = buffFull

  x[destConfig.unconvertibleProperty]?.buff(buffDelta, source)
  x[destConfig.property].buffDynamic(buffDelta, source, action, context)
}

export function dynamicStatConversionContainer(
  sourceStat: ConvertibleStatsType,
  destinationStat: ConvertibleStatsType,
  conditional: DynamicConditional,
  x: ComputedStatsContainer,
  action: OptimizerAction,
  context: OptimizerContext,
  source: BuffSource,
  buffFn: (convertibleValue: number) => number,
) {
  const statConfig = statConversionConfig[sourceStat]
  const destConfig = statConversionConfig[destinationStat]

  const statValue = x.getActionValueByIndex(statConfig.key, SELF_ENTITY_INDEX)
  const unconvertibleValue = x.getActionValueByIndex(statConfig.unconvertibleKey, SELF_ENTITY_INDEX)

  const stateValue = action.conditionalState[conditional.id] ?? 0
  const convertibleValue = statValue - unconvertibleValue

  if (convertibleValue <= 0) return

  const buffFull = Math.max(0, buffFn(convertibleValue))
  const buffDelta = buffFull - stateValue

  action.conditionalState[conditional.id] = buffFull

  x.buffDynamic(statConfig.unconvertibleKey, buffDelta, action, context, x.source(source))
  x.buffDynamic(destConfig.key, buffDelta, action, context, x.source(source))
}

export function gpuDynamicStatConversion(
  sourceStat: ConvertibleStatsType,
  destinationStat: ConvertibleStatsType,
  conditional: DynamicConditional,
  action: OptimizerAction,
  context: OptimizerContext,
  buffWgsl: string,
  activeConditionWgsl: string,
  thresholdConditionWgsl: string = 'true',
) {
  const statConfig = statConversionConfig[sourceStat]
  const destConfig = statConversionConfig[destinationStat]
  const config = action.config

  const sourceVal = containerActionVal(SELF_ENTITY_INDEX, statConfig.key, config)
  const sourceUnconvertibleVal = containerActionVal(SELF_ENTITY_INDEX, statConfig.unconvertibleKey, config)
  const destVal = p_containerActionVal(SELF_ENTITY_INDEX, destConfig.key, config)
  const destUnconvertibleVal = p_containerActionVal(SELF_ENTITY_INDEX, destConfig.unconvertibleKey, config)

  return newConditionalWgslWrapper(
    conditional,
    action,
    context,
    `
if (!(${activeConditionWgsl})) {
  return;
}

let stateValue: f32 = (*p_state).${conditional.id}${action.actionIdentifier};
let convertibleValue: f32 = ${sourceVal} - ${sourceUnconvertibleVal};

if (!(${thresholdConditionWgsl}) || convertibleValue <= 0) {
  return;
}

let buffFull = max(0, ${buffWgsl});
let buffDelta = buffFull - stateValue;

(*p_state).${conditional.id}${action.actionIdentifier} += buffDelta;

${destUnconvertibleVal} += buffDelta;
${destVal} += buffDelta;
`,
  )
}
