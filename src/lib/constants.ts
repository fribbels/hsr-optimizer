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
  Wind_DMG: 'Wind DMG Boost',
}
export type StatsKeys = keyof typeof Stats
export type StatsValues = (typeof Stats)[StatsKeys]

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
export type MainStats = typeof MainStats[number]

export const MainStatsValues = {
  [Stats.HP_P]: { 5: { base: 6.912, increment: 2.4192 }, 4: { base: 5.5296, increment: 1.9354 }, 3: { base: 4.1472, increment: 1.4515 }, 2: { base: 2.7648, increment: 0.9677 } },
  [Stats.ATK_P]: { 5: { base: 6.912, increment: 2.4192 }, 4: { base: 5.5296, increment: 1.9354 }, 3: { base: 4.1472, increment: 1.4515 }, 2: { base: 2.7648, increment: 0.9677 } },
  [Stats.DEF_P]: { 5: { base: 8.64, increment: 3.024 }, 4: { base: 6.912, increment: 2.4192 }, 3: { base: 5.184, increment: 1.8144 }, 2: { base: 3.456, increment: 1.2096 } },
  [Stats.HP]: { 5: { base: 112.896, increment: 39.5136 }, 4: { base: 90.3168, increment: 31.61088 }, 3: { base: 67.7376, increment: 23.70816 }, 2: { base: 45.1584, increment: 15.80544 } },
  [Stats.ATK]: { 5: { base: 56.448, increment: 19.7568 }, 4: { base: 45.1584, increment: 15.80544 }, 3: { base: 33.8688, increment: 11.85408 }, 2: { base: 22.5792, increment: 7.90272 } },
  [Stats.SPD]: { 5: { base: 4.032, increment: 1.4 }, 4: { base: 3.226, increment: 1.1 }, 3: { base: 2.419, increment: 1.0 }, 2: { base: 1.613, increment: 1.0 } },
  [Stats.CR]: { 5: { base: 5.184, increment: 1.8144 }, 4: { base: 4.1472, increment: 1.4515 }, 3: { base: 3.1104, increment: 1.0886 }, 2: { base: 2.0736, increment: 0.7258 } },
  [Stats.CD]: { 5: { base: 10.368, increment: 3.6288 }, 4: { base: 8.2944, increment: 2.9030 }, 3: { base: 6.2208, increment: 2.1773 }, 2: { base: 4.1472, increment: 1.4515 } },
  [Stats.EHR]: { 5: { base: 6.912, increment: 2.4192 }, 4: { base: 5.5296, increment: 1.9354 }, 3: { base: 4.1472, increment: 1.4515 }, 2: { base: 2.7648, increment: 0.9677 } },
  [Stats.BE]: { 5: { base: 10.3680, increment: 3.6288 }, 4: { base: 8.2944, increment: 2.9030 }, 3: { base: 6.2208, increment: 2.1773 }, 2: { base: 4.1472, increment: 1.4515 } },
  [Stats.ERR]: { 5: { base: 3.1104, increment: 1.0886 }, 4: { base: 2.4883, increment: 0.8709 }, 3: { base: 1.8662, increment: 0.6532 }, 2: { base: 1.2442, increment: 0.4355 } },
  [Stats.OHB]: { 5: { base: 5.5296, increment: 1.9354 }, 4: { base: 4.4237, increment: 1.5483 }, 3: { base: 3.3178, increment: 1.1612 }, 2: { base: 2.2118, increment: 0.7741 } },
  [Stats.Physical_DMG]: { 5: { base: 6.2208, increment: 2.1773 }, 4: { base: 4.9766, increment: 1.7418 }, 3: { base: 3.7325, increment: 1.3064 }, 2: { base: 2.4883, increment: 0.8709 } },
  [Stats.Fire_DMG]: { 5: { base: 6.2208, increment: 2.1773 }, 4: { base: 4.9766, increment: 1.7418 }, 3: { base: 3.7325, increment: 1.3064 }, 2: { base: 2.4883, increment: 0.8709 } },
  [Stats.Ice_DMG]: { 5: { base: 6.2208, increment: 2.1773 }, 4: { base: 4.9766, increment: 1.7418 }, 3: { base: 3.7325, increment: 1.3064 }, 2: { base: 2.4883, increment: 0.8709 } },
  [Stats.Lightning_DMG]: { 5: { base: 6.2208, increment: 2.1773 }, 4: { base: 4.9766, increment: 1.7418 }, 3: { base: 3.7325, increment: 1.3064 }, 2: { base: 2.4883, increment: 0.8709 } },
  [Stats.Wind_DMG]: { 5: { base: 6.2208, increment: 2.1773 }, 4: { base: 4.9766, increment: 1.7418 }, 3: { base: 3.7325, increment: 1.3064 }, 2: { base: 2.4883, increment: 0.8709 } },
  [Stats.Quantum_DMG]: { 5: { base: 6.2208, increment: 2.1773 }, 4: { base: 4.9766, increment: 1.7418 }, 3: { base: 3.7325, increment: 1.3064 }, 2: { base: 2.4883, increment: 0.8709 } },
  [Stats.Imaginary_DMG]: { 5: { base: 6.2208, increment: 2.1773 }, 4: { base: 4.9766, increment: 1.7418 }, 3: { base: 3.7325, increment: 1.3064 }, 2: { base: 2.4883, increment: 0.8709 } },
}

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
  Stats.BE,
  Stats.RES,
]
export type SubStats = typeof SubStats[number]

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
  [Stats.Imaginary_DMG]: 'Imaginary DMG',
}

export const Parts = {
  Head: 'Head',
  Hands: 'Hands',
  Body: 'Body',
  Feet: 'Feet',
  PlanarSphere: 'PlanarSphere',
  LinkRope: 'LinkRope',
}
export type Parts = typeof Parts[keyof typeof Parts]

export const PartsToReadable = {
  [Parts.Head]: 'Head',
  [Parts.Hands]: 'Hands',
  [Parts.Body]: 'Body',
  [Parts.Feet]: 'Feet',
  [Parts.PlanarSphere]: 'Sphere',
  [Parts.LinkRope]: 'Rope',
}
export type PartsToReadable = typeof PartsToReadable[keyof typeof PartsToReadable]

export const PartsMainStats = {
  [Parts.Head]: [Stats.HP],
  [Parts.Hands]: [Stats.ATK],
  [Parts.Body]: [Stats.HP_P, Stats.ATK_P, Stats.DEF_P, Stats.CR, Stats.CD, Stats.OHB, Stats.EHR],
  [Parts.Feet]: [Stats.HP_P, Stats.ATK_P, Stats.DEF_P, Stats.SPD],
  [Parts.PlanarSphere]: [Stats.HP_P, Stats.ATK_P, Stats.DEF_P, Stats.Physical_DMG, Stats.Fire_DMG, Stats.Ice_DMG, Stats.Lightning_DMG, Stats.Wind_DMG, Stats.Quantum_DMG, Stats.Imaginary_DMG],
  [Parts.LinkRope]: [Stats.HP_P, Stats.ATK_P, Stats.DEF_P, Stats.BE, Stats.ERR],
}

export const SetsRelics = {
  PasserbyOfWanderingCloud: 'Passerby of Wandering Cloud',
  MusketeerOfWildWheat: 'Musketeer of Wild Wheat',
  KnightOfPurityPalace: 'Knight of Purity Palace',
  HunterOfGlacialForest: 'Hunter of Glacial Forest',
  ChampionOfStreetwiseBoxing: 'Champion of Streetwise Boxing',
  GuardOfWutheringSnow: 'Guard of Wuthering Snow',
  FiresmithOfLavaForging: 'Firesmith of Lava-Forging',
  GeniusOfBrilliantStars: 'Genius of Brilliant Stars',
  BandOfSizzlingThunder: 'Band of Sizzling Thunder',
  EagleOfTwilightLine: 'Eagle of Twilight Line',
  ThiefOfShootingMeteor: 'Thief of Shooting Meteor',
  WastelanderOfBanditryDesert: 'Wastelander of Banditry Desert',
  LongevousDisciple: 'Longevous Disciple',
  MessengerTraversingHackerspace: 'Messenger Traversing Hackerspace',
  TheAshblazingGrandDuke: 'The Ashblazing Grand Duke',
  PrisonerInDeepConfinement: 'Prisoner in Deep Confinement',
  PioneerDiverOfDeadWaters: 'Pioneer Diver of Dead Waters',
  WatchmakerMasterOfDreamMachinations: 'Watchmaker, Master of Dream Machinations',
}
export type SetsRelics = typeof SetsRelics[keyof typeof SetsRelics]

export const SetsOrnaments = {
  SpaceSealingStation: 'Space Sealing Station',
  FleetOfTheAgeless: 'Fleet of the Ageless',
  PanCosmicCommercialEnterprise: 'Pan-Cosmic Commercial Enterprise',
  BelobogOfTheArchitects: 'Belobog of the Architects',
  CelestialDifferentiator: 'Celestial Differentiator',
  InertSalsotto: 'Inert Salsotto',
  TaliaKingdomOfBanditry: 'Talia: Kingdom of Banditry',
  SprightlyVonwacq: 'Sprightly Vonwacq',
  RutilantArena: 'Rutilant Arena',
  BrokenKeel: 'Broken Keel',
  FirmamentFrontlineGlamoth: 'Firmament Frontline: Glamoth',
  PenaconyLandOfTheDreams: 'Penacony, Land of the Dreams',
}
export type SetsOrnaments = typeof SetsOrnaments[keyof typeof SetsOrnaments]

export const Sets = {
  ...SetsRelics,
  ...SetsOrnaments,
}
export type Sets = typeof Sets[keyof typeof Sets]

export const SetsRelicsNames = Object.values(SetsRelics)
export const SetsOrnamentsNames = Object.values(SetsOrnaments)

export const OrnamentSetToIndex: { [key: string]: number } = {}
for (let i = 0; i < SetsOrnamentsNames.length; i++) {
  OrnamentSetToIndex[SetsOrnamentsNames[i]] = i
}

export const RelicSetToIndex: { [key: string]: number } = {}
for (let i = 0; i < SetsRelicsNames.length; i++) {
  RelicSetToIndex[SetsRelicsNames[i]] = i
}

export const RelicSetCount = Object.values(SetsRelics).length
export const OrnamentSetCount = Object.values(SetsOrnaments).length

export const PathToClass = {
  Abundance: 'Priest',
  Destruction: 'Warrior',
  Erudition: 'Mage',
  Harmony: 'Shaman',
  Hunt: 'Rogue',
  Nihility: 'Warlock',
  Preservation: 'Knight',
}
export const ClassToPath = {
  Priest: 'Abundance',
  Warrior: 'Destruction',
  Mage: 'Erudition',
  Shaman: 'Harmony',
  Rogue: 'Hunt',
  Warlock: 'Nihility',
  Knight: 'Preservation',
}

export const ElementToDamage = {
  Physical: Stats.Physical_DMG,
  Fire: Stats.Fire_DMG,
  Ice: Stats.Ice_DMG,
  Thunder: Stats.Lightning_DMG,
  Wind: Stats.Wind_DMG,
  Quantum: Stats.Quantum_DMG,
  Imaginary: Stats.Imaginary_DMG,
}

export const ElementToResPenType = {
  Physical: 'PHYSICAL_RES_PEN',
  Fire: 'FIRE_RES_PEN',
  Ice: 'ICE_RES_PEN',
  Thunder: 'LIGHTNING_RES_PEN',
  Wind: 'WIND_RES_PEN',
  Quantum: 'QUANTUM_RES_PEN',
  Imaginary: 'IMAGINARY_RES_PEN',
}

export const Constants = {
  Sets,
  Parts,
  Stats,
  MainStats,
  MainStatsValues,
  SubStats,
  SetsOrnaments,
  SetsRelics,
  SetsRelicsNames,
  SetsOrnamentsNames,
  StatsToReadable,
  PartsToReadable,
  PartsMainStats,
  RelicSetToIndex,
  OrnamentSetToIndex,
  // StatMaxes,
  MAX_INT: 2147483647,
  THREAD_BUFFER_LENGTH: 100000,
}

export const levelOptions = (() => {
  const levelStats: { value: number; label: string }[] = []
  for (let i = 80; i >= 1; i--) {
    levelStats.push({
      value: i,
      label: `Lv. ${i}`,
    })
  }

  return levelStats
})()

export const enemyLevelOptions = (() => {
  const levelStats: { value: number; label: string; number: string }[] = []
  for (let i = 95; i >= 1; i--) {
    levelStats.push({
      value: i,
      label: `Lv. ${i} - ${200 + 10 * i} DEF`,
      number: `Lv. ${i}`,
    })
  }

  return levelStats
})()

export const enemyCountOptions = (() => {
  const levelStats: { value: number; label: string }[] = []
  for (let i = 1; i <= 5; i += 2) {
    levelStats.push({
      value: i,
      label: `${i} target${i > 1 ? 's' : ''}`,
    })
  }

  return levelStats
})()

export const enemyResistanceOptions = (() => {
  const levelStats: { value: number; label: string }[] = []
  for (let i = 20; i <= 60; i += 20) {
    levelStats.push({
      value: i / 100,
      label: `${i}% RES`,
    })
  }

  return levelStats
})()

export const enemyHpPercentOptions = (() => {
  const levelStats: { value: number; label: string }[] = []
  for (let i = 100; i >= 1; i--) {
    levelStats.push({
      value: i / 100,
      label: `${i}% HP`,
    })
  }

  return levelStats
})()

export const superimpositionOptions = (() => {
  return [
    { value: 1, label: 'S1' },
    { value: 2, label: 'S2' },
    { value: 3, label: 'S3' },
    { value: 4, label: 'S4' },
    { value: 5, label: 'S5' },
  ]
})()

export const eidolonOptions = (() => {
  return [
    { value: 0, label: 'E0' },
    { value: 1, label: 'E1' },
    { value: 2, label: 'E2' },
    { value: 3, label: 'E3' },
    { value: 4, label: 'E4' },
    { value: 5, label: 'E5' },
    { value: 6, label: 'E6' },
  ]
})()

export const RelicSetFilterOptions = {
  relic4Piece: '4 Piece',
  relic2Plus2Piece: '2 + 2 Piece',
  relic2PlusAny: '2 + Any',
}

export const DEFAULT_STAT_DISPLAY = 'combat'
export const MAX_RESULTS = 2_000_000
