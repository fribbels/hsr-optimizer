export const Assets = {
  getCharacterPortrait: (character) => {
    if (!character) return ''
    return process.env.PUBLIC_URL + `/assets/${character.portrait}`
  },
  getCharacterPortraitById: (id) => {
    if (!id) return ''
    // console.log('getCharacterPortraitById', id, DB.getMetadata().characters[id])

    let character = DB.getMetadata().characters[id]
    return process.env.PUBLIC_URL + `/assets/${character.portrait}`
  },
  getCharacterAvatarById: (id) => {
    if (!id) return ''
    // console.log('getCharacterAvatarById', id, DB.getMetadata().characters[id])

    let character = DB.getMetadata().characters[id]
    return process.env.PUBLIC_URL + `/assets/icon/avatar/${id}.png`
  },
  getCharacterIconById: (id) => {
    if (!id) return ''
    // console.log('getCharacterAvatarById', id, DB.getMetadata().characters[id])

    let character = DB.getMetadata().characters[id]
    return process.env.PUBLIC_URL + `/assets/icon/character/${id}.png`
  },

  getCharacterPreview: (character) => {
    if (!character) return ''
    return process.env.PUBLIC_URL + `/assets/${character.preview}`
  },

  getLightConePortrait: (lightCone) => {
    if (!lightCone) return ''
    return process.env.PUBLIC_URL + `/assets/image/light_cone_portrait/${lightCone.id}.png`
  },
  
  getPath: (path) => {
    if (!path) return ''
    return process.env.PUBLIC_URL + `/assets/icon/path/${path}.png`
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
    return process.env.PUBLIC_URL + `/assets/icon/path/${mapping[c]}.png`
  },

  getElement: (element) => {
    if (!element) return ''
    if (element == 'Thunder') element = 'Lightning'
    return process.env.PUBLIC_URL + `/assets/icon/element/${element}.png`
  },

  getBlank: () => {
    return process.env.PUBLIC_URL + '/assets/misc/blank.png'
  },

  getQuestion: () => {
    return process.env.PUBLIC_URL + '/assets/misc/tooltip.png'
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

    return process.env.PUBLIC_URL + `/assets/misc/${mapping[part]}.png`
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
    let path = process.env.PUBLIC_URL + `/assets/icon/relic/${setToId[set]}${partToId[part]}.png`
    return path;
  }
}