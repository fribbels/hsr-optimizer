// <import structs>
// <import constants>

const WORKGROUP_SIZE = 16;

@group(0) @binding(0) var<storage, read_write> params : Params;
@group(0) @binding(1) var<storage, read_write> relics : array<Relic>;
@group(0) @binding(2) var<storage, read_write> results : array<f32>; // Temporarily f32 for testing, should be boolean

@group(1) @binding(0) var<storage, read_write> ornamentSetSolutionsMatrix : array<i32>;
@group(1) @binding(1) var<storage, read_write> relicSetSolutionsMatrix : array<i32>;
@compute @workgroup_size(WORKGROUP_SIZE, WORKGROUP_SIZE)
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

  // Calculate global_invocation_index
  let index = i32(workgroup_index * WORKGROUP_SIZE * WORKGROUP_SIZE + local_invocation_index);

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
  let relicSetCount = u32(params.relicSetCount);
  let ornamentSetCount = u32(params.ornamentSetCount);

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

  let setH : u32 = u32(head.relicSet);
  let setG : u32 = u32(hands.relicSet);
  let setB : u32 = u32(body.relicSet);
  let setF : u32 = u32(feet.relicSet);
  let setP : u32 = u32(planarSphere.relicSet);
  let setL : u32 = u32(linkRope.relicSet);

  // Get the index for set permutation lookup

  let relicSetIndex : u32 = setH + setB * relicSetCount + setG * relicSetCount * relicSetCount + setF * relicSetCount * relicSetCount * relicSetCount;
  let ornamentSetIndex: u32 = setP + setL * ornamentSetCount;

  var c : BasicStats = BasicStats();
  var x : ComputedStats = ComputedStats();

  x.BASIC_DMG_TYPE = 1;
  x.SKILL_DMG_TYPE = 2;
  x.ULT_DMG_TYPE = 4;
  x.FUA_DMG_TYPE = 8;
  x.DOT_DMG_TYPE = 16;
  x.BREAK_DMG_TYPE = 32;
  x.SUPER_BREAK_TYPE = 64;

  // Calculate relic stat sums

  let epsilon = 0.00001f;

  c.HP_P = head.HP_P + hands.HP_P + body.HP_P + feet.HP_P + planarSphere.HP_P + linkRope.HP_P;
  c.ATK_P = head.ATK_P + hands.ATK_P + body.ATK_P + feet.ATK_P + planarSphere.ATK_P + linkRope.ATK_P;
  c.DEF_P = head.DEF_P + hands.DEF_P + body.DEF_P + feet.DEF_P + planarSphere.DEF_P + linkRope.DEF_P;
  c.SPD_P = head.SPD_P + hands.SPD_P + body.SPD_P + feet.SPD_P + planarSphere.SPD_P + linkRope.SPD_P;
  c.HP = epsilon + head.HP + hands.HP + body.HP + feet.HP + planarSphere.HP + linkRope.HP;
  c.ATK = epsilon + head.ATK + hands.ATK + body.ATK + feet.ATK + planarSphere.ATK + linkRope.ATK;
  c.DEF = epsilon + head.DEF + hands.DEF + body.DEF + feet.DEF + planarSphere.DEF + linkRope.DEF;
  c.SPD = epsilon + head.SPD + hands.SPD + body.SPD + feet.SPD + planarSphere.SPD + linkRope.SPD;
  c.CR = epsilon + head.CR + hands.CR + body.CR + feet.CR + planarSphere.CR + linkRope.CR;
  c.CD = epsilon + head.CD + hands.CD + body.CD + feet.CD + planarSphere.CD + linkRope.CD;
  c.EHR = epsilon + head.EHR + hands.EHR + body.EHR + feet.EHR + planarSphere.EHR + linkRope.EHR;
  c.RES = epsilon + head.RES + hands.RES + body.RES + feet.RES + planarSphere.RES + linkRope.RES;
  c.BE = epsilon + head.BE + hands.BE + body.BE + feet.BE + planarSphere.BE + linkRope.BE;
  c.ERR = epsilon + head.ERR + hands.ERR + body.ERR + feet.ERR + planarSphere.ERR + linkRope.ERR;
  c.OHB = epsilon + head.OHB + hands.OHB + body.OHB + feet.OHB + planarSphere.OHB + linkRope.OHB;
  c.Physical_DMG = epsilon + head.Physical_DMG + hands.Physical_DMG + body.Physical_DMG + feet.Physical_DMG + planarSphere.Physical_DMG + linkRope.Physical_DMG;
  c.Fire_DMG = epsilon + head.Fire_DMG + hands.Fire_DMG + body.Fire_DMG + feet.Fire_DMG + planarSphere.Fire_DMG + linkRope.Fire_DMG;
  c.Ice_DMG = epsilon + head.Ice_DMG + hands.Ice_DMG + body.Ice_DMG + feet.Ice_DMG + planarSphere.Ice_DMG + linkRope.Ice_DMG;
  c.Lightning_DMG = epsilon + head.Lightning_DMG + hands.Lightning_DMG + body.Lightning_DMG + feet.Lightning_DMG + planarSphere.Lightning_DMG + linkRope.Lightning_DMG;
  c.Wind_DMG = epsilon + head.Wind_DMG + hands.Wind_DMG + body.Wind_DMG + feet.Wind_DMG + planarSphere.Wind_DMG + linkRope.Wind_DMG;
  c.Quantum_DMG = epsilon + head.Quantum_DMG + hands.Quantum_DMG + body.Quantum_DMG + feet.Quantum_DMG + planarSphere.Quantum_DMG + linkRope.Quantum_DMG;
  c.Imaginary_DMG = epsilon + head.Imaginary_DMG + hands.Imaginary_DMG + body.Imaginary_DMG + feet.Imaginary_DMG + planarSphere.Imaginary_DMG + linkRope.Imaginary_DMG;
  c.weightScore = epsilon + head.weightScore + hands.weightScore + body.weightScore + feet.weightScore + planarSphere.weightScore + linkRope.weightScore;

  // Calculate relic set counts

  c.sets.PasserbyOfWanderingCloud            = i32((1 >> (setH ^ 0)) + (1 >> (setG ^ 0)) + (1 >> (setB ^ 0)) + (1 >> (setF ^ 0)));
  c.sets.MusketeerOfWildWheat                = i32((1 >> (setH ^ 1)) + (1 >> (setG ^ 1)) + (1 >> (setB ^ 1)) + (1 >> (setF ^ 1)));
  c.sets.KnightOfPurityPalace                = i32((1 >> (setH ^ 2)) + (1 >> (setG ^ 2)) + (1 >> (setB ^ 2)) + (1 >> (setF ^ 2)));
  c.sets.HunterOfGlacialForest               = i32((1 >> (setH ^ 3)) + (1 >> (setG ^ 3)) + (1 >> (setB ^ 3)) + (1 >> (setF ^ 3)));
  c.sets.ChampionOfStreetwiseBoxing          = i32((1 >> (setH ^ 4)) + (1 >> (setG ^ 4)) + (1 >> (setB ^ 4)) + (1 >> (setF ^ 4)));
  c.sets.GuardOfWutheringSnow                = i32((1 >> (setH ^ 5)) + (1 >> (setG ^ 5)) + (1 >> (setB ^ 5)) + (1 >> (setF ^ 5)));
  c.sets.FiresmithOfLavaForging              = i32((1 >> (setH ^ 6)) + (1 >> (setG ^ 6)) + (1 >> (setB ^ 6)) + (1 >> (setF ^ 6)));
  c.sets.GeniusOfBrilliantStars              = i32((1 >> (setH ^ 7)) + (1 >> (setG ^ 7)) + (1 >> (setB ^ 7)) + (1 >> (setF ^ 7)));
  c.sets.BandOfSizzlingThunder               = i32((1 >> (setH ^ 8)) + (1 >> (setG ^ 8)) + (1 >> (setB ^ 8)) + (1 >> (setF ^ 8)));
  c.sets.EagleOfTwilightLine                 = i32((1 >> (setH ^ 9)) + (1 >> (setG ^ 9)) + (1 >> (setB ^ 9)) + (1 >> (setF ^ 9)));
  c.sets.ThiefOfShootingMeteor               = i32((1 >> (setH ^ 10)) + (1 >> (setG ^ 10)) + (1 >> (setB ^ 10)) + (1 >> (setF ^ 10)));
  c.sets.WastelanderOfBanditryDesert         = i32((1 >> (setH ^ 11)) + (1 >> (setG ^ 11)) + (1 >> (setB ^ 11)) + (1 >> (setF ^ 11)));
  c.sets.LongevousDisciple                   = i32((1 >> (setH ^ 12)) + (1 >> (setG ^ 12)) + (1 >> (setB ^ 12)) + (1 >> (setF ^ 12)));
  c.sets.MessengerTraversingHackerspace      = i32((1 >> (setH ^ 13)) + (1 >> (setG ^ 13)) + (1 >> (setB ^ 13)) + (1 >> (setF ^ 13)));
  c.sets.TheAshblazingGrandDuke              = i32((1 >> (setH ^ 14)) + (1 >> (setG ^ 14)) + (1 >> (setB ^ 14)) + (1 >> (setF ^ 14)));
  c.sets.PrisonerInDeepConfinement           = i32((1 >> (setH ^ 15)) + (1 >> (setG ^ 15)) + (1 >> (setB ^ 15)) + (1 >> (setF ^ 15)));
  c.sets.PioneerDiverOfDeadWaters            = i32((1 >> (setH ^ 16)) + (1 >> (setG ^ 16)) + (1 >> (setB ^ 16)) + (1 >> (setF ^ 16)));
  c.sets.WatchmakerMasterOfDreamMachinations = i32((1 >> (setH ^ 17)) + (1 >> (setG ^ 17)) + (1 >> (setB ^ 17)) + (1 >> (setF ^ 17)));
  c.sets.IronCavalryAgainstTheScourge        = i32((1 >> (setH ^ 18)) + (1 >> (setG ^ 18)) + (1 >> (setB ^ 18)) + (1 >> (setF ^ 18)));
  c.sets.TheWindSoaringValorous              = i32((1 >> (setH ^ 19)) + (1 >> (setG ^ 19)) + (1 >> (setB ^ 19)) + (1 >> (setF ^ 19)));

  // Calculate ornament set counts

  c.sets.SpaceSealingStation                 = i32((1 >> (setP ^ 0)) + (1 >> (setL ^ 0)));
  c.sets.FleetOfTheAgeless                   = i32((1 >> (setP ^ 1)) + (1 >> (setL ^ 1)));
  c.sets.PanCosmicCommercialEnterprise       = i32((1 >> (setP ^ 2)) + (1 >> (setL ^ 2)));
  c.sets.BelobogOfTheArchitects              = i32((1 >> (setP ^ 3)) + (1 >> (setL ^ 3)));
  c.sets.CelestialDifferentiator             = i32((1 >> (setP ^ 4)) + (1 >> (setL ^ 4)));
  c.sets.InertSalsotto                       = i32((1 >> (setP ^ 5)) + (1 >> (setL ^ 5)));
  c.sets.TaliaKingdomOfBanditry              = i32((1 >> (setP ^ 6)) + (1 >> (setL ^ 6)));
  c.sets.SprightlyVonwacq                    = i32((1 >> (setP ^ 7)) + (1 >> (setL ^ 7)));
  c.sets.RutilantArena                       = i32((1 >> (setP ^ 8)) + (1 >> (setL ^ 8)));
  c.sets.BrokenKeel                          = i32((1 >> (setP ^ 9)) + (1 >> (setL ^ 9)));
  c.sets.FirmamentFrontlineGlamoth           = i32((1 >> (setP ^ 10)) + (1 >> (setL ^ 10)));
  c.sets.PenaconyLandOfTheDreams             = i32((1 >> (setP ^ 11)) + (1 >> (setL ^ 11)));
  c.sets.SigoniaTheUnclaimedDesolation       = i32((1 >> (setP ^ 12)) + (1 >> (setL ^ 12)));
  c.sets.IzumoGenseiAndTakamaDivineRealm     = i32((1 >> (setP ^ 13)) + (1 >> (setL ^ 13)));
  c.sets.DuranDynastyOfRunningWolves         = i32((1 >> (setP ^ 14)) + (1 >> (setL ^ 14)));
  c.sets.ForgeOfTheKalpagniLantern           = i32((1 >> (setP ^ 15)) + (1 >> (setL ^ 15)));
  c.sets.LushakaTheSunkenSeas                = i32((1 >> (setP ^ 16)) + (1 >> (setL ^ 16)));
  c.sets.TheWondrousBananAmusementPark       = i32((1 >> (setP ^ 17)) + (1 >> (setL ^ 17)));

  // Base stats, this should probably be passed in from params

  let baseHP = characterHP + lcHP;
  let baseATK = characterATK + lcATK;
  let baseDEF = characterDEF + lcDEF;
  let baseSPD = characterSPD + lcSPD;

  // Calculate set effects

  let setEffects = 0.0f;
  let spdSetEffects = 0.06f * p2(c.sets.MessengerTraversingHackerspace);
  let crSetEffects = 0.08f * p2(c.sets.RutilantArena);

  // Calculate basic stats

  c.HP  = (baseHP) * (1 + setEffects + c.HP_P + traceHP_P + lcHP_P) + c.HP + traceHP;
  c.DEF = (baseDEF) * (1 + setEffects + c.DEF_P + traceDEF_P + lcDEF_P) + c.DEF + traceDEF;
  c.ATK = (baseATK) * (1 + setEffects + c.ATK_P + traceATK_P + lcATK_P) + c.ATK + traceATK;
  c.SPD = (baseSPD) * (1 + spdSetEffects + c.SPD_P + traceSPD_P + lcSPD_P) + c.SPD + traceSPD;
  c.CR  += characterCR + lcCR + traceCR + crSetEffects;
  c.CD  += characterCD + lcCD + traceCD + setEffects;
  c.EHR += characterEHR + lcEHR + traceEHR + setEffects;
  c.RES += characterRES + lcRES + traceRES + setEffects;
  c.BE  += characterBE + lcBE + traceBE + setEffects;
  c.ERR += characterERR + lcERR + traceERR + setEffects;
  c.OHB += characterOHB + lcOHB + traceOHB + setEffects;
  c.Physical_DMG += tracePhysical_DMG;
  c.Fire_DMG += traceFire_DMG;
  c.Ice_DMG += traceIce_DMG;
  c.Lightning_DMG += traceLightning_DMG;
  c.Wind_DMG += traceWind_DMG;
  c.Quantum_DMG += traceQuantum_DMG;
  c.Imaginary_DMG += traceImaginary_DMG;

  // Calculate elemental stats

  c.Physical_DMG += 0.10 * p2(c.sets.ChampionOfStreetwiseBoxing);
  c.Fire_DMG += 0.10 * p2(c.sets.FiresmithOfLavaForging);
  c.Ice_DMG += 0.10 * p2(c.sets.HunterOfGlacialForest);
  c.Lightning_DMG += 0.10 * p2(c.sets.BandOfSizzlingThunder);
  c.Wind_DMG += 0.10 * p2(c.sets.EagleOfTwilightLine);
  c.Quantum_DMG += 0.10 * p2(c.sets.GeniusOfBrilliantStars);
  c.Imaginary_DMG += 0.10 * p2(c.sets.WastelanderOfBanditryDesert);

  c.SPD += (baseSPD) * (
    0.06 * p2(c.sets.MessengerTraversingHackerspace) +
    0.06 * p2(c.sets.ForgeOfTheKalpagniLantern) +
    0.06 * p4(c.sets.MusketeerOfWildWheat)
  );

  c.HP += (baseHP) * (
    0.12 * p2(c.sets.FleetOfTheAgeless) +
    0.12 * p2(c.sets.LongevousDisciple)
  );

  c.ATK += (baseATK) * (
    0.12 * p2(c.sets.SpaceSealingStation) +
    0.12 * p2(c.sets.FirmamentFrontlineGlamoth) +
    0.12 * p2(c.sets.MusketeerOfWildWheat) +
    0.12 * p2(c.sets.PrisonerInDeepConfinement) +
    0.12 * p2(c.sets.IzumoGenseiAndTakamaDivineRealm) +
    0.12 * p2(c.sets.TheWindSoaringValorous)
  );

  c.DEF += (baseDEF) * (
    0.15 * p2(c.sets.BelobogOfTheArchitects) +
    0.15 * p2(c.sets.KnightOfPurityPalace)
  );

  c.CR += (
    0.08 * p2(c.sets.InertSalsotto) +
    0.08 * p2(c.sets.RutilantArena) +
    0.04 * p4(c.sets.PioneerDiverOfDeadWaters) +
    0.04 * p2(c.sets.SigoniaTheUnclaimedDesolation) +
    0.06 * p4(c.sets.TheWindSoaringValorous)
  );

  c.CD += (
    0.16 * p2(c.sets.CelestialDifferentiator) +
    0.16 * p2(c.sets.TheWondrousBananAmusementPark)
  );

  c.EHR += (
    0.10 * p2(c.sets.PanCosmicCommercialEnterprise)
  );

  c.RES += (
    0.10 * p2(c.sets.BrokenKeel)
  );

  c.BE += (
    0.16 * p2(c.sets.TaliaKingdomOfBanditry) +
    0.16 * p2(c.sets.ThiefOfShootingMeteor) +
    0.16 * p4(c.sets.ThiefOfShootingMeteor) +
    0.16 * p2(c.sets.WatchmakerMasterOfDreamMachinations) +
    0.16 * p2(c.sets.IronCavalryAgainstTheScourge)
  );

  c.ERR += (
    0.05 * p2(c.sets.SprightlyVonwacq) +
    0.05 * p2(c.sets.PenaconyLandOfTheDreams) +
    0.05 * p2(c.sets.LushakaTheSunkenSeas)
  );

  c.OHB += (
    0.10 * p2(c.sets.PasserbyOfWanderingCloud)
  );

  // Add base to computed

  x.ATK += c.ATK;
  x.DEF += c.DEF;
  x.HP += c.HP;
  x.SPD += c.SPD;
  x.CD += c.CD;
  x.CR += c.CR;
  x.EHR += c.EHR;
  x.RES += c.RES;
  x.BE += c.BE;
  x.ERR += c.ERR;
  x.OHB += c.OHB;
  
//  x.SPD += x.SPD_P * request.baseSpd;
//  x.ATK += x.ATK_P * request.baseAtk;
//  x.DEF += x.DEF_P * request.baseDef;
//  x.HP += x.HP_P * request.baseHp;

  // TODO: Combat buffs

  // TODO: Fire set is x condition










  // Precompute combat conditional stats
  // This should ideally all happen outside the GPU, and passed through in params
  // Assumptions: Jingliu E1S1, default conditionals

//  x.CR += 0.50f;
//  x.ATK_P += 1.80f;
//  x.RES += 0.35f;
//
//  x.ULT_BOOST += 0.20f;
//  x.CD += 0.24f;
//
//  x.BASIC_SCALING += 1.00f;
//  x.SKILL_SCALING += 2.50f;
//  x.SKILL_SCALING += 1.00f;
//
//  x.ULT_SCALING += 3.00f;
//  x.ULT_SCALING += 1.00f;
//
//  x.ELEMENTAL_DMG += 0.14f * 3.0f;
//  x.DEF_SHRED += 0.12f;

  // Aventurine E0S1

  x.BASIC_SCALING += 1.00f;
  x.ULT_SCALING += 2.70f;
  x.FUA_SCALING += 0.25f * 7;

  x.RES += 0.50f;
  x.CD += 0.15f;

  // Add basic stats to combat stats

  x.HP += c.HP;
  x.DEF += c.DEF;
  x.ATK += c.ATK;
  x.SPD += c.SPD;
  x.CR += c.CR;
  x.CD += c.CD;
  x.EHR += c.EHR;
  x.RES += c.RES;
  x.BE += c.BE;
  x.ERR += c.ERR;
  x.OHB += c.OHB;
  x.Ice_DMG += c.Ice_DMG;
  x.Imaginary_DMG += c.Imaginary_DMG;

  x.SPD += x.SPD_P * baseSPD;
  x.ATK += x.ATK_P * baseATK;
  x.DEF += x.DEF_P * baseDEF;
  x.HP += x.HP_P * baseHP;

  // Add custom combat buffs

  // Set effects

  x.CD += 0.25 * p4(c.sets.HunterOfGlacialForest);

  // Dynamic conditionals

  var state = ConditionalState();

  evaluateRutilantArenaConditional(&x, &state);
  evaluateAventurineDefConversionConditional(&x, &state);

  // Calculate passive stat conversions

  // Calculate base multis

// JINGLIU
//  x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
//  x.SKILL_DMG += x.SKILL_SCALING * x.ATK;
//  x.ULT_DMG += x.ULT_SCALING * x.ATK;

// AVENTURINE
  x.BASIC_DMG += x.BASIC_SCALING * x.DEF;
  x.SKILL_DMG += x.SKILL_SCALING * x.DEF;
  x.ULT_DMG += x.ULT_SCALING * x.DEF;
  x.FUA_DMG += x.FUA_SCALING * x.DEF;

  // Calculate damage
  let cLevel: f32 = 80;
  let eLevel: f32 = 95;
  let defReduction: f32 = x.DEF_SHRED;
  let defIgnore: f32 = 0.0;

  x.ELEMENTAL_DMG += x.Imaginary_DMG;
  let dmgBoostMultiplier: f32 = 1 + x.ELEMENTAL_DMG;
  let dmgReductionMultiplier: f32 = 1;

  let ehp = (x.HP / (1 - x.DEF / (x.DEF + 200 + 10 + 95))) * (1.0f / (x.DMG_RED_MULTI));
  // Guard
  x.EHP = ehp;

  let brokenMultiplier = 0.9;
  let universalMulti = dmgReductionMultiplier * brokenMultiplier;
  let baseResistance = 0.0 - x.RES_PEN - x.IMAGINARY_RES_PEN;

  //  let ULT_CD = x.ULT_CD_OVERRIDE || (x[Stats.CD] + x.ULT_CD_BOOST) // Robin overrides ULT CD
  let ULT_CD = x.CD + x.ULT_CD_BOOST;
  let ULT_BOOSTS_MULTI = 1.0;

  let breakVulnerability = 1.0 + x.DMG_TAKEN_MULTI + x.BREAK_VULNERABILITY;
  let basicVulnerability = 1.0 + x.DMG_TAKEN_MULTI + x.BASIC_VULNERABILITY;
  let skillVulnerability = 1.0 + x.DMG_TAKEN_MULTI + x.SKILL_VULNERABILITY;
  let ultVulnerability = 1.0 + x.DMG_TAKEN_MULTI + x.ULT_VULNERABILITY;
  let fuaVulnerability = 1.0 + x.DMG_TAKEN_MULTI + x.FUA_VULNERABILITY;
  let dotVulnerability = 1.0 + x.DMG_TAKEN_MULTI + x.DOT_VULNERABILITY;

  let ENEMY_EFFECT_RES = 0.20;
  // const ENEMY_DEBUFF_RES = 0 // Ignored debuff res for now

  // For stacking dots where the first stack has extra value
  // c = dot chance, s = stacks => avg dmg = (full dmg) * (1 + 0.05 * c * (s-1)) / (1 + 0.05 * (s-1))
  let effectiveDotChance = min(1, x.DOT_CHANCE * (1 + x.EHR) * (1 - ENEMY_EFFECT_RES + x.EFFECT_RES_SHRED));
  var dotEhrMultiplier = effectiveDotChance;
  if (x.DOT_SPLIT != 0) {
    dotEhrMultiplier = (1 + x.DOT_SPLIT * effectiveDotChance * (x.DOT_STACKS - 1)) / (1 + 0.05 * (x.DOT_STACKS - 1));
  }

  // BREAK
  let maxToughness = 360.0;

  let ELEMENTAL_BREAK_SCALING = 0.5;

  x.BREAK_DMG
    = universalMulti
    * 3767.5533
    * ELEMENTAL_BREAK_SCALING
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.BASIC_DEF_PEN)
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

  x.BASIC_DMG
    = x.BASIC_DMG
    * universalMulti
    * (dmgBoostMultiplier + x.BASIC_BOOST)
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.BASIC_DEF_PEN)
    * ((basicVulnerability) * min(1, x.CR + x.BASIC_CR_BOOST) * (1.0 + x.CD + x.BASIC_CD_BOOST) + basicVulnerability * (1.0 - min(1.0, x.CR + x.BASIC_CR_BOOST)))
    * (1.0 - (baseResistance - x.BASIC_RES_PEN))
    * (1.0 + x.BASIC_ORIGINAL_DMG_BOOST)
    + (x.BASIC_BREAK_DMG_MODIFIER * x.BREAK_DMG)
    + (SUPER_BREAK_DMG * x.BASIC_TOUGHNESS_DMG * (1.0 + x.BASIC_BREAK_EFFICIENCY_BOOST));

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
    * (dmgBoostMultiplier + x.ULT_BOOST * ULT_BOOSTS_MULTI)
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.ULT_DEF_PEN * ULT_BOOSTS_MULTI)
    * ((ultVulnerability) * min(1.0, x.CR + x.ULT_CR_BOOST) * (1.0 + ULT_CD) + ultVulnerability * (1.0 - min(1, x.CR + x.ULT_CR_BOOST)))
    * (1 - (baseResistance - x.ULT_RES_PEN * ULT_BOOSTS_MULTI))
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

//  x.COMBO_DMG
//    = request.combo.BASIC * x.BASIC_DMG
//    + request.combo.SKILL * x.SKILL_DMG
//    + request.combo.ULT * x.ULT_DMG
//    + request.combo.FUA * x.FUA_DMG
//    + request.combo.DOT * x.DOT_DMG
//    + request.combo.BREAK * x.BREAK_DMG
  // Calculate damage

  results[index] = x.BASIC_DMG;
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

struct ConditionalState {
  aventurineDefConversion: f32,
  rutilantArena: f32,
}

// DEF -> CR
// Repeatable
fn evaluateAventurineDefConversionConditional(
  p_x: ptr<function, ComputedStats>,
  p_state: ptr<function, ConditionalState>
) {
  let def = (*p_x).DEF;
  let stateValue: f32 = (*p_state).aventurineDefConversion;

  if (def > 1600) {
    let buffValue: f32 = min(0.48, 0.02 * floor((def - 1600) / 100));
    let oldBuffValue: f32 = stateValue;

    (*p_state).aventurineDefConversion = buffValue;
    (*p_x).CR += buffValue - stateValue;

    evaluateCrDependencies(p_x, p_state);
  }
}

// CR ->
fn evaluateRutilantArenaConditional(
  p_x: ptr<function, ComputedStats>,
  p_state: ptr<function, ConditionalState>
) {
  if (
    (*p_state).rutilantArena == 0.0 &&
    (*p_x).CR > 0.70
  ) {
    (*p_state).rutilantArena = 1.0;

    buffAbilityDmg(p_x, BASIC_TYPE | SKILL_TYPE | ULT_TYPE, 0.20, 1);
  }
}

fn evaluateCrDependencies(
  p_x: ptr<function, ComputedStats>,
  p_state: ptr<function, ConditionalState>
) {
  evaluateRutilantArenaConditional(p_x, p_state);
  // Add more CR dependencies here
}

fn evaluateCdDependencies(
  p_x: ptr<function, ComputedStats>,
  p_state: ptr<function, ConditionalState>
) {
  // Add more CR dependencies here
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


const BASIC_TYPE = 1;
const SKILL_TYPE = 2;
const ULT_TYPE = 4;
const FUA_TYPE = 8;
const DOT_TYPE = 16;
const BREAK_TYPE = 32;
const SUPER_BREAK_TYPE = 64;