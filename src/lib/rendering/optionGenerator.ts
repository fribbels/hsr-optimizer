import i18next from 'i18next'
import { sortAlphabeticEmojiLast } from 'lib/rendering/displayUtils'
import DB from 'lib/state/db'
import { TsUtils } from 'lib/utils/TsUtils'
import { CharacterId } from 'types/character'
import { LightCone } from 'types/lightCone'
import {
  DBMetadataCharacter,
  DBMetadataLightCone,
} from 'types/metadata'

export function generateCharacterOptions() {
  const t = i18next.getFixedT(null, 'gameData', 'Characters')
  const characterData = TsUtils.clone(DB.getMetadata().characters) as CharacterOptions

  for (const value of Object.values(characterData)) {
    value.value = value.id
    value.label = t(`${value.id}.LongName`)
  }

  return Object.values(characterData).sort(sortAlphabeticEmojiLast('label'))
}

// Light cone selector options from current db metadata
export function generateLightConeOptions(characterId?: CharacterId) {
  const t = i18next.getFixedT(null, 'gameData', 'Lightcones')
  const lcData = TsUtils.clone(DB.getMetadata().lightCones) as LcOptions

  let pathFilter = null
  if (characterId) {
    const character = DB.getMetadata().characters[characterId]
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

type LcOptions = Record<LightCone['id'], DBMetadataLightCone & { value: DBMetadataLightCone['id'], label: string }>
type CharacterOptions = Record<CharacterId, DBMetadataCharacter & { value: DBMetadataCharacter['id'], label: string }>
