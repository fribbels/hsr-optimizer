// <import structs>
// <import constants>

const WORKGROUP_SIZE = 16;

@group(0) @binding(0) var<storage, read_write> params : Params;
@group(0) @binding(1) var<storage, read_write> relics : array<Relic>;
@group(0) @binding(2) var<storage, read_write> results : array<ComputedStats>; // For testing calculated stat numbers
//@group(0) @binding(2) var<storage, read_write> results : array<f32>; // For generating results

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

  /* INJECT COMPUTED STATS */

  x.BASIC_DMG_TYPE = 1;
  x.SKILL_DMG_TYPE = 2;
  x.ULT_DMG_TYPE = 4;
  x.FUA_DMG_TYPE = 8;
  x.DOT_DMG_TYPE = 16;
  x.BREAK_DMG_TYPE = 32;
  x.SUPER_BREAK_TYPE = 64;

  // Calculate relic stat sums

  let epsilon = 0.000001f;

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

  addElementalStats(&c, &x);

  x.ATK += c.ATK + combatBuffsATK + combatBuffsATK_P * baseATK;
  x.DEF += c.DEF + combatBuffsDEF + combatBuffsDEF_P * baseDEF;
  x.HP += c.HP   + combatBuffsHP  + combatBuffsHP_P  * baseHP;
  x.SPD += c.SPD + combatBuffsSPD + combatBuffsSPD_P * baseSPD;
  x.CD += c.CD   + combatBuffsCD;
  x.CR += c.CR   + combatBuffsCR;
  x.EHR += c.EHR;
  x.RES += c.RES;
  x.BE += c.BE   + combatBuffsBE;
  x.ERR += c.ERR;
  x.OHB += c.OHB;

  x.ELEMENTAL_DMG += combatBuffsDMG_BOOST;
  x.EFFECT_RES_SHRED += combatBuffsEFFECT_RES_SHRED;
  x.DMG_TAKEN_MULTI += combatBuffsVULNERABILITY;
  x.BREAK_EFFICIENCY_BOOST += combatBuffsBREAK_EFFICIENCY;

  // ATK

  if (p4(c.sets.MessengerTraversingHackerspace) >= 1 && enabledMessengerTraversingHackerspace == 1) {
    x.SPD_P += 0.12;
  }
  x.SPD += x.SPD_P * baseSPD;

  // DEF

  if (p4(c.sets.ChampionOfStreetwiseBoxing) >= 1) {
    x.ATK_P += 0.05 * f32(valueChampionOfStreetwiseBoxing);
  }
  if (p4(c.sets.BandOfSizzlingThunder) >= 1 && enabledBandOfSizzlingThunder == 1) {
    x.ATK_P += 0.20;
  }
  if (p4(c.sets.TheAshblazingGrandDuke) >= 1) {
    x.ATK_P += 0.06 * f32(valueTheAshblazingGrandDuke);
  }
  x.ATK += x.ATK_P * baseATK;

  // DEF

  x.DEF += x.DEF_P * baseDEF;

  // HP

  x.HP += x.HP_P * baseHP;

  // CD

  if (p4(c.sets.HunterOfGlacialForest) >= 1 && enabledHunterOfGlacialForest == 1) {
    x.CD += 0.25;
  }
  if (p4(c.sets.WastelanderOfBanditryDesert) >= 1 && valueWastelanderOfBanditryDesert == 2) {
    x.CD += 0.10;
  }
  if (p4(c.sets.PioneerDiverOfDeadWaters) >= 1) {
    x.CD += getPioneerSetCd(valuePioneerDiverOfDeadWaters);
  }
  if (p2(c.sets.SigoniaTheUnclaimedDesolation) >= 1) {
    x.CD += 0.04 * f32(valueSigoniaTheUnclaimedDesolation);
  }
  if (p2(c.sets.DuranDynastyOfRunningWolves) >= 1 && valueDuranDynastyOfRunningWolves >= 5) {
    x.CD += 0.25;
  }
  if (p2(c.sets.TheWondrousBananAmusementPark) >= 1 && enabledTheWondrousBananAmusementPark == 1) {
    x.CD += 0.32;
  }

  // CR

  if (p4(c.sets.WastelanderOfBanditryDesert) >= 1 && valueWastelanderOfBanditryDesert > 0) {
    x.CR += 0.10;
  }
  if (p4(c.sets.LongevousDisciple) >= 1) {
    x.CR += 0.08 * f32(valueLongevousDisciple);
  }
  if (p4(c.sets.PioneerDiverOfDeadWaters) >= 1 && valuePioneerDiverOfDeadWaters > 2) {
    x.CR += 0.04;
  }
  if (p2(c.sets.IzumoGenseiAndTakamaDivineRealm) >= 1 && enabledIzumoGenseiAndTakamaDivineRealm == 1) {
    x.CR += 0.12;
  }

  // BE

  if (p4(c.sets.WatchmakerMasterOfDreamMachinations) >= 1 && enabledWatchmakerMasterOfDreamMachinations == 1) {
    x.BE += 0.30;
  }
  if (p2(c.sets.ForgeOfTheKalpagniLantern) >= 1 && enabledForgeOfTheKalpagniLantern == 1) {
    x.BE += 0.40;
  }

  // Buffs

  // Basic boost
  if (p4(c.sets.MusketeerOfWildWheat) >= 1) {
    buffAbilityDmg(&x, BASIC_TYPE, 0.10, 1);
  }

  // Skill boost
  if (p4(c.sets.FiresmithOfLavaForging) >= 1) {
    buffAbilityDmg(&x, SKILL_TYPE, 0.12, 1);
  }

  // Fua boost
  if (p2(c.sets.TheAshblazingGrandDuke) >= 1) {
    buffAbilityDmg(&x, FUA_TYPE, 0.20, 1);
  }
  if(p2(c.sets.DuranDynastyOfRunningWolves) >= 1) {
    buffAbilityDmg(&x, FUA_TYPE, 0.05 * f32(valueDuranDynastyOfRunningWolves), 1);
  }

  // Ult boost
  if (p4(c.sets.TheWindSoaringValorous) >= 1) {
    buffAbilityDmg(&x, ULT_TYPE, 0.36 * f32(enabledTheWindSoaringValorous), 1);
  }

  //

  if (p4(c.sets.GeniusOfBrilliantStars) >= 1) {
    if (enabledGeniusOfBrilliantStars == 1) {
      x.DEF_SHRED += 0.20;
    } else {
      x.DEF_SHRED += 0.10;
    }
  }

  if (p4(c.sets.PrisonerInDeepConfinement) >= 1) {
    x.DEF_SHRED += 0.06 * f32(valuePrisonerInDeepConfinement);
  }

  if (p2(c.sets.PioneerDiverOfDeadWaters) >= 1) {
    x.ELEMENTAL_DMG += 0.12;
  }

  // Dynamic - still need implementing

  // x[Stats.ATK_P]
  // + 0.12 * (x[Stats.SPD] >= 120 ? 1 : 0) * p2(sets.SpaceSealingStation)
  // + 0.08 * (x[Stats.SPD] >= 120 ? 1 : 0) * p2(sets.FleetOfTheAgeless)
  // + Math.min(0.25, 0.25 * x[Stats.EHR]) * p2(sets.PanCosmicCommercialEnterprise)
  // x[Stats.DEF_P]
  //   += 0.15 * (x[Stats.EHR] >= 0.50 ? 1 : 0) * p2(sets.BelobogOfTheArchitects)
  // x[Stats.CD]
  //   + 0.10 * (x[Stats.RES] >= 0.30 ? 1 : 0) * p2(sets.BrokenKeel)
  // x[Stats.CR]
  //   + 0.60 * params.enabledCelestialDifferentiator * (x[Stats.CD] >= 1.20 ? 1 : 0) * p2(sets.CelestialDifferentiator)
  // x[Stats.BE]
  //   += 0.20 * (x[Stats.SPD] >= 145 ? 1 : 0) * p2(sets.TaliaKingdomOfBanditry)
  // x.BREAK_DEF_PEN
  //   += 0.10 * (x[Stats.BE] >= 1.50 ? 1 : 0) * p4(sets.IronCavalryAgainstTheScourge)
  // x.SUPER_BREAK_DEF_PEN
  //   += 0.15 * (x[Stats.BE] >= 2.50 ? 1 : 0) * p4(sets.IronCavalryAgainstTheScourge)
  // x.ELEMENTAL_DMG
  //   += 0.12 * (x[Stats.SPD] >= 135 ? 1 : 0) * p2(sets.FirmamentFrontlineGlamoth)
  //   + 0.06 * (x[Stats.SPD] >= 160 ? 1 : 0) * p2(sets.FirmamentFrontlineGlamoth)


  const semicolonTest = 0;
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

//  x.BASIC_SCALING += 1.00f;
//  x.ULT_SCALING += 2.70f;
//  x.FUA_SCALING += 0.25f * 7;
//
//  x.RES += 0.50f;
//  x.CD += 0.15f;

  // Set effects

  // Dynamic conditionals

  var state = ConditionalState();

  // Dynamic stat conditionals

  evaluateDependenciesHP(&x, &state);
  evaluateDependenciesATK(&x, &state);
  evaluateDependenciesDEF(&x, &state);
  evaluateDependenciesSPD(&x, &state);
  evaluateDependenciesCR(&x, &state);
  evaluateDependenciesCD(&x, &state);
  evaluateDependenciesEHR(&x, &state);
  evaluateDependenciesRES(&x, &state);
  evaluateDependenciesBE(&x, &state);
  evaluateDependenciesOHB(&x, &state);
  evaluateDependenciesERR(&x, &state);

  // Conditional injections

  /* INJECT LIGHT CONE CONDITIONALS */

  /* INJECT CHARACTER CONDITIONALS */

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

  x.COMBO_DMG
    = BASIC_COMBO * x.BASIC_DMG
    + SKILL_COMBO * x.SKILL_DMG
    + ULT_COMBO * x.ULT_DMG
    + FUA_COMBO * x.FUA_DMG
    + DOT_COMBO * x.DOT_DMG
    + BREAK_COMBO * x.BREAK_DMG;

//  results[index] = x.BASIC_DMG;
  results[index] = x;
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

fn addElementalStats(
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


const BASIC_TYPE = 1;
const SKILL_TYPE = 2;
const ULT_TYPE = 4;
const FUA_TYPE = 8;
const DOT_TYPE = 16;
const BREAK_TYPE = 32;
const SUPER_BREAK_TYPE = 64;