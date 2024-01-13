export const Stats = {
  HP_P: 'HP%',
  ATK_P: 'ATK%',
  DEF_P: 'DEF%',
  SPD_P: 'SPD%',
  HP: 'HP',
  ATK: 'ATK',
  DEF: 'DEF',
  SPD: 'SPD',
  CD: 'CRIT DMG',
  CR: 'CRIT Rate',
  EHR: 'Effect Hit Rate',
  RES: 'Effect RES',
  BE: 'Break Effect',
  ERR: 'Energy Regeneration Rate',
  OHB: 'Outgoing Healing Boost',
  Physical_DMG: 'Physical DMG Boost',
  Fire_DMG: 'Fire DMG Boost',
  Ice_DMG: 'Ice DMG Boost',
  Lightning_DMG: 'Lightning DMG Boost',
  Wind_DMG: 'Wind DMG Boost',
  Quantum_DMG: 'Quantum DMG Boost',
  Imaginary_DMG: 'Imaginary DMG Boost'
}

export const MainStats = [
  Stats.HP_P,
  Stats.ATK_P,
  Stats.DEF_P,
  Stats.HP,
  Stats.ATK,
  Stats.SPD,
  Stats.CR,
  Stats.CD,
  Stats.EHR,
  Stats.BE,
  Stats.ERR,
  Stats.OHB,
  Stats.Physical_DMG,
  Stats.Fire_DMG,
  Stats.Ice_DMG,
  Stats.Lightning_DMG,
  Stats.Wind_DMG,
  Stats.Quantum_DMG,
  Stats.Imaginary_DMG,
]

export const SubStats = [
  Stats.HP_P,
  Stats.ATK_P,
  Stats.DEF_P,
  Stats.HP,
  Stats.ATK,
  Stats.DEF,
  Stats.SPD,
  Stats.CR,
  Stats.CD,
  Stats.EHR,
  Stats.RES,
  Stats.BE,
]

export const StatsToReadable = {
  [Stats.HP_P]: 'HP %',
  [Stats.ATK_P]: 'ATK %',
  [Stats.DEF_P]: 'DEF %',
  [Stats.SPD_P]: 'SPD %',
  [Stats.HP]: 'HP',
  [Stats.ATK]: 'ATK',
  [Stats.DEF]: 'DEF',
  [Stats.SPD]: 'SPD',
  [Stats.CR]: 'CRIT Rate',
  [Stats.CD]: 'CRIT DMG',
  [Stats.EHR]: 'Effect Hit Rate',
  [Stats.RES]: 'Effect RES',
  [Stats.BE]: 'Break Effect',
  [Stats.ERR]: 'Energy Regen',
  [Stats.OHB]: 'Healing Boost',
  [Stats.Physical_DMG]: 'Physical DMG',
  [Stats.Fire_DMG]: 'Fire DMG',
  [Stats.Ice_DMG]: 'Ice DMG',
  [Stats.Lightning_DMG]: 'Lightning DMG',
  [Stats.Wind_DMG]: 'Wind DMG',
  [Stats.Quantum_DMG]: 'Quantum DMG',
  [Stats.Imaginary_DMG]: 'Imaginary DMG'
}

export var StatsToIndex = {

}
let i = 0;
Object.values(Stats).map(x => StatsToIndex[x] = i++) 

export const Parts = {
  Head: 'Head',
  Hands: 'Hands',
  Body: 'Body',
  Feet: 'Feet',
  PlanarSphere: 'PlanarSphere',
  LinkRope: 'LinkRope'
};
export const PartsToReadable = {
  [Parts.Head]: 'Head',
  [Parts.Hands]: 'Hands',
  [Parts.Body]: 'Body',
  [Parts.Feet]: 'Feet',
  [Parts.PlanarSphere]: 'Sphere',
  [Parts.LinkRope]: 'Rope'
};

export const SetsRelics = {
  'PasserbyOfWanderingCloud': 'Passerby of Wandering Cloud',
  'MusketeerOfWildWheat': 'Musketeer of Wild Wheat',
  'KnightOfPurityPalace': 'Knight of Purity Palace',
  'HunterOfGlacialForest': 'Hunter of Glacial Forest',
  'ChampionOfStreetwiseBoxing': 'Champion of Streetwise Boxing',
  'GuardOfWutheringSnow': 'Guard of Wuthering Snow',
  'FiresmithOfLavaForging': 'Firesmith of Lava-Forging',
  'GeniusOfBrilliantStars': 'Genius of Brilliant Stars',
  'BandOfSizzlingThunder': 'Band of Sizzling Thunder',
  'EagleOfTwilightLine': 'Eagle of Twilight Line',
  'ThiefOfShootingMeteor': 'Thief of Shooting Meteor',
  'WastelanderOfBanditryDesert': 'Wastelander of Banditry Desert',
  'LongevousDisciple': 'Longevous Disciple',
  'MessengerTraversingHackerspace': 'Messenger Traversing Hackerspace',
  'TheAshblazingGrandDuke': 'The Ashblazing Grand Duke',
  'PrisonerInDeepConfinement': 'Prisoner in Deep Confinement',
}

export const SetsOrnaments = {
  'SpaceSealingStation': 'Space Sealing Station',
  'FleetOfTheAgeless': 'Fleet of the Ageless',
  'PanCosmicCommercialEnterprise': 'Pan-Cosmic Commercial Enterprise',
  'BelobogOfTheArchitects': 'Belobog of the Architects',
  'CelestialDifferentiator': 'Celestial Differentiator',
  'InertSalsotto': 'Inert Salsotto',
  'TaliaKingdomOfBanditry': 'Talia: Kingdom of Banditry',
  'SprightlyVonwacq': 'Sprightly Vonwacq',
  'RutilantArena': 'Rutilant Arena',
  'BrokenKeel': 'Broken Keel',
  'FirmamentFrontlineGlamoth': 'Firmament Frontline: Glamoth',
  'PenaconyLandOfTheDreams': 'Penacony, Land of the Dreams',
}

export const Sets = {
  ...SetsRelics,
  ...SetsOrnaments
}

export const SetsRelicsNames = Object.values(SetsRelics)
export const SetsOrnamentsNames = Object.values(SetsOrnaments)

const OrnamentSetToIndex = {}
for (let i = 0; i < SetsOrnamentsNames.length; i++) {
  OrnamentSetToIndex[SetsOrnamentsNames[i]] = i
}

const RelicSetToIndex = {}
for (let i = 0; i < SetsRelicsNames.length; i++) {
  RelicSetToIndex[SetsRelicsNames[i]] = i
}

// let StatMaxes = {
//   [Stats.HP_P]: 43.2,
//   [Stats.ATK_P]: 43.2,
//   [Stats.DEF_P]: 54,
//   [Stats.HP]: 705,
//   [Stats.ATK]: 352,
//   [Stats.CR]: 32.4,
//   [Stats.CD]: 64.8,
//   [Stats.OHB]: 34.5,
//   [Stats.EHR]: 43.2,
//   [Stats.SPD]: 25,
//   [Stats.BE]: 64.8,
//   [Stats.ERR]: 19.4,
//   [Stats.Physical_DMG]: 38.8,
//   [Stats.Fire_DMG]: 38.8,
//   [Stats.Ice_DMG]: 38.8,
//   [Stats.Lightning_DMG]: 38.8,
//   [Stats.Wind_DMG]: 38.8,
//   [Stats.Quantum_DMG]: 38.8,
//   [Stats.Imaginary_DMG]: 38.8,
// }

export const Constants = {
  Sets,
  Parts,
  Stats,
  MainStats,
  SubStats,
  StatsToIndex,
  SetsOrnaments,
  SetsRelics,
  SetsRelicsNames,
  SetsOrnamentsNames,
  StatsToReadable,
  PartsToReadable,
  RelicSetToIndex,
  OrnamentSetToIndex,
  // StatMaxes,
  MAX_INT: 2147483647,
}