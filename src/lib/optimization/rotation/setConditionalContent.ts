import { type TFunction } from 'i18next'
import {
  type ConditionalDataType,
  Constants,
  Sets,
} from 'lib/constants/constants'
import { setConfigRegistry } from 'lib/sets/setConfigRegistry'
import { type SelectOptionContent } from 'types/setConfig'

export type { SelectOptionContent } from 'types/setConfig'

type SetConditionalTFunction = TFunction<'optimizerTab', 'SetConditionals.SelectOptions'>

export type SetMetadata = {
  type: ConditionalDataType
  modifiable?: boolean
  selectionOptions?: (t: SetConditionalTFunction) => SelectOptionContent[]
}

export function generateSetConditionalContent(t: SetConditionalTFunction) {
  return Object.values(Constants.Sets).reduce((acc, cur) => {
    acc[cur] = ConditionalSetMetadata[cur].selectionOptions?.(t) ?? []
    return acc
  }, {} as Record<Sets, SelectOptionContent[]>)
}

function buildConditionalSetMetadata(): Record<Sets, SetMetadata> {
  const result = {} as Record<Sets, SetMetadata>
  for (const [id, config] of setConfigRegistry) {
    result[Sets[id]] = {
      type: config.display.conditionalType,
      modifiable: config.display.modifiable,
      selectionOptions: config.display.selectionOptions,
    }
  }
  return result
}

export const ConditionalSetMetadata: Readonly<Record<Sets, SetMetadata>> = buildConditionalSetMetadata()
