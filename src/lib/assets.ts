import {
  Constants,
  SACERDOS_RELIVED_ORDEAL_1_STACK,
  SACERDOS_RELIVED_ORDEAL_2_STACK,
  setToId,
  Stats,
} from 'lib/constants'
import { BASE_PATH } from 'lib/db'

// let baseUrl = process.env.PUBLIC_URL // Local testing;
// const baseUrl = 'https://d28ecrnsw8u0fj.cloudfront.net'

function getImageUrl(name: string) {
  return new URL(BASE_PATH + `/assets` + name, import.meta.url).href
}

const iconFromStatMapping: Record<string, string> = {
  [Stats.HP]: 'IconMaxHP.webp',
  [Stats.ATK]: 'IconAttack.webp',
  [Stats.DEF]: 'IconDefence.webp',
  [Stats.HP_P]: 'IconMaxHP.webp',
  [Stats.ATK_P]: 'IconAttack.webp',
  [Stats.DEF_P]: 'IconDefence.webp',
  [Stats.SPD]: 'IconSpeed.webp',
  [Stats.SPD_P]: 'IconSpeed.webp',
  [Stats.CR]: 'IconCriticalChance.webp',
  [Stats.CD]: 'IconCriticalDamage.webp',
  [Stats.EHR]: 'IconStatusProbability.webp',
  [Stats.RES]: 'IconStatusResistance.webp',
  [Stats.BE]: 'IconBreakUp.webp',
  [Stats.ERR]: 'IconEnergyRecovery.webp',
  [Stats.OHB]: 'IconHealRatio.webp',
  [Stats.Physical_DMG]: 'IconPhysicalAddedRatio.webp',
  [Stats.Fire_DMG]: 'IconFireAddedRatio.webp',
  [Stats.Ice_DMG]: 'IconIceAddedRatio.webp',
  [Stats.Lightning_DMG]: 'IconThunderAddedRatio.webp',
  [Stats.Wind_DMG]: 'IconWindAddedRatio.webp',
  [Stats.Quantum_DMG]: 'IconQuantumAddedRatio.webp',
  [Stats.Imaginary_DMG]: 'IconImaginaryAddedRatio.webp',
}

export const Assets = {
  getStatIcon: (stat: string, percented: boolean = false) => {
    if (stat == 'CV') return getImageUrl(`/misc/cv.webp`)
    if (stat == 'simScore') return getImageUrl(`/misc/battle.webp`)
    if (stat == Constants.Stats.HP_P && percented) return getImageUrl(`/misc/IconMaxHPPercent.webp`)
    if (stat == Constants.Stats.ATK_P && percented) return getImageUrl(`/misc/IconAttackPercent.webp`)
    if (stat == Constants.Stats.DEF_P && percented) return getImageUrl(`/misc/IconDefencePercent.webp`)
    if (!stat || !iconFromStatMapping[stat]) return Assets.getBlank()

    return getImageUrl(`/icon/property/${iconFromStatMapping[stat]}`)
  },
  getCharacterPortraitById: (id: string) => {
    if (!id) {
      console.warn('No id found')
      return Assets.getBlank()
    }

    return getImageUrl(`/image/character_portrait/${id}.webp`)
  },
  getCharacterAvatarById: (id: string) => {
    if (!id) return Assets.getBlank()

    return getImageUrl(`/icon/avatar/${id}.webp`)
  },
  getCharacterPreviewById: (id: string) => {
    if (!id) return Assets.getBlank()

    return getImageUrl(`/image/character_preview/${id}.webp`)
  },

  getLightConePortrait: (lightCone: { id: string }) => {
    if (!lightCone) return Assets.getBlank()
    return getImageUrl(`/image/light_cone_portrait/${lightCone.id}.webp`)
  },
  getLightConePortraitById: (lightConeId: string) => {
    if (!lightConeId) return Assets.getBlank()
    return getImageUrl(`/image/light_cone_portrait/${lightConeId}.webp`)
  },

  getLightConeIconById: (lightConeId: string) => {
    if (!lightConeId) return Assets.getBlank()
    return getImageUrl(`/icon/light_cone/${lightConeId}.webp`)
  },
  getPath: (path: string) => {
    if (!path) return Assets.getBlank()
    return getImageUrl(`/icon/path/${path}.webp`)
  },
  getPathFromClass: (c: string) => {
    if (!c) return Assets.getBlank()
    return getImageUrl(`/icon/path/${c}.webp`)
  },

  getElement: (element: string) => {
    if (!element) return Assets.getBlank()
    return getImageUrl(`/icon/element/${element}.webp`)
  },
  getBlank: () => {
    return getImageUrl('/misc/blank.webp')
  },
  getQuestion: () => {
    return getImageUrl('/misc/tooltip.webp')
  },
  getLogo: () => {
    return getImageUrl('/misc/logo.webp')
  },
  getDiscord: () => {
    return getImageUrl('/misc/badgediscord.webp')
  },
  getGithub: () => {
    return getImageUrl('/misc/badgegithub.webp')
  },
  getKofi: () => {
    return getImageUrl('/misc/badgekofi.webp')
  },
  getStar: () => {
    return getImageUrl('/misc/StarBig.webp')
  },
  getGuideImage: (name: string) => {
    return getImageUrl(`/misc/guide/${name}.webp`)
  },
  getLocaleGuideImage: (name: string, locale: string) => {
    if (!locale) return Assets.getBlank()
    return getImageUrl(`/misc/guide/${locale}/${name}.webp`)
  },
  getStarBw: () => {
    return getImageUrl('/misc/QuestMainIcon.webp')
  },
  getFlag: (locale: string) => {
    return getImageUrl(`/misc/flags/${locale}.webp`)
  },

  getPart: (part: string) => {
    const mapping = {
      [Constants.Parts.Head]: 'partHead',
      [Constants.Parts.Hands]: 'partHands',
      [Constants.Parts.Body]: 'partBody',
      [Constants.Parts.Feet]: 'partFeet',
      [Constants.Parts.PlanarSphere]: 'partPlanarSphere',
      [Constants.Parts.LinkRope]: 'partLinkRope',
    }

    return getImageUrl(`/misc/${mapping[part]}.webp`)
  },

  getChangelog: (path: string) => {
    return getImageUrl(`/misc/changelog/${path}`)
  },

  getSetImage: (set: string | number, part: string = Constants.Parts.PlanarSphere, actualIcon: boolean = false) => {
    if (set == -1) {
      return Assets.getBlank()
    }

    const partToId = {
      base: '',
      [Constants.Parts.Head]: '_0',
      [Constants.Parts.Hands]: '_1',
      [Constants.Parts.Body]: '_2',
      [Constants.Parts.Feet]: '_3',
      [Constants.Parts.PlanarSphere]: '_0',
      [Constants.Parts.LinkRope]: '_1',
    }
    if (actualIcon) {
      return getImageUrl(`/icon/relic/${setToId[set]}.webp`)
    }
    if (set == SACERDOS_RELIVED_ORDEAL_1_STACK || set == SACERDOS_RELIVED_ORDEAL_2_STACK) {
      return getImageUrl(`/icon/relic/${setToId[Constants.Sets.SacerdosRelivedOrdeal]}${partToId[part]}.webp`)
    }
    return getImageUrl(`/icon/relic/${setToId[set]}${partToId[part]}.webp`)
  },
}
