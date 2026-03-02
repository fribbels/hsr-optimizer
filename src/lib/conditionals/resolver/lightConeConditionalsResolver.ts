import { lightConeConfigRegistry } from 'lib/conditionals/resolver/lightConeConfigRegistry'
import { ElementName, PathName } from 'lib/constants/constants'
import { CharacterId } from 'types/character'
import { LightConeConditionalsController } from 'types/conditionals'
import { LightConeId } from 'types/lightCone'

export type WearerMetadata = { element: ElementName; characterId: CharacterId }

export const LightConeConditionalsResolver = {
  get: (
    request: { lightCone: string; lightConeSuperimposition: number; lightConePath: PathName; path: PathName; element: ElementName; characterId: CharacterId },
    withContent = false,
  ): LightConeConditionalsController => {
    const lcFn = lightConeConfigRegistry.get(request.lightCone as LightConeId)?.conditionals
    // GPU debugger should be able to use all light cones
    // Otherwise path mismatches disable light cone effects
    if (!lcFn || (request.lightConePath !== request.path && !globalThis?.WEBGPU_DEBUG)) {
      return {
        content: () => [],
        defaults: () => ({}),
        finalizeCalculations: () => {},
      }
    }
    return lcFn(request.lightConeSuperimposition - 1, withContent, { element: request.element, characterId: request.characterId })
  },
}
