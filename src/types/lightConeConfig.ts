import type { WearerMetadata } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import type { LightConeConditionalsController } from 'types/conditionals'
import type {
  LightConeId,
  SuperImpositionLevel,
} from 'types/lightCone'

export type LightConeInfo = Record<string, never>

export type LightConeDisplay = {
  imageOffset?: { x: number, y: number, s: number },
}

export type LightConeConfig = {
  id: LightConeId,
  info?: LightConeInfo,
  conditionals: LightConeConditionalFunction,
  display?: LightConeDisplay,
}

export type LightConeConditionalFunction = (s: SuperImpositionLevel, withContent: boolean, wearerMetadata: WearerMetadata) => LightConeConditionalsController
