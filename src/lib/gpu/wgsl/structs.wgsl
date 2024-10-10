struct Relic {
  HP_P: f32,
  ATK_P: f32,
  DEF_P: f32,
  SPD_P: f32,
  HP: f32,
  ATK: f32,
  DEF: f32,
  SPD: f32,
  CR: f32,
  CD: f32,
  EHR: f32,
  RES: f32,
  BE: f32,
  ERR: f32,
  OHB: f32,
  Physical_DMG: f32,
  Fire_DMG: f32,
  Ice_DMG: f32,
  Lightning_DMG: f32,
  Wind_DMG: f32,
  Quantum_DMG: f32,
  Imaginary_DMG: f32,
  relicSet: f32,
  weightScore: f32, // 23
}

struct BasicStats {
  HP_P: f32,
  ATK_P: f32,
  DEF_P: f32,
  SPD_P: f32,
  HP: f32,
  ATK: f32,
  DEF: f32,
  SPD: f32,
  CR: f32,
  CD: f32,
  EHR: f32,
  RES: f32,
  BE: f32,
  ERR: f32,
  OHB: f32,
  Physical_DMG: f32,
  Fire_DMG: f32,
  Ice_DMG: f32,
  Lightning_DMG: f32,
  Wind_DMG: f32,
  Quantum_DMG: f32,
  Imaginary_DMG: f32,
  weightScore: f32,
}

struct Sets {
  PasserbyOfWanderingCloud: i32,
  MusketeerOfWildWheat: i32,
  KnightOfPurityPalace: i32,
  HunterOfGlacialForest: i32,
  ChampionOfStreetwiseBoxing: i32,
  GuardOfWutheringSnow: i32,
  FiresmithOfLavaForging: i32,
  GeniusOfBrilliantStars: i32,
  BandOfSizzlingThunder: i32,
  EagleOfTwilightLine: i32,
  ThiefOfShootingMeteor: i32,
  WastelanderOfBanditryDesert: i32,
  LongevousDisciple: i32,
  MessengerTraversingHackerspace: i32,
  TheAshblazingGrandDuke: i32,
  PrisonerInDeepConfinement: i32,
  PioneerDiverOfDeadWaters: i32,
  WatchmakerMasterOfDreamMachinations: i32,
  IronCavalryAgainstTheScourge: i32,
  TheWindSoaringValorous: i32,
  SacerdosRelivedOrdeal: i32,
  ScholarLostInErudition: i32,
  SpaceSealingStation: i32,
  FleetOfTheAgeless: i32,
  PanCosmicCommercialEnterprise: i32,
  BelobogOfTheArchitects: i32,
  CelestialDifferentiator: i32,
  InertSalsotto: i32,
  TaliaKingdomOfBanditry: i32,
  SprightlyVonwacq: i32,
  RutilantArena: i32,
  BrokenKeel: i32,
  FirmamentFrontlineGlamoth: i32,
  PenaconyLandOfTheDreams: i32,
  SigoniaTheUnclaimedDesolation: i32,
  IzumoGenseiAndTakamaDivineRealm: i32,
  DuranDynastyOfRunningWolves: i32,
  ForgeOfTheKalpagniLantern: i32,
  LushakaTheSunkenSeas: i32,
  TheWondrousBananAmusementPark: i32,
}

struct SetConditionals {
  enabledHunterOfGlacialForest: bool,
  enabledFiresmithOfLavaForging: bool,
  enabledGeniusOfBrilliantStars: bool,
  enabledBandOfSizzlingThunder: bool,
  enabledMessengerTraversingHackerspace: bool,
  enabledCelestialDifferentiator: bool,
  enabledWatchmakerMasterOfDreamMachinations: bool,
  enabledIzumoGenseiAndTakamaDivineRealm: bool,
  enabledForgeOfTheKalpagniLantern: bool,
  enabledTheWindSoaringValorous: bool,
  enabledTheWondrousBananAmusementPark: bool,
  enabledScholarLostInErudition: bool,
  valueChampionOfStreetwiseBoxing: i32,
  valueWastelanderOfBanditryDesert: i32,
  valueLongevousDisciple: i32,
  valueTheAshblazingGrandDuke: i32,
  valuePrisonerInDeepConfinement: i32,
  valuePioneerDiverOfDeadWaters: i32,
  valueSigoniaTheUnclaimedDesolation: i32,
  valueDuranDynastyOfRunningWolves: i32,
}

struct Action {
  abilityType: i32,
  setConditionals: SetConditionals,
  x: ComputedStats,
  state: ConditionalState,
}

struct Params {
  lSize: f32,
  pSize: f32,
  fSize: f32,
  bSize: f32,
  gSize: f32,
  hSize: f32,

  xl: f32,
  xp: f32,
  xf: f32,
  xb: f32,
  xg: f32,
  xh: f32,

  threshold: f32,

  relicSetCount: f32,
  ornamentSetCount: f32,

  characterHP_P: f32,
  characterATK_P: f32,
  characterDEF_P: f32,
  characterSPD_P: f32,
  characterHP: f32,
  characterATK: f32,
  characterDEF: f32,
  characterSPD: f32,
  characterCR: f32,
  characterCD: f32,
  characterEHR: f32,
  characterRES: f32,
  characterBE: f32,
  characterERR: f32,
  characterOHB: f32,
  characterPhysical_DMG: f32,
  characterFire_DMG: f32,
  characterIce_DMG: f32,
  characterLightning_DMG: f32,
  characterWind_DMG: f32,
  characterQuantum_DMG: f32,
  characterImaginary_DMG: f32,

  lcHP_P: f32,
  lcATK_P: f32,
  lcDEF_P: f32,
  lcSPD_P: f32,
  lcHP: f32,
  lcATK: f32,
  lcDEF: f32,
  lcSPD: f32,
  lcCR: f32,
  lcCD: f32,
  lcEHR: f32,
  lcRES: f32,
  lcBE: f32,
  lcERR: f32,
  lcOHB: f32,
  lcPhysical_DMG: f32,
  lcFire_DMG: f32,
  lcIce_DMG: f32,
  lcLightning_DMG: f32,
  lcWind_DMG: f32,
  lcQuantum_DMG: f32,
  lcImaginary_DMG: f32,

  traceHP_P: f32,
  traceATK_P: f32,
  traceDEF_P: f32,
  traceSPD_P: f32,
  traceHP: f32,
  traceATK: f32,
  traceDEF: f32,
  traceSPD: f32,
  traceCR: f32,
  traceCD: f32,
  traceEHR: f32,
  traceRES: f32,
  traceBE: f32,
  traceERR: f32,
  traceOHB: f32,
  tracePhysical_DMG: f32,
  traceFire_DMG: f32,
  traceIce_DMG: f32,
  traceLightning_DMG: f32,
  traceWind_DMG: f32,
  traceQuantum_DMG: f32,
  traceImaginary_DMG: f32,
}