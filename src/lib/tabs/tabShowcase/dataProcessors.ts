// @ts-nocheck
/* eslint-disable */
// this is very much not ideal but unless the API response types can be properly downstreamed it will have to do
import type { UnconvertedCharacter } from 'lib/importer/characterConverter'

export function processMihomoData(data: MihomoApiResponse): UnconvertedCharacter[] {
  const characters = data.characters.filter((x) => !!x)
  for (const character of characters) {
    character.relicList = character.relics || []
    character.equipment = character.light_cone
    character.avatarId = character.id

    if (character.equipment) {
      character.equipment.tid = character.equipment.id
    }

    for (const relic of character.relicList) {
      relic.tid = relic.id
      relic.subAffixList = relic.sub_affix
    }
  }
  return characters
}

export function processEnkaData(data: EnkaApiResponse): UnconvertedCharacter[] {
  return [...(data.detailInfo.assistAvatarList || []), ...(data.detailInfo.avatarDetailList || [])]
    .filter((x) => !!x)
    .sort((a, b) => {
      if (b._assist && a._assist) return (a.pos || 0) - (b.pos || 0)
      if (b._assist) return 1
      if (a._assist) return -1
      return 0
    })
    .filter((item, index, array) => {
      return array.findIndex((i) => i.avatarId === item.avatarId) === index
    })
}

export type APIResponse = MihomoApiResponse | EnkaApiResponse

type MihomoApiResponse = {
  source: 'mihomo'
}

type EnkaApiResponse = {
  source: 'enka'
}
