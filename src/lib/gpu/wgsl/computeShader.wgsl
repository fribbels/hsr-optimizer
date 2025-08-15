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
      0.06 * p2(sets.WarriorGoddessOfSunAndThunder)
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
      0.08 * p2(sets.WorldRemakingDeliverer)
    );

    c.CD += (
      0.16 * p2(sets.CelestialDifferentiator) +
      0.16 * p2(sets.TheWondrousBananAmusementPark) +
      0.16 * p2(sets.WavestriderCaptain)
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

    var combo = 0.0;

    /* START MC ASSIGNMENT */
    var mc = c;
    /* END MC ASSIGNMENT */

    for (var actionIndex = actionCount - 1; actionIndex >= 0; actionIndex--) {
      var action: Action;
      var x: ComputedStats;
      var m: ComputedStats;
      getAction(actionIndex, &action, &x, &m);

      let setConditionals = action.setConditionals;
      var state = ConditionalState();
      state.actionIndex = actionIndex;

      let p_x = &x;
      let p_m = &m;
      let p_sets = &sets;
      let p_state = &state;

      // BASIC

      if (p2(sets.CelestialDifferentiator) >= 1 && setConditionals.enabledCelestialDifferentiator == true && c.CD >= 1.20) {
        x.CR += 0.60;
      }

      // SPD

      if (p4(sets.MessengerTraversingHackerspace) >= 1 && setConditionals.enabledMessengerTraversingHackerspace == true) {
        x.SPD_P += 0.12;
        m.SPD_P += 0.12;
      }
      if (p4(sets.HeroOfTriumphantSong) >= 1 && setConditionals.enabledHeroOfTriumphantSong == true) {
        x.SPD_P += 0.06;
        x.CD += 0.30;
        m.CD += 0.30;
      }
      if (p4(sets.WarriorGoddessOfSunAndThunder) >= 1 && setConditionals.enabledWarriorGoddessOfSunAndThunder == true) {
        x.SPD_P += 0.06;
      }

      // ATK

      if (p4(sets.ChampionOfStreetwiseBoxing) >= 1) {
        x.ATK_P += 0.05 * f32(setConditionals.valueChampionOfStreetwiseBoxing);
      }
      if (p4(sets.BandOfSizzlingThunder) >= 1 && setConditionals.enabledBandOfSizzlingThunder == true) {
        x.ATK_P += 0.20;
      }
      if (p4(sets.TheAshblazingGrandDuke) >= 1) {
        x.ATK_P += 0.06 * f32(setConditionals.valueTheAshblazingGrandDuke);
      }
      if (p4(sets.WavestriderCaptain) >= 1 && setConditionals.enabledWavestriderCaptain == true) {
        x.ATK_P += 0.48;
      }

      // DEF

      // HP

      if (p4(sets.WorldRemakingDeliverer) >= 1 && setConditionals.enabledWorldRemakingDeliverer == true) {
        x.HP_P += 0.24;
        m.HP_P += 0.24;
      }

      // CD

      if (p4(sets.HunterOfGlacialForest) >= 1 && setConditionals.enabledHunterOfGlacialForest == true) {
        x.CD += 0.25;
      }
      if (p4(sets.WastelanderOfBanditryDesert) >= 1 && setConditionals.valueWastelanderOfBanditryDesert == 2) {
        x.CD_BOOST += 0.10;
      }
      if (p4(sets.PioneerDiverOfDeadWaters) >= 1) {
        x.CD_BOOST += getPioneerSetValue(setConditionals.valuePioneerDiverOfDeadWaters);
      }
      if (p2(sets.SigoniaTheUnclaimedDesolation) >= 1) {
        x.CD += 0.04 * f32(setConditionals.valueSigoniaTheUnclaimedDesolation);
      }
      if (p2(sets.DuranDynastyOfRunningWolves) >= 1 && setConditionals.valueDuranDynastyOfRunningWolves >= 5) {
        x.CD += 0.25;
      }
      if (p2(sets.TheWondrousBananAmusementPark) >= 1 && setConditionals.enabledTheWondrousBananAmusementPark == true) {
        x.CD += 0.32;
      }
      if (p4(sets.SacerdosRelivedOrdeal) >= 1) {
        x.CD += 0.18 * f32(setConditionals.valueSacerdosRelivedOrdeal);
      }
      if (p4(sets.WarriorGoddessOfSunAndThunder) >= 1 && setConditionals.enabledWarriorGoddessOfSunAndThunder == true) {
        x.CD += 0.15;
        m.CD += 0.15;
      }

      // CR

      if (p4(sets.WastelanderOfBanditryDesert) >= 1 && setConditionals.valueWastelanderOfBanditryDesert > 0) {
        x.CR_BOOST += 0.10;
      }
      if (p4(sets.LongevousDisciple) >= 1) {
        x.CR += 0.08 * f32(setConditionals.valueLongevousDisciple);
      }
      if (p4(sets.PioneerDiverOfDeadWaters) >= 1 && setConditionals.valuePioneerDiverOfDeadWaters > 2) {
        x.CR += 0.04;
      }
      if (p2(sets.IzumoGenseiAndTakamaDivineRealm) >= 1 && setConditionals.enabledIzumoGenseiAndTakamaDivineRealm == true) {
        x.CR += 0.12;
      }
      if (p4(sets.PoetOfMourningCollapse) >= 1) {
        let crValue = select(0.0, 0.20, c.SPD < 110) + select(0.0, 0.12, c.SPD < 95);
        x.CR += crValue;
        m.CR += crValue;
      }

      // BE

      if (p4(sets.WatchmakerMasterOfDreamMachinations) >= 1 && setConditionals.enabledWatchmakerMasterOfDreamMachinations == true) {
        x.BE += 0.30;
        m.BE += 0.30;
      }
      if (p2(sets.ForgeOfTheKalpagniLantern) >= 1 && setConditionals.enabledForgeOfTheKalpagniLantern == true) {
        x.BE += 0.40;
      }

      // Buffs

      // Basic boost
      if (p4(sets.MusketeerOfWildWheat) >= 1) {
        buffAbilityDmg(&x, BASIC_DMG_TYPE, 0.10, 1);
      }

      // Skill boost
      if (p4(sets.FiresmithOfLavaForging) >= 1) {
        buffAbilityDmg(&x, SKILL_DMG_TYPE, 0.12, 1);
      }

      // Fua boost
      if (p2(sets.TheAshblazingGrandDuke) >= 1) {
        buffAbilityDmg(&x, FUA_DMG_TYPE, 0.20, 1);
      }
      if (p2(sets.DuranDynastyOfRunningWolves) >= 1) {
        buffAbilityDmg(&x, FUA_DMG_TYPE, 0.05 * f32(setConditionals.valueDuranDynastyOfRunningWolves), 1);
      }

      // Ult boost
      if (p4(sets.TheWindSoaringValorous) >= 1) {
        buffAbilityDmg(&x, ULT_DMG_TYPE, 0.36 * f32(setConditionals.enabledTheWindSoaringValorous), 1);
      }

      if (p4(sets.ScholarLostInErudition) >= 1) {
        buffAbilityDmg(&x, SKILL_DMG_TYPE | ULT_DMG_TYPE, 0.20, 1);

        if (setConditionals.enabledScholarLostInErudition == true) {
          buffAbilityDmg(&x, SKILL_DMG_TYPE, 0.25, 1);
        }
      }

      // Other boosts

      if (p4(sets.GeniusOfBrilliantStars) >= 1) {
        if (setConditionals.enabledGeniusOfBrilliantStars == true) {
          x.DEF_PEN += 0.20;
        } else {
          x.DEF_PEN += 0.10;
        }
      }

      if (p4(sets.PrisonerInDeepConfinement) >= 1) {
        x.DEF_PEN += 0.06 * f32(setConditionals.valuePrisonerInDeepConfinement);
      }

      if (p2(sets.PioneerDiverOfDeadWaters) >= 1 && setConditionals.valuePioneerDiverOfDeadWaters >= 0) {
        x.ELEMENTAL_DMG += 0.12;
      }

      if (p4(sets.WorldRemakingDeliverer) >= 1 && setConditionals.enabledWorldRemakingDeliverer == true) {
        x.ELEMENTAL_DMG += 0.08;
        m.ELEMENTAL_DMG += 0.08;
      }

      if (p2(sets.FiresmithOfLavaForging) >= 1 && setConditionals.enabledFiresmithOfLavaForging == true) {
        x.FIRE_DMG_BOOST += 0.12;
      }

      if (p2(sets.GuardOfWutheringSnow) >= 1) {
        x.DMG_RED_MULTI *= (1 - 0.08);
      }

      if (p4(sets.KnightOfPurityPalace) >= 1) {
        x.SHIELD_BOOST += 0.20;
      }

      if (p2(sets.PenaconyLandOfTheDreams) >= 1 && setConditionals.enabledPenaconyLandOfTheDreams == true) {
        m.ELEMENTAL_DMG += 0.10;
      }

      if (p2(sets.ArcadiaOfWovenDreams) >= 1) {
        let buffValue = getArcadiaOfWovenDreamsValue(setConditionals.valueArcadiaOfWovenDreams);
        x.ELEMENTAL_DMG += buffValue;
        m.ELEMENTAL_DMG += buffValue;
      }

      x.ATK += diffATK;
      x.DEF += diffDEF;
      x.HP  += diffHP;
      x.SPD += diffSPD;
      x.CD  += diffCD;
      x.CR  += diffCR;
      x.EHR += diffEHR;
      x.RES += diffRES;
      x.BE  += diffBE;
      x.ERR += diffERR;
      x.OHB += diffOHB;

      addElementalDmg(&c, &x);

      x.ELEMENTAL_DMG += combatBuffsDMG_BOOST;
      x.EFFECT_RES_PEN += combatBuffsEFFECT_RES_PEN;
      x.VULNERABILITY += combatBuffsVULNERABILITY;
      x.BREAK_EFFICIENCY_BOOST += combatBuffsBREAK_EFFICIENCY;

      x.ATK += x.ATK_P * baseATK;
      x.DEF += x.DEF_P * baseDEF;
      x.HP += x.HP_P * baseHP;
      x.SPD += x.SPD_P * baseSPD;

      /* START COPY MEMOSPRITE BASIC STATS */
      m.CD  += mc.CD;
      m.CR  += mc.CR;
      m.EHR += mc.EHR;
      m.RES += mc.RES;
      m.BE  += mc.BE;
      m.ERR += mc.ERR;
      m.OHB += mc.OHB;

      addElementalDmg(&mc, &m);

      m.BASE_ATK = baseATK * x.MEMO_BASE_ATK_SCALING;
      m.BASE_DEF = baseDEF * x.MEMO_BASE_DEF_SCALING;
      m.BASE_HP = baseHP * x.MEMO_BASE_HP_SCALING;
      m.BASE_SPD = baseSPD * x.MEMO_BASE_SPD_SCALING;

      m.ATK += diffATK * x.MEMO_BASE_ATK_SCALING + x.MEMO_BASE_ATK_FLAT + m.BASE_ATK * m.ATK_P;
      m.DEF += diffDEF * x.MEMO_BASE_DEF_SCALING + x.MEMO_BASE_DEF_FLAT + m.BASE_DEF * m.DEF_P;
      m.HP += diffHP * x.MEMO_BASE_HP_SCALING + x.MEMO_BASE_HP_FLAT + m.BASE_HP * m.HP_P;
      m.SPD += diffSPD * x.MEMO_BASE_SPD_SCALING + x.MEMO_BASE_SPD_FLAT + m.BASE_SPD * m.SPD_P;
      /* END COPY MEMOSPRITE BASIC STATS */

      // START BASIC CONDITIONALS
      // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
      /* INJECT BASIC CONDITIONALS */
      // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
      // END BASIC CONDITIONALS

      // START COMBAT CONDITIONALS
      // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
      /* INJECT COMBAT CONDITIONALS */
      // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
      // END COMBAT CONDITIONALS

      if (p2(sets.FirmamentFrontlineGlamoth) >= 1 && x.SPD >= 135) {
        x.ELEMENTAL_DMG += select(0.12, 0.18, x.SPD >= 160);
      }

      if (p2(sets.RutilantArena) >= 1 && x.CR >= 0.70) {
        buffAbilityDmg(p_x, BASIC_DMG_TYPE | SKILL_DMG_TYPE, 0.20, 1);
      }

      if (p2(sets.InertSalsotto) >= 1 && x.CR >= 0.50) {
        buffAbilityDmg(p_x, ULT_DMG_TYPE | FUA_DMG_TYPE, 0.15, 1);
      }

      if (p4(sets.IronCavalryAgainstTheScourge) >= 1 && x.BE >= 1.50) {
        buffAbilityDefShred(p_x, BREAK_DMG_TYPE, 0.10, 1);
        buffAbilityDefShred(p_x, SUPER_BREAK_DMG_TYPE, select(0.0, 0.15, x.BE >= 2.50), 1);
      }

      if (p2(sets.RevelryByTheSea) >= 1) {
        if (x.ATK >= 3600) {
          buffAbilityDmg(p_x, DOT_DMG_TYPE, 0.24, 1);
        } else if (x.ATK >= 2400) {
          buffAbilityDmg(p_x, DOT_DMG_TYPE, 0.12, 1);
        }
      }

      // START ACTION CONDITIONALS
      // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
      /* INJECT ACTION CONDITIONALS */
      // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
      // END ACTION CONDITIONALS

      // Calculate damage

      addComputedElementalDmg(&x);

      /* START MEMOSPRITE DAMAGE CALCS */
      calculateDamage(&m, &emptyComputedStats, actionIndex, action.abilityType);
      /* END MEMOSPRITE DAMAGE CALCS */

      calculateDamage(&x, &m, actionIndex, action.abilityType);

      if (actionIndex > 0) {
        if (action.abilityType == BASIC_ABILITY_TYPE) {
          combo += x.BASIC_DMG;
        } else if (action.abilityType == SKILL_ABILITY_TYPE) {
          combo += x.SKILL_DMG;
        } else if (action.abilityType == ULT_ABILITY_TYPE) {
          combo += x.ULT_DMG;
        } else if (action.abilityType == FUA_ABILITY_TYPE) {
          combo += x.FUA_DMG;
        } else if (action.abilityType == DOT_ABILITY_TYPE) {
          combo += x.DOT_DMG * comboDot / max(1, dotAbilities);
        } else if (action.abilityType == BREAK_ABILITY_TYPE) {
          combo += x.BREAK_DMG;
        } else if (action.abilityType == MEMO_SKILL_ABILITY_TYPE) {
          combo += x.MEMO_SKILL_DMG;
        } else if (action.abilityType == MEMO_TALENT_ABILITY_TYPE) {
          combo += x.MEMO_TALENT_DMG;
        }
      } else {
        x.COMBO_DMG = combo + x.DOT_DMG * select(0, comboDot, dotAbilities == 0);

        // START COMBAT STAT FILTERS
        // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
        /* INJECT COMBAT STAT FILTERS */
        // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
        // END COMBAT STAT FILTERS


        // START BASIC STAT FILTERS
        // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
        /* INJECT BASIC STAT FILTERS */
        // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
        // END BASIC STAT FILTERS


        // START RATING STAT FILTERS
        // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
        /* INJECT RATING STAT FILTERS */
        // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
        // END RATING STAT FILTERS


        // START RETURN VALUE
        // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
        /* INJECT RETURN VALUE */
        // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
        // END RETURN VALUE
      }
    }
  }
}

fn calculateDamage(
  p_x: ptr<function, ComputedStats>,
  p_m: ptr<function, ComputedStats>,
  actionIndex: i32,
  abilityType: f32,
) {
  let x = *p_x;
  let m = *p_m;
  let eLevel: f32 = f32(enemyLevel);

  (*p_x).CR += x.CR_BOOST;
  (*p_x).CD += x.CD_BOOST;
  (*p_x).ATK += x.ATK_P_BOOST * baseATK;

  let baseDmgBoost = 1 + x.ELEMENTAL_DMG;
  let baseDefPen = x.DEF_PEN + combatBuffsDEF_PEN;
  let baseUniversalMulti = 0.9 + x.ENEMY_WEAKNESS_BROKEN * 0.1;
  let baseResistance = resistance - x.RES_PEN - combatBuffsRES_PEN - getElementalResPen(p_x);
  let baseBreakEfficiencyBoost = 1 + x.BREAK_EFFICIENCY_BOOST;

  // === Super / Break ===

  (*p_x).BREAK_DMG
    = baseUniversalMulti
    * 3767.5533
    * ELEMENTAL_BREAK_SCALING
    * calculateDefMulti(baseDefPen + x.BREAK_DEF_PEN)
    * (0.5 + enemyMaxToughness / 120)
    * (1 + x.VULNERABILITY + x.BREAK_VULNERABILITY)
    * (1 - baseResistance)
    * (1 + x.BE)
    * (1 + x.BREAK_DMG_BOOST);

  let baseSuperBreakInstanceDmg
    = baseUniversalMulti
    * 3767.5533
    * calculateDefMulti(baseDefPen + x.SUPER_BREAK_DEF_PEN)
    * (1 + x.VULNERABILITY + x.SUPER_BREAK_VULNERABILITY)
    * (1 - baseResistance)
    * (1 + x.BE)
    * (1 + x.SUPER_BREAK_DMG_BOOST)
    * (0.10f);

  if (actionIndex == 0) {
    if (dotAbilities == 0) {
      // Duplicated in injectActionDamage.ts

      let dotDmgBoostMulti = baseDmgBoost + x.DOT_DMG_BOOST;
      let dotDefMulti = calculateDefMulti(baseDefPen + x.DOT_DEF_PEN);
      let dotVulnerabilityMulti = 1 + x.VULNERABILITY + x.DOT_VULNERABILITY;
      let dotResMulti = 1 - (baseResistance - x.DOT_RES_PEN);
      let dotEhrMulti = calculateEhrMulti(p_x);
      let dotTrueDmgMulti = 1 + x.TRUE_DMG_MODIFIER + x.DOT_TRUE_DMG_MODIFIER;
      let dotFinalDmgMulti = 1 + x.FINAL_DMG_BOOST + x.DOT_FINAL_DMG_BOOST;
      let initialDmg = calculateInitial(
        p_x,
        x.DOT_DMG,
        x.DOT_HP_SCALING,
        x.DOT_DEF_SCALING,
        x.DOT_ATK_SCALING,
        x.DOT_ATK_P_BOOST
      );

      if (initialDmg > 0) {
        (*p_x).DOT_DMG = initialDmg // When no DOT abilities specified, use the default
          * (baseUniversalMulti)
          * (dotDmgBoostMulti)
          * (dotDefMulti)
          * (dotVulnerabilityMulti)
          * (dotResMulti)
          * (dotEhrMulti)
          * (dotTrueDmgMulti)
          * (dotFinalDmgMulti);
      }
    }

    if (x.HEAL_VALUE > 0) {
      (*p_x).HEAL_VALUE = x.HEAL_VALUE * (
        1
        + x.OHB
        + select(0.0, x.SKILL_OHB, x.HEAL_TYPE == SKILL_DMG_TYPE)
        + select(0.0, x.ULT_OHB, x.HEAL_TYPE == ULT_DMG_TYPE)
      );
    }

    if (x.SHIELD_VALUE > 0) {
      (*p_x).SHIELD_VALUE = x.SHIELD_VALUE * (1 + x.SHIELD_BOOST);
    }

    /* START EHP CALC */
    (*p_x).EHP = x.HP / (1 - x.DEF / (x.DEF + 200 + 10 * eLevel)) * (1 / x.DMG_RED_MULTI);
    /* END EHP CALC */
  }

  // START ACTION DAMAGE
  // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
  /* INJECT ACTION DAMAGE */
  // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
  // END ACTION DAMAGE

  (*p_x).BREAK_DMG *= 1 + x.TRUE_DMG_MODIFIER + x.BREAK_TRUE_DMG_MODIFIER;
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

fn calculateEhrMulti(
  p_x: ptr<function, ComputedStats>
) -> f32 {
  let x = *p_x;
  let effectiveDotChance = min(1, x.DOT_CHANCE * (1 + x.EHR) * (1 - enemyEffectResistance + x.EFFECT_RES_PEN));
  let dotEhrMulti = select(
    (effectiveDotChance),
    (1 + x.DOT_SPLIT * effectiveDotChance * (x.DOT_STACKS - 1)) / (1 + x.DOT_SPLIT * (x.DOT_STACKS - 1)),
    x.DOT_SPLIT > 0.0
  );

  return dotEhrMulti;
}

fn calculateAbilityDmg(
  p_x: ptr<function, ComputedStats>,
  baseUniversalMulti: f32,
  baseDmgBoost: f32,
  baseDefPen: f32,
  baseResistance: f32,
  baseSuperBreakInstanceDmg: f32,
  baseBreakEfficiencyBoost: f32,
  abilityDmg: f32,
  abilityDmgBoost: f32,
  abilityVulnerability: f32,
  abilityDefPen: f32,
  abilityResPen: f32,
  abilityCrBoost: f32,
  abilityCdBoost: f32,
  abilityOriginalDmgBoost: f32,
  abilityBreakEfficiencyBoost: f32,
  abilitySuperBreakModifier: f32,
  abilityBreakDmgModifier: f32,
  abilityToughnessDmg: f32,
  abilityAdditionalDmg: f32,
  abilityAdditionalCrOverride: f32,
  abilityAdditionalCdOverride: f32,
  abilityTrueDmgModifier: f32,
  abilityMemoJointDamage: f32,
) -> f32 {
  let x = *p_x;

  var abilityCritDmgOutput: f32 = 0;
  if (abilityDmg > 0) {
    let abilityCr = min(1, x.CR + abilityCrBoost);
    let abilityCd = x.CD + abilityCdBoost;
    let abilityCritMulti = abilityCr * (1 + abilityCd) + (1 - abilityCr);
    let abilityVulnerabilityMulti = 1 + x.VULNERABILITY + abilityVulnerability;
    let abilityDefMulti = calculateDefMulti(baseDefPen + abilityDefPen);
    let abilityResMulti = 1 - (baseResistance - abilityResPen);
    let abilityOriginalDmgMulti = 1 + abilityOriginalDmgBoost + x.FINAL_DMG_BOOST;

    abilityCritDmgOutput = abilityDmg
      * (baseUniversalMulti)
      * (baseDmgBoost + abilityDmgBoost)
      * (abilityDefMulti)
      * (abilityVulnerabilityMulti)
      * (abilityCritMulti)
      * (abilityResMulti)
      * (abilityOriginalDmgMulti);
  }

  // === Break DMG ===

  var abilityBreakDmgOutput: f32 = 0;
  if (abilityBreakDmgModifier > 0) {
    abilityBreakDmgOutput = abilityBreakDmgModifier * x.BREAK_DMG;
  }

  // === Super Break DMG ===

  var abilitySuperBreakDmgOutput: f32 = 0;
  let superBreakModifier = x.SUPER_BREAK_MODIFIER + abilitySuperBreakModifier;
  if (superBreakModifier > 0) {
    abilitySuperBreakDmgOutput = baseSuperBreakInstanceDmg
      * (superBreakModifier)
      * (baseBreakEfficiencyBoost + abilityBreakEfficiencyBoost)
      * (abilityToughnessDmg);
  }

  // === Additional DMG ===

  var abilityAdditionalDmgOutput: f32 = 0;
  if (abilityAdditionalDmg > 0) {
    let additionalDmgCr = select(min(1, x.CR), abilityAdditionalCrOverride, abilityAdditionalCrOverride > 0.0);
    let additionalDmgCd = select(x.CD, abilityAdditionalCdOverride, abilityAdditionalCdOverride > 0.0);
    let abilityAdditionalCritMulti = additionalDmgCr * (1 + additionalDmgCd) + (1 - additionalDmgCr);
    abilityAdditionalDmgOutput = abilityAdditionalDmg
      * (baseUniversalMulti)
      * (baseDmgBoost + x.ADDITIONAL_DMG_BOOST)
      * calculateDefMulti(baseDefPen)
      * (1 + x.VULNERABILITY)
      * (abilityAdditionalCritMulti)
      * (1 - baseResistance);
  }

  // === Primary DMG ===

  let primaryDmgOutput = abilityCritDmgOutput
    + abilityBreakDmgOutput
    + abilitySuperBreakDmgOutput
    + abilityAdditionalDmgOutput;

  // === True DMG ===

  let trueDmgOutput = (x.TRUE_DMG_MODIFIER + abilityTrueDmgModifier) * primaryDmgOutput;

  // === Memo Joint DMG ===

  var memoJointDmgOutput: f32 = 0;
  if (abilityMemoJointDamage > 0) {
    memoJointDmgOutput = abilityMemoJointDamage;
  }

  return primaryDmgOutput + trueDmgOutput + memoJointDmgOutput;
}

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
  if (condition == 0) {
    return;
  }
  if ((abilityTypeFlags & i32((*p_x).BASIC_DMG_TYPE)) != 0) {
    (*p_x).BASIC_TRUE_DMG_MODIFIER += value;
  }
  if ((abilityTypeFlags & i32((*p_x).SKILL_DMG_TYPE)) != 0) {
    (*p_x).SKILL_TRUE_DMG_MODIFIER += value;
  }
  if ((abilityTypeFlags & i32((*p_x).ULT_DMG_TYPE)) != 0) {
    (*p_x).ULT_TRUE_DMG_MODIFIER += value;
  }
  if ((abilityTypeFlags & i32((*p_x).FUA_DMG_TYPE)) != 0) {
    (*p_x).FUA_TRUE_DMG_MODIFIER += value;
  }
  if ((abilityTypeFlags & i32((*p_x).DOT_DMG_TYPE)) != 0) {
    (*p_x).DOT_TRUE_DMG_MODIFIER += value;
  }
  if ((abilityTypeFlags & i32((*p_x).BREAK_DMG_TYPE)) != 0) {
    (*p_x).BREAK_TRUE_DMG_MODIFIER += value;
  }
  if ((abilityTypeFlags & i32((*p_x).MEMO_SKILL_DMG_TYPE)) != 0) {
    (*p_x).MEMO_SKILL_TRUE_DMG_MODIFIER += value;
  }
  if ((abilityTypeFlags & i32((*p_x).MEMO_TALENT_DMG_TYPE)) != 0) {
    (*p_x).MEMO_TALENT_TRUE_DMG_MODIFIER += value;
  }
//  if ((abilityTypeFlags & i32((*p_x).ADDITIONAL_DMG_TYPE)) != 0) {
//    (*p_x).ADDITIONAL_TRUE_DMG_MODIFIER += value;
//  }
//  if ((abilityTypeFlags & i32((*p_x).SUPER_BREAK_DMG_TYPE)) != 0) {
//    (*p_x).SUPER_BREAK_TRUE_DMG_MODIFIER += value;
//  }
}

fn buffAbilityDmg(
  p_x: ptr<function, ComputedStats>,
  abilityTypeFlags: i32,
  value: f32,
  condition: i32
) {
  if (condition == 0) {
    return;
  }
  if ((abilityTypeFlags & i32((*p_x).BASIC_DMG_TYPE)) != 0) {
    (*p_x).BASIC_DMG_BOOST += value;
  }
  if ((abilityTypeFlags & i32((*p_x).SKILL_DMG_TYPE)) != 0) {
    (*p_x).SKILL_DMG_BOOST += value;
  }
  if ((abilityTypeFlags & i32((*p_x).ULT_DMG_TYPE)) != 0) {
    (*p_x).ULT_DMG_BOOST += value;
  }
  if ((abilityTypeFlags & i32((*p_x).FUA_DMG_TYPE)) != 0) {
    (*p_x).FUA_DMG_BOOST += value;
  }
  if ((abilityTypeFlags & i32((*p_x).DOT_DMG_TYPE)) != 0) {
    (*p_x).DOT_DMG_BOOST += value;
  }
  if ((abilityTypeFlags & i32((*p_x).BREAK_DMG_TYPE)) != 0) {
    (*p_x).BREAK_DMG_BOOST += value;
  }
  if ((abilityTypeFlags & i32((*p_x).MEMO_SKILL_DMG_TYPE)) != 0) {
    (*p_x).MEMO_SKILL_DMG_BOOST += value;
  }
  if ((abilityTypeFlags & i32((*p_x).MEMO_TALENT_DMG_TYPE)) != 0) {
    (*p_x).MEMO_TALENT_DMG_BOOST += value;
  }
  if ((abilityTypeFlags & i32((*p_x).ADDITIONAL_DMG_TYPE)) != 0) {
    (*p_x).ADDITIONAL_DMG_BOOST += value;
  }
  if ((abilityTypeFlags & i32((*p_x).SUPER_BREAK_DMG_TYPE)) != 0) {
    (*p_x).SUPER_BREAK_DMG_BOOST += value;
  }
}

fn buffAbilityCr(
  p_x: ptr<function, ComputedStats>,
  abilityTypeFlags: i32,
  value: f32,
  condition: i32
) {
  if (condition == 0) {
    return;
  }
  if ((abilityTypeFlags & i32((*p_x).BASIC_DMG_TYPE)) != 0) {
    (*p_x).BASIC_CR_BOOST += value;
  }
  if ((abilityTypeFlags & i32((*p_x).SKILL_DMG_TYPE)) != 0) {
    (*p_x).SKILL_CR_BOOST += value;
  }
  if ((abilityTypeFlags & i32((*p_x).ULT_DMG_TYPE)) != 0) {
    (*p_x).ULT_CR_BOOST += value;
  }
  if ((abilityTypeFlags & i32((*p_x).FUA_DMG_TYPE)) != 0) {
    (*p_x).FUA_CR_BOOST += value;
  }
//  if ((abilityTypeFlags & i32((*p_x).DOT_DMG_TYPE)) != 0) {
//    (*p_x).DOT_CR_BOOST += value;
//  }
//  if ((abilityTypeFlags & i32((*p_x).BREAK_DMG_TYPE)) != 0) {
//    (*p_x).BREAK_CR_BOOST += value;
//  }
  if ((abilityTypeFlags & i32((*p_x).MEMO_SKILL_DMG_TYPE)) != 0) {
    (*p_x).MEMO_SKILL_CR_BOOST += value;
  }
  if ((abilityTypeFlags & i32((*p_x).MEMO_TALENT_DMG_TYPE)) != 0) {
    (*p_x).MEMO_TALENT_CR_BOOST += value;
  }
//  if ((abilityTypeFlags & i32((*p_x).ADDITIONAL_DMG_TYPE)) != 0) {
//    (*p_x).ADDITIONAL_CR_BOOST += value;
//  }
//  if ((abilityTypeFlags & i32((*p_x).SUPER_BREAK_DMG_TYPE)) != 0) {
//    (*p_x).SUPER_BREAK_CR_BOOST += value;
//  }
}

fn buffAbilityCd(
  p_x: ptr<function, ComputedStats>,
  abilityTypeFlags: i32,
  value: f32,
  condition: i32
) {
  if (condition == 0) {
    return;
  }
  if ((abilityTypeFlags & i32((*p_x).BASIC_DMG_TYPE)) != 0) {
    (*p_x).BASIC_CD_BOOST += value;
  }
  if ((abilityTypeFlags & i32((*p_x).SKILL_DMG_TYPE)) != 0) {
    (*p_x).SKILL_CD_BOOST += value;
  }
  if ((abilityTypeFlags & i32((*p_x).ULT_DMG_TYPE)) != 0) {
    (*p_x).ULT_CD_BOOST += value;
  }
  if ((abilityTypeFlags & i32((*p_x).FUA_DMG_TYPE)) != 0) {
    (*p_x).FUA_CD_BOOST += value;
  }
//  if ((abilityTypeFlags & i32((*p_x).DOT_DMG_TYPE)) != 0) {
//    (*p_x).DOT_CD_BOOST += value;
//  }
//  if ((abilityTypeFlags & i32((*p_x).BREAK_DMG_TYPE)) != 0) {
//    (*p_x).BREAK_CD_BOOST += value;
//  }
  if ((abilityTypeFlags & i32((*p_x).MEMO_SKILL_DMG_TYPE)) != 0) {
    (*p_x).MEMO_SKILL_CD_BOOST += value;
  }
  if ((abilityTypeFlags & i32((*p_x).MEMO_TALENT_DMG_TYPE)) != 0) {
    (*p_x).MEMO_TALENT_CD_BOOST += value;
  }
//  if ((abilityTypeFlags & i32((*p_x).ADDITIONAL_DMG_TYPE)) != 0) {
//    (*p_x).ADDITIONAL_CD_BOOST += value;
//  }
//  if ((abilityTypeFlags & i32((*p_x).SUPER_BREAK_DMG_TYPE)) != 0) {
//    (*p_x).SUPER_BREAK_CD_BOOST += value;
//  }
}

fn buffAbilityDefShred(
  p_x: ptr<function, ComputedStats>,
  abilityTypeFlags: i32,
  value: f32,
  condition: i32
) {
  if (condition == 0) {
    return;
  }
  if ((abilityTypeFlags & i32((*p_x).BASIC_DMG_TYPE)) != 0) {
    (*p_x).BASIC_DEF_PEN += value;
  }
  if ((abilityTypeFlags & i32((*p_x).SKILL_DMG_TYPE)) != 0) {
    (*p_x).SKILL_DEF_PEN += value;
  }
  if ((abilityTypeFlags & i32((*p_x).ULT_DMG_TYPE)) != 0) {
    (*p_x).ULT_DEF_PEN += value;
  }
  if ((abilityTypeFlags & i32((*p_x).FUA_DMG_TYPE)) != 0) {
    (*p_x).FUA_DEF_PEN += value;
  }
  if ((abilityTypeFlags & i32((*p_x).DOT_DMG_TYPE)) != 0) {
    (*p_x).DOT_DEF_PEN += value;
  }
  if ((abilityTypeFlags & i32((*p_x).BREAK_DMG_TYPE)) != 0) {
    (*p_x).BREAK_DEF_PEN += value;
  }
  if ((abilityTypeFlags & i32((*p_x).MEMO_SKILL_DMG_TYPE)) != 0) {
    (*p_x).MEMO_SKILL_DEF_PEN += value;
  }
  if ((abilityTypeFlags & i32((*p_x).MEMO_TALENT_DMG_TYPE)) != 0) {
    (*p_x).MEMO_TALENT_DEF_PEN += value;
  }
//  if ((abilityTypeFlags & i32((*p_x).ADDITIONAL_DMG_TYPE)) != 0) {
//    (*p_x).ADDITIONAL_DEF_PEN += value;
//  }
  if ((abilityTypeFlags & i32((*p_x).SUPER_BREAK_DMG_TYPE)) != 0) {
    (*p_x).SUPER_BREAK_DEF_PEN += value;
  }
}

fn buffAbilityVulnerability(
  p_x: ptr<function, ComputedStats>,
  abilityTypeFlags: i32,
  value: f32,
  condition: i32
) {
  if (condition == 0) {
    return;
  }
  if ((abilityTypeFlags & i32((*p_x).BASIC_DMG_TYPE)) != 0) {
    (*p_x).BASIC_VULNERABILITY += value;
  }
  if ((abilityTypeFlags & i32((*p_x).SKILL_DMG_TYPE)) != 0) {
    (*p_x).SKILL_VULNERABILITY += value;
  }
  if ((abilityTypeFlags & i32((*p_x).ULT_DMG_TYPE)) != 0) {
    (*p_x).ULT_VULNERABILITY += value;
  }
  if ((abilityTypeFlags & i32((*p_x).FUA_DMG_TYPE)) != 0) {
    (*p_x).FUA_VULNERABILITY += value;
  }
  if ((abilityTypeFlags & i32((*p_x).DOT_DMG_TYPE)) != 0) {
    (*p_x).DOT_VULNERABILITY += value;
  }
  if ((abilityTypeFlags & i32((*p_x).BREAK_DMG_TYPE)) != 0) {
    (*p_x).BREAK_VULNERABILITY += value;
  }
  if ((abilityTypeFlags & i32((*p_x).MEMO_SKILL_DMG_TYPE)) != 0) {
    (*p_x).MEMO_SKILL_VULNERABILITY += value;
  }
  if ((abilityTypeFlags & i32((*p_x).MEMO_TALENT_DMG_TYPE)) != 0) {
    (*p_x).MEMO_TALENT_VULNERABILITY += value;
  }
//  if ((abilityTypeFlags & i32((*p_x).ADDITIONAL_DMG_TYPE)) != 0) {
//    (*p_x).ADDITIONAL_VULNERABILITY += value;
//  }
  if ((abilityTypeFlags & i32((*p_x).SUPER_BREAK_DMG_TYPE)) != 0) {
    (*p_x).SUPER_BREAK_VULNERABILITY += value;
  }
}

fn addElementalDmg(
  c_x: ptr<function, BasicStats>,
  p_x: ptr<function, ComputedStats>,
) {
  switch (ELEMENT_INDEX) {
    case 0: {
      (*p_x).ELEMENTAL_DMG += (*c_x).PHYSICAL_DMG_BOOST;
    }
    case 1: {
      (*p_x).ELEMENTAL_DMG += (*c_x).FIRE_DMG_BOOST;
    }
    case 2: {
      (*p_x).ELEMENTAL_DMG += (*c_x).ICE_DMG_BOOST;
    }
    case 3: {
      (*p_x).ELEMENTAL_DMG += (*c_x).LIGHTNING_DMG_BOOST;
    }
    case 4: {
      (*p_x).ELEMENTAL_DMG += (*c_x).WIND_DMG_BOOST;
    }
    case 5: {
      (*p_x).ELEMENTAL_DMG += (*c_x).QUANTUM_DMG_BOOST;
    }
    case 6: {
      (*p_x).ELEMENTAL_DMG += (*c_x).IMAGINARY_DMG_BOOST;
    }
    default: {

    }
  }
}

fn addComputedElementalDmg(
  p_x: ptr<function, ComputedStats>,
) {
  switch (ELEMENT_INDEX) {
    case 0: {
      (*p_x).ELEMENTAL_DMG += (*p_x).PHYSICAL_DMG_BOOST;
    }
    case 1: {
      (*p_x).ELEMENTAL_DMG += (*p_x).FIRE_DMG_BOOST;
    }
    case 2: {
      (*p_x).ELEMENTAL_DMG += (*p_x).ICE_DMG_BOOST;
    }
    case 3: {
      (*p_x).ELEMENTAL_DMG += (*p_x).LIGHTNING_DMG_BOOST;
    }
    case 4: {
      (*p_x).ELEMENTAL_DMG += (*p_x).WIND_DMG_BOOST;
    }
    case 5: {
      (*p_x).ELEMENTAL_DMG += (*p_x).QUANTUM_DMG_BOOST;
    }
    case 6: {
      (*p_x).ELEMENTAL_DMG += (*p_x).IMAGINARY_DMG_BOOST;
    }
    default: {

    }
  }
}

fn getElementalResPen(
  p_x: ptr<function, ComputedStats>,
) -> f32 {
  switch (ELEMENT_INDEX) {
    case 0: {
      return (*p_x).PHYSICAL_RES_PEN;
    }
    case 1: {
      return (*p_x).FIRE_RES_PEN;
    }
    case 2: {
      return (*p_x).ICE_RES_PEN;
    }
    case 3: {
      return (*p_x).LIGHTNING_RES_PEN;
    }
    case 4: {
      return (*p_x).WIND_RES_PEN;
    }
    case 5: {
      return (*p_x).QUANTUM_RES_PEN;
    }
    case 6: {
      return (*p_x).IMAGINARY_RES_PEN;
    }
    default: {
      return 0;
    }
  }
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
