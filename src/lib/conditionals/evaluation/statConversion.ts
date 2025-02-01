import { ConvertibleStatsType, statConversionConfig } from 'lib/conditionals/evaluation/statConversionConfig'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
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
  const buffFull = buffFn(convertibleValue)
  const buffDelta = buffFull - stateValue

  action.conditionalState[conditional.id] = buffFull
  sourceStat == destinationStat && x[statConfig.preconvertedProperty]?.buff(buffDelta, Source.NONE)
  x[destConfig.property].buffDynamic(buffDelta, Source.NONE, action, context)
}
