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
const ELATION_SKILL_ABILITY_TYPE = 256;


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

  var emptyComputedStats = ComputedStats();

  for (var i = 0; i < CYCLES_PER_INVOCATION; i++) {

    // Calculate global_invocation_index

    let index = cycleIndex + i;

    if (index >= i32(params.permLimit)) {
      break;
    }

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
    let hands        : Relic = (relics[finalG + handsOffset]);
    let body         : Relic = (relics[finalB + bodyOffset]);
    let feet         : Relic = (relics[finalF + feetOffset]);
    let planarSphere : Relic = (relics[finalP + planarOffset]);
    let linkRope     : Relic = (relics[finalL + ropeOffset]);

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

    // Calculate set bitmasks — 21 ops replacing 360+ ALU ops
    // Each bit position corresponds to a set index (SET_* constants)

    var sets = Sets();
    let maskH = 1u << setH;
    let maskG = 1u << setG;
    let maskB = 1u << setB;
    let maskF = 1u << setF;

    // Pairwise AND: bit N set if relic set N has >= 2 pieces among the 4 slots
    sets.relicMatch2 = (maskH & maskG) | (maskH & maskB) | (maskH & maskF)
                     | (maskG & maskB) | (maskG & maskF) | (maskB & maskF);

    // All-four AND: bit N set if relic set N has exactly 4 pieces
    sets.relicMatch4 = maskH & maskG & maskB & maskF;

    // Ornament 2p: bit N set if both ornament slots share set N
    sets.ornamentMatch2 = (1u << setP) & (1u << setL);

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
    c.PHYSICAL_DMG_BOOST  += tracePhysical_DMG + 0.10 * relic2p(sets, SET_ChampionOfStreetwiseBoxing);
    c.FIRE_DMG_BOOST      += traceFire_DMG + 0.10 * relic2p(sets, SET_FiresmithOfLavaForging);
    c.ICE_DMG_BOOST       += traceIce_DMG + 0.10 * relic2p(sets, SET_HunterOfGlacialForest);
    c.LIGHTNING_DMG_BOOST += traceLightning_DMG + 0.10 * relic2p(sets, SET_BandOfSizzlingThunder);
    c.WIND_DMG_BOOST      += traceWind_DMG + 0.10 * relic2p(sets, SET_EagleOfTwilightLine);
    c.QUANTUM_DMG_BOOST   += traceQuantum_DMG + 0.10 * relic2p(sets, SET_GeniusOfBrilliantStars) + 0.10 * relic2p(sets, SET_PoetOfMourningCollapse);
    c.IMAGINARY_DMG_BOOST += traceImaginary_DMG + 0.10 * relic2p(sets, SET_WastelanderOfBanditryDesert);
    c.ELATION += traceElation + baseElation;

    // Calculate set effects

    c.SPD += (baseSPD) * (
      0.06 * relic2p(sets, SET_MessengerTraversingHackerspace) +
      0.06 * ornament2p(sets, SET_ForgeOfTheKalpagniLantern) +
      0.06 * relic4p(sets, SET_MusketeerOfWildWheat) +
      0.06 * relic2p(sets, SET_SacerdosRelivedOrdeal) -
      0.08 * relic4p(sets, SET_PoetOfMourningCollapse) +
      0.06 * ornament2p(sets, SET_GiantTreeOfRaptBrooding) +
      0.06 * relic2p(sets, SET_WarriorGoddessOfSunAndThunder) +
      0.06 * relic2p(sets, SET_DivinerOfDistantReach)
    );

    c.HP += (baseHP) * (
      0.12 * ornament2p(sets, SET_FleetOfTheAgeless) +
      0.12 * relic2p(sets, SET_LongevousDisciple) +
      0.12 * ornament2p(sets, SET_BoneCollectionsSereneDemesne)
    );

    c.ATK += (baseATK) * (
      0.12 * ornament2p(sets, SET_SpaceSealingStation) +
      0.12 * ornament2p(sets, SET_FirmamentFrontlineGlamoth) +
      0.12 * relic2p(sets, SET_MusketeerOfWildWheat) +
      0.12 * relic2p(sets, SET_PrisonerInDeepConfinement) +
      0.12 * ornament2p(sets, SET_IzumoGenseiAndTakamaDivineRealm) +
      0.12 * relic2p(sets, SET_TheWindSoaringValorous) +
      0.12 * relic2p(sets, SET_HeroOfTriumphantSong) +
      0.12 * ornament2p(sets, SET_RevelryByTheSea)
    );

    c.DEF += (baseDEF) * (
      0.15 * ornament2p(sets, SET_BelobogOfTheArchitects) +
      0.15 * relic2p(sets, SET_KnightOfPurityPalace)
    );

    c.CR += (
      0.08 * ornament2p(sets, SET_InertSalsotto) +
      0.08 * ornament2p(sets, SET_RutilantArena) +
      0.04 * relic4p(sets, SET_PioneerDiverOfDeadWaters) +
      0.04 * ornament2p(sets, SET_SigoniaTheUnclaimedDesolation) +
      0.06 * relic4p(sets, SET_TheWindSoaringValorous) +
      0.08 * relic2p(sets, SET_ScholarLostInErudition) +
      0.08 * relic2p(sets, SET_WorldRemakingDeliverer) +
      0.08 * ornament2p(sets, SET_AmphoreusTheEternalLand)
    );

    c.CD += (
      0.16 * ornament2p(sets, SET_CelestialDifferentiator) +
      0.16 * ornament2p(sets, SET_TheWondrousBananAmusementPark) +
      0.16 * relic2p(sets, SET_WavestriderCaptain) +
      0.16 * ornament2p(sets, SET_TengokuLivestream) +
      0.16 * relic2p(sets, SET_EverGloriousMagicalGirl)
    );

    c.EHR += (
      0.10 * ornament2p(sets, SET_PanCosmicCommercialEnterprise)
    );

    c.RES += (
      0.10 * ornament2p(sets, SET_BrokenKeel)
    );

    c.BE += (
      0.16 * ornament2p(sets, SET_TaliaKingdomOfBanditry) +
      0.16 * relic2p(sets, SET_ThiefOfShootingMeteor) +
      0.16 * relic4p(sets, SET_ThiefOfShootingMeteor) +
      0.16 * relic2p(sets, SET_WatchmakerMasterOfDreamMachinations) +
      0.16 * relic2p(sets, SET_IronCavalryAgainstTheScourge)
    );

    c.ERR += (
      0.05 * ornament2p(sets, SET_SprightlyVonwacq) +
      0.05 * ornament2p(sets, SET_PenaconyLandOfTheDreams) +
      0.05 * ornament2p(sets, SET_LushakaTheSunkenSeas)
    );

    c.OHB += (
      0.10 * relic2p(sets, SET_PasserbyOfWanderingCloud)
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
  if (setCount >= 4) {
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