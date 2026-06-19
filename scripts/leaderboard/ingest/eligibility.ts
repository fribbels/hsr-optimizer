import type { PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import type { ShowcaseTabCharacter } from 'lib/tabs/tabShowcase/showcaseTabTypes'
import type { UnconvertedCharacter } from 'lib/importer/characterConverter'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'

// CharacterConverter.convert() always produces non-null characterId/lightCone when isEligibleRaw passes
export type EligibleConverted = ShowcaseTabCharacter & {
  form: { characterId: CharacterId; lightCone: LightConeId }
  equipped: PreviewRelics
}

export function isEligibleRaw(character: UnconvertedCharacter): boolean {
  if (!character.relicList || character.relicList.length !== 6) return false
  if (character.relicList.some((r) => !Number.isFinite(r.level) || r.level < 15)) return false
  if (!character.equipment) return false
  return true
}
