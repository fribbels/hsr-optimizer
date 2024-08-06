export function generateWgslConstants() {
  return `

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

  `
}