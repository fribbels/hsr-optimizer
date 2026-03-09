import { WearerMetadata } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { LightConeConditionalsController } from 'types/conditionals'
import {
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
