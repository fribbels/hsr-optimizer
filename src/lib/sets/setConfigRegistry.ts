import { ConditionalDataType, Sets } from 'lib/constants/constants'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import {
  OptimizerAction,
  OptimizerContext,
  SetConditional,
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
  if (config.conditionals.teammate) {
    for (const option of config.conditionals.teammate) {
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

// ── Set Conditional Field Registry ──

export type SetConditionalFieldInfo = {
  fieldName: string
  wgslType: 'bool' | 'i32'
  setKey: Sets
}

function buildOrderedSetConditionalFields(): SetConditionalFieldInfo[] {
  const boolFields: { index: number; id: string; field: SetConditionalFieldInfo }[] = []
  const intFields: { index: number; id: string; field: SetConditionalFieldInfo }[] = []

  for (const config of setConfigRegistry.values()) {
    if (!config.display.conditionalI18nKey || !config.display.modifiable) continue

    const isBoolean = config.display.conditionalType === ConditionalDataType.BOOLEAN
    const prefix = isBoolean ? 'enabled' : 'value'
    const field: SetConditionalFieldInfo = {
      fieldName: `${prefix}${config.id}`,
      wgslType: isBoolean ? 'bool' : 'i32',
      setKey: Sets[config.id],
    }

    const entry = { index: config.info.index, id: config.id, field }
    if (isBoolean) {
      boolFields.push(entry)
    } else {
      intFields.push(entry)
    }
  }

  const sort = (a: { index: number; id: string }, b: { index: number; id: string }) =>
    a.index - b.index || a.id.localeCompare(b.id)

  boolFields.sort(sort)
  intFields.sort(sort)

  return [...boolFields.map((e) => e.field), ...intFields.map((e) => e.field)]
}

const orderedSetConditionalFields = buildOrderedSetConditionalFields()

export function getOrderedSetConditionalFields(): SetConditionalFieldInfo[] {
  return orderedSetConditionalFields
}

export function getConditionalFieldName(config: SetConfig): string | undefined {
  if (!config.display.conditionalI18nKey || !config.display.modifiable) return undefined
  const prefix = config.display.conditionalType === ConditionalDataType.BOOLEAN ? 'enabled' : 'value'
  return `${prefix}${config.id}`
}

export function generateSetConditionalsStruct(): string {
  const fields = orderedSetConditionalFields
    .map((f) => `  ${f.fieldName}: ${f.wgslType},`)
    .join('\n')
  return `struct SetConditionals {\n${fields}\n}`
}

export function generateSetConditionalsInitializer(setConditionals: SetConditional, debug: boolean = false): string {
  const record = setConditionals as Record<string, boolean | number>
  return orderedSetConditionalFields
    .map((f) => `${record[f.fieldName]},${debug ? ` // ${f.fieldName}` : ''}`)
    .join('\n    ')
}
