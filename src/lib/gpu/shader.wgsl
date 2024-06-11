// STATS
const HP_P = 0;
const ATK_P = 1;
const DEF_P = 2;
const SPD_P = 3;
const HP = 4;
const ATK = 5;
const DEF = 6;
const SPD = 7;
const CR = 8;
const CD = 9;
const EHR = 10;
const RES = 11;
const BE = 12;
const ERR = 13;
const OHB = 14;
const Physical_DMG = 15;
const Fire_DMG = 16;
const Ice_DMG = 17;
const Lightning_DMG = 18;
const Wind_DMG = 19;
const Quantum_DMG = 20;
const Imaginary_DMG = 21;

// Continuing stats with computedStatsObject
const ELEMENTAL_DMG = 22;

const BASIC_SCALING = 23;
const SKILL_SCALING = 24;
const ULT_SCALING = 25;
const FUA_SCALING = 26;
const DOT_SCALING = 27;

const BASIC_CR_BOOST = 28;
const SKILL_CR_BOOST = 29;
const ULT_CR_BOOST = 30;
const FUA_CR_BOOST = 31;
const BASIC_CD_BOOST = 32;
const SKILL_CD_BOOST = 33;
const ULT_CD_BOOST = 34;
const FUA_CD_BOOST = 35;

const BASIC_BOOST = 36;
const SKILL_BOOST = 37;
const ULT_BOOST = 38;
const FUA_BOOST = 39;
const DOT_BOOST = 40;

const DMG_TAKEN_MULTI = 41;
const BASIC_VULNERABILITY = 42;
const SKILL_VULNERABILITY = 43;
const ULT_VULNERABILITY = 44;
const FUA_VULNERABILITY = 45;
const DOT_VULNERABILITY = 46;

const DEF_SHRED = 47;
const BASIC_DEF_PEN = 48;
const SKILL_DEF_PEN = 49;
const ULT_DEF_PEN = 50;
const FUA_DEF_PEN = 51;
const DOT_DEF_PEN = 52;

const RES_PEN = 53;
const PHYSICAL_RES_PEN = 54;
const FIRE_RES_PEN = 55;
const ICE_RES_PEN = 56;
const LIGHTNING_RES_PEN = 57;
const WIND_RES_PEN = 58;
const QUANTUM_RES_PEN = 59;
const IMAGINARY_RES_PEN = 60;

const BASIC_RES_PEN = 61;
const SKILL_RES_PEN = 62;
const ULT_RES_PEN = 63;
const FUA_RES_PEN = 64;
const DOT_RES_PEN = 65;

const BASIC_DMG = 66;
const SKILL_DMG = 67;
const ULT_DMG = 68;
const FUA_DMG = 69;
const DOT_DMG = 70;

const DMG_RED_MULTI = 71;

const ORIGINAL_DMG_BOOST= 72;

const VAR_SIZE = 73;
// End 73 size

struct Relic {
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
  Physical_DMG: f32,
  Fire_DMG: f32,
  Ice_DMG: f32,
  Lightning_DMG: f32,
  Wind_DMG: f32,
  Quantum_DMG: f32,
  Imaginary_DMG: f32,
  relicSet: f32,
  weightScore: f32, // 23
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
  Physical_DMG: f32,
  Fire_DMG: f32,
  Ice_DMG: f32,
  Lightning_DMG: f32,
  Wind_DMG: f32,
  Quantum_DMG: f32,
  Imaginary_DMG: f32,
  weightScore: f32,
  sets: Sets,
}

struct Sets {
  PasserbyOfWanderingCloud: i32,
  MusketeerOfWildWheat: i32,
  KnightOfPurityPalace: i32,
  HunterOfGlacialForest: i32,
  ChampionOfStreetwiseBoxing: i32,
  GuardOfWutheringSnow: i32,
  FiresmithOfLavaForging: i32,
  GeniusOfBrilliantStars: i32,
  BandOfSizzlingThunder: i32,
  EagleOfTwilightLine: i32,
  ThiefOfShootingMeteor: i32,
  WastelanderOfBanditryDesert: i32,
  LongevousDisciple: i32,
  MessengerTraversingHackerspace: i32,
  TheAshblazingGrandDuke: i32,
  PrisonerInDeepConfinement: i32,
  PioneerDiverOfDeadWaters: i32,
  WatchmakerMasterOfDreamMachinations: i32,
  SpaceSealingStation: i32,
  FleetOfTheAgeless: i32,
  PanCosmicCommercialEnterprise: i32,
  BelobogOfTheArchitects: i32,
  CelestialDifferentiator: i32,
  InertSalsotto: i32,
  TaliaKingdomOfBanditry: i32,
  SprightlyVonwacq: i32,
  RutilantArena: i32,
  BrokenKeel: i32,
  FirmamentFrontlineGlamoth: i32,
  PenaconyLandOfTheDreams: i32,
}

struct ComputedStats {
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
  Physical_DMG: f32,
  Fire_DMG: f32,
  Ice_DMG: f32,
  Lightning_DMG: f32,
  Wind_DMG: f32,
  Quantum_DMG: f32,
  Imaginary_DMG: f32,

  ELEMENTAL_DMG: f32,

  BASIC_SCALING: f32,
  SKILL_SCALING: f32,
  ULT_SCALING: f32,
  FUA_SCALING: f32,
  DOT_SCALING: f32,

  BASIC_CR_BOOST: f32,
  SKILL_CR_BOOST: f32,
  ULT_CR_BOOST: f32,
  FUA_CR_BOOST: f32,
  BASIC_CD_BOOST: f32,
  SKILL_CD_BOOST: f32,
  ULT_CD_BOOST: f32,
  FUA_CD_BOOST: f32,

  BASIC_BOOST: f32,
  SKILL_BOOST: f32,
  ULT_BOOST: f32,
  FUA_BOOST: f32,
  DOT_BOOST: f32,

  DMG_TAKEN_MULTI: f32,
  BASIC_VULNERABILITY: f32,
  SKILL_VULNERABILITY: f32,
  ULT_VULNERABILITY: f32,
  FUA_VULNERABILITY: f32,
  DOT_VULNERABILITY: f32,

  DEF_SHRED: f32,
  BASIC_DEF_PEN: f32,
  SKILL_DEF_PEN: f32,
  ULT_DEF_PEN: f32,
  FUA_DEF_PEN: f32,
  DOT_DEF_PEN: f32,

  RES_PEN: f32,
  PHYSICAL_RES_PEN: f32,
  FIRE_RES_PEN: f32,
  ICE_RES_PEN: f32,
  LIGHTNING_RES_PEN: f32,
  WIND_RES_PEN: f32,
  QUANTUM_RES_PEN: f32,
  IMAGINARY_RES_PEN: f32,

  BASIC_RES_PEN: f32,
  SKILL_RES_PEN: f32,
  ULT_RES_PEN: f32,
  FUA_RES_PEN: f32,
  DOT_RES_PEN: f32,

  BASIC_DMG: f32,
  SKILL_DMG: f32,
  ULT_DMG: f32,
  FUA_DMG: f32,
  DOT_DMG: f32,

  DMG_RED_MULTI: f32,

  ORIGINAL_DMG_BOOST: f32,
}

struct Params {
  lSize: f32,
  pSize: f32,
  fSize: f32,
  bSize: f32,
  gSize: f32,
  hSize: f32,

  xl: f32,
  xp: f32,
  xf: f32,
  xb: f32,
  xg: f32,
  xh: f32,

  relicSetCount: f32,
  ornamentSetCount: f32,

  baseHP_P: f32,
  baseATK_P: f32,
  baseDEF_P: f32,
  baseSPD_P: f32,
  baseHP: f32,
  baseATK: f32,
  baseDEF: f32,
  baseSPD: f32,
  baseCR: f32,
  baseCD: f32,
  baseEHR: f32,
  baseRES: f32,
  baseBE: f32,
  baseERR: f32,
  baseOHB: f32,
  basePhysical_DMG: f32,
  baseFire_DMG: f32,
  baseIce_DMG: f32,
  baseLightning_DMG: f32,
  baseWind_DMG: f32,
  baseQuantum_DMG: f32,
  baseImaginary_DMG: f32,

  lcHP_P: f32,
  lcATK_P: f32,
  lcDEF_P: f32,
  lcSPD_P: f32,
  lcHP: f32,
  lcATK: f32,
  lcDEF: f32,
  lcSPD: f32,
  lcCR: f32,
  lcCD: f32,
  lcEHR: f32,
  lcRES: f32,
  lcBE: f32,
  lcERR: f32,
  lcOHB: f32,
  lcPhysical_DMG: f32,
  lcFire_DMG: f32,
  lcIce_DMG: f32,
  lcLightning_DMG: f32,
  lcWind_DMG: f32,
  lcQuantum_DMG: f32,
  lcImaginary_DMG: f32,

  traceHP_P: f32,
  traceATK_P: f32,
  traceDEF_P: f32,
  traceSPD_P: f32,
  traceHP: f32,
  traceATK: f32,
  traceDEF: f32,
  traceSPD: f32,
  traceCR: f32,
  traceCD: f32,
  traceEHR: f32,
  traceRES: f32,
  traceBE: f32,
  traceERR: f32,
  traceOHB: f32,
  tracePhysical_DMG: f32,
  traceFire_DMG: f32,
  traceIce_DMG: f32,
  traceLightning_DMG: f32,
  traceWind_DMG: f32,
  traceQuantum_DMG: f32,
  traceImaginary_DMG: f32,
}

@group(0) @binding(0) var<storage, read_write> params : Params;
@group(0) @binding(1) var<storage, read_write> relics : array<Relic>;
@group(0) @binding(2) var<storage, read_write> results : array<BasicStats>; // Temporarily f32 for testing, should be boolean

@group(1) @binding(0) var<storage, read_write> relicSetSolutionsMatrix : array<i32>;
@group(1) @binding(1) var<storage, read_write> ornamentSetSolutionsMatrix : array<i32>;
@compute @workgroup_size(16, 16)
fn main(
  @builtin(workgroup_id) workgroup_id : vec3<u32>,
  @builtin(local_invocation_id) local_invocation_id : vec3<u32>,
  @builtin(global_invocation_id) global_invocation_id : vec3<u32>,
  @builtin(local_invocation_index) local_invocation_index: u32,
  @builtin(num_workgroups) num_workgroups: vec3<u32>
) {
  // Calculate invocation indices
  let workgroup_index =
    workgroup_id.x +
    workgroup_id.y * num_workgroups.x +
    workgroup_id.z * num_workgroups.x * num_workgroups.y;

  // // global_invocation_index
  let index =
    i32(workgroup_index * 256 +
    local_invocation_index);

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

  // ???
  let zl = (l+xl) % lSize;
  let yl = (l+xl-zl) / lSize;
  let zp = (p+xp+yl) % pSize;
  let yp = (p+xp+yl-zp) / pSize;
  let zf = (f+xf+yp) % fSize;
  let yf = (f+xf+yp-zf) % fSize;
  let zb = (b+xb+yf) % bSize;
  let yb = (b+xb+yf-zb) % bSize;
  let zg = (g+xg+yb) % gSize;
  let yg = (g+xg+yb-zg) % gSize;
  let zh = (h+xh+yg) % hSize;

  // Calculate relic struct
  let head  : Relic = (relics[zh]);
  let hands : Relic = (relics[zg + hSize]);
  let body  : Relic = (relics[zb + hSize + gSize]);
  let feet  : Relic = (relics[zf + hSize + gSize + bSize]);
  let planarSphere : Relic = (relics[zp + hSize + gSize + bSize + fSize]);
  let linkRope     : Relic = (relics[zl + hSize + gSize + bSize + fSize + pSize]);

  let setH : u32 = u32(head.relicSet);
  let setG : u32 = u32(hands.relicSet);
  let setB : u32 = u32(body.relicSet);
  let setF : u32 = u32(feet.relicSet);
  let setP : u32 = u32(planarSphere.relicSet);
  let setL : u32 = u32(linkRope.relicSet);

  let relicSetIndex : u32 = setH + setB * relicSetCount + setG * relicSetCount * relicSetCount + setF * relicSetCount * relicSetCount * relicSetCount;
  let ornamentSetIndex: u32 = setP + setL * ornamentSetCount;

  var c : BasicStats = BasicStats();
  var x : ComputedStats = ComputedStats();

  c.HP_P = head.HP_P + hands.HP_P + body.HP_P + feet.HP_P + planarSphere.HP_P + linkRope.HP_P;
  c.ATK_P = head.ATK_P + hands.ATK_P + body.ATK_P + feet.ATK_P + planarSphere.ATK_P + linkRope.ATK_P;
  c.DEF_P = head.DEF_P + hands.DEF_P + body.DEF_P + feet.DEF_P + planarSphere.DEF_P + linkRope.DEF_P;
  c.SPD_P = head.SPD_P + hands.SPD_P + body.SPD_P + feet.SPD_P + planarSphere.SPD_P + linkRope.SPD_P;
  c.HP = head.HP + hands.HP + body.HP + feet.HP + planarSphere.HP + linkRope.HP;
  c.ATK = head.ATK + hands.ATK + body.ATK + feet.ATK + planarSphere.ATK + linkRope.ATK;
  c.DEF = head.DEF + hands.DEF + body.DEF + feet.DEF + planarSphere.DEF + linkRope.DEF;
  c.SPD = head.SPD + hands.SPD + body.SPD + feet.SPD + planarSphere.SPD + linkRope.SPD;
  c.CR = head.CR + hands.CR + body.CR + feet.CR + planarSphere.CR + linkRope.CR;
  c.CD = head.CD + hands.CD + body.CD + feet.CD + planarSphere.CD + linkRope.CD;
  c.EHR = head.EHR + hands.EHR + body.EHR + feet.EHR + planarSphere.EHR + linkRope.EHR;
  c.RES = head.RES + hands.RES + body.RES + feet.RES + planarSphere.RES + linkRope.RES;
  c.BE = head.BE + hands.BE + body.BE + feet.BE + planarSphere.BE + linkRope.BE;
  c.ERR = head.ERR + hands.ERR + body.ERR + feet.ERR + planarSphere.ERR + linkRope.ERR;
  c.OHB = head.OHB + hands.OHB + body.OHB + feet.OHB + planarSphere.OHB + linkRope.OHB;
  c.Physical_DMG = head.Physical_DMG + hands.Physical_DMG + body.Physical_DMG + feet.Physical_DMG + planarSphere.Physical_DMG + linkRope.Physical_DMG;
  c.Fire_DMG = head.Fire_DMG + hands.Fire_DMG + body.Fire_DMG + feet.Fire_DMG + planarSphere.Fire_DMG + linkRope.Fire_DMG;
  c.Ice_DMG = head.Ice_DMG + hands.Ice_DMG + body.Ice_DMG + feet.Ice_DMG + planarSphere.Ice_DMG + linkRope.Ice_DMG;
  c.Lightning_DMG = head.Lightning_DMG + hands.Lightning_DMG + body.Lightning_DMG + feet.Lightning_DMG + planarSphere.Lightning_DMG + linkRope.Lightning_DMG;
  c.Wind_DMG = head.Wind_DMG + hands.Wind_DMG + body.Wind_DMG + feet.Wind_DMG + planarSphere.Wind_DMG + linkRope.Wind_DMG;
  c.Quantum_DMG = head.Quantum_DMG + hands.Quantum_DMG + body.Quantum_DMG + feet.Quantum_DMG + planarSphere.Quantum_DMG + linkRope.Quantum_DMG;
  c.Imaginary_DMG = head.Imaginary_DMG + hands.Imaginary_DMG + body.Imaginary_DMG + feet.Imaginary_DMG + planarSphere.Imaginary_DMG + linkRope.Imaginary_DMG;
  c.weightScore = head.weightScore + hands.weightScore + body.weightScore + feet.weightScore + planarSphere.weightScore + linkRope.weightScore;

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

  let baseHP = params.baseHP + params.lcHP;
  let baseATK = params.baseATK + params.lcATK;
  let baseDEF = params.baseDEF + params.lcDEF;
  let baseSPD = params.baseSPD + params.lcSPD;
  const setEffects = 0;

//  c[Stats.SPD] = sumFlatStat(Stats.SPD, Stats.SPD_P, request.baseSpd, lc, trace, c,
//    0.06 * p2(sets.MessengerTraversingHackerspace)
//    + 0.06 * p4(sets.MusketeerOfWildWheat))
//function sumFlatStat(stat, statP, baseValue, lc, trace, relicSum, setEffects) {
//
//}
//function sumPercentStat(stat, base, lc, trace, relicSum, setEffects) {
//  return base[stat] + lc[stat] + relicSum[stat] + trace[stat] + setEffects
//}

  c.HP  = (baseHP) * (1 + setEffects + c.HP_P + params.traceHP_P + params.lcHP_P) + c.HP + params.traceHP;
  c.DEF = (baseDEF) * (1 + setEffects + c.DEF_P + params.traceDEF_P + params.lcDEF_P) + c.DEF + params.traceDEF;
  c.ATK = (baseATK) * (1 + setEffects + c.ATK_P + params.traceATK_P + params.lcATK_P) + c.ATK + params.traceATK;
  c.SPD = (baseSPD) * (1 + setEffects + c.SPD_P + params.traceSPD_P + params.lcSPD_P) + c.SPD + params.traceSPD;
  c.CR  += params.baseCR + params.lcCR + params.traceCR + setEffects;
  c.CD  += params.baseCD + params.lcCD + params.traceCD + setEffects;
  c.EHR += params.baseEHR + params.lcEHR + params.traceEHR + setEffects;
  c.RES += params.baseRES + params.lcRES + params.traceRES + setEffects;
  c.BE  += params.baseBE + params.lcBE + params.traceBE + setEffects;
  c.ERR += params.baseERR + params.lcERR + params.traceERR + setEffects;
  c.OHB += params.baseOHB + params.lcOHB + params.traceOHB + setEffects;

//  if (1 == 3) {
  results[index] = c;
//  }

//  if (relicSetSolutionsMatrix[relicSetIndex] != 1 || ornamentSetSolutionsMatrix[ornamentSetIndex] != 1) {
//    // Fail
//    results[index] = f32(params.lSize);
//  } else {
//    // Pass
//    results[index] = f32(c.CD);
//  }
}
