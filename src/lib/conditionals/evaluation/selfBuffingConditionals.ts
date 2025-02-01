import { ConvertibleStatsType, statConversionConfig } from 'lib/conditionals/evaluation/statConversionConfig'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export function statConversion(
  sourceStat: ConvertibleStatsType,
  destinationStat: ConvertibleStatsType,
  valueFn: (convertibleValue: number) => number,
  conditional: DynamicConditional,
  x: ComputedStatsArray,
  action: OptimizerAction,
  context: OptimizerContext,
) {
  const statConfig = statConversionConfig[sourceStat]
  const destConfig = statConversionConfig[destinationStat]

  const statValue = x.a[statConfig.key]
  const statPreconvertedValue = x.a[statConfig.preconvertedKey!] ?? 0
  const statPreconvertedPercentValue = statConfig.percentStat ? x.a[statConfig.percentPreconvertedKey!] * context[statConfig.baseProperty!] : 0

  const stateValue = action.conditionalState[conditional.id] ?? 0
  const convertibleAtk = statValue - statPreconvertedValue - statPreconvertedPercentValue
  const buffValue = valueFn(convertibleAtk)

  action.conditionalState[conditional.id] = buffValue
  x[destConfig.property].buffDynamic(buffValue - stateValue, Source.NONE, action, context)
}

export function statSelfConversion(
  stat: ConvertibleStatsType,
  valueFn: (convertibleValue: number) => number,
  conditional: DynamicConditional,
  x: ComputedStatsArray,
  action: OptimizerAction,
  context: OptimizerContext,
) {
  const statConfig = statConversionConfig[stat]

  const statValue = x.a[statConfig.key]
  const statPreconvertedValue = x.a[statConfig.preconvertedKey!] ?? 0
  const statPreconvertedPercentValue = statConfig.percentStat ? x.a[statConfig.percentPreconvertedKey!] * context[statConfig.baseProperty!] : 0

  const stateValue = action.conditionalState[conditional.id] ?? 0
  const convertibleValue = statValue - statPreconvertedValue - statPreconvertedPercentValue

  const buffValue = valueFn(convertibleValue)
  const finalBuffValue = buffValue - stateValue

  action.conditionalState[conditional.id] = buffValue

  x[statConfig.preconvertedProperty]?.buff(finalBuffValue, Source.NONE)
  x[statConfig.property].buffDynamic(finalBuffValue, Source.NONE, action, context)
}
