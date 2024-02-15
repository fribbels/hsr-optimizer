import { Constants } from './constants.ts'

// let baseUrl = process.env.PUBLIC_URL // Local testing;
let baseUrl = 'https://d28ecrnsw8u0fj.cloudfront.net'

let pathFromClassMapping
let iconFromStatMapping
export const Assets = {
  getStatIcon: (stat, percented) => {
    if (!iconFromStatMapping) {
      iconFromStatMapping = {
        [Constants.Stats.HP]: 'IconMaxHP.png',
        [Constants.Stats.ATK]: 'IconAttack.png',
        [Constants.Stats.DEF]: 'IconDefence.png',
        [Constants.Stats.HP_P]: 'IconMaxHP.png',
        [Constants.Stats.ATK_P]: 'IconAttack.png',
        [Constants.Stats.DEF_P]: 'IconDefence.png',
        [Constants.Stats.SPD]: 'IconSpeed.png',
        [Constants.Stats.SPD_P]: 'IconSpeed.png',
        [Constants.Stats.CR]: 'IconCriticalChance.png',
        [Constants.Stats.CD]: 'IconCriticalDamage.png',
        [Constants.Stats.EHR]: 'IconStatusProbability.png',
        [Constants.Stats.RES]: 'IconStatusResistance.png',
        [Constants.Stats.BE]: 'IconBreakUp.png',
        [Constants.Stats.ERR]: 'IconEnergyRecovery.png',
        [Constants.Stats.OHB]: 'IconHealRatio.png',
        [Constants.Stats.Physical_DMG]: 'IconPhysicalAddedRatio.png',
        [Constants.Stats.Fire_DMG]: 'IconFireAddedRatio.png',
        [Constants.Stats.Ice_DMG]: 'IconIceAddedRatio.png',
        [Constants.Stats.Lightning_DMG]: 'IconThunderAddedRatio.png',
        [Constants.Stats.Wind_DMG]: 'IconWindAddedRatio.png',
        [Constants.Stats.Quantum_DMG]: 'IconQuantumAddedRatio.png',
        [Constants.Stats.Imaginary_DMG]: 'IconImaginaryAddedRatio.png',
      }
    }
    if (stat == 'CV') return baseUrl + `/assets/misc/cv.png`
    if (stat == Constants.Stats.HP_P && percented) return baseUrl + `/assets/misc/IconMaxHPPercent.png`
    if (stat == Constants.Stats.ATK_P && percented) return baseUrl + `/assets/misc/IconAttackPercent.png`
    if (stat == Constants.Stats.DEF_P && percented) return baseUrl + `/assets/misc/IconDefencePercent.png`
    if (!stat || !iconFromStatMapping[stat]) return Assets.getBlank()

    return baseUrl + `/assets/icon/property/` + iconFromStatMapping[stat]
  },
  getSampleSave: () => {
    return baseUrl + `/sample-save.json`
  },
  getCharacterPortrait: (characterId) => {
    if (!characterId) return Assets.getBlank()
    return baseUrl + `/assets/image/character_portrait_resized/resized${characterId}.png`
  },
  getCharacterPortraitById: (id) => {
    if (!id) {
      console.warn('No id found')
      return Assets.getBlank()
    }

    return baseUrl + `/assets/image/character_portrait_resized/resized${id}.png`
  },
  getCharacterAvatarById: (id) => {
    if (!id) return Assets.getBlank()

    return baseUrl + `/assets/icon/avatar/${id}.png`
  },
  getCharacterIconById: (id) => {
    if (!id) return Assets.getBlank()

    return baseUrl + `/assets/icon/character/${id}.png`
  },

  getCharacterPreview: (character) => {
    if (!character) return Assets.getBlank()
    return baseUrl + `/assets/${character.preview}`
  },
  getCharacterPreviewById: (id) => {
    if (!id) return Assets.getBlank()
    return baseUrl + `/assets/image/character_preview/${id}.png`
  },

  getLightConePortrait: (lightCone) => {
    if (!lightCone) return Assets.getBlank()
    return baseUrl + `/assets/image/light_cone_portrait/${lightCone.id}.png`
  },
  getLightConePortraitById: (lightConeId) => {
    if (!lightConeId) return Assets.getBlank()
    return baseUrl + `/assets/image/light_cone_portrait/${lightConeId}.png`
  },
  getLightConeIconById: (lightConeId) => {
    if (!lightConeId) return Assets.getBlank()
    return baseUrl + `/assets/icon/light_cone/${lightConeId}.png`
  },
  getPath: (path) => {
    if (!path) return Assets.getBlank()
    return baseUrl + `/assets/icon/path/${path}.png`
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
    return baseUrl + `/assets/icon/path/${pathFromClassMapping[c]}.png`
  },

  getElement: (element) => {
    if (!element) return Assets.getBlank()
    if (element == 'Thunder') element = 'Lightning'
    return baseUrl + `/assets/icon/element/${element}.png`
  },
  getBlank: () => {
    return baseUrl + '/assets/misc/blank.png'
  },
  getQuestion: () => {
    return baseUrl + '/assets/misc/tooltip.png'
  },
  getLogo: () => {
    return baseUrl + '/assets/misc/logo.png'
  },
  getDiscord: () => {
    return baseUrl + '/assets/misc/badgediscord.png'
  },
  getStar: () => {
    return baseUrl + '/assets/icon/deco/StarBig.png'
  },
  getGuideImage: (name) => {
    return baseUrl + '/assets/guide/' + name + '.png'
  },
  getInventory: () => {
    return baseUrl + '/assets/icon/sign/ShopMaterialsIcon.png'
  },
  getStarBw: () => {
    return baseUrl + '/assets/icon/sign/QuestMainIcon.png'
  },
  getMisc: (filename) => {
    return baseUrl + '/assets/misc/' + filename
  },

  getPart: (part) => {
    let mapping = {
      [Constants.Parts.Head]: 'partHead',
      [Constants.Parts.Hands]: 'partHands',
      [Constants.Parts.Body]: 'partBody',
      [Constants.Parts.Feet]: 'partFeet',
      [Constants.Parts.PlanarSphere]: 'partPlanarSphere',
      [Constants.Parts.LinkRope]: 'partLinkRope',
    }

    return baseUrl + `/assets/misc/${mapping[part]}.png`
  },

  getSetImage: (set, part) => {
    if (!part) {
      part = 'base'
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
    return baseUrl + `/assets/icon/relic/${setToId[set]}${partToId[part]}.png`
  },
}
