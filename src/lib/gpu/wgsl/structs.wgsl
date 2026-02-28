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
  PHYSICAL_DMG_BOOST: f32,
  FIRE_DMG_BOOST: f32,
  ICE_DMG_BOOST: f32,
  LIGHTNING_DMG_BOOST: f32,
  WIND_DMG_BOOST: f32,
  QUANTUM_DMG_BOOST: f32,
  IMAGINARY_DMG_BOOST: f32,
  relicSet: f32, // 22
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
  PHYSICAL_DMG_BOOST: f32,
  FIRE_DMG_BOOST: f32,
  ICE_DMG_BOOST: f32,
  LIGHTNING_DMG_BOOST: f32,
  WIND_DMG_BOOST: f32,
  QUANTUM_DMG_BOOST: f32,
  IMAGINARY_DMG_BOOST: f32,
  ELATION: f32,
}

struct Sets {
  relicMatch2: u32,   // bit N set = relic set N has >= 2 pieces
  relicMatch4: u32,   // bit N set = relic set N has 4 pieces
  ornamentMatch2: u32, // bit N set = ornament set N has 2 pieces
}

// Bitmask set accessors: extract whether set at bit index has 2p/4p
fn relic2p(s: Sets, bit: u32) -> f32 { return f32((s.relicMatch2 >> bit) & 1u); }
fn relic4p(s: Sets, bit: u32) -> f32 { return f32((s.relicMatch4 >> bit) & 1u); }
fn ornament2p(s: Sets, bit: u32) -> f32 { return f32((s.ornamentMatch2 >> bit) & 1u); }

struct SetConditionals {
  enabledHunterOfGlacialForest: bool,
  enabledFiresmithOfLavaForging: bool,
  enabledGeniusOfBrilliantStars: bool,
  enabledBandOfSizzlingThunder: bool,
  enabledMessengerTraversingHackerspace: bool,
  enabledCelestialDifferentiator: bool,
  enabledWatchmakerMasterOfDreamMachinations: bool,
  enabledPenaconyLandOfTheDreams: bool,
  enabledIzumoGenseiAndTakamaDivineRealm: bool,
  enabledForgeOfTheKalpagniLantern: bool,
  enabledTheWindSoaringValorous: bool,
  enabledTheWondrousBananAmusementPark: bool,
  enabledScholarLostInErudition: bool,
  enabledHeroOfTriumphantSong: bool,
  enabledWarriorGoddessOfSunAndThunder: bool,
  enabledWavestriderCaptain: bool,
  enabledWorldRemakingDeliverer: bool,
  enabledSelfEnshroudedRecluse: bool,
  enabledDivinerOfDistantReach: bool,
  enabledAmphoreusTheEternalLand: bool,
  enabledTengokuLivestream: bool,
  valueChampionOfStreetwiseBoxing: i32,
  valueWastelanderOfBanditryDesert: i32,
  valueLongevousDisciple: i32,
  valueTheAshblazingGrandDuke: i32,
  valuePrisonerInDeepConfinement: i32,
  valuePioneerDiverOfDeadWaters: i32,
  valueSigoniaTheUnclaimedDesolation: i32,
  valueDuranDynastyOfRunningWolves: i32,
  valueSacerdosRelivedOrdeal: i32,
  valueArcadiaOfWovenDreams: i32,
  valueEverGloriousMagicalGirl: i32
}

struct Action {
  abilityType: f32,
  setConditionals: SetConditionals,
}

struct Params {
  xl: f32,
  xp: f32,
  xf: f32,
  xb: f32,
  xg: f32,
  xh: f32,
  threshold: f32,
  permLimit: f32,
}
