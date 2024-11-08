// START CHARACTER CONDITIONAL CONSTANTS
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
/* INJECT CHARACTER CONDITIONAL CONSTANTS */
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
// END CHARACTER CONDITIONAL CONSTANTS


// START LIGHT CONE CONDITIONAL CONSTANTS
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
/* INJECT LIGHT CONE CONDITIONAL CONSTANTS */
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
// END LIGHT CONE CONDITIONAL CONSTANTS


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


const BASIC_TYPE = 1;
const SKILL_TYPE = 2;
const ULT_TYPE = 4;
const FUA_TYPE = 8;
const DOT_TYPE = 16;
const BREAK_TYPE = 32;
const SUPER_BREAK_TYPE = 64;

@group(0) @binding(0) var<storage> params : Params;

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

  // Load params
  let lSize = i32(params.lSize);
  let pSize = i32(params.pSize);
  let fSize = i32(params.fSize);
  let bSize = i32(params.bSize);
  let gSize = i32(params.gSize);
  let hSize = i32(params.hSize);
  let xl = i32(params.xl);
  let xp = i32(params.xp);
  let xf = i32(params.xf);
  let xb = i32(params.xb);
  let xg = i32(params.xg);
  let xh = i32(params.xh);
  let threshold = f32(params.threshold);
  let relicSetCount = u32(params.relicSetCount);
  let ornamentSetCount = u32(params.ornamentSetCount);

  let epsilon = 0.000001f;

  var failures: f32 = 1;

  for (var i = 0; i < CYCLES_PER_INVOCATION; i++) {

    // Calculate global_invocation_index

    let index = indexGlobal * CYCLES_PER_INVOCATION + i;

    // Calculate relic index per slot

    let l = (index % lSize);
    let p = (((index - l) / lSize) % pSize);
    let f = (((index - p * lSize - l) / (lSize * pSize)) % fSize);
    let b = (((index - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize);
    let g = (((index - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize);
    let h = (((index - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize)) % hSize);

    let finalL = (l + xl) % lSize;
    let carryL = ((l + xl) / lSize);
    let finalP = (p + xp + carryL) % pSize;
    let carryP = ((p + xp + carryL) / pSize);
    let finalF = (f + xf + carryP) % fSize;
    let carryF = ((f + xf + carryP) / fSize);
    let finalB = (b + xb + carryF) % bSize;
    let carryB = ((b + xb + carryF) / bSize);
    let finalG = (g + xg + carryB) % gSize;
    let carryG = ((g + xg + carryB) / gSize);
    let finalH = (h + xh + carryG) % hSize;

    // Calculate Relic structs

    let head  : Relic = (relics[finalH]);
    let hands : Relic = (relics[finalG + hSize]);
    let body  : Relic = (relics[finalB + hSize + gSize]);
    let feet  : Relic = (relics[finalF + hSize + gSize + bSize]);
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

    // Calculate ornament set counts

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
    c.Physical_DMG  = epsilon + head.Physical_DMG + hands.Physical_DMG + body.Physical_DMG + feet.Physical_DMG + planarSphere.Physical_DMG + linkRope.Physical_DMG;
    c.Fire_DMG      = epsilon + head.Fire_DMG + hands.Fire_DMG + body.Fire_DMG + feet.Fire_DMG + planarSphere.Fire_DMG + linkRope.Fire_DMG;
    c.Ice_DMG       = epsilon + head.Ice_DMG + hands.Ice_DMG + body.Ice_DMG + feet.Ice_DMG + planarSphere.Ice_DMG + linkRope.Ice_DMG;
    c.Lightning_DMG = epsilon + head.Lightning_DMG + hands.Lightning_DMG + body.Lightning_DMG + feet.Lightning_DMG + planarSphere.Lightning_DMG + linkRope.Lightning_DMG;
    c.Wind_DMG      = epsilon + head.Wind_DMG + hands.Wind_DMG + body.Wind_DMG + feet.Wind_DMG + planarSphere.Wind_DMG + linkRope.Wind_DMG;
    c.Quantum_DMG   = epsilon + head.Quantum_DMG + hands.Quantum_DMG + body.Quantum_DMG + feet.Quantum_DMG + planarSphere.Quantum_DMG + linkRope.Quantum_DMG;
    c.Imaginary_DMG = epsilon + head.Imaginary_DMG + hands.Imaginary_DMG + body.Imaginary_DMG + feet.Imaginary_DMG + planarSphere.Imaginary_DMG + linkRope.Imaginary_DMG;

    // Calculate basic stats

    c.HP  += (baseHP) * (1 + c.HP_P + traceHP_P + lcHP_P) + traceHP;
    c.DEF += (baseDEF) * (1 + c.DEF_P + traceDEF_P + lcDEF_P) + traceDEF;
    c.ATK += (baseATK) * (1 + c.ATK_P + traceATK_P + lcATK_P) + traceATK;
    c.SPD += (baseSPD) * (1 + c.SPD_P + traceSPD_P + lcSPD_P) + traceSPD;
    c.CR  += characterCR + lcCR + traceCR;
    c.CD  += characterCD + lcCD + traceCD;
    c.EHR += characterEHR + lcEHR + traceEHR;
    c.RES += characterRES + lcRES + traceRES;
    c.BE  += characterBE + lcBE + traceBE;
    c.ERR += characterERR + lcERR + traceERR;
    c.OHB += characterOHB + lcOHB + traceOHB;
    c.Physical_DMG  += tracePhysical_DMG + 0.10 * p2(sets.ChampionOfStreetwiseBoxing);
    c.Fire_DMG      += traceFire_DMG + 0.10 * p2(sets.FiresmithOfLavaForging);
    c.Ice_DMG       += traceIce_DMG + 0.10 * p2(sets.HunterOfGlacialForest);
    c.Lightning_DMG += traceLightning_DMG + 0.10 * p2(sets.BandOfSizzlingThunder);
    c.Wind_DMG      += traceWind_DMG + 0.10 * p2(sets.EagleOfTwilightLine);
    c.Quantum_DMG   += traceQuantum_DMG + 0.10 * p2(sets.GeniusOfBrilliantStars);
    c.Imaginary_DMG += traceImaginary_DMG + 0.10 * p2(sets.WastelanderOfBanditryDesert);

    // Calculate set effects

    c.SPD += (baseSPD) * (
      0.06 * p2(sets.MessengerTraversingHackerspace) +
      0.06 * p2(sets.ForgeOfTheKalpagniLantern) +
      0.06 * p4(sets.MusketeerOfWildWheat) +
      0.06 * p2(sets.SacerdosRelivedOrdeal)
    );

    c.HP += (baseHP) * (
      0.12 * p2(sets.FleetOfTheAgeless) +
      0.12 * p2(sets.LongevousDisciple)
    );

    c.ATK += (baseATK) * (
      0.12 * p2(sets.SpaceSealingStation) +
      0.12 * p2(sets.FirmamentFrontlineGlamoth) +
      0.12 * p2(sets.MusketeerOfWildWheat) +
      0.12 * p2(sets.PrisonerInDeepConfinement) +
      0.12 * p2(sets.IzumoGenseiAndTakamaDivineRealm) +
      0.12 * p2(sets.TheWindSoaringValorous)
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
      0.08 * p2(sets.ScholarLostInErudition)
    );

    c.CD += (
      0.16 * p2(sets.CelestialDifferentiator) +
      0.16 * p2(sets.TheWondrousBananAmusementPark)
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

    for (var actionIndex = actionCount - 1; actionIndex >= 0; actionIndex--) {
      let action = actions[actionIndex];
      var x = action.x;
      let setConditionals = action.setConditionals;
      var state = ConditionalState();
      state.actionIndex = actionIndex;

      let p_x = &x;
      let p_state = &state;
      x.sets = sets;

      if (p4(sets.MessengerTraversingHackerspace) >= 1 && setConditionals.enabledMessengerTraversingHackerspace == true) {
        x.SPD_P += 0.12;
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

      // DEF


      // HP


      // CD

      if (p4(sets.HunterOfGlacialForest) >= 1 && setConditionals.enabledHunterOfGlacialForest == true) {
        x.CD += 0.25;
      }
      if (p4(sets.WastelanderOfBanditryDesert) >= 1 && setConditionals.valueWastelanderOfBanditryDesert == 2) {
        x.CD += 0.10;
      }
      if (p4(sets.PioneerDiverOfDeadWaters) >= 1) {
        x.CD += getPioneerSetCd(setConditionals.valuePioneerDiverOfDeadWaters);
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

      // CR

      if (p4(sets.WastelanderOfBanditryDesert) >= 1 && setConditionals.valueWastelanderOfBanditryDesert > 0) {
        x.CR += 0.10;
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

      // BE

      if (p4(sets.WatchmakerMasterOfDreamMachinations) >= 1 && setConditionals.enabledWatchmakerMasterOfDreamMachinations == true) {
        x.BE += 0.30;
      }
      if (p2(sets.ForgeOfTheKalpagniLantern) >= 1 && setConditionals.enabledForgeOfTheKalpagniLantern == true) {
        x.BE += 0.40;
      }

      // Buffs

      // Basic boost
      if (p4(sets.MusketeerOfWildWheat) >= 1) {
        buffAbilityDmg(&x, BASIC_TYPE, 0.10, 1);
      }

      // Skill boost
      if (p4(sets.FiresmithOfLavaForging) >= 1) {
        buffAbilityDmg(&x, SKILL_TYPE, 0.12, 1);
      }

      // Fua boost
      if (p2(sets.TheAshblazingGrandDuke) >= 1) {
        buffAbilityDmg(&x, FUA_TYPE, 0.20, 1);
      }
      if (p2(sets.DuranDynastyOfRunningWolves) >= 1) {
        buffAbilityDmg(&x, FUA_TYPE, 0.05 * f32(setConditionals.valueDuranDynastyOfRunningWolves), 1);
      }

      // Ult boost
      if (p4(sets.TheWindSoaringValorous) >= 1) {
        buffAbilityDmg(&x, ULT_TYPE, 0.36 * f32(setConditionals.enabledTheWindSoaringValorous), 1);
      }

      if (p4(sets.ScholarLostInErudition) >= 1) {
        buffAbilityDmg(&x, SKILL_TYPE | ULT_TYPE, 0.20, 1);

        if (setConditionals.enabledScholarLostInErudition == true) {
          buffAbilityDmg(&x, SKILL_TYPE, 0.25, 1);
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

      if (p2(sets.FiresmithOfLavaForging) >= 1 && setConditionals.enabledFiresmithOfLavaForging == true) {
        x.Fire_DMG += 0.12;
      }

      //

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

      //

      x.ATK += x.ATK_P * baseATK;
      x.DEF += x.DEF_P * baseDEF;
      x.HP += x.HP_P * baseHP;
      x.SPD += x.SPD_P * baseSPD;

      evaluateDependenciesSPD(p_x, p_state);
      evaluateDependenciesBE(p_x, p_state);

      evaluateDependenciesHP(p_x, p_state);
      evaluateDependenciesATK(p_x, p_state);
      evaluateDependenciesDEF(p_x, p_state);
      evaluateDependenciesCR(p_x, p_state);
      evaluateDependenciesCD(p_x, p_state);
      evaluateDependenciesEHR(p_x, p_state);
      evaluateDependenciesRES(p_x, p_state);
      evaluateDependenciesOHB(p_x, p_state);
      evaluateDependenciesERR(p_x, p_state);

      evaluateDependenciesSPD(p_x, p_state);
      evaluateDependenciesBE(p_x, p_state);

      evaluateDependenciesHP(p_x, p_state);
      evaluateDependenciesATK(p_x, p_state);
      evaluateDependenciesDEF(p_x, p_state);
      evaluateDependenciesCR(p_x, p_state);
      evaluateDependenciesCD(p_x, p_state);
      evaluateDependenciesEHR(p_x, p_state);
      evaluateDependenciesRES(p_x, p_state);
      evaluateDependenciesOHB(p_x, p_state);
      evaluateDependenciesERR(p_x, p_state);


      // START ACTION CONDITIONALS
      // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
      /* INJECT ACTION CONDITIONALS */
      // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
      // END ACTION CONDITIONALS


      // Calculate damage
      let eLevel: f32 = f32(enemyLevel);

      addComputedElementalDmg(&x);

      let baseDmgBoost = 1 + x.ELEMENTAL_DMG;
      let baseDefPen = x.DEF_PEN + combatBuffsDEF_PEN;
      let baseUniversalMulti = 0.9 + x.ENEMY_WEAKNESS_BROKEN * 0.1;
      let baseResistance = resistance - x.RES_PEN - combatBuffsRES_PEN - getElementalResPen(&x);
      let baseBreakEfficiencyBoost = 1 + x.BREAK_EFFICIENCY_BOOST;

      // === Super / Break ===

      x.BREAK_DMG
        = baseUniversalMulti
        * 3767.5533
        * ELEMENTAL_BREAK_SCALING
        * calculateDefMulti(baseDefPen + x.BREAK_DEF_PEN)
        * (0.5 + enemyMaxToughness / 120)
        * (1 + x.VULNERABILITY + x.BREAK_VULNERABILITY)
        * (1 - baseResistance)
        * (1 + x.BE)
        * (1 + x.BREAK_BOOST);

      let baseSuperBreakModifier = x.SUPER_BREAK_MODIFIER + x.SUPER_BREAK_HMC_MODIFIER;

      let baseSuperBreakInstanceDmg
        = baseUniversalMulti
        * 3767.5533
        * calculateDefMulti(baseDefPen + x.BREAK_DEF_PEN + x.SUPER_BREAK_DEF_PEN)
        * (1 + x.VULNERABILITY + x.BREAK_VULNERABILITY)
        * (1 - baseResistance)
        * (1 + x.BE)
        * (1 + x.BREAK_BOOST)
        * (0.03333333333f);

      if (actionIndex == 0) {
        let dotDmgBoostMulti = baseDmgBoost + x.DOT_BOOST;
        let dotDefMulti = calculateDefMulti(baseDefPen + x.DOT_DEF_PEN);
        let dotVulnerabilityMulti = 1 + x.VULNERABILITY + x.DOT_VULNERABILITY;
        let dotResMulti = 1 - (baseResistance - x.DOT_RES_PEN);
        let dotEhrMulti = calculateEhrMulti(p_x);

        if (x.DOT_DMG > 0) {
          x.DOT_DMG = x.DOT_DMG
            * (baseUniversalMulti)
            * (dotDmgBoostMulti)
            * (dotDefMulti)
            * (dotVulnerabilityMulti)
            * (dotResMulti)
            * (dotEhrMulti);
        }

        if (x.HEAL_VALUE > 0) {
          x.HEAL_VALUE = x.HEAL_VALUE * (
            1
            + x.OHB
            + select(0, x.SKILL_OHB, x.HEAL_TYPE == SKILL_TYPE)
            + select(0, x.ULT_OHB, x.HEAL_TYPE == ULT_TYPE)
          );
        }

        if (x.SHIELD_VALUE > 0) {
          x.SHIELD_VALUE = x.SHIELD_VALUE * (1 + 0.20 * p4(x.sets.KnightOfPurityPalace));
        }

        x.EHP = x.HP / (1 - x.DEF / (x.DEF + 200 + 10 * eLevel)) * (1 / ((1 - 0.08 * p2(x.sets.GuardOfWutheringSnow)) * x.DMG_RED_MULTI));
      }

      if (action.abilityType == 1 || actionIndex == 0) {
        x.BASIC_DMG = calculateAbilityDmg(
          p_x,
          baseUniversalMulti,
          baseDmgBoost,
          baseDefPen,
          baseResistance,
          baseSuperBreakInstanceDmg,
          baseSuperBreakModifier,
          baseBreakEfficiencyBoost,
          x.BASIC_DMG,
          x.BASIC_BOOST,
          x.BASIC_VULNERABILITY,
          x.BASIC_DEF_PEN,
          x.BASIC_RES_PEN,
          x.BASIC_CR_BOOST,
          x.BASIC_CD_BOOST,
          x.BASIC_ORIGINAL_DMG_BOOST,
          x.BASIC_BREAK_EFFICIENCY_BOOST,
          x.BASIC_SUPER_BREAK_MODIFIER,
          x.BASIC_BREAK_DMG_MODIFIER,
          x.BASIC_TOUGHNESS_DMG,
          x.BASIC_ADDITIONAL_DMG,
          0, // x.BASIC_ADDITIONAL_DMG_CR_OVERRIDE,
          0, // x.BASIC_ADDITIONAL_DMG_CD_OVERRIDE,
        );
      }

      if (action.abilityType == 2 || actionIndex == 0) {
        x.SKILL_DMG = calculateAbilityDmg(
          p_x,
          baseUniversalMulti,
          baseDmgBoost,
          baseDefPen,
          baseResistance,
          baseSuperBreakInstanceDmg,
          baseSuperBreakModifier,
          baseBreakEfficiencyBoost,
          x.SKILL_DMG,
          x.SKILL_BOOST,
          x.SKILL_VULNERABILITY,
          x.SKILL_DEF_PEN,
          x.SKILL_RES_PEN,
          x.SKILL_CR_BOOST,
          x.SKILL_CD_BOOST,
          x.SKILL_ORIGINAL_DMG_BOOST,
          0, // x.SKILL_BREAK_EFFICIENCY_BOOST,
          0, // x.SKILL_SUPER_BREAK_MODIFIER,
          0, // x.SKILL_BREAK_DMG_MODIFIER,
          x.SKILL_TOUGHNESS_DMG,
          x.SKILL_ADDITIONAL_DMG,
          0, // x.SKILL_ADDITIONAL_DMG_CR_OVERRIDE,
          0, // x.SKILL_ADDITIONAL_DMG_CD_OVERRIDE,
        );
      }

      if (action.abilityType == 4 || actionIndex == 0) {
        x.ULT_DMG = calculateAbilityDmg(
          p_x,
          baseUniversalMulti,
          baseDmgBoost,
          baseDefPen,
          baseResistance,
          baseSuperBreakInstanceDmg,
          baseSuperBreakModifier,
          baseBreakEfficiencyBoost,
          x.ULT_DMG,
          x.ULT_BOOST,
          x.ULT_VULNERABILITY,
          x.ULT_DEF_PEN,
          x.ULT_RES_PEN,
          x.ULT_CR_BOOST,
          x.ULT_CD_BOOST,
          x.ULT_ORIGINAL_DMG_BOOST,
          x.ULT_BREAK_EFFICIENCY_BOOST,
          0, // x.ULT_SUPER_BREAK_MODIFIER,
          0, // x.ULT_BREAK_DMG_MODIFIER,
          x.ULT_TOUGHNESS_DMG,
          x.ULT_ADDITIONAL_DMG,
          x.ULT_ADDITIONAL_DMG_CR_OVERRIDE,
          x.ULT_ADDITIONAL_DMG_CD_OVERRIDE,
        );
      }

      if (action.abilityType == 8 || actionIndex == 0) {
        x.FUA_DMG = calculateAbilityDmg(
          p_x,
          baseUniversalMulti,
          baseDmgBoost,
          baseDefPen,
          baseResistance,
          baseSuperBreakInstanceDmg,
          baseSuperBreakModifier,
          baseBreakEfficiencyBoost,
          x.FUA_DMG,
          x.FUA_BOOST,
          x.FUA_VULNERABILITY,
          x.FUA_DEF_PEN,
          x.FUA_RES_PEN,
          x.FUA_CR_BOOST,
          x.FUA_CD_BOOST,
          0, // x.FUA_ORIGINAL_DMG_BOOST,
          0, // x.FUA_BREAK_EFFICIENCY_BOOST,
          0, // x.FUA_SUPER_BREAK_MODIFIER,
          0, // x.FUA_BREAK_DMG_MODIFIER,
          x.FUA_TOUGHNESS_DMG,
          x.FUA_ADDITIONAL_DMG,
          0, // x.FUA_ADDITIONAL_DMG_CR_OVERRIDE,
          0, // x.FUA_ADDITIONAL_DMG_CD_OVERRIDE,
        );
      }

      if (actionIndex > 0) {
        if (action.abilityType == 1) {
          combo += x.BASIC_DMG;
        } else if (action.abilityType == 2) {
          combo += x.SKILL_DMG;
        } else if (action.abilityType == 4) {
          combo += x.ULT_DMG;
        } else if (action.abilityType == 8) {
          combo += x.FUA_DMG;
        }
      } else {
        x.COMBO_DMG = combo + comboDot * x.DOT_DMG + comboBreak * x.BREAK_DMG;

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



        // START RETURN VALUE
        // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
        /* INJECT RETURN VALUE */
        // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
        // END RETURN VALUE
      }
    }
  }
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
    (1 + x.DOT_SPLIT * effectiveDotChance * (x.DOT_STACKS - 1)) / (1 + 0.05 * (x.DOT_STACKS - 1)),
    x.DOT_SPLIT > 0
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
  baseSuperBreakModifier: f32,
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
    let abilityOriginalDmgMulti = 1 + abilityOriginalDmgBoost;

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
  if (baseSuperBreakModifier + abilitySuperBreakModifier > 0) {
    abilitySuperBreakDmgOutput = baseSuperBreakInstanceDmg
      * (baseSuperBreakModifier + abilitySuperBreakModifier)
      * (baseBreakEfficiencyBoost + abilityBreakEfficiencyBoost)
      * (abilityToughnessDmg);
  }

  // === Additional DMG ===

  var abilityAdditionalDmgOutput: f32 = 0;
  if (abilityAdditionalDmg > 0) {
    let additionalDmgCr = select(min(1, x.CR), abilityAdditionalCrOverride, abilityAdditionalCrOverride > 0);
    let additionalDmgCd = select(x.CD, abilityAdditionalCdOverride, abilityAdditionalCdOverride > 0);
    let abilityAdditionalCritMulti = additionalDmgCr * (1 + additionalDmgCd) + (1 - additionalDmgCr);
    abilityAdditionalDmgOutput = abilityAdditionalDmg
      * (baseUniversalMulti)
      * (baseDmgBoost)
      * calculateDefMulti(baseDefPen)
      * (1 + x.VULNERABILITY)
      * (abilityAdditionalCritMulti)
      * (1 - baseResistance);
  }

  return abilityCritDmgOutput
    + abilityBreakDmgOutput
    + abilitySuperBreakDmgOutput
    + abilityAdditionalDmgOutput;
}

fn p2(n: i32) -> f32 {
  return f32(min(1, n >> 1));
}
fn p4(n: i32) -> f32 {
  return f32(n >> 2);
}

fn buffAbilityDmg(
  p_x: ptr<function, ComputedStats>,
  abilityTypeFlags: i32,
  value: f32,
  condition: i32
) {
  if ((abilityTypeFlags & i32((*p_x).BASIC_DMG_TYPE)) != 0) {
    (*p_x).BASIC_BOOST += value;
  }
  if ((abilityTypeFlags & i32((*p_x).SKILL_DMG_TYPE)) != 0) {
    (*p_x).SKILL_BOOST += value;
  }
  if ((abilityTypeFlags & i32((*p_x).ULT_DMG_TYPE)) != 0) {
    (*p_x).ULT_BOOST += value;
  }
  if ((abilityTypeFlags & i32((*p_x).FUA_DMG_TYPE)) != 0) {
    (*p_x).FUA_BOOST += value;
  }
  if ((abilityTypeFlags & i32((*p_x).DOT_DMG_TYPE)) != 0) {
    (*p_x).DOT_BOOST += value;
  }
  if ((abilityTypeFlags & i32((*p_x).BREAK_DMG_TYPE)) != 0) {
    (*p_x).BREAK_BOOST += value;
  }
}

fn buffAbilityCr(
  p_x: ptr<function, ComputedStats>,
  abilityTypeFlags: i32,
  value: f32,
  condition: i32
) {
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
}

fn buffAbilityCd(
  p_x: ptr<function, ComputedStats>,
  abilityTypeFlags: i32,
  value: f32,
  condition: i32
) {
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
}

fn addElementalDmg(
  c_x: ptr<function, BasicStats>,
  p_x: ptr<function, ComputedStats>,
) {
  switch (ELEMENT_INDEX) {
    case 0: {
      (*p_x).ELEMENTAL_DMG += (*c_x).Physical_DMG;
    }
    case 1: {
      (*p_x).ELEMENTAL_DMG += (*c_x).Fire_DMG;
    }
    case 2: {
      (*p_x).ELEMENTAL_DMG += (*c_x).Ice_DMG;
    }
    case 3: {
      (*p_x).ELEMENTAL_DMG += (*c_x).Lightning_DMG;
    }
    case 4: {
      (*p_x).ELEMENTAL_DMG += (*c_x).Wind_DMG;
    }
    case 5: {
      (*p_x).ELEMENTAL_DMG += (*c_x).Quantum_DMG;
    }
    case 6: {
      (*p_x).ELEMENTAL_DMG += (*c_x).Imaginary_DMG;
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
      (*p_x).ELEMENTAL_DMG += (*p_x).Physical_DMG;
    }
    case 1: {
      (*p_x).ELEMENTAL_DMG += (*p_x).Fire_DMG;
    }
    case 2: {
      (*p_x).ELEMENTAL_DMG += (*p_x).Ice_DMG;
    }
    case 3: {
      (*p_x).ELEMENTAL_DMG += (*p_x).Lightning_DMG;
    }
    case 4: {
      (*p_x).ELEMENTAL_DMG += (*p_x).Wind_DMG;
    }
    case 5: {
      (*p_x).ELEMENTAL_DMG += (*p_x).Quantum_DMG;
    }
    case 6: {
      (*p_x).ELEMENTAL_DMG += (*p_x).Imaginary_DMG;
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

fn getPioneerSetCd(
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

fn calculateAshblazingSet(
  p_x: ptr<function, ComputedStats>,
  p_state: ptr<function, ConditionalState>,
  hitMulti: f32,
) -> f32 {
  if (p4((*p_x).sets.TheAshblazingGrandDuke) >= 1) {
    let ashblazingAtk = 0.06 * f32(actions[(*p_state).actionIndex].setConditionals.valueTheAshblazingGrandDuke) * baseATK;
    let ashblazingMulti = hitMulti * baseATK;

    return ashblazingMulti - ashblazingAtk;
  }

  return 0;
}
