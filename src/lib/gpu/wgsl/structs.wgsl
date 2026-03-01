struct Relic {
  v0: vec4<f32>,  // HP_P, ATK_P, DEF_P, SPD_P
  v1: vec4<f32>,  // HP, ATK, DEF, SPD
  v2: vec4<f32>,  // CR, CD, EHR, RES
  v3: vec4<f32>,  // BE, ERR, OHB, PHYSICAL_DMG_BOOST
  v4: vec4<f32>,  // FIRE, ICE, LIGHTNING, WIND
  v5: vec4<f32>,  // QUANTUM, IMAGINARY, relicSet, _pad
}

struct OuterRelicStats {
  s0: vec4<f32>,
  s1: vec4<f32>,
  s2: vec4<f32>,
  s3: vec4<f32>,
  s4: vec4<f32>,
  s5: vec4<f32>,
}

fn sumOuterRelics(head: Relic, hands: Relic, body: Relic, feet: Relic) -> OuterRelicStats {
  return OuterRelicStats(
    head.v0 + hands.v0 + body.v0 + feet.v0,
    head.v1 + hands.v1 + body.v1 + feet.v1,
    head.v2 + hands.v2 + body.v2 + feet.v2,
    head.v3 + hands.v3 + body.v3 + feet.v3,
    head.v4 + hands.v4 + body.v4 + feet.v4,
    head.v5 + hands.v5 + body.v5 + feet.v5,
  );
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
