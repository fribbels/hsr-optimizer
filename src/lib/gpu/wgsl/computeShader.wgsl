// START GPU PARAMS
// ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
/* INJECT GPU PARAMS */
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
// END GPU PARAMS


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
// ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
/* INJECT RESULTS BUFFER */
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
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
    // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
    /* INJECT SET FILTERS */
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
    // END SET FILTERS



    // START COMPUTED STATS
    // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
    /* INJECT COMPUTED STATS */
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
    // END COMPUTED STATS



    // Calculate relic set counts

    x.sets.PasserbyOfWanderingCloud            = i32((1 >> (setH ^ 0)) + (1 >> (setG ^ 0)) + (1 >> (setB ^ 0)) + (1 >> (setF ^ 0)));
    x.sets.MusketeerOfWildWheat                = i32((1 >> (setH ^ 1)) + (1 >> (setG ^ 1)) + (1 >> (setB ^ 1)) + (1 >> (setF ^ 1)));
    x.sets.KnightOfPurityPalace                = i32((1 >> (setH ^ 2)) + (1 >> (setG ^ 2)) + (1 >> (setB ^ 2)) + (1 >> (setF ^ 2)));
    x.sets.HunterOfGlacialForest               = i32((1 >> (setH ^ 3)) + (1 >> (setG ^ 3)) + (1 >> (setB ^ 3)) + (1 >> (setF ^ 3)));
    x.sets.ChampionOfStreetwiseBoxing          = i32((1 >> (setH ^ 4)) + (1 >> (setG ^ 4)) + (1 >> (setB ^ 4)) + (1 >> (setF ^ 4)));
    x.sets.GuardOfWutheringSnow                = i32((1 >> (setH ^ 5)) + (1 >> (setG ^ 5)) + (1 >> (setB ^ 5)) + (1 >> (setF ^ 5)));
    x.sets.FiresmithOfLavaForging              = i32((1 >> (setH ^ 6)) + (1 >> (setG ^ 6)) + (1 >> (setB ^ 6)) + (1 >> (setF ^ 6)));
    x.sets.GeniusOfBrilliantStars              = i32((1 >> (setH ^ 7)) + (1 >> (setG ^ 7)) + (1 >> (setB ^ 7)) + (1 >> (setF ^ 7)));
    x.sets.BandOfSizzlingThunder               = i32((1 >> (setH ^ 8)) + (1 >> (setG ^ 8)) + (1 >> (setB ^ 8)) + (1 >> (setF ^ 8)));
    x.sets.EagleOfTwilightLine                 = i32((1 >> (setH ^ 9)) + (1 >> (setG ^ 9)) + (1 >> (setB ^ 9)) + (1 >> (setF ^ 9)));
    x.sets.ThiefOfShootingMeteor               = i32((1 >> (setH ^ 10)) + (1 >> (setG ^ 10)) + (1 >> (setB ^ 10)) + (1 >> (setF ^ 10)));
    x.sets.WastelanderOfBanditryDesert         = i32((1 >> (setH ^ 11)) + (1 >> (setG ^ 11)) + (1 >> (setB ^ 11)) + (1 >> (setF ^ 11)));
    x.sets.LongevousDisciple                   = i32((1 >> (setH ^ 12)) + (1 >> (setG ^ 12)) + (1 >> (setB ^ 12)) + (1 >> (setF ^ 12)));
    x.sets.MessengerTraversingHackerspace      = i32((1 >> (setH ^ 13)) + (1 >> (setG ^ 13)) + (1 >> (setB ^ 13)) + (1 >> (setF ^ 13)));
    x.sets.TheAshblazingGrandDuke              = i32((1 >> (setH ^ 14)) + (1 >> (setG ^ 14)) + (1 >> (setB ^ 14)) + (1 >> (setF ^ 14)));
    x.sets.PrisonerInDeepConfinement           = i32((1 >> (setH ^ 15)) + (1 >> (setG ^ 15)) + (1 >> (setB ^ 15)) + (1 >> (setF ^ 15)));
    x.sets.PioneerDiverOfDeadWaters            = i32((1 >> (setH ^ 16)) + (1 >> (setG ^ 16)) + (1 >> (setB ^ 16)) + (1 >> (setF ^ 16)));
    x.sets.WatchmakerMasterOfDreamMachinations = i32((1 >> (setH ^ 17)) + (1 >> (setG ^ 17)) + (1 >> (setB ^ 17)) + (1 >> (setF ^ 17)));
    x.sets.IronCavalryAgainstTheScourge        = i32((1 >> (setH ^ 18)) + (1 >> (setG ^ 18)) + (1 >> (setB ^ 18)) + (1 >> (setF ^ 18)));
    x.sets.TheWindSoaringValorous              = i32((1 >> (setH ^ 19)) + (1 >> (setG ^ 19)) + (1 >> (setB ^ 19)) + (1 >> (setF ^ 19)));
    x.sets.SacerdosRelivedOrdeal               = i32((1 >> (setH ^ 20)) + (1 >> (setG ^ 20)) + (1 >> (setB ^ 20)) + (1 >> (setF ^ 20)));
    x.sets.ScholarLostInErudition              = i32((1 >> (setH ^ 21)) + (1 >> (setG ^ 21)) + (1 >> (setB ^ 21)) + (1 >> (setF ^ 21)));

    // Calculate ornament set counts

    x.sets.SpaceSealingStation             = i32((1 >> (setP ^ 0)) + (1 >> (setL ^ 0)));
    x.sets.FleetOfTheAgeless               = i32((1 >> (setP ^ 1)) + (1 >> (setL ^ 1)));
    x.sets.PanCosmicCommercialEnterprise   = i32((1 >> (setP ^ 2)) + (1 >> (setL ^ 2)));
    x.sets.BelobogOfTheArchitects          = i32((1 >> (setP ^ 3)) + (1 >> (setL ^ 3)));
    x.sets.CelestialDifferentiator         = i32((1 >> (setP ^ 4)) + (1 >> (setL ^ 4)));
    x.sets.InertSalsotto                   = i32((1 >> (setP ^ 5)) + (1 >> (setL ^ 5)));
    x.sets.TaliaKingdomOfBanditry          = i32((1 >> (setP ^ 6)) + (1 >> (setL ^ 6)));
    x.sets.SprightlyVonwacq                = i32((1 >> (setP ^ 7)) + (1 >> (setL ^ 7)));
    x.sets.RutilantArena                   = i32((1 >> (setP ^ 8)) + (1 >> (setL ^ 8)));
    x.sets.BrokenKeel                      = i32((1 >> (setP ^ 9)) + (1 >> (setL ^ 9)));
    x.sets.FirmamentFrontlineGlamoth       = i32((1 >> (setP ^ 10)) + (1 >> (setL ^ 10)));
    x.sets.PenaconyLandOfTheDreams         = i32((1 >> (setP ^ 11)) + (1 >> (setL ^ 11)));
    x.sets.SigoniaTheUnclaimedDesolation   = i32((1 >> (setP ^ 12)) + (1 >> (setL ^ 12)));
    x.sets.IzumoGenseiAndTakamaDivineRealm = i32((1 >> (setP ^ 13)) + (1 >> (setL ^ 13)));
    x.sets.DuranDynastyOfRunningWolves     = i32((1 >> (setP ^ 14)) + (1 >> (setL ^ 14)));
    x.sets.ForgeOfTheKalpagniLantern       = i32((1 >> (setP ^ 15)) + (1 >> (setL ^ 15)));
    x.sets.LushakaTheSunkenSeas            = i32((1 >> (setP ^ 16)) + (1 >> (setL ^ 16)));
    x.sets.TheWondrousBananAmusementPark   = i32((1 >> (setP ^ 17)) + (1 >> (setL ^ 17)));

    var c: BasicStats = BasicStats();
    var state: ConditionalState = ConditionalState();

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
    c.Physical_DMG  += tracePhysical_DMG + 0.10 * p2(x.sets.ChampionOfStreetwiseBoxing);
    c.Fire_DMG      += traceFire_DMG + 0.10 * p2(x.sets.FiresmithOfLavaForging);
    c.Ice_DMG       += traceIce_DMG + 0.10 * p2(x.sets.HunterOfGlacialForest);
    c.Lightning_DMG += traceLightning_DMG + 0.10 * p2(x.sets.BandOfSizzlingThunder);
    c.Wind_DMG      += traceWind_DMG + 0.10 * p2(x.sets.EagleOfTwilightLine);
    c.Quantum_DMG   += traceQuantum_DMG + 0.10 * p2(x.sets.GeniusOfBrilliantStars);
    c.Imaginary_DMG += traceImaginary_DMG + 0.10 * p2(x.sets.WastelanderOfBanditryDesert);

    // Calculate set effects

    c.SPD += (baseSPD) * (
      0.06 * p2(x.sets.MessengerTraversingHackerspace) +
      0.06 * p2(x.sets.ForgeOfTheKalpagniLantern) +
      0.06 * p4(x.sets.MusketeerOfWildWheat) +
      0.06 * p2(x.sets.SacerdosRelivedOrdeal)
    );

    c.HP += (baseHP) * (
      0.12 * p2(x.sets.FleetOfTheAgeless) +
      0.12 * p2(x.sets.LongevousDisciple)
    );

    c.ATK += (baseATK) * (
      0.12 * p2(x.sets.SpaceSealingStation) +
      0.12 * p2(x.sets.FirmamentFrontlineGlamoth) +
      0.12 * p2(x.sets.MusketeerOfWildWheat) +
      0.12 * p2(x.sets.PrisonerInDeepConfinement) +
      0.12 * p2(x.sets.IzumoGenseiAndTakamaDivineRealm) +
      0.12 * p2(x.sets.TheWindSoaringValorous)
    );

    c.DEF += (baseDEF) * (
      0.15 * p2(x.sets.BelobogOfTheArchitects) +
      0.15 * p2(x.sets.KnightOfPurityPalace)
    );

    c.CR += (
      0.08 * p2(x.sets.InertSalsotto) +
      0.08 * p2(x.sets.RutilantArena) +
      0.04 * p4(x.sets.PioneerDiverOfDeadWaters) +
      0.04 * p2(x.sets.SigoniaTheUnclaimedDesolation) +
      0.06 * p4(x.sets.TheWindSoaringValorous) +
      0.06 * p2(x.sets.ScholarLostInErudition)
    );

    c.CD += (
      0.16 * p2(x.sets.CelestialDifferentiator) +
      0.16 * p2(x.sets.TheWondrousBananAmusementPark)
    );

    c.EHR += (
      0.10 * p2(x.sets.PanCosmicCommercialEnterprise)
    );

    c.RES += (
      0.10 * p2(x.sets.BrokenKeel)
    );

    c.BE += (
      0.16 * p2(x.sets.TaliaKingdomOfBanditry) +
      0.16 * p2(x.sets.ThiefOfShootingMeteor) +
      0.16 * p4(x.sets.ThiefOfShootingMeteor) +
      0.16 * p2(x.sets.WatchmakerMasterOfDreamMachinations) +
      0.16 * p2(x.sets.IronCavalryAgainstTheScourge)
    );

    c.ERR += (
      0.05 * p2(x.sets.SprightlyVonwacq) +
      0.05 * p2(x.sets.PenaconyLandOfTheDreams) +
      0.05 * p2(x.sets.LushakaTheSunkenSeas)
    );

    c.OHB += (
      0.10 * p2(x.sets.PasserbyOfWanderingCloud)
    );

    // Add base to computed

    x.ATK += c.ATK + combatBuffsATK + combatBuffsATK_P * baseATK;
    x.DEF += c.DEF + combatBuffsDEF + combatBuffsDEF_P * baseDEF;
    x.HP  += c.HP   + combatBuffsHP  + combatBuffsHP_P  * baseHP;
    x.SPD += c.SPD + combatBuffsSPD + combatBuffsSPD_P * baseSPD;
    x.CD  += c.CD   + combatBuffsCD;
    x.CR  += c.CR   + combatBuffsCR;
    x.EHR += c.EHR;
    x.RES += c.RES;
    x.BE  += c.BE   + combatBuffsBE;
    x.ERR += c.ERR;
    x.OHB += c.OHB;

    addElementalDmg(&c, &x);
    x.WEIGHT = epsilon + head.weightScore + hands.weightScore + body.weightScore + feet.weightScore + planarSphere.weightScore + linkRope.weightScore;

    x.ELEMENTAL_DMG += combatBuffsDMG_BOOST;
    x.EFFECT_RES_PEN += combatBuffsEFFECT_RES_PEN;
    x.VULNERABILITY += combatBuffsVULNERABILITY;
    x.BREAK_EFFICIENCY_BOOST += combatBuffsBREAK_EFFICIENCY;

    // ATK

    if (p4(x.sets.MessengerTraversingHackerspace) >= 1 && enabledMessengerTraversingHackerspace == 1) {
      x.SPD_P += 0.12;
    }

    // DEF

    if (p4(x.sets.ChampionOfStreetwiseBoxing) >= 1) {
      x.ATK_P += 0.05 * f32(valueChampionOfStreetwiseBoxing);
    }
    if (p4(x.sets.BandOfSizzlingThunder) >= 1 && enabledBandOfSizzlingThunder == 1) {
      x.ATK_P += 0.20;
    }
    if (p4(x.sets.TheAshblazingGrandDuke) >= 1) {
      x.ATK_P += 0.06 * f32(valueTheAshblazingGrandDuke);
    }

    // DEF


    // HP


    // CD

    if (p4(x.sets.HunterOfGlacialForest) >= 1 && enabledHunterOfGlacialForest == 1) {
      x.CD += 0.25;
    }
    if (p4(x.sets.WastelanderOfBanditryDesert) >= 1 && valueWastelanderOfBanditryDesert == 2) {
      x.CD += 0.10;
    }
    if (p4(x.sets.PioneerDiverOfDeadWaters) >= 1) {
      x.CD += getPioneerSetCd(valuePioneerDiverOfDeadWaters);
    }
    if (p2(x.sets.SigoniaTheUnclaimedDesolation) >= 1) {
      x.CD += 0.04 * f32(valueSigoniaTheUnclaimedDesolation);
    }
    if (p2(x.sets.DuranDynastyOfRunningWolves) >= 1 && valueDuranDynastyOfRunningWolves >= 5) {
      x.CD += 0.25;
    }
    if (p2(x.sets.TheWondrousBananAmusementPark) >= 1 && enabledTheWondrousBananAmusementPark == 1) {
      x.CD += 0.32;
    }

    // CR

    if (p4(x.sets.WastelanderOfBanditryDesert) >= 1 && valueWastelanderOfBanditryDesert > 0) {
      x.CR += 0.10;
    }
    if (p4(x.sets.LongevousDisciple) >= 1) {
      x.CR += 0.08 * f32(valueLongevousDisciple);
    }
    if (p4(x.sets.PioneerDiverOfDeadWaters) >= 1 && valuePioneerDiverOfDeadWaters > 2) {
      x.CR += 0.04;
    }
    if (p2(x.sets.IzumoGenseiAndTakamaDivineRealm) >= 1 && enabledIzumoGenseiAndTakamaDivineRealm == 1) {
      x.CR += 0.12;
    }

    // BE

    if (p4(x.sets.WatchmakerMasterOfDreamMachinations) >= 1 && enabledWatchmakerMasterOfDreamMachinations == 1) {
      x.BE += 0.30;
    }
    if (p2(x.sets.ForgeOfTheKalpagniLantern) >= 1 && enabledForgeOfTheKalpagniLantern == 1) {
      x.BE += 0.40;
    }

    // Buffs

    // Basic boost
    if (p4(x.sets.MusketeerOfWildWheat) >= 1) {
      buffAbilityDmg(&x, BASIC_TYPE, 0.10, 1);
    }

    // Skill boost
    if (p4(x.sets.FiresmithOfLavaForging) >= 1) {
      buffAbilityDmg(&x, SKILL_TYPE, 0.12, 1);
    }

    // Fua boost
    if (p2(x.sets.TheAshblazingGrandDuke) >= 1) {
      buffAbilityDmg(&x, FUA_TYPE, 0.20, 1);
    }
    if (p2(x.sets.DuranDynastyOfRunningWolves) >= 1) {
      buffAbilityDmg(&x, FUA_TYPE, 0.05 * f32(valueDuranDynastyOfRunningWolves), 1);
    }

    // Ult boost
    if (p4(x.sets.TheWindSoaringValorous) >= 1) {
      buffAbilityDmg(&x, ULT_TYPE, 0.36 * f32(enabledTheWindSoaringValorous), 1);
    }

    if (p4(x.sets.ScholarLostInErudition) >= 1) {
      buffAbilityDmg(&x, SKILL_TYPE | ULT_TYPE, 0.20, 1);

      if (f32(enabledScholarLostInErudition) >= 1.0) {
        buffAbilityDmg(&x, SKILL_TYPE, 0.20, 1);
      }
    }

    //

    if (p4(x.sets.GeniusOfBrilliantStars) >= 1) {
      if (enabledGeniusOfBrilliantStars == 1) {
        x.DEF_PEN += 0.20;
      } else {
        x.DEF_PEN += 0.10;
      }
    }

    if (p4(x.sets.PrisonerInDeepConfinement) >= 1) {
      x.DEF_PEN += 0.06 * f32(valuePrisonerInDeepConfinement);
    }

    if (p2(x.sets.PioneerDiverOfDeadWaters) >= 1) {
      x.ELEMENTAL_DMG += 0.12;
    }

    if (p2(x.sets.FiresmithOfLavaForging) >= 1 && enabledFiresmithOfLavaForging == 1) {
      x.Fire_DMG += 0.12;
    }

    // Set effects

    // Dynamic stat conditionals

    x.ATK += x.ATK_P * baseATK;
    x.DEF += x.DEF_P * baseDEF;
    x.HP += x.HP_P * baseHP;
    x.SPD += x.SPD_P * baseSPD;

    let p_x = &x;
    let p_state = &state;

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


    // START LIGHT CONE CONDITIONALS
    // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
    /* INJECT LIGHT CONE CONDITIONALS */
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
    // END LIGHT CONE CONDITIONALS




    // START CHARACTER CONDITIONALS
    // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
    /* INJECT CHARACTER CONDITIONALS */
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
    // END CHARACTER CONDITIONALS


    // Calculate damage
    let cLevel: f32 = 80;
    let eLevel: f32 = f32(enemyLevel);
    let defReduction: f32 = x.DEF_PEN + combatBuffsDEF_PEN;
    let defIgnore: f32 = 0.0;

    addComputedElementalDmg(&x);

    let dmgBoostMultiplier: f32 = 1 + x.ELEMENTAL_DMG;
    let dmgReductionMultiplier: f32 = 1;

    let ehp: f32 = x.HP / (1 - x.DEF / (x.DEF + 200 + 10 * eLevel)) * (1 / ((1 - 0.08 * p2(x.sets.GuardOfWutheringSnow)) * x.DMG_RED_MULTI));
    x.EHP = ehp;

    let brokenMultiplier = 0.9 + x.ENEMY_WEAKNESS_BROKEN * 0.1;

    let universalMulti = dmgReductionMultiplier * brokenMultiplier;
    let baseResistance = resistance - x.RES_PEN - getElementalResPen(&x);

    let ULT_CD = select(x.CD + x.ULT_CD_BOOST, x.ULT_CD_OVERRIDE, x.ULT_CD_OVERRIDE > 0);

    let breakVulnerability = 1.0 + x.VULNERABILITY + x.BREAK_VULNERABILITY;
    let basicVulnerability = 1.0 + x.VULNERABILITY + x.BASIC_VULNERABILITY;
    let skillVulnerability = 1.0 + x.VULNERABILITY + x.SKILL_VULNERABILITY;
    let ultVulnerability = 1.0 + x.VULNERABILITY + x.ULT_VULNERABILITY * x.ULT_BOOSTS_MULTI;
    let fuaVulnerability = 1.0 + x.VULNERABILITY + x.FUA_VULNERABILITY;
    let dotVulnerability = 1.0 + x.VULNERABILITY + x.DOT_VULNERABILITY;

    let ENEMY_EFFECT_RES = enemyEffectResistance;

    // For stacking dots where the first stack has extra value
    // c = dot chance, s = stacks => avg dmg = (full dmg) * (1 + 0.05 * c * (s-1)) / (1 + 0.05 * (s-1))
    let effectiveDotChance = min(1, x.DOT_CHANCE * (1 + x.EHR) * (1 - ENEMY_EFFECT_RES + x.EFFECT_RES_PEN));
    let dotEhrMultiplier = select(effectiveDotChance, (1 + x.DOT_SPLIT * effectiveDotChance * (x.DOT_STACKS - 1)) / (1 + 0.05 * (x.DOT_STACKS - 1)), x.DOT_SPLIT > 0);

    // BREAK
    let maxToughness = enemyMaxToughness;

    x.BREAK_DMG
      = universalMulti
      * 3767.5533
      * ELEMENTAL_BREAK_SCALING
      * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.BREAK_DEF_PEN)
      * (0.5 + maxToughness / 120)
      * breakVulnerability
      * (1.0 - baseResistance)
      * (1.0 + x.BE);

    let SUPER_BREAK_DMG
      = universalMulti
      * 3767.5533
      * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.BREAK_DEF_PEN + x.SUPER_BREAK_DEF_PEN)
      * breakVulnerability
      * (1.0 - baseResistance)
      * (1.0 + x.BE)
      * (x.SUPER_BREAK_MODIFIER + x.SUPER_BREAK_HMC_MODIFIER)
      * (1.0 / 30.0)
      * (1.0 + x.BREAK_EFFICIENCY_BOOST);

    let BASIC_SUPER_BREAK_DMG
      = universalMulti
      * 3767.5533
      * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.BREAK_DEF_PEN + x.SUPER_BREAK_DEF_PEN)
      * breakVulnerability
      * (1.0 - baseResistance)
      * (1.0 + x.BE)
      * (x.BASIC_SUPER_BREAK_MODIFIER + x.SUPER_BREAK_HMC_MODIFIER)
      * (1.0 / 30.0)
      * (1.0 + x.BREAK_EFFICIENCY_BOOST);

    let ACTUAL_BASIC_SUPER_BREAK_DMG = select(SUPER_BREAK_DMG, BASIC_SUPER_BREAK_DMG, BASIC_SUPER_BREAK_DMG > 0);

    x.BASIC_DMG
      = x.BASIC_DMG
      * universalMulti
      * (dmgBoostMultiplier + x.BASIC_BOOST)
      * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.BASIC_DEF_PEN)
      * ((basicVulnerability) * min(1, x.CR + x.BASIC_CR_BOOST) * (1.0 + x.CD + x.BASIC_CD_BOOST) + basicVulnerability * (1.0 - min(1.0, x.CR + x.BASIC_CR_BOOST)))
      * (1.0 - (baseResistance - x.BASIC_RES_PEN))
      * (1.0 + x.BASIC_ORIGINAL_DMG_BOOST)
      + (x.BASIC_BREAK_DMG_MODIFIER * x.BREAK_DMG)
      + (ACTUAL_BASIC_SUPER_BREAK_DMG * x.BASIC_TOUGHNESS_DMG * (1.0 + x.BASIC_BREAK_EFFICIENCY_BOOST));

    x.SKILL_DMG
      = x.SKILL_DMG
      * universalMulti
      * (dmgBoostMultiplier + x.SKILL_BOOST)
      * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.SKILL_DEF_PEN)
      * ((skillVulnerability) * min(1.0, x.CR + x.SKILL_CR_BOOST) * (1.0 + x.CD + x.SKILL_CD_BOOST) + skillVulnerability * (1.0 - min(1.0, x.CR + x.SKILL_CR_BOOST)))
      * (1.0 - (baseResistance - x.SKILL_RES_PEN))
      * (1.0 + x.SKILL_ORIGINAL_DMG_BOOST)
      + (SUPER_BREAK_DMG * x.SKILL_TOUGHNESS_DMG);

    x.ULT_DMG
      = x.ULT_DMG
      * universalMulti
      * (dmgBoostMultiplier + x.ULT_BOOST * x.ULT_BOOSTS_MULTI)
      * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.ULT_DEF_PEN * x.ULT_BOOSTS_MULTI)
      * ((ultVulnerability) * min(1.0, x.CR + x.ULT_CR_BOOST) * (1.0 + ULT_CD) + ultVulnerability * (1.0 - min(1, x.CR + x.ULT_CR_BOOST)))
      * (1 - (baseResistance - x.ULT_RES_PEN * x.ULT_BOOSTS_MULTI))
      * (1 + x.ULT_ORIGINAL_DMG_BOOST)
      + (SUPER_BREAK_DMG * x.ULT_TOUGHNESS_DMG * (1.0 + x.ULT_BREAK_EFFICIENCY_BOOST));

    x.FUA_DMG
      = x.FUA_DMG
      * universalMulti
      * (dmgBoostMultiplier + x.FUA_BOOST)
      * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.FUA_DEF_PEN)
      * ((fuaVulnerability) * min(1.0, x.CR + x.FUA_CR_BOOST) * (1.0 + x.CD + x.FUA_CD_BOOST) + fuaVulnerability * (1.0 - min(1.0, x.CR + x.FUA_CR_BOOST)))
      * (1.0 - (baseResistance - x.FUA_RES_PEN))
      + (SUPER_BREAK_DMG * x.FUA_TOUGHNESS_DMG);

    x.DOT_DMG
      = x.DOT_DMG
      * universalMulti
      * (dmgBoostMultiplier + x.DOT_BOOST)
      * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.DOT_DEF_PEN)
      * dotVulnerability
      * (1.0 - (baseResistance - x.DOT_RES_PEN))
      * dotEhrMultiplier;

    x.COMBO_DMG
      = BASIC_COMBO * x.BASIC_DMG
      + SKILL_COMBO * x.SKILL_DMG
      + ULT_COMBO * x.ULT_DMG
      + FUA_COMBO * x.FUA_DMG
      + DOT_COMBO * x.DOT_DMG
      + BREAK_COMBO * x.BREAK_DMG;


    // START COMBAT STAT FILTERS
    // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
    /* INJECT COMBAT STAT FILTERS */
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
    // END COMBAT STAT FILTERS



    // START BASIC STAT FILTERS
    // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
    /* INJECT BASIC STAT FILTERS */
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
    // END BASIC STAT FILTERS



    // START RETURN VALUE
    // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
    /* INJECT RETURN VALUE */
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
    // END RETURN VALUE
  }
}

fn p2(n: i32) -> f32 {
  return f32(min(1, n >> 1));
}
fn p4(n: i32) -> f32 {
  return f32(n >> 2);
}

fn calculateDefMultiplier(cLevel: f32, eLevel: f32, defReduction: f32, defIgnore: f32, additionalPen: f32) -> f32 {
  return (cLevel + 20.0f) / ((eLevel + 20.0f) * max(0.0f, 1.0f - defReduction - defIgnore - additionalPen) + cLevel + 20.0f);
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
    let ashblazingAtk = 0.06 * f32(valueTheAshblazingGrandDuke) * baseATK;
    let ashblazingMulti = hitMulti * baseATK;

    return ashblazingMulti - ashblazingAtk;
  }

  return 0;
}