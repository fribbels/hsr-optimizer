let baseUrl = process.env.PUBLIC_URL;

export const Assets = {
  getSampleSave: () => {
    return baseUrl + `/sample-save.json`
  },

  getCharacterPortrait: (character) => {
    if (!character) return ''
    return baseUrl + `/assets/${character.portrait}`
  },
  getCharacterPortraitById: (id) => {
    if (!id) return ''

    let character = DB.getMetadata().characters[id]
    return baseUrl + `/assets/${character.portrait}`
  },
  getCharacterAvatarById: (id) => {
    if (!id) return ''

    return baseUrl + `/assets/icon/avatar/${id}.png`
  },
  getCharacterIconById: (id) => {
    if (!id) return ''

    return baseUrl + `/assets/icon/character/${id}.png`
  },

  getCharacterPreview: (character) => {
    if (!character) return ''
    return baseUrl + `/assets/${character.preview}`
  },

  getLightConePortrait: (lightCone) => {
    if (!lightCone) return ''
    return baseUrl + `/assets/image/light_cone_portrait/${lightCone.id}.png`
  },
  
  getPath: (path) => {
    if (!path) return ''
    return baseUrl + `/assets/icon/path/${path}.png`
  },

  getPathFromClass: (c) => {
    let mapping = {
      'Warrior': 'Destruction',
      'Warlock': 'Nihility',
      'Knight': 'Preservation',
      'Priest': 'Abundance',
      'Rogue': 'Hunt',
      'Shaman': 'Harmony',
      'Mage': 'Erudition',
    }
    if (!c || !mapping[c]) return ''
    return baseUrl + `/assets/icon/path/${mapping[c]}.png`
  },

  getElement: (element) => {
    if (!element) return ''
    if (element == 'Thunder') element = 'Lightning'
    return baseUrl + `/assets/icon/element/${element}.png`
  },

  getBlank: () => {
    return baseUrl + '/assets/misc/blank.png'
  },

  getQuestion: () => {
    return baseUrl + '/assets/misc/tooltip.png'
  },

  getPart: (part) => {
    let mapping = {
      [Constants.Parts.Head]: 'head',
      [Constants.Parts.Hands]: 'hands',
      [Constants.Parts.Body]: 'body',
      [Constants.Parts.Feet]: 'feet',
      [Constants.Parts.PlanarSphere]: 'planarSphere',
      [Constants.Parts.LinkRope]: 'linkRope',
    }

    return baseUrl + `/assets/misc/${mapping[part]}.png`
  },

  getSetImage: (set, part) => {
    if (!part) {
      part = 'base'
    }
    const setToId = {
      [Constants.Sets.BandOfSizzlingThunder]: '109',
      [Constants.Sets.ChampionOfStreetwiseBoxing]: '105',
      [Constants.Sets.EagleOfTwilightLine]: '110',
      [Constants.Sets.FiresmithOfLavaForging]: '107',
      [Constants.Sets.GeniusOfBrilliantStars]: '108',
      [Constants.Sets.HunterOfGlacialForest]: '104',
      [Constants.Sets.KnightOfPurityPalace]: '103',
      [Constants.Sets.MessengerTraversingHackerspace]: '114',
      [Constants.Sets.GuardOfWutheringSnow]: '106',
      [Constants.Sets.LongevousDisciple]: '113',
      [Constants.Sets.MusketeerOfWildWheat]: '102',
      [Constants.Sets.PasserbyOfWanderingCloud]: '101',
      [Constants.Sets.ThiefOfShootingMeteor]: '111',
      [Constants.Sets.WastelanderOfBanditryDesert]: '112',
      
      [Constants.Sets.BelobogOfTheArchitects]: '304',
      [Constants.Sets.BrokenKeel]: '310',
      [Constants.Sets.CelestialDifferentiator]: '305',
      [Constants.Sets.FleetOfTheAgeless]: '302',
      [Constants.Sets.InertSalsotto]: '306',
      [Constants.Sets.PanCosmicCommercialEnterprise]: '303',
      [Constants.Sets.RutilantArena]: '309',
      [Constants.Sets.SpaceSealingStation]: '301',
      [Constants.Sets.SprightlyVonwacq]: '308',
      [Constants.Sets.TaliaKingdomOfBanditry]: '307',
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
    let path = baseUrl + `/assets/icon/relic/${setToId[set]}${partToId[part]}.png`
    return path;
  }
}