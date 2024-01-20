export const Stats = {
  ATK_P: 'ATK%',
  ATK: 'ATK',
  BE: 'Break Effect',
  CD: 'CRIT DMG',
  CR: 'CRIT Rate',
  DEF_P: 'DEF%',
  DEF: 'DEF',
  EHR: 'Effect Hit Rate',
  ERR: 'Energy Regeneration Rate',
  Fire_DMG: 'Fire DMG Boost',
  HP_P: 'HP%',
  HP: 'HP',
  Ice_DMG: 'Ice DMG Boost',
  Imaginary_DMG: 'Imaginary DMG Boost',
  Lightning_DMG: 'Lightning DMG Boost',
  OHB: 'Outgoing Healing Boost',
  Physical_DMG: 'Physical DMG Boost',
  Quantum_DMG: 'Quantum DMG Boost',
  RES: 'Effect RES',
  SPD_P: 'SPD%',
  SPD: 'SPD',
  Wind_DMG: 'Wind DMG Boost'
};
export type Stats = typeof Stats[keyof typeof Stats];

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
];
export type MainStats = typeof MainStats[number];

export const SubStats = [
  Stats.ATK_P,
  Stats.ATK,
  Stats.BE,
  Stats.CD,
  Stats.CR,
  Stats.DEF_P,
  Stats.DEF,
  Stats.EHR,
  Stats.HP_P,
  Stats.HP,
  Stats.RES,
  Stats.SPD,
];
export type SubStats = typeof SubStats[number];

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

export const StatsToIndex = {

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
export type Parts = typeof Parts[keyof typeof Parts];

export const PartsToReadable = {
  [Parts.Head]: 'Head',
  [Parts.Hands]: 'Hands',
  [Parts.Body]: 'Body',
  [Parts.Feet]: 'Feet',
  [Parts.PlanarSphere]: 'Sphere',
  [Parts.LinkRope]: 'Rope'
};
export type PartsToReadable = typeof PartsToReadable[keyof typeof PartsToReadable];

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
};
export type SetsRelics = typeof SetsRelics[keyof typeof SetsRelics];

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
};
export type SetsOrnaments = typeof SetsOrnaments[keyof typeof SetsOrnaments];

export const Sets = {
  ...SetsRelics,
  ...SetsOrnaments
}
export type Sets = typeof Sets[keyof typeof Sets];

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