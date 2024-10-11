// Here goes all the dead code and/or a wgsl scratchpad to test stuff

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

const VULNERABILITY = 41;
const BASIC_VULNERABILITY = 42;
const SKILL_VULNERABILITY = 43;
const ULT_VULNERABILITY = 44;
const FUA_VULNERABILITY = 45;
const DOT_VULNERABILITY = 46;

const DEF_PEN = 47;
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



const enabledHunterOfGlacialForest = 1;
const enabledFiresmithOfLavaForging = 1;
const enabledGeniusOfBrilliantStars = 0;
const enabledBandOfSizzlingThunder = 1;
const enabledMessengerTraversingHackerspace = 0;
const enabledCelestialDifferentiator = 0;
const enabledWatchmakerMasterOfDreamMachinations = 0;
const enabledIzumoGenseiAndTakamaDivineRealm = 1;
const enabledForgeOfTheKalpagniLantern = 0;
const enabledTheWindSoaringValorous = 1;
const valueChampionOfStreetwiseBoxing = 5;
const valueWastelanderOfBanditryDesert = 1;
const valueLongevousDisciple = 2;
const valueTheAshblazingGrandDuke = 7;
const valuePrisonerInDeepConfinement = 0;
const valuePioneerDiverOfDeadWaters = 2;
const valueSigoniaTheUnclaimedDesolation = 4;
const valueDuranDynastyOfRunningWolves = 5;

const baseHP_P = 0;
const baseATK_P = 0;
const baseDEF_P = 0;
const baseSPD_P = 0;
const baseHP = 1203.048;
const baseATK = 446.292;
const baseDEF = 654.885;
const baseSPD = 106;
const baseCR = 0.05;
const baseCD = 0.5;
const baseEHR = 0;
const baseRES = 0;
const baseBE = 0;
const baseERR = 0;
const baseOHB = 0;
const basePhysical_DMG = 0;
const baseFire_DMG = 0;
const baseIce_DMG = 0;
const baseLightning_DMG = 0;
const baseWind_DMG = 0;
const baseQuantum_DMG = 0;
const baseImaginary_DMG = 0;

const lcHP_P = 0;
const lcATK_P = 0;
const lcDEF_P = 0;
const lcSPD_P = 0;
const lcHP = 1203.048;
const lcATK = 446.292;
const lcDEF = 654.885;
const lcSPD = 106;
const lcCR = 0.05;
const lcCD = 0.5;
const lcEHR = 0;
const lcRES = 0;
const lcBE = 0;
const lcERR = 0;
const lcOHB = 0;
const lcPhysical_DMG = 0;
const lcFire_DMG = 0;
const lcIce_DMG = 0;
const lcLightning_DMG = 0;
const lcWind_DMG = 0;
const lcQuantum_DMG = 0;
const lcImaginary_DMG = 0;

const traceHP_P = 0;
const traceATK_P = 0;
const traceDEF_P = 0;
const traceSPD_P = 0;
const traceHP = 1203.048;
const traceATK = 446.292;
const traceDEF = 654.885;
const traceSPD = 106;
const traceCR = 0.05;
const traceCD = 0.5;
const traceEHR = 0;
const traceRES = 0;
const traceBE = 0;
const traceERR = 0;
const traceOHB = 0;
const tracePhysical_DMG = 0;
const traceFire_DMG = 0;
const traceIce_DMG = 0;
const traceLightning_DMG = 0;
const traceWind_DMG = 0;
const traceQuantum_DMG = 0;
const traceImaginary_DMG = 0;
/*


function copy(aObject) {
  // Prevent undefined objects
  // if (!aObject) return aObject;

  const bObject = Array.isArray(aObject) ? [] : {}

  let value
  for (const key in aObject) {
    // Prevent self-references to parent object
    // if (Object.is(aObject[key], aObject)) continue;

    value = aObject[key]

    bObject[key] = (typeof value === 'object') ? copy(value) : value
  }

  return bObject
}

function startTests2() {
  const original = baseComputedStatsObject

  function measure(testFn) {
    const start = Date.now()
    testFn()
    const end = Date.now()

    return end - start
  }

  function test1() {
    return measure(() => {
      for (let i = 0; i < 1000000; i++) {
        const copy = JSON.parse(JSON.stringify(original))
      }
    })
  }

  function test2() {
    return measure(() => {
      for (let i = 0; i < 1000000; i++) {
        const copy = {
          ...original,
        }
      }
    })
  }

  function test3() {
    return measure(() => {
      for (let i = 0; i < 1000000; i++) {
        const copy = cloneDeep(original)
      }
    })
  }

  function test4() {
    return measure(() => {
      for (let i = 0; i < 1000000; i++) {
        const copy = structuredClone(original)
      }
    })
  }

  function test5() {
    return measure(() => {
      for (let i = 0; i < 1000000; i++) {
        const copy = Object.assign({}, original)
      }
    })
  }

  function test6() {
    return measure(() => {
      for (let i = 0; i < 1000000; i++) {
        const x = copy(original)
      }
    })
  }

  function test7() {
    return measure(() => {
      for (let i = 0; i < 1000000; i++) {
        const x = {
          BASIC_DMG_TYPE: BASIC_TYPE,
          SKILL_DMG_TYPE: SKILL_TYPE,
          ULT_DMG_TYPE: ULT_TYPE,
          FUA_DMG_TYPE: FUA_TYPE,
          DOT_DMG_TYPE: DOT_TYPE,
          BREAK_DMG_TYPE: BREAK_TYPE,
          SUPER_BREAK_DMG_TYPE: SUPER_BREAK_TYPE,

          ['HP%']: 0,
          ['ATK%']: 0,
          ['DEF%']: 0,
          ['SPD%']: 0,
          ['HP']: 0,
          ['ATK']: 0,
          ['DEF']: 0,
          ['SPD']: 0.0001,
          ['CRIT DMG']: 0,
          ['CRIT Rate']: 0,
          ['Effect Hit Rate']: 0,
          ['Effect RES']: 0,
          ['Break Effect']: 0,
          ['Energy Regeneration Rate']: 0,
          ['Outgoing Healing Boost']: 0,

          ['Physical DMG Boost']: 0,
          ['Fire DMG Boost']: 0,
          ['Ice DMG Boost']: 0,
          ['Lightning DMG Boost']: 0,
          ['Wind DMG Boost']: 0,
          ['Quantum DMG Boost']: 0,
          ['Imaginary DMG Boost']: 0,

          ELEMENTAL_DMG: 0,

          BASIC_SCALING: 0,
          SKILL_SCALING: 0,
          ULT_SCALING: 0,
          FUA_SCALING: 0,
          DOT_SCALING: 0,

          BASIC_CR_BOOST: 0,
          SKILL_CR_BOOST: 0,
          ULT_CR_BOOST: 0,
          FUA_CR_BOOST: 0,

          BASIC_CD_BOOST: 0,
          SKILL_CD_BOOST: 0,
          ULT_CD_BOOST: 0,
          FUA_CD_BOOST: 0,

          // These are unused
          BASIC_BOOST: 0,
          SKILL_BOOST: 0,
          ULT_BOOST: 0,
          FUA_BOOST: 0,
          DOT_BOOST: 0,

          VULNERABILITY: 0,
          BASIC_VULNERABILITY: 0,
          SKILL_VULNERABILITY: 0,
          ULT_VULNERABILITY: 0,
          FUA_VULNERABILITY: 0,
          DOT_VULNERABILITY: 0,
          BREAK_VULNERABILITY: 0,

          DEF_PEN: 0,
          BASIC_DEF_PEN: 0,
          SKILL_DEF_PEN: 0,
          ULT_DEF_PEN: 0,
          FUA_DEF_PEN: 0,
          DOT_DEF_PEN: 0,
          BREAK_DEF_PEN: 0,
          SUPER_BREAK_DEF_PEN: 0,

          RES_PEN: 0,
          PHYSICAL_RES_PEN: 0,
          FIRE_RES_PEN: 0,
          ICE_RES_PEN: 0,
          LIGHTNING_RES_PEN: 0,
          WIND_RES_PEN: 0,
          QUANTUM_RES_PEN: 0,
          IMAGINARY_RES_PEN: 0,

          // These should technically be split by element but they are rare enough to ignore imo (e.g. DHIL basic attack)
          BASIC_RES_PEN: 0,
          SKILL_RES_PEN: 0,
          ULT_RES_PEN: 0,
          FUA_RES_PEN: 0,
          DOT_RES_PEN: 0,

          BASIC_DMG: 0,
          SKILL_DMG: 0,
          ULT_DMG: 0,
          FUA_DMG: 0,
          DOT_DMG: 0,
          BREAK_DMG: 0,
          COMBO_DMG: 0,

          DMG_RED_MULTI: 1, // Dmg reduction multiplier for EHP calcs - this should be multiplied by (1 - multi)
          EHP: 0,

          DOT_CHANCE: 0,
          EFFECT_RES_PEN: 0,

          // Black swan's stacking DoTs, the initial DoT has full value but subsequent stacks have reduced (DOT_SPLIT) value
          DOT_SPLIT: 0,
          DOT_STACKS: 0,

          ENEMY_WEAKNESS_BROKEN: 0,

          SUPER_BREAK_MODIFIER: 0,
          BASIC_SUPER_BREAK_MODIFIER: 0,
          SUPER_BREAK_HMC_MODIFIER: 0,
          BASIC_TOUGHNESS_DMG: 0,
          SKILL_TOUGHNESS_DMG: 0,
          ULT_TOUGHNESS_DMG: 0,
          FUA_TOUGHNESS_DMG: 0,

          // e.g. Acheron multiplier
          BASIC_ORIGINAL_DMG_BOOST: 0,
          SKILL_ORIGINAL_DMG_BOOST: 0,
          ULT_ORIGINAL_DMG_BOOST: 0,

          // Boothill
          BASIC_BREAK_DMG_MODIFIER: 0,

          // Robin
          ULT_CD_OVERRIDE: 0,
          ULT_BOOSTS_MULTI: 1,

          RATIO_BASED_HP_BUFF: 0,
          RATIO_BASED_HP_P_BUFF: 0,
          RATIO_BASED_ATK_BUFF: 0,
          RATIO_BASED_ATK_P_BUFF: 0,
          RATIO_BASED_DEF_BUFF: 0,
          RATIO_BASED_DEF_P_BUFF: 0,
          RATIO_BASED_SPD_BUFF: 0,
          RATIO_BASED_CD_BUFF: 0,

          BREAK_EFFICIENCY_BOOST: 0,
          BASIC_BREAK_EFFICIENCY_BOOST: 0, // Boothill
          ULT_BREAK_EFFICIENCY_BOOST: 0, // Feixiao

          WEIGHT: 0,
        }
      }
    })
  }

  console.log(`${test1()}ms - Stringify`)
  console.log(`${test2()}ms - Spread`)
  console.log(`${test3()}ms - Lodash`)
  console.log(`${test4()}ms - StructuredClone`)
  console.log(`${test5()}ms - Assign`)
  console.log(`${test6()}ms - Custom`)
  console.log(`${test7()}ms - Create`)

   // Chrome
   // 6302ms - Stringify
   // 106ms - Spread
   // 7987ms - Lodash
   // 8937ms - StructuredClone
   // 2662ms - Assign
   // 3014ms - Custom
   // 17ms - N/A - Creation time

   // Firefox
   // 7191ms - Stringify
   // 1519ms - Spread
   // 4535ms - Lodash
   // 10590ms - StructuredClone
   // 241ms - Assign
   // 1060ms - Custom
   // 177ms - N/A - Creation time

   // Opera
   // 6103ms - Stringify
   // 99ms - Spread
   // 7110ms - Lodash
   // 8401ms - StructuredClone
   // 2386ms - Assign
   // 2620ms - Custom
   // 16ms - N/A - Creation time
}
*/