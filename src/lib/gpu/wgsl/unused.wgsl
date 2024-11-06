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


import {
  ASHBLAZING_ATK_STACK,
  BREAK_TYPE,
  ComputedStatsObject,
  NONE_TYPE,
  SKILL_TYPE,
  ULT_TYPE,
} from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  gpuStandardAtkHealFinalizer,
  gpuStandardFuaAtkFinalizer,
  standardAtkHealFinalizer,
  standardFuaAtkFinalizer,
} from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants'
import { buffStat, conditionalWgslWrapper, DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { buffAbilityVulnerability } from 'lib/optimizer/calculateBuffs'
import { TsUtils } from 'lib/TsUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { NumberToNumberMap } from 'types/Common'
import { ContentItem } from 'types/Conditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Lingsha')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.80, 0.88)
  const ultScaling = ult(e, 1.50, 1.65)
  const ultBreakVulnerability = ult(e, 0.25, 0.27)
  const fuaScaling = talent(e, 0.75, 0.825)

  const skillHealScaling = skill(e, 0.14, 0.148)
  const skillHealFlat = skill(e, 420, 467.25)

  const ultHealScaling = ult(e, 0.12, 0.128)
  const ultHealFlat = ult(e, 360, 400.5)

  const talentHealScaling = talent(e, 0.12, 0.128)
  const talentHealFlat = talent(e, 360, 400.5)

  const hitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 2 + 2 * 1 / 2),
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 2 + 3 * 1 / 2),
    5: ASHBLAZING_ATK_STACK * (3 * 1 / 2 + 4 * 1 / 2),
  }

  const defaults = {
    healAbility: NONE_TYPE,
    beConversion: true,
    befogState: true,
    e1DefShred: true,
    e2BeBuff: true,
    e6ResShred: true,
  }

  type CharacterContent = typeof defaults

  const content: EnforcedContent<CharacterContent> = [
    {
      formItem: 'select',
      id: 'healAbility',
      name: 'healAbility',
      text: tHeal('Text'),
      content: tHeal('Content'),
      options: [
        {
          display: tHeal('Skill'),
          value: SKILL_TYPE,
          label: tHeal('Skill'),
        },
        {
          display: tHeal('Ult'),
          value: ULT_TYPE,
          label: tHeal('Ult'),
        },
        {
          display: tHeal('Talent'),
          value: NONE_TYPE,
          label: tHeal('Talent'),
        },
      ],
      fullWidth: true,
    },
    {
      formItem: 'switch',
      id: 'beConversion',
      name: 'beConversion',
      text: t('Content.beConversion.text'),
      content: t('Content.beConversion.content'),
    },
    {
      formItem: 'switch',
      id: 'befogState',
      name: 'befogState',
      text: t('Content.befogState.text'),
      content: t('Content.befogState.content', { BefogVulnerability: TsUtils.precisionRound(100 * ultBreakVulnerability) }),
    },
    {
      formItem: 'switch',
      id: 'e1DefShred',
      name: 'e1DefShred',
      text: t('Content.e1DefShred.text'),
      content: t('Content.e1DefShred.content'),
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e2BeBuff',
      name: 'e2BeBuff',
      text: t('Content.e2BeBuff.text'),
      content: t('Content.e2BeBuff.content'),
      disabled: e < 2,
    },
    {
      formItem: 'switch',
      id: 'e6ResShred',
      name: 'e6ResShred',
      text: t('Content.e6ResShred.text'),
      content: t('Content.e6ResShred.content'),
      disabled: e < 6,
    },
  ]

  type CharacterConditionalContent = ConditionalContent<CharacterContent>

  const teammateDefaults = {
    befogState: true,
    e1DefShred: true,
    e2BeBuff: true,
    e6ResShred: true,
  }
  type TeammateContent = ConditionalContent<typeof teammateDefaults>
  const teammateContent: EnforcedContent<TeammateContent> = [
    findOrCreateContentItem(content, 'befogState'),
    findOrCreateContentItem(content, 'e1DefShred'),
    findOrCreateContentItem(content, 'e2BeBuff'),
    findOrCreateContentItem(content, 'e6ResShred'),
  ]

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r: CharacterConditionalContent = action.characterConditionals

      x.SUMMONS = 1
    },
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r: CharacterConditionalContent = action.characterConditionals

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.FUA_SCALING += fuaScaling * 2
      x.ULT_SCALING += ultScaling

      x.BREAK_EFFICIENCY_BOOST += (e >= 1) ? 0.50 : 0
      x.FUA_SCALING += (e >= 6 && r.e6ResShred) ? 0.50 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 30
      x.ULT_TOUGHNESS_DMG += 60
      x.FUA_TOUGHNESS_DMG += 30 * 2
      x.FUA_TOUGHNESS_DMG += (e >= 6) ? 15 : 0

      if (r.healAbility == SKILL_TYPE) {
        x.HEAL_TYPE = SKILL_TYPE
        x.HEAL_SCALING += skillHealScaling
        x.HEAL_FLAT += skillHealFlat
      }
      if (r.healAbility == ULT_TYPE) {
        x.HEAL_TYPE = ULT_TYPE
        x.HEAL_SCALING += ultHealScaling
        x.HEAL_FLAT += ultHealFlat
      }
      if (r.healAbility == NONE_TYPE) {
        x.HEAL_TYPE = NONE_TYPE
        x.HEAL_SCALING += talentHealScaling
        x.HEAL_FLAT += talentHealFlat
      }

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m: TeammateContent = action.characterConditionals

      if (x.ENEMY_WEAKNESS_BROKEN) {
        x.DEF_PEN += (e >= 1 && m.e1DefShred) ? 0.20 : 0
      }

      buffAbilityVulnerability(x, BREAK_TYPE, ultBreakVulnerability, (m.befogState))

      x[Stats.BE] += (e >= 2 && m.e2BeBuff) ? 0.40 : 0
      x.RES_PEN += (e >= 6 && m.e6ResShred) ? 0.20 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      standardFuaAtkFinalizer(x, action, context, hitMultiByTargets[context.enemyCount])
      standardAtkHealFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardFuaAtkFinalizer(hitMultiByTargets[context.enemyCount]) + gpuStandardAtkHealFinalizer()
    },
    dynamicConditionals: [LingshaConversionConditional],
  }
}

const LingshaConversionConditional: DynamicConditional = {
  id: 'LingshaConversionConditional',
  type: ConditionalType.ABILITY,
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.BE],
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return true
  },
  effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals
    if (!r.beConversion) {
      return
    }

    const stateValue = action.conditionalState[this.id] || 0
    const buffValueAtk = Math.min(0.50, 0.25 * x[Stats.BE]) * context.baseATK
    const buffValueOhb = Math.min(0.20, 0.10 * x[Stats.BE])

    const stateBuffValueAtk = Math.min(0.50, 0.25 * stateValue) * context.baseATK
    const stateBuffValueOhb = Math.min(0.20, 0.10 * stateValue)

    action.conditionalState[this.id] = x[Stats.BE]

    const finalBuffAtk = buffValueAtk - (stateValue ? stateBuffValueAtk : 0)
    const finalBuffOhb = buffValueOhb - (stateValue ? stateBuffValueOhb : 0)

    buffStat(x, Stats.ATK, finalBuffAtk, action, context)
    buffStat(x, Stats.OHB, finalBuffOhb, action, context)
  },
  gpu: function (action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals

    return conditionalWgslWrapper(this, `
if (${wgslFalse(r.beConversion)}) {
  return;
}

let stateValue: f32 = (*p_state).LingshaConversionConditional;

let buffValueAtk = min(0.50, 0.25 * x.BE) * baseATK;
let buffValueOhb = min(0.20, 0.10 * x.BE);

let stateBuffValueAtk = min(0.50, 0.25 * stateValue) * baseATK;
let stateBuffValueOhb = min(0.20, 0.10 * stateValue);

(*p_state).LingshaConversionConditional = (*p_x).BE;

let finalBuffAtk = buffValueAtk - select(0, stateBuffValueAtk, stateValue > 0);
let finalBuffOhb = buffValueOhb - select(0, stateBuffValueOhb, stateValue > 0);

buffDynamicATK(finalBuffAtk, p_x, p_state);
buffDynamicOHB(finalBuffOhb, p_x, p_state);
    `)
  },
}

type EnforcedContent<T extends Record<string, unknown>> = Array<ContentItem & { id: keyof T }>

function findOrCreateContentItem<T extends Record<string, unknown>, K extends Extract<keyof T, string>>(
  content: ContentItem[],
  id: K,
): ContentItem & { id: K } {
  const item = content.find((contentItem) => contentItem.id === id)!
  return item as ContentItem & { id: K }
}

type ConditionalContent<T extends Record<string, unknown>> = {
  [K in keyof T]: number;
}


export const StatToKey: Record<string, number> = {
  [Stats.ATK_P]: Key.ATK_P,
  [Stats.ATK]: Key.ATK,
  [Stats.BE]: Key.BE,
  [Stats.CD]: Key.CD,
  [Stats.CR]: Key.CR,
  [Stats.DEF_P]: Key.DEF_P,
  [Stats.DEF]: Key.DEF,
  [Stats.EHR]: Key.EHR,
  [Stats.ERR]: Key.ERR,
  [Stats.Fire_DMG]: Key.FIRE_DMG_BOOST,
  [Stats.HP_P]: Key.HP_P,
  [Stats.HP]: Key.HP,
  [Stats.Ice_DMG]: Key.ICE_DMG_BOOST,
  [Stats.Imaginary_DMG]: Key.IMAGINARY_DMG_BOOST,
  [Stats.Lightning_DMG]: Key.LIGHTNING_DMG_BOOST,
  [Stats.OHB]: Key.OHB,
  [Stats.Physical_DMG]: Key.PHYSICAL_DMG_BOOST,
  [Stats.Quantum_DMG]: Key.QUANTUM_DMG_BOOST,
  [Stats.RES]: Key.RES,
  [Stats.SPD_P]: Key.SPD_P,
  [Stats.SPD]: Key.SPD,
  [Stats.Wind_DMG]: Key.WIND_DMG_BOOST,
} as const

export const StatToOptimizerStat: Record<string, string> = {
  [Stats.ATK_P]: 'ATK_P',
  [Stats.ATK]: 'ATK',
  [Stats.BE]: 'BE',
  [Stats.CD]: 'CD',
  [Stats.CR]: 'CR',
  [Stats.DEF_P]: 'DEF_P',
  [Stats.DEF]: 'DEF',
  [Stats.EHR]: 'EHR',
  [Stats.ERR]: 'ERR',
  [Stats.Fire_DMG]: 'FIRE_DMG_BOOST',
  [Stats.HP_P]: 'HP_P',
  [Stats.HP]: 'HP',
  [Stats.Ice_DMG]: 'ICE_DMG_BOOST',
  [Stats.Imaginary_DMG]: 'IMAGINARY_DMG_BOOST',
  [Stats.Lightning_DMG]: 'LIGHTNING_DMG_BOOST',
  [Stats.OHB]: 'OHB',
  [Stats.Physical_DMG]: 'PHYSICAL_DMG_BOOST',
  [Stats.Quantum_DMG]: 'QUANTUM_DMG_BOOST',
  [Stats.RES]: 'RES',
  [Stats.SPD_P]: 'SPD_P',
  [Stats.SPD]: 'SPD',
  [Stats.Wind_DMG]: 'WIND_DMG_BOOST',
} as const
