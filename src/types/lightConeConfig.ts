import { LightConeId, SuperImpositionLevel } from 'types/lightCone'
import { LightConeConditionalsController } from 'types/conditionals'
import { WearerMetadata } from 'lib/conditionals/resolver/lightConeConditionalsResolver'

export type LightConeInfo = Record<string, never>

export type LightConeConfig = {
  id: LightConeId
  info: LightConeInfo
  conditionals: (s: SuperImpositionLevel, withContent: boolean, wearerMetadata?: WearerMetadata) => LightConeConditionalsController
  superimpositions: Record<number, Record<string, number>>
}
