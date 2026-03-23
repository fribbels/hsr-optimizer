import i18next from 'i18next'
import { sortAlphabeticEmojiLast } from 'lib/rendering/displayUtils'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { clone } from 'lib/utils/objectUtils'
import { type CharacterId } from 'types/character'
import { type LightConeId } from 'types/lightCone'
import {
  type DBMetadataCharacter,
  type DBMetadataLightCone,
} from 'types/metadata'

export function generateCharacterOptions() {
  const t = i18next.getFixedT(null, 'gameData', 'Characters')
  const characterData = clone(getGameMetadata().characters) as CharacterOptions

  for (const value of Object.values(characterData)) {
    value.value = value.id
    value.label = t(`${value.id}.LongName`)
  }

  return Object.values(characterData).sort(sortAlphabeticEmojiLast('label'))
}

// Light cone selector options from current db metadata
export function generateLightConeOptions(characterId?: CharacterId) {
  const t = i18next.getFixedT(null, 'gameData', 'Lightcones')
  const lcData = clone(getGameMetadata().lightCones) as LcOptions

  let pathFilter = null
  if (characterId) {
    const character = getGameMetadata().characters[characterId]
    pathFilter = character.path
  }

  for (const value of Object.values(lcData)) {
    value.value = value.id
    value.label = t(`${value.id}.Name`)
  }

  return Object.values(lcData)
    .filter((lc) => !pathFilter || lc.path === pathFilter)
    .sort(sortAlphabeticEmojiLast('label'))
}

export type LcOptions = Record<LightConeId, DBMetadataLightCone & { value: DBMetadataLightCone['id'], label: string }>
export type CharacterOptions = Record<CharacterId, DBMetadataCharacter & { value: DBMetadataCharacter['id'], label: string }>
