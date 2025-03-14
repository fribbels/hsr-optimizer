import { ConvertibleStatsType, statConversionConfig } from 'lib/conditionals/evaluation/statConversionConfig'
import { conditionalWgslWrapper, DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { BuffSource } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

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

  return conditionalWgslWrapper(conditional, `
if (!(${activeConditionWgsl})) {
  return;
}

let stateValue: f32 = (*p_state).${conditional.id};
let convertibleValue: f32 = x.${statConfig.property} - x.${statConfig.unconvertibleProperty};

if (!(${thresholdConditionWgsl}) || convertibleValue <= 0) {
  return;
}

let buffFull = max(0, ${buffWgsl});
let buffDelta = buffFull - stateValue;

(*p_state).${conditional.id} += buffDelta;

(*p_x).${destConfig.unconvertibleProperty} += buffDelta;
(*p_x).${destConfig.property} += buffDelta;
`,
  )
}
