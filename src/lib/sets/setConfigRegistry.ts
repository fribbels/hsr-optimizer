import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import {
  OptimizerAction,
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'
import {
  SetConfig,
  SetType,
  TeammateOption,
} from 'types/setConfig'

export type SetConditionalFieldInfo = {
  fieldName: string,
  wgslType: 'bool' | 'i32',
  setKey: Sets,
}

// ── Registry ──

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

// ── Derived data ──

type IndexedConfig = {
  index: number,
  config: SetConfig,
}

type IndexedField = {
  index: number,
  id: string,
  field: SetConditionalFieldInfo,
}

const relicConfigs: IndexedConfig[] = []
const ornamentConfigs: IndexedConfig[] = []
const setToConditionalKeyMap = new Map<Sets, string>()
const teammateOptionsMap = new Map<string, TeammateOption>()
const boolFields: IndexedField[] = []
const intFields: IndexedField[] = []
export const teammateRelicOptions: TeammateOption[] = []
export const teammateOrnamentOptions: TeammateOption[] = []
export const setToId = {} as Record<Sets, string>

for (const config of setConfigRegistry.values()) {
  const setKey = Sets[config.id]
  const isRelic = config.info.setType === SetType.RELIC

  // Config arrays
  if (isRelic) {
    relicConfigs.push({ index: config.info.index, config })
  } else {
    ornamentConfigs.push({ index: config.info.index, config })
  }

  // ID mapping
  setToId[setKey] = config.info.ingameId

  // Conditional i18n keys
  if (config.display.conditionalI18nKey) {
    setToConditionalKeyMap.set(setKey, config.display.conditionalI18nKey)
  }

  // Teammates
  if (config.conditionals.teammate) {
    for (const option of config.conditionals.teammate) {
      teammateOptionsMap.set(option.value, option)
      if (isRelic) {
        teammateRelicOptions.push(option)
      } else {
        teammateOrnamentOptions.push(option)
      }
    }
  }

  // Conditional fields
  if (config.display.conditionalI18nKey && config.display.modifiable) {
    const isBoolean = config.display.conditionalType === ConditionalDataType.BOOLEAN
    const field: SetConditionalFieldInfo = {
      fieldName: `${isBoolean ? 'enabled' : 'value'}${config.id}`,
      wgslType: isBoolean ? 'bool' : 'i32',
      setKey,
    }
    if (isBoolean) {
      boolFields.push({ index: config.info.index, id: config.id, field })
    } else {
      intFields.push({ index: config.info.index, id: config.id, field })
    }
  }
}

const byIndex = (a: IndexedConfig, b: IndexedConfig) => a.index - b.index
const byIndexThenId = (a: IndexedField, b: IndexedField) => a.index - b.index || a.id.localeCompare(b.id)

relicConfigs.sort(byIndex)
ornamentConfigs.sort(byIndex)
boolFields.sort(byIndexThenId)
intFields.sort(byIndexThenId)

export const relicIndexToSetConfig = relicConfigs.map((c) => c.config)
export const ornamentIndexToSetConfig = ornamentConfigs.map((c) => c.config)
export const orderedSetConditionalFields = [
  ...boolFields.map((e) => e.field),
  ...intFields.map((e) => e.field),
]

// ── Usage ──

export function setToConditionalKey(set: Sets): string {
  return setToConditionalKeyMap.get(set) ?? 'Conditionals.DefaultMessage'
}

export function getTeammateOption(key: string): TeammateOption | undefined {
  return teammateOptionsMap.get(key)
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
