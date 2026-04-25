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



// START BIND GROUP 0
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
/* INJECT BIND GROUP 0 */
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
// END BIND GROUP 0

@group(1) @binding(0) var<storage> relics : array<Relic>;
@group(1) @binding(1) var<storage> ornamentSetSolutionsMatrix : array<i32>;
@group(1) @binding(2) var<storage> relicSetSolutionsMatrix : array<i32>;

// START RESULTS BUFFER
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
/* INJECT RESULTS BUFFER */
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
// END RESULTS BUFFER

// Safe floor/ceil: bias protects against f32 rounding causing off-by-one
// when accumulated stat values land just below exact thresholds.
fn floorSafe(x: f32) -> f32 { return floor(x + 0.0001); }
fn ceilSafe(x: f32) -> f32 { return ceil(x - 0.0001); }

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

  // START OFFSET DECODE
  // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
  /* INJECT OFFSET DECODE */
  // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
  // END OFFSET DECODE

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

  var localValidCount: u32 = 0u;

  var i: i32 = 0;
  loop {
    if (i >= CYCLES_PER_INVOCATION) { break; }

    // START PERM LIMIT CHECK
    // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
    /* INJECT PERM LIMIT CHECK */
    // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
    // END PERM LIMIT CHECK

    let linkRope = relics[curL + ropeOffset];
    let setL = u32(linkRope.v5.z);

    let relicSetIndex: u32 = setH + setB * relicSetCount + setG * relicSetCount * relicSetCount + setF * relicSetCount * relicSetCount * relicSetCount;
    let ornamentSetIndex: u32 = setP + setL * ornamentSetCount;

    // START SET FILTERS
    // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
    /* INJECT SET FILTERS */
    // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
    // END SET FILTERS

    localValidCount += 1u;

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
    c.PHYSICAL_DMG_BOOST  += basePhysical_DMG + tracePhysical_DMG;
    c.FIRE_DMG_BOOST      += baseFire_DMG + traceFire_DMG;
    c.ICE_DMG_BOOST       += baseIce_DMG + traceIce_DMG;
    c.LIGHTNING_DMG_BOOST += baseLightning_DMG + traceLightning_DMG;
    c.WIND_DMG_BOOST      += baseWind_DMG + traceWind_DMG;
    c.QUANTUM_DMG_BOOST   += baseQuantum_DMG + traceQuantum_DMG;
    c.IMAGINARY_DMG_BOOST += baseImaginary_DMG + traceImaginary_DMG;
    c.ELATION += traceElation + baseElation;

    // Basic set effects
    // ═══════════════════════════════════════════════════════════════════════════════════════╗
    /* INJECT BASIC SET EFFECTS */
    // ═══════════════════════════════════════════════════════════════════════════════════════╝

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

    // START CARRY CHAIN
    // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
    /* INJECT CARRY CHAIN */
    // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
    // END CARRY CHAIN
  }

  if (localValidCount > 0u) {
    atomicAdd(&validCount, localValidCount);
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