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

  // Decompose initial index into mixed-radix digits
  let index = cycleIndex;

  let l = (index % lSize);
  let c1 = index / lSize;
  let p = (c1 % pSize);
  let c2 = c1 / pSize;
  let f = (c2 % fSize);
  let c3 = c2 / fSize;
  let b = (c3 % bSize);
  let c4 = c3 / bSize;
  let g = (c4 % gSize);
  let h = c4 / gSize;

  // Apply carry-chain offsets for odometer starting position
  let carryL = (l + xl) / lSize;
  var curL = (l + xl) % lSize;
  let carryP = (p + xp + carryL) / pSize;
  var curP = (p + xp + carryL) % pSize;
  let carryF = (f + xf + carryP) / fSize;
  var curF = (f + xf + carryP) % fSize;
  let carryB = (b + xb + carryF) / bSize;
  var curB = (b + xb + carryF) % bSize;
  let carryG = (g + xg + carryB) / gSize;
  var curG = (g + xg + carryB) % gSize;
  var curH = (h + xh + carryG) % hSize;

  // Pre-load relics — outer 4 are loop-invariant most iterations
  var head         = relics[curH];
  var hands        = relics[curG + handsOffset];
  var body         = relics[curB + bodyOffset];
  var feet         = relics[curF + feetOffset];
  var planarSphere = relics[curP + planarOffset];

  var outerStats = sumOuterRelics(head, hands, body, feet);

  var setH = u32(head.v5.z);
  var setG = u32(hands.v5.z);
  var setB = u32(body.v5.z);
  var setF = u32(feet.v5.z);
  var setP = u32(planarSphere.v5.z);

  var maskH = 1u << setH;
  var maskG = 1u << setG;
  var maskB = 1u << setB;
  var maskF = 1u << setF;

  var i: i32 = 0;
  loop {
    if (i >= CYCLES_PER_INVOCATION) { break; }

    let index = cycleIndex + i;

    if (index >= i32(params.permLimit)) {
      break;
    }

    let linkRope = relics[curL + ropeOffset];
    let setL = u32(linkRope.v5.z);

    let relicSetIndex: u32 = setH + setB * relicSetCount + setG * relicSetCount * relicSetCount + setF * relicSetCount * relicSetCount * relicSetCount;
    let ornamentSetIndex: u32 = setP + setL * ornamentSetCount;

    // START SET FILTERS
    // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
    /* INJECT SET FILTERS */
    // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
    // END SET FILTERS

    var sets = Sets();
    sets.relicMatch2 = (maskH & maskG) | (maskH & maskB) | (maskH & maskF)
                     | (maskG & maskB) | (maskG & maskF) | (maskB & maskF);
    sets.relicMatch4 = maskH & maskG & maskB & maskF;
    sets.ornamentMatch2 = (1u << setP) & (1u << setL);

    var c: BasicStats = BasicStats();

    // Vec4 relic stat sums — outer 4 cached, only add planarSphere + linkRope
    let s0 = outerStats.s0 + planarSphere.v0 + linkRope.v0;
    let s1 = outerStats.s1 + planarSphere.v1 + linkRope.v1;
    let s2 = outerStats.s2 + planarSphere.v2 + linkRope.v2;
    let s3 = outerStats.s3 + planarSphere.v3 + linkRope.v3;
    let s4 = outerStats.s4 + planarSphere.v4 + linkRope.v4;
    let s5 = outerStats.s5 + planarSphere.v5 + linkRope.v5;

    c.HP_P  = s0.x;
    c.ATK_P = s0.y;
    c.DEF_P = s0.z;
    c.SPD_P = s0.w;

    c.HP    = s1.x;
    c.ATK   = s1.y;
    c.DEF   = s1.z;
    c.SPD   = s1.w;

    c.CR    = s2.x;
    c.CD    = s2.y;
    c.EHR   = s2.z;
    c.RES   = s2.w;

    c.BE    = s3.x;
    c.ERR   = s3.y;
    c.OHB   = s3.z;
    c.PHYSICAL_DMG_BOOST  = s3.w;

    c.FIRE_DMG_BOOST      = s4.x;
    c.ICE_DMG_BOOST       = s4.y;
    c.LIGHTNING_DMG_BOOST = s4.z;
    c.WIND_DMG_BOOST      = s4.w;

    c.QUANTUM_DMG_BOOST   = s5.x;
    c.IMAGINARY_DMG_BOOST = s5.y;

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

    continuing {
      i++;

      curL += 1;
      if (curL >= lSize) {
        curL = 0;
        curP += 1;
        if (curP >= pSize) {
          curP = 0;
          curF += 1;
          if (curF >= fSize) {
            curF = 0;
            curB += 1;
            if (curB >= bSize) {
              curB = 0;
              curG += 1;
              if (curG >= gSize) {
                curG = 0;
                curH = (curH + 1) % hSize;
                head = relics[curH];
                setH = u32(head.v5.z);
                maskH = 1u << setH;
              }
              hands = relics[curG + handsOffset];
              setG = u32(hands.v5.z);
              maskG = 1u << setG;
            }
            body = relics[curB + bodyOffset];
            setB = u32(body.v5.z);
            maskB = 1u << setB;
          }
          feet = relics[curF + feetOffset];
          setF = u32(feet.v5.z);
          maskF = 1u << setF;

          outerStats = sumOuterRelics(head, hands, body, feet);
        }
        planarSphere = relics[curP + planarOffset];
        setP = u32(planarSphere.v5.z);
      }
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


// START UNROLLED ACTION FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
/* INJECT UNROLLED ACTION FUNCTIONS */
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
// END UNROLLED ACTION FUNCTIONS