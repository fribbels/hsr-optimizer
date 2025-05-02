// @ts-nocheck
/* eslint-disable */
// TODO this is very much not ideal but until the API responses can be properly typed it will have to do
import { UnconvertedCharacter } from 'lib/importer/characterConverter'
import { Utils } from 'lib/utils/utils'

export function processManaData(data: ManaApiResponse): UnconvertedCharacter[] {
  data = Utils.recursiveToCamel(data)
  return [
    data.detailInfo.assistAvatars[0],
    data.detailInfo.assistAvatars[1],
    data.detailInfo.assistAvatars[2],
    data.detailInfo.avatarDetailList[0],
    data.detailInfo.avatarDetailList[1],
    data.detailInfo.avatarDetailList[2],
    data.detailInfo.avatarDetailList[3],
    data.detailInfo.avatarDetailList[4],
  ].filter((x) => !!x)
}

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

export type APIResponse = ManaApiResponse | MihomoApiResponse | EnkaApiResponse

type ManaApiResponse = {
  source: 'mana'
}

type MihomoApiResponse = {
  source: 'mihomo'
}

type EnkaApiResponse = {
  source: 'enka'
}
