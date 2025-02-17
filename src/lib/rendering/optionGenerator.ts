import i18next from 'i18next'
import DB from 'lib/state/db'
import { currentLocale } from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { CharacterId } from 'types/character'
import { DBMetadataCharacter, DBMetadataLightCone } from 'types/metadata'

export function generateCharacterOptions() {
  const t = i18next.getFixedT(null, 'gameData', 'Characters')
  const characterData = TsUtils.clone(DB.getMetadata().characters) as CharacterOptions

  for (const value of Object.values(characterData)) {
    value.value = value.id
    value.label = t(`${value.id}.LongName` as never)
  }

  return Object.values(characterData)
    .sort((a, b) => a.label.localeCompare(b.label, currentLocale()))
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
    value.label = t(`${value.id}.Name` as never)
  }

  return Object.values(lcData)
    .filter((lc) => !pathFilter || lc.path === pathFilter)
    .sort((a, b) => a.label.localeCompare(b.label, currentLocale()))
}

type LcOptions = Record<string, DBMetadataLightCone & { value: string; label: string; id: string }>
type CharacterOptions = Record<string, DBMetadataCharacter & { value: string; label: string; id: string }>
