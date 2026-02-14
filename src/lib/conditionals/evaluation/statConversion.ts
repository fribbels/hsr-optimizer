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
  getActionIndex,
} from 'lib/gpu/injection/injectUtils'
import { BuffSource } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { AKeyValue } from 'lib/optimization/engine/config/keys'
import {
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { matchesTargetTag } from 'lib/optimization/engine/container/gpuBuffBuilder'
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
  targetTag: TargetTag = TargetTag.SelfAndPet,
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

  x.buffDynamic(destConfig.unconvertibleKey, buffDelta, action, context, x.targets(targetTag).source(source))
  x.buffDynamic(destConfig.key, buffDelta, action, context, x.targets(targetTag).source(source))
}

// Helper to generate WGSL buff lines for all entities matching the target tag
function generateMultiEntityBuffWgsl(
  actionKey: AKeyValue,
  valueExpr: string,
  action: OptimizerAction,
  targetTag: TargetTag,
): string {
  const config = action.config
  const lines: string[] = []

  for (let entityIndex = 0; entityIndex < config.entitiesLength; entityIndex++) {
    const entity = config.entitiesArray[entityIndex]
    if (matchesTargetTag(entity, targetTag, config.entitiesArray)) {
      const index = getActionIndex(entityIndex, actionKey, config)
      lines.push(`(*p_container)[${index}] += ${valueExpr}; // ${entity.name}`)
    }
  }

  return lines.join('\n')
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
  targetTag: TargetTag = TargetTag.SelfAndPet,
) {
  const statConfig = statConversionConfig[sourceStat]
  const destConfig = statConversionConfig[destinationStat]
  const config = action.config

  const sourceVal = containerActionVal(SELF_ENTITY_INDEX, statConfig.key, config)
  const sourceUnconvertibleVal = containerActionVal(SELF_ENTITY_INDEX, statConfig.unconvertibleKey, config)

  // Generate buff lines for all entities matching the target tag
  const destUnconvertibleBuffLines = generateMultiEntityBuffWgsl(destConfig.unconvertibleKey, 'buffDelta', action, targetTag)
  const destBuffLines = generateMultiEntityBuffWgsl(destConfig.key, 'buffDelta', action, targetTag)

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

${destUnconvertibleBuffLines}
${destBuffLines}
`,
  )
}
