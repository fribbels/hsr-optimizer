import { Constants } from './constants.ts'

// let baseUrl = process.env.PUBLIC_URL // Local testing;
// const baseUrl = 'https://d28ecrnsw8u0fj.cloudfront.net'

function getImageUrl(name) {
  return new URL(`/hsr-optimizer/assets` + name, import.meta.url).href
}

let pathFromClassMapping
let iconFromStatMapping
export const Assets = {
  getStatIcon: (stat, percented) => {
    if (!iconFromStatMapping) {
      iconFromStatMapping = {
        [Constants.Stats.HP]: 'IconMaxHP.webp',
        [Constants.Stats.ATK]: 'IconAttack.webp',
        [Constants.Stats.DEF]: 'IconDefence.webp',
        [Constants.Stats.HP_P]: 'IconMaxHP.webp',
        [Constants.Stats.ATK_P]: 'IconAttack.webp',
        [Constants.Stats.DEF_P]: 'IconDefence.webp',
        [Constants.Stats.SPD]: 'IconSpeed.webp',
        [Constants.Stats.SPD_P]: 'IconSpeed.webp',
        [Constants.Stats.CR]: 'IconCriticalChance.webp',
        [Constants.Stats.CD]: 'IconCriticalDamage.webp',
        [Constants.Stats.EHR]: 'IconStatusProbability.webp',
        [Constants.Stats.RES]: 'IconStatusResistance.webp',
        [Constants.Stats.BE]: 'IconBreakUp.webp',
        [Constants.Stats.ERR]: 'IconEnergyRecovery.webp',
        [Constants.Stats.OHB]: 'IconHealRatio.webp',
        [Constants.Stats.Physical_DMG]: 'IconPhysicalAddedRatio.webp',
        [Constants.Stats.Fire_DMG]: 'IconFireAddedRatio.webp',
        [Constants.Stats.Ice_DMG]: 'IconIceAddedRatio.webp',
        [Constants.Stats.Lightning_DMG]: 'IconThunderAddedRatio.webp',
        [Constants.Stats.Wind_DMG]: 'IconWindAddedRatio.webp',
        [Constants.Stats.Quantum_DMG]: 'IconQuantumAddedRatio.webp',
        [Constants.Stats.Imaginary_DMG]: 'IconImaginaryAddedRatio.webp',
      }
    }
    if (stat == 'CV') return getImageUrl(`/misc/cv.webp`)
    if (stat == Constants.Stats.HP_P && percented) return getImageUrl(`/misc/IconMaxHPPercent.webp`)
    if (stat == Constants.Stats.ATK_P && percented) return getImageUrl(`/misc/IconAttackPercent.webp`)
    if (stat == Constants.Stats.DEF_P && percented) return getImageUrl(`/misc/IconDefencePercent.webp`)
    if (!stat || !iconFromStatMapping[stat]) return Assets.getBlank()

    return getImageUrl(`/icon/property/${iconFromStatMapping[stat]}`)
  },
  getCharacterPortraitById: (id) => {
    if (!id) {
      console.warn('No id found')
      return Assets.getBlank()
    }

    return getImageUrl(`/image/character_portrait/${id}.webp`)
  },
  getCharacterAvatarById: (id) => {
    if (!id) return Assets.getBlank()

    return getImageUrl(`/icon/avatar/${id}.webp`)
  },
  getCharacterPreviewById: (id) => {
    if (!id) return Assets.getBlank()

    return getImageUrl(`/image/character_preview/${id}.webp`)
  },

  getLightConePortrait: (lightCone) => {
    if (!lightCone) return Assets.getBlank()
    return getImageUrl(`/image/light_cone_portrait/${lightCone.id}.webp`)
  },
  getLightConePortraitById: (lightConeId) => {
    if (!lightConeId) return Assets.getBlank()
    return getImageUrl(`/image/light_cone_portrait/${lightConeId}.webp`)
  },
  getLightConeIconById: (lightConeId) => {
    if (!lightConeId) return Assets.getBlank()
    return getImageUrl(`/icon/light_cone/${lightConeId}.webp`)
  },
  getPath: (path) => {
    if (!path) return Assets.getBlank()
    return getImageUrl(`/icon/path/${path}.webp`)
  },
  getPathFromClass: (c) => {
    if (!pathFromClassMapping) {
      pathFromClassMapping = {
        Warrior: 'Destruction',
        Warlock: 'Nihility',
        Knight: 'Preservation',
        Priest: 'Abundance',
        Rogue: 'Hunt',
        Shaman: 'Harmony',
        Mage: 'Erudition',
      }
    }
    if (!c || !pathFromClassMapping[c]) return Assets.getBlank()
    return getImageUrl(`/icon/path/${pathFromClassMapping[c]}.webp`)
  },

  getElement: (element) => {
    if (!element) return Assets.getBlank()
    if (element == 'Thunder') element = 'Lightning'
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
  getStar: () => {
    return getImageUrl('/misc/StarBig.webp')
  },
  getGuideImage: (name) => {
    return getImageUrl(`/misc/guide/${name}.webp`)
  },
  getStarBw: () => {
    return getImageUrl('/misc/QuestMainIcon.webp')
  },

  getPart: (part) => {
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

  getChangelog: (path) => {
    return getImageUrl(`/misc/changelog/${path}`)
  },

  getSetImage: (set, part) => {
    if (!part) {
      part = Constants.Parts.PlanarSphere
    }
    const setToId = {
      [Constants.Sets.PasserbyOfWanderingCloud]: '101',
      [Constants.Sets.MusketeerOfWildWheat]: '102',
      [Constants.Sets.KnightOfPurityPalace]: '103',
      [Constants.Sets.HunterOfGlacialForest]: '104',
      [Constants.Sets.ChampionOfStreetwiseBoxing]: '105',
      [Constants.Sets.GuardOfWutheringSnow]: '106',
      [Constants.Sets.FiresmithOfLavaForging]: '107',
      [Constants.Sets.GeniusOfBrilliantStars]: '108',
      [Constants.Sets.BandOfSizzlingThunder]: '109',
      [Constants.Sets.EagleOfTwilightLine]: '110',
      [Constants.Sets.ThiefOfShootingMeteor]: '111',
      [Constants.Sets.WastelanderOfBanditryDesert]: '112',
      [Constants.Sets.LongevousDisciple]: '113',
      [Constants.Sets.MessengerTraversingHackerspace]: '114',
      [Constants.Sets.TheAshblazingGrandDuke]: '115',
      [Constants.Sets.PrisonerInDeepConfinement]: '116',
      [Constants.Sets.PioneerDiverOfDeadWaters]: '117',
      [Constants.Sets.WatchmakerMasterOfDreamMachinations]: '118',

      [Constants.Sets.SpaceSealingStation]: '301',
      [Constants.Sets.FleetOfTheAgeless]: '302',
      [Constants.Sets.PanCosmicCommercialEnterprise]: '303',
      [Constants.Sets.BelobogOfTheArchitects]: '304',
      [Constants.Sets.CelestialDifferentiator]: '305',
      [Constants.Sets.InertSalsotto]: '306',
      [Constants.Sets.TaliaKingdomOfBanditry]: '307',
      [Constants.Sets.SprightlyVonwacq]: '308',
      [Constants.Sets.RutilantArena]: '309',
      [Constants.Sets.BrokenKeel]: '310',
      [Constants.Sets.FirmamentFrontlineGlamoth]: '311',
      [Constants.Sets.PenaconyLandOfTheDreams]: '312',
      [Constants.Sets.SigoniaTheUnclaimedDesolation]: '313',
      [Constants.Sets.IzumoGenseiAndTakamaDivineRealm]: '314',
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
    return getImageUrl(`/icon/relic/${setToId[set]}${partToId[part]}.webp`)
  },
}
