import { ConvertibleStatsType, statConversionConfig } from 'lib/conditionals/evaluation/statConversionConfig'
import { conditionalWgslWrapper, DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export function dynamicStatConversion(
  sourceStat: ConvertibleStatsType,
  destinationStat: ConvertibleStatsType,
  conditional: DynamicConditional,
  x: ComputedStatsArray,
  action: OptimizerAction,
  context: OptimizerContext,
  buffFn: (convertibleValue: number) => number,
) {
  const statConfig = statConversionConfig[sourceStat]
  const destConfig = statConversionConfig[destinationStat]

  const statValue = x.a[statConfig.key]
  const statPreconvertedValue = x.a[statConfig.preconvertedKey!] ?? 0
  const statPreconvertedPercentValue = statConfig.percentStat ? x.a[statConfig.percentPreconvertedKey!] * context[statConfig.baseProperty!] : 0

  const stateValue = action.conditionalState[conditional.id] ?? 0
  const convertibleValue = statValue - statPreconvertedValue - statPreconvertedPercentValue

  if (convertibleValue <= 0) return

  const buffFull = Math.max(0, buffFn(convertibleValue))
  const buffDelta = buffFull - stateValue

  action.conditionalState[conditional.id] = buffFull

  sourceStat == destinationStat && x[statConfig.preconvertedProperty]?.buff(buffDelta, Source.NONE)
  x[destConfig.property].buffDynamic(buffDelta, Source.NONE, action, context)
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
let convertibleValue: f32 = (*p_x).${statConfig.property} - (*p_x).${statConfig.preconvertedProperty};

if (!(${thresholdConditionWgsl}) || convertibleValue <= 0) {
  return;
}

let buffFull = max(0, ${buffWgsl});
let buffDelta = buffFull - stateValue;

(*p_state).${conditional.id} += buffDelta;

if (${wgslTrue(sourceStat == destinationStat)}) {
  (*p_x).${statConfig.preconvertedProperty} += buffDelta;
}

(*p_x).${destConfig.property} += buffDelta;
`,
  )
}
