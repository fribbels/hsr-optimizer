import { Sets } from 'lib/constants/constants'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'
import { SetConfig, SetType, TeammateOption } from 'types/setConfig'

const setModules = import.meta.glob<Record<string, unknown>>(
  ['./**/*.ts', '!./setConfigRegistry.ts'],
  { eager: true },
)

export const setConfigRegistry = new Map<keyof typeof Sets, SetConfig>()

for (const mod of Object.values(setModules)) {
  for (const value of Object.values(mod)) {
    if (
      value != null
      && typeof value === 'object'
      && 'id' in value
      && 'info' in value
      && 'conditionals' in value
      && 'display' in value
    ) {
      const config = value as SetConfig
      setConfigRegistry.set(config.id, config)
    }
  }
}

export function getSetConfig(id: keyof typeof Sets): SetConfig | undefined {
  return setConfigRegistry.get(id)
}

export function getAllSetConfigs(): Map<keyof typeof Sets, SetConfig> {
  return setConfigRegistry
}

export function generateSetCombatWgsl(action: OptimizerAction, context: OptimizerContext): string {
  let wgsl = ''
  for (const config of setConfigRegistry.values()) {
    if (config.conditionals.gpu) {
      wgsl += config.conditionals.gpu(action, context)
    }
  }
  return wgsl
}

export function generateSetTerminalWgsl(action: OptimizerAction, context: OptimizerContext): string {
  let wgsl = ''
  for (const config of setConfigRegistry.values()) {
    if (config.conditionals.gpuTerminal) {
      wgsl += config.conditionals.gpuTerminal(action, context)
    }
  }
  return wgsl
}

export function getAllSetDynamicConditionals(): DynamicConditional[] {
  const result: DynamicConditional[] = []
  for (const config of setConfigRegistry.values()) {
    if (config.conditionals.dynamicConditionals) {
      result.push(...config.conditionals.dynamicConditionals)
    }
  }
  return result
}

function buildIndexToConfigArray(setType: SetType): SetConfig[] {
  const configs: { index: number; config: SetConfig }[] = []
  for (const config of setConfigRegistry.values()) {
    if (config.info.setType === setType) {
      configs.push({ index: config.info.index, config })
    }
  }
  configs.sort((a, b) => a.index - b.index)
  return configs.map((c) => c.config)
}

export const relicIndexToSetConfig = buildIndexToConfigArray(SetType.RELIC)
export const ornamentIndexToSetConfig = buildIndexToConfigArray(SetType.ORNAMENT)

export const setToId: Record<Sets, string> = (() => {
  const result = {} as Record<Sets, string>
  for (const config of setConfigRegistry.values()) {
    result[Sets[config.id]] = config.info.ingameId
  }
  return result
})()

const setToConditionalKeyMap = new Map<Sets, string>()
for (const config of setConfigRegistry.values()) {
  if (config.display.conditionalI18nKey) {
    setToConditionalKeyMap.set(Sets[config.id], config.display.conditionalI18nKey)
  }
}

export function setToConditionalKey(set: Sets): string {
  return setToConditionalKeyMap.get(set) ?? 'Conditionals.DefaultMessage'
}

const teammateOptionsMap = new Map<string, TeammateOption>()
const teammateRelicOptions: TeammateOption[] = []
const teammateOrnamentOptions: TeammateOption[] = []

for (const config of setConfigRegistry.values()) {
  if (config.teammate) {
    for (const option of config.teammate) {
      teammateOptionsMap.set(option.value, option)
      if (config.info.setType === SetType.RELIC) {
        teammateRelicOptions.push(option)
      } else {
        teammateOrnamentOptions.push(option)
      }
    }
  }
}

export function getTeammateOption(key: string): TeammateOption | undefined {
  return teammateOptionsMap.get(key)
}

export function getTeammateRelicOptions(): TeammateOption[] {
  return teammateRelicOptions
}

export function getTeammateOrnamentOptions(): TeammateOption[] {
  return teammateOrnamentOptions
}
