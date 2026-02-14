// START GPU PARAMS
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
/* INJECT GPU PARAMS */
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
// END GPU PARAMS

// START ACTIONS DEFINITION
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
/* INJECT ACTIONS DEFINITION */
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
// END ACTIONS DEFINITION


const BASIC_DMG_TYPE = 1;
const SKILL_DMG_TYPE = 2;
const ULT_DMG_TYPE = 4;
const FUA_DMG_TYPE = 8;
const DOT_DMG_TYPE = 16;
const BREAK_DMG_TYPE = 32;
const SUPER_BREAK_DMG_TYPE = 64;
const MEMO_DMG_TYPE = 128;
const ADDITIONAL_DMG_TYPE = 256;

const BASIC_ABILITY_TYPE = 1;
const SKILL_ABILITY_TYPE = 2;
const ULT_ABILITY_TYPE = 4;
const FUA_ABILITY_TYPE = 8;
const DOT_ABILITY_TYPE = 16;
const BREAK_ABILITY_TYPE = 32;
const MEMO_SKILL_ABILITY_TYPE = 64;
const MEMO_TALENT_ABILITY_TYPE = 128;


const epsilon = 0.00000001f;

@group(0) @binding(0) var<uniform> params : Params;

@group(1) @binding(0) var<storage> relics : array<Relic>;
@group(1) @binding(1) var<storage> ornamentSetSolutionsMatrix : array<i32>;
@group(1) @binding(2) var<storage> relicSetSolutionsMatrix : array<i32>;

// START RESULTS BUFFER
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
/* INJECT RESULTS BUFFER */
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
// END RESULTS BUFFER

@compute @workgroup_size(WORKGROUP_SIZE)
fn main(
  @builtin(workgroup_id) workgroup_id : vec3<u32>,
  @builtin(local_invocation_id) local_invocation_id : vec3<u32>,
  @builtin(global_invocation_id) global_invocation_id : vec3<u32>,
  @builtin(local_invocation_index) local_invocation_index: u32,
  @builtin(num_workgroups) num_workgroups: vec3<u32>
) {
  let workgroup_index =
    workgroup_id.x +
    workgroup_id.y * num_workgroups.x +
    workgroup_id.z * num_workgroups.x * num_workgroups.y;
  let indexGlobal = i32(workgroup_index * WORKGROUP_SIZE + local_invocation_index);

  // Load offset params
  let xl = i32(params.xl);
  let xp = i32(params.xp);
  let xf = i32(params.xf);
  let xb = i32(params.xb);
  let xg = i32(params.xg);
  let xh = i32(params.xh);
  let threshold = params.threshold;
  let cycleIndex = indexGlobal * CYCLES_PER_INVOCATION;

  var failures: f32 = 1;

  var emptyComputedStats = ComputedStats();

  for (var i = 0; i < CYCLES_PER_INVOCATION; i++) {

    // Calculate global_invocation_index

    let index = cycleIndex + i;

    // Calculate relic index per slot based on the index (global index + invocation index)

    // START RELIC SLOT INDEX STRATEGY
    // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
    /* INJECT RELIC SLOT INDEX STRATEGY */
    // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
    // START RELIC SLOT INDEX STRATEGY

    // Sum this invocation slots with the block offset

    let finalL = (l + xl) % lSize;
    let carryL = (l + xl) / lSize;
    let finalP = (p + xp + carryL) % pSize;
    let carryP = (p + xp + carryL) / pSize;
    let finalF = (f + xf + carryP) % fSize;
    let carryF = (f + xf + carryP) / fSize;
    let finalB = (b + xb + carryF) % bSize;
    let carryB = (b + xb + carryF) / bSize;
    let finalG = (g + xg + carryB) % gSize;
    let carryG = (g + xg + carryB) / gSize;
    let finalH = (h + xh + carryG) % hSize;

    // Calculate Relic structs

    let head         : Relic = (relics[finalH]);
    let hands        : Relic = (relics[finalG + hSize]);
    let body         : Relic = (relics[finalB + hSize + gSize]);
    let feet         : Relic = (relics[finalF + hSize + gSize + bSize]);
    let planarSphere : Relic = (relics[finalP + hSize + gSize + bSize + fSize]);
    let linkRope     : Relic = (relics[finalL + hSize + gSize + bSize + fSize + pSize]);

    // Convert set ID

    let setH: u32 = u32(head.relicSet);
    let setG: u32 = u32(hands.relicSet);
    let setB: u32 = u32(body.relicSet);
    let setF: u32 = u32(feet.relicSet);
    let setP: u32 = u32(planarSphere.relicSet);
    let setL: u32 = u32(linkRope.relicSet);

    // Get the index for set permutation lookup

    let relicSetIndex: u32 = setH + setB * relicSetCount + setG * relicSetCount * relicSetCount + setF * relicSetCount * relicSetCount * relicSetCount;
    let ornamentSetIndex: u32 = setP + setL * ornamentSetCount;

    // START SET FILTERS
    // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
    /* INJECT SET FILTERS */
    // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
    // END SET FILTERS

    // Calculate relic set counts

    var sets = Sets();

    sets.PasserbyOfWanderingCloud            = i32((1 >> (setH ^ 0)) + (1 >> (setG ^ 0)) + (1 >> (setB ^ 0)) + (1 >> (setF ^ 0)));
    sets.MusketeerOfWildWheat                = i32((1 >> (setH ^ 1)) + (1 >> (setG ^ 1)) + (1 >> (setB ^ 1)) + (1 >> (setF ^ 1)));
    sets.KnightOfPurityPalace                = i32((1 >> (setH ^ 2)) + (1 >> (setG ^ 2)) + (1 >> (setB ^ 2)) + (1 >> (setF ^ 2)));
    sets.HunterOfGlacialForest               = i32((1 >> (setH ^ 3)) + (1 >> (setG ^ 3)) + (1 >> (setB ^ 3)) + (1 >> (setF ^ 3)));
    sets.ChampionOfStreetwiseBoxing          = i32((1 >> (setH ^ 4)) + (1 >> (setG ^ 4)) + (1 >> (setB ^ 4)) + (1 >> (setF ^ 4)));
    sets.GuardOfWutheringSnow                = i32((1 >> (setH ^ 5)) + (1 >> (setG ^ 5)) + (1 >> (setB ^ 5)) + (1 >> (setF ^ 5)));
    sets.FiresmithOfLavaForging              = i32((1 >> (setH ^ 6)) + (1 >> (setG ^ 6)) + (1 >> (setB ^ 6)) + (1 >> (setF ^ 6)));
    sets.GeniusOfBrilliantStars              = i32((1 >> (setH ^ 7)) + (1 >> (setG ^ 7)) + (1 >> (setB ^ 7)) + (1 >> (setF ^ 7)));
    sets.BandOfSizzlingThunder               = i32((1 >> (setH ^ 8)) + (1 >> (setG ^ 8)) + (1 >> (setB ^ 8)) + (1 >> (setF ^ 8)));
    sets.EagleOfTwilightLine                 = i32((1 >> (setH ^ 9)) + (1 >> (setG ^ 9)) + (1 >> (setB ^ 9)) + (1 >> (setF ^ 9)));
    sets.ThiefOfShootingMeteor               = i32((1 >> (setH ^ 10)) + (1 >> (setG ^ 10)) + (1 >> (setB ^ 10)) + (1 >> (setF ^ 10)));
    sets.WastelanderOfBanditryDesert         = i32((1 >> (setH ^ 11)) + (1 >> (setG ^ 11)) + (1 >> (setB ^ 11)) + (1 >> (setF ^ 11)));
    sets.LongevousDisciple                   = i32((1 >> (setH ^ 12)) + (1 >> (setG ^ 12)) + (1 >> (setB ^ 12)) + (1 >> (setF ^ 12)));
    sets.MessengerTraversingHackerspace      = i32((1 >> (setH ^ 13)) + (1 >> (setG ^ 13)) + (1 >> (setB ^ 13)) + (1 >> (setF ^ 13)));
    sets.TheAshblazingGrandDuke              = i32((1 >> (setH ^ 14)) + (1 >> (setG ^ 14)) + (1 >> (setB ^ 14)) + (1 >> (setF ^ 14)));
    sets.PrisonerInDeepConfinement           = i32((1 >> (setH ^ 15)) + (1 >> (setG ^ 15)) + (1 >> (setB ^ 15)) + (1 >> (setF ^ 15)));
    sets.PioneerDiverOfDeadWaters            = i32((1 >> (setH ^ 16)) + (1 >> (setG ^ 16)) + (1 >> (setB ^ 16)) + (1 >> (setF ^ 16)));
    sets.WatchmakerMasterOfDreamMachinations = i32((1 >> (setH ^ 17)) + (1 >> (setG ^ 17)) + (1 >> (setB ^ 17)) + (1 >> (setF ^ 17)));
    sets.IronCavalryAgainstTheScourge        = i32((1 >> (setH ^ 18)) + (1 >> (setG ^ 18)) + (1 >> (setB ^ 18)) + (1 >> (setF ^ 18)));
    sets.TheWindSoaringValorous              = i32((1 >> (setH ^ 19)) + (1 >> (setG ^ 19)) + (1 >> (setB ^ 19)) + (1 >> (setF ^ 19)));
    sets.SacerdosRelivedOrdeal               = i32((1 >> (setH ^ 20)) + (1 >> (setG ^ 20)) + (1 >> (setB ^ 20)) + (1 >> (setF ^ 20)));
    sets.ScholarLostInErudition              = i32((1 >> (setH ^ 21)) + (1 >> (setG ^ 21)) + (1 >> (setB ^ 21)) + (1 >> (setF ^ 21)));
    sets.HeroOfTriumphantSong                = i32((1 >> (setH ^ 22)) + (1 >> (setG ^ 22)) + (1 >> (setB ^ 22)) + (1 >> (setF ^ 22)));
    sets.PoetOfMourningCollapse              = i32((1 >> (setH ^ 23)) + (1 >> (setG ^ 23)) + (1 >> (setB ^ 23)) + (1 >> (setF ^ 23)));
    sets.WarriorGoddessOfSunAndThunder       = i32((1 >> (setH ^ 24)) + (1 >> (setG ^ 24)) + (1 >> (setB ^ 24)) + (1 >> (setF ^ 24)));
    sets.WavestriderCaptain                  = i32((1 >> (setH ^ 25)) + (1 >> (setG ^ 25)) + (1 >> (setB ^ 25)) + (1 >> (setF ^ 25)));
    sets.WorldRemakingDeliverer              = i32((1 >> (setH ^ 26)) + (1 >> (setG ^ 26)) + (1 >> (setB ^ 26)) + (1 >> (setF ^ 26)));
    sets.SelfEnshroudedRecluse               = i32((1 >> (setH ^ 27)) + (1 >> (setG ^ 27)) + (1 >> (setB ^ 27)) + (1 >> (setF ^ 27)));
    sets.EverGloriousMagicalGirl             = i32((1 >> (setH ^ 28)) + (1 >> (setG ^ 28)) + (1 >> (setB ^ 28)) + (1 >> (setF ^ 28)));
    sets.DivinerOfDistantReach               = i32((1 >> (setH ^ 29)) + (1 >> (setG ^ 29)) + (1 >> (setB ^ 29)) + (1 >> (setF ^ 29)));


    // Calculate ornament set counts

    if (setP == setL) {
      sets.SpaceSealingStation             = i32((1 >> (setP ^ 0)) + (1 >> (setL ^ 0)));
      sets.FleetOfTheAgeless               = i32((1 >> (setP ^ 1)) + (1 >> (setL ^ 1)));
      sets.PanCosmicCommercialEnterprise   = i32((1 >> (setP ^ 2)) + (1 >> (setL ^ 2)));
      sets.BelobogOfTheArchitects          = i32((1 >> (setP ^ 3)) + (1 >> (setL ^ 3)));
      sets.CelestialDifferentiator         = i32((1 >> (setP ^ 4)) + (1 >> (setL ^ 4)));
      sets.InertSalsotto                   = i32((1 >> (setP ^ 5)) + (1 >> (setL ^ 5)));
      sets.TaliaKingdomOfBanditry          = i32((1 >> (setP ^ 6)) + (1 >> (setL ^ 6)));
      sets.SprightlyVonwacq                = i32((1 >> (setP ^ 7)) + (1 >> (setL ^ 7)));
      sets.RutilantArena                   = i32((1 >> (setP ^ 8)) + (1 >> (setL ^ 8)));
      sets.BrokenKeel                      = i32((1 >> (setP ^ 9)) + (1 >> (setL ^ 9)));
      sets.FirmamentFrontlineGlamoth       = i32((1 >> (setP ^ 10)) + (1 >> (setL ^ 10)));
      sets.PenaconyLandOfTheDreams         = i32((1 >> (setP ^ 11)) + (1 >> (setL ^ 11)));
      sets.SigoniaTheUnclaimedDesolation   = i32((1 >> (setP ^ 12)) + (1 >> (setL ^ 12)));
      sets.IzumoGenseiAndTakamaDivineRealm = i32((1 >> (setP ^ 13)) + (1 >> (setL ^ 13)));
      sets.DuranDynastyOfRunningWolves     = i32((1 >> (setP ^ 14)) + (1 >> (setL ^ 14)));
      sets.ForgeOfTheKalpagniLantern       = i32((1 >> (setP ^ 15)) + (1 >> (setL ^ 15)));
      sets.LushakaTheSunkenSeas            = i32((1 >> (setP ^ 16)) + (1 >> (setL ^ 16)));
      sets.TheWondrousBananAmusementPark   = i32((1 >> (setP ^ 17)) + (1 >> (setL ^ 17)));
      sets.BoneCollectionsSereneDemesne    = i32((1 >> (setP ^ 18)) + (1 >> (setL ^ 18)));
      sets.GiantTreeOfRaptBrooding         = i32((1 >> (setP ^ 19)) + (1 >> (setL ^ 19)));
      sets.ArcadiaOfWovenDreams            = i32((1 >> (setP ^ 20)) + (1 >> (setL ^ 20)));
      sets.RevelryByTheSea                 = i32((1 >> (setP ^ 21)) + (1 >> (setL ^ 21)));
      sets.AmphoreusTheEternalLand         = i32((1 >> (setP ^ 22)) + (1 >> (setL ^ 22)));
      sets.TengokuLivestream               = i32((1 >> (setP ^ 23)) + (1 >> (setL ^ 23)));
    }

    var c: BasicStats = BasicStats();

    // Calculate relic stat sums
    // NOTE: Performance is worse if we don't add elemental dmg from head/hands/body/feet/rope

    c.HP_P  = head.HP_P + hands.HP_P + body.HP_P + feet.HP_P + planarSphere.HP_P + linkRope.HP_P;
    c.ATK_P = head.ATK_P + hands.ATK_P + body.ATK_P + feet.ATK_P + planarSphere.ATK_P + linkRope.ATK_P;
    c.DEF_P = head.DEF_P + hands.DEF_P + body.DEF_P + feet.DEF_P + planarSphere.DEF_P + linkRope.DEF_P;
    c.SPD_P = head.SPD_P + hands.SPD_P + body.SPD_P + feet.SPD_P + planarSphere.SPD_P + linkRope.SPD_P;
    c.HP  = epsilon + head.HP + hands.HP + body.HP + feet.HP + planarSphere.HP + linkRope.HP;
    c.ATK = epsilon + head.ATK + hands.ATK + body.ATK + feet.ATK + planarSphere.ATK + linkRope.ATK;
    c.DEF = epsilon + head.DEF + hands.DEF + body.DEF + feet.DEF + planarSphere.DEF + linkRope.DEF;
    c.SPD = epsilon + head.SPD + hands.SPD + body.SPD + feet.SPD + planarSphere.SPD + linkRope.SPD;
    c.CR  = epsilon + head.CR + hands.CR + body.CR + feet.CR + planarSphere.CR + linkRope.CR;
    c.CD  = epsilon + head.CD + hands.CD + body.CD + feet.CD + planarSphere.CD + linkRope.CD;
    c.EHR = epsilon + head.EHR + hands.EHR + body.EHR + feet.EHR + planarSphere.EHR + linkRope.EHR;
    c.RES = epsilon + head.RES + hands.RES + body.RES + feet.RES + planarSphere.RES + linkRope.RES;
    c.BE  = epsilon + head.BE + hands.BE + body.BE + feet.BE + planarSphere.BE + linkRope.BE;
    c.ERR = epsilon + head.ERR + hands.ERR + body.ERR + feet.ERR + planarSphere.ERR + linkRope.ERR;
    c.OHB = epsilon + head.OHB + hands.OHB + body.OHB + feet.OHB + planarSphere.OHB + linkRope.OHB;
    c.PHYSICAL_DMG_BOOST  = epsilon + head.PHYSICAL_DMG_BOOST + hands.PHYSICAL_DMG_BOOST + body.PHYSICAL_DMG_BOOST + feet.PHYSICAL_DMG_BOOST + planarSphere.PHYSICAL_DMG_BOOST + linkRope.PHYSICAL_DMG_BOOST;
    c.FIRE_DMG_BOOST      = epsilon + head.FIRE_DMG_BOOST + hands.FIRE_DMG_BOOST + body.FIRE_DMG_BOOST + feet.FIRE_DMG_BOOST + planarSphere.FIRE_DMG_BOOST + linkRope.FIRE_DMG_BOOST;
    c.ICE_DMG_BOOST       = epsilon + head.ICE_DMG_BOOST + hands.ICE_DMG_BOOST + body.ICE_DMG_BOOST + feet.ICE_DMG_BOOST + planarSphere.ICE_DMG_BOOST + linkRope.ICE_DMG_BOOST;
    c.LIGHTNING_DMG_BOOST = epsilon + head.LIGHTNING_DMG_BOOST + hands.LIGHTNING_DMG_BOOST + body.LIGHTNING_DMG_BOOST + feet.LIGHTNING_DMG_BOOST + planarSphere.LIGHTNING_DMG_BOOST + linkRope.LIGHTNING_DMG_BOOST;
    c.WIND_DMG_BOOST      = epsilon + head.WIND_DMG_BOOST + hands.WIND_DMG_BOOST + body.WIND_DMG_BOOST + feet.WIND_DMG_BOOST + planarSphere.WIND_DMG_BOOST + linkRope.WIND_DMG_BOOST;
    c.QUANTUM_DMG_BOOST   = epsilon + head.QUANTUM_DMG_BOOST + hands.QUANTUM_DMG_BOOST + body.QUANTUM_DMG_BOOST + feet.QUANTUM_DMG_BOOST + planarSphere.QUANTUM_DMG_BOOST + linkRope.QUANTUM_DMG_BOOST;
    c.IMAGINARY_DMG_BOOST = epsilon + head.IMAGINARY_DMG_BOOST + hands.IMAGINARY_DMG_BOOST + body.IMAGINARY_DMG_BOOST + feet.IMAGINARY_DMG_BOOST + planarSphere.IMAGINARY_DMG_BOOST + linkRope.IMAGINARY_DMG_BOOST;

    // Calculate basic stats

    c.HP  += (baseHP) * (1 + c.HP_P + traceHP_P + baseHP_P) + traceHP;
    c.ATK += (baseATK) * (1 + c.ATK_P + traceATK_P + baseATK_P) + traceATK;
    c.DEF += (baseDEF) * (1 + c.DEF_P + traceDEF_P + baseDEF_P) + traceDEF;
    c.SPD += (baseSPD) * (1 + c.SPD_P + traceSPD_P + baseSPD_P) + traceSPD;
    c.CR  += baseCR + traceCR;
    c.CD  += baseCD + traceCD;
    c.EHR += baseEHR + traceEHR;
    c.RES += baseRES + traceRES;
    c.BE  += baseBE + traceBE;
    c.ERR += baseERR + traceERR;
    c.OHB += baseOHB + traceOHB;
    c.PHYSICAL_DMG_BOOST  += tracePhysical_DMG + 0.10 * p2(sets.ChampionOfStreetwiseBoxing);
    c.FIRE_DMG_BOOST      += traceFire_DMG + 0.10 * p2(sets.FiresmithOfLavaForging);
    c.ICE_DMG_BOOST       += traceIce_DMG + 0.10 * p2(sets.HunterOfGlacialForest);
    c.LIGHTNING_DMG_BOOST += traceLightning_DMG + 0.10 * p2(sets.BandOfSizzlingThunder);
    c.WIND_DMG_BOOST      += traceWind_DMG + 0.10 * p2(sets.EagleOfTwilightLine);
    c.QUANTUM_DMG_BOOST   += traceQuantum_DMG + 0.10 * p2(sets.GeniusOfBrilliantStars) + 0.10 * p2(sets.PoetOfMourningCollapse);
    c.IMAGINARY_DMG_BOOST += traceImaginary_DMG + 0.10 * p2(sets.WastelanderOfBanditryDesert);

    // Calculate set effects

    c.SPD += (baseSPD) * (
      0.06 * p2(sets.MessengerTraversingHackerspace) +
      0.06 * p2(sets.ForgeOfTheKalpagniLantern) +
      0.06 * p4(sets.MusketeerOfWildWheat) +
      0.06 * p2(sets.SacerdosRelivedOrdeal) -
      0.08 * p4(sets.PoetOfMourningCollapse) +
      0.06 * p2(sets.GiantTreeOfRaptBrooding) +
      0.06 * p2(sets.WarriorGoddessOfSunAndThunder) +
      0.06 * p2(sets.DivinerOfDistantReach)
    );

    c.HP += (baseHP) * (
      0.12 * p2(sets.FleetOfTheAgeless) +
      0.12 * p2(sets.LongevousDisciple) +
      0.12 * p2(sets.BoneCollectionsSereneDemesne)
    );

    c.ATK += (baseATK) * (
      0.12 * p2(sets.SpaceSealingStation) +
      0.12 * p2(sets.FirmamentFrontlineGlamoth) +
      0.12 * p2(sets.MusketeerOfWildWheat) +
      0.12 * p2(sets.PrisonerInDeepConfinement) +
      0.12 * p2(sets.IzumoGenseiAndTakamaDivineRealm) +
      0.12 * p2(sets.TheWindSoaringValorous) +
      0.12 * p2(sets.HeroOfTriumphantSong) +
      0.12 * p2(sets.RevelryByTheSea)
    );

    c.DEF += (baseDEF) * (
      0.15 * p2(sets.BelobogOfTheArchitects) +
      0.15 * p2(sets.KnightOfPurityPalace)
    );

    c.CR += (
      0.08 * p2(sets.InertSalsotto) +
      0.08 * p2(sets.RutilantArena) +
      0.04 * p4(sets.PioneerDiverOfDeadWaters) +
      0.04 * p2(sets.SigoniaTheUnclaimedDesolation) +
      0.06 * p4(sets.TheWindSoaringValorous) +
      0.08 * p2(sets.ScholarLostInErudition) +
      0.08 * p2(sets.WorldRemakingDeliverer) +
      0.08 * p2(sets.AmphoreusTheEternalLand)
    );

    c.CD += (
      0.16 * p2(sets.CelestialDifferentiator) +
      0.16 * p2(sets.TheWondrousBananAmusementPark) +
      0.16 * p2(sets.WavestriderCaptain) +
      0.16 * p2(sets.TengokuLivestream) +
      0.16 * p2(sets.EverGloriousMagicalGirl)
    );

    c.EHR += (
      0.10 * p2(sets.PanCosmicCommercialEnterprise)
    );

    c.RES += (
      0.10 * p2(sets.BrokenKeel)
    );

    c.BE += (
      0.16 * p2(sets.TaliaKingdomOfBanditry) +
      0.16 * p2(sets.ThiefOfShootingMeteor) +
      0.16 * p4(sets.ThiefOfShootingMeteor) +
      0.16 * p2(sets.WatchmakerMasterOfDreamMachinations) +
      0.16 * p2(sets.IronCavalryAgainstTheScourge)
    );

    c.ERR += (
      0.05 * p2(sets.SprightlyVonwacq) +
      0.05 * p2(sets.PenaconyLandOfTheDreams) +
      0.05 * p2(sets.LushakaTheSunkenSeas)
    );

    c.OHB += (
      0.10 * p2(sets.PasserbyOfWanderingCloud)
    );

    // Basic filters here

    // START BASIC STAT FILTERS
    // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
    /* INJECT BASIC STAT FILTERS */
    // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
    // END BASIC STAT FILTERS

    let diffATK = c.ATK + combatBuffsATK + combatBuffsATK_P * baseATK;
    let diffDEF = c.DEF + combatBuffsDEF + combatBuffsDEF_P * baseDEF;
    let diffHP = c.HP   + combatBuffsHP  + combatBuffsHP_P  * baseHP;
    let diffSPD = c.SPD + combatBuffsSPD + combatBuffsSPD_P * baseSPD;
    let diffCD = c.CD   + combatBuffsCD;
    let diffCR = c.CR   + combatBuffsCR;
    let diffEHR = c.EHR;
    let diffRES = c.RES;
    let diffBE = c.BE   + combatBuffsBE;
    let diffERR = c.ERR;
    let diffOHB = c.OHB;

    // START UNROLLED ACTIONS
    // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
    /* INJECT UNROLLED ACTIONS */
    // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
    // END UNROLLED ACTIONS
  }
}


fn calculateInitial(
  p_x: ptr<function, ComputedStats>,
  abilityDmg: f32,
  hpScaling: f32,
  defScaling: f32,
  atkScaling: f32,
  atkBoostP: f32
) -> f32 {
  let x = *p_x;
  return abilityDmg
    + hpScaling * x.HP
    + defScaling * x.DEF
    + atkScaling * (x.ATK + atkBoostP * baseATK);
}

fn calculateDefMulti(defPen: f32) -> f32 {
  return (100.0f) / ((f32(enemyLevel) + 20.0f) * max(0.0f, 1.0f - defPen) + 100.0f);
}

//fn calculateEhrMulti(
//  p_x: ptr<function, ComputedStats>
//) -> f32 {
//  let x = *p_x;
//  let effectiveDotChance = min(1, x.DOT_CHANCE * (1 + x.EHR) * (1 - enemyEffectResistance + x.EFFECT_RES_PEN));
//  let dotEhrMulti = select(
//    (effectiveDotChance),
//    (1 + x.DOT_SPLIT * effectiveDotChance * (x.DOT_STACKS - 1)) / (1 + x.DOT_SPLIT * (x.DOT_STACKS - 1)),
//    x.DOT_SPLIT > 0.0
//  );
//
//  return dotEhrMulti;
//}

fn p2(n: i32) -> f32 {
  return f32(min(1, n >> 1));
}

fn p4(n: i32) -> f32 {
  return f32(n >> 2);
}

fn buffAbilityTrueDmg(
  p_x: ptr<function, ComputedStats>,
  abilityTypeFlags: i32,
  value: f32,
  condition: i32
) {
}

fn buffAbilityDmg(
  p_x: ptr<function, ComputedStats>,
  abilityTypeFlags: i32,
  value: f32,
  condition: i32
) {
}

fn buffAbilityCr(
  p_x: ptr<function, ComputedStats>,
  abilityTypeFlags: i32,
  value: f32,
  condition: i32
) {
}

fn buffAbilityCd(
  p_x: ptr<function, ComputedStats>,
  abilityTypeFlags: i32,
  value: f32,
  condition: i32
) {
}

fn buffAbilityDefShred(
  p_x: ptr<function, ComputedStats>,
  abilityTypeFlags: i32,
  value: f32,
  condition: i32
) {
}

fn buffAbilityVulnerability(
  p_x: ptr<function, ComputedStats>,
  abilityTypeFlags: i32,
  value: f32,
  condition: i32
) {
}

fn addElementalDmg(
  c_x: ptr<function, BasicStats>,
  p_x: ptr<function, ComputedStats>,
) {
}

fn addComputedElementalDmg(
  p_x: ptr<function, ComputedStats>,
) {
}

fn getElementalResPen(
  p_x: ptr<function, ComputedStats>,
) -> f32 {
  return 0;
}

fn getPioneerSetValue(
  index: i32,
) -> f32 {
  switch (index) {
    case 4: {
      return 0.24;
    }
    case 3: {
      return 0.16;
    }
    case 2: {
      return 0.12;
    }
    case 1: {
      return 0.08;
    }
    default: {
      return 0.0;
    }
  }
}

fn getArcadiaOfWovenDreamsValue(
  index: i32,
) -> f32 {
  switch (index) {
    case 1: {
      return 0.36;
    }
    case 2: {
      return 0.24;
    }
    case 3: {
      return 0.12;
    }
    case 4: {
      return 0.00;
    }
    case 5: {
      return 0.09;
    }
    case 6: {
      return 0.18;
    }
    case 7: {
      return 0.27;
    }
    case 8: {
      return 0.36;
    }
    default: {
      return 0.0;
    }
  }
}

fn calculateAshblazingSetP(
  setCount: i32,
  valueTheAshblazingGrandDuke: i32,
  hitMulti: f32,
) -> f32 {
  if (p4(setCount) >= 1) {
    let ashblazingAtk = 0.06 * f32(valueTheAshblazingGrandDuke);
    let ashblazingMulti = hitMulti;

    return ashblazingMulti - ashblazingAtk;
  }

  return 0;
}

// START UNROLLED ACTION FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
/* INJECT UNROLLED ACTION FUNCTIONS */
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
// END UNROLLED ACTION FUNCTIONS