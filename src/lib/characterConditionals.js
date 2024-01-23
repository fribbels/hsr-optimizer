import { ConfigProvider, Flex } from "antd";
import React from "react";
import { HeaderText } from "../components/HeaderText";
import { Constants } from './constants.ts'
import { FormSlider, FormSwitch } from "../components/optimizerTab/FormConditionalInputs";
import { TooltipImage } from "../components/TooltipImage";
import { Hint } from "./hint";

let Stats = Constants.Stats

let precisionRound = (number, precision = 8) => {
  let factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

const ASHBLAZING_ATK_STACK = 0.06
// Remove the ashblazing set atk bonus only when calc-ing fua attacks
function calculateAshblazingSet(c, request, hitMulti) {
  let enabled = p4(c.sets.TheAshblazingGrandDuke)
  let valueTheAshblazingGrandDuke = request.setConditionals[Constants.Sets.TheAshblazingGrandDuke][1]
  let ashblazingAtk = 0.06 * valueTheAshblazingGrandDuke * enabled * c.baseAtk * enabled
  let ashblazingMulti = hitMulti * enabled * c.baseAtk

  return {
    ashblazingMulti,
    ashblazingAtk
  }
}

const characterOptionMapping = {
  1212: jingliu,
  1302: argenti,
  1008: arlan,
  1009: asta,
  1211: bailu,
  1205: blade,
  1101: bronya,
  1107: clara,
  1002: danheng,
  1208: fuxuan,
  1104: gepard,
  1210: guinaifen,
  1215: hanya,
  1013: herta,
  1003: himeko,
  1109: hook,
  1217: huohuo,
  1213: imbibitorlunae, // Simplified stacking logic, revisit
  1204: jingyuan,
  1005: kafka,
  1111: luka,
  1203: luocha,
  1110: lynx,
  1001: march7th,
  1105: natasha,
  1106: pela,
  1201: qingque,
  1108: sampo,
  1102: seele,
  1103: serval,
  1006: silverwolf,
  1206: sushang,
  1202: tingyun,
  1112: topaz,
  8001: physicaltrailblazer,
  8002: physicaltrailblazer,
  8003: firetrailblazer,
  8004: firetrailblazer,
  1004: welt,
  1209: yanqing,
  1207: yukong,
  1303: ruanmei,
  1305: drratio,
  1214: xueyi,
}

// TODO profile & convert to array for performance?
const baseComputedStatsObject = {
  [Stats.HP_P]: 0,
  [Stats.ATK_P]: 0,
  [Stats.DEF_P]: 0,
  [Stats.SPD_P]: 0,
  [Stats.HP]: 0,
  [Stats.ATK]: 0,
  [Stats.DEF]: 0,
  [Stats.SPD]: 0,
  [Stats.CD]: 0,
  [Stats.CR]: 0,
  [Stats.EHR]: 0,
  [Stats.RES]: 0,
  [Stats.BE]: 0,
  [Stats.ERR]: 0,
  [Stats.OHB]: 0,

  ELEMENTAL_DMG: 0,
  DEF_SHRED: 0,
  DMG_TAKEN_MULTI: 0,
  ALL_DMG_MULTI: 0,
  RES_PEN: 0,
  DMG_RED_MULTI: 1,

  BASIC_CR_BOOST: 0,
  SKILL_CR_BOOST: 0,
  ULT_CR_BOOST: 0,
  FUA_CR_BOOST: 0,

  BASIC_CD_BOOST: 0,
  SKILL_CD_BOOST: 0,
  ULT_CD_BOOST: 0,
  FUA_CD_BOOST: 0,

  BASIC_SCALING: 0,
  SKILL_SCALING: 0,
  ULT_SCALING: 0,
  FUA_SCALING: 0,
  DOT_SCALING: 0,

  BASIC_BOOST: 0,
  SKILL_BOOST: 0,
  ULT_BOOST: 0,
  FUA_BOOST: 0,
  DOT_BOOST: 0,

  BASIC_VULNERABILITY: 0,
  SKILL_VULNERABILITY: 0,
  ULT_VULNERABILITY: 0,
  FUA_VULNERABILITY: 0,
  DOT_VULNERABILITY: 0,

  BASIC_DMG: 0,
  SKILL_DMG: 0,
  ULT_DMG: 0,
  FUA_DMG: 0,
  DOT_DMG: 0,

  BASIC_DEF_PEN: 0,
  SKILL_DEF_PEN: 0,
  ULT_DEF_PEN: 0,
  FUA_DEF_PEN: 0,
  DOT_DEF_PEN: 0,

  BASIC_RES_PEN: 0,
  SKILL_RES_PEN: 0,
  ULT_RES_PEN: 0,
  FUA_RES_PEN: 0,
  DOT_RES_PEN: 0,
}

function xueyi(e) {
  let ultBoostMax = ult(e, 0.60, 0.648)

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 1.40, 1.54)
  let ultScaling = ult(e, 2.50, 2.70)
  let fuaScaling = talent(e, 0.90, 0.99)

  let hitMultiByFuaHits = {
    0: 0,
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1), // 0.06
    2: ASHBLAZING_ATK_STACK * (1 * 1 / 2 + 2 * 1 / 2), // 0.09
    3: ASHBLAZING_ATK_STACK * (1 * 1 / 3 + 2 * 1 / 3 + 3 * 1 / 3) // 0.12
  }

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='enemyToughness50' text='Enemy toughness >= 50%' />
        <FormSlider name='toughnessReductionDmgBoost' text='Ult toughness based dmg boost' min={0} max={ultBoostMax} percent />
        <FormSlider name='fuaHits' text='Fua hits' min={0} max={3} />
        <FormSwitch name='e4BeBuff' text='E4 break effect buff' disabled={e < 4} />
      </Flex>
    ),
    defaults: () => ({
      enemyToughness50: true,
      toughnessReductionDmgBoost: ultBoostMax,
      fuaHits: 3,
      e4BeBuff: true,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.BE] += (e >= 4 && r.e4BeBuff) ? 0.40 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling * r.fuaHits

      // Boost
      x.ULT_BOOST += (r.enemyToughness50) ? 0.10 : 0
      x.ULT_BOOST += r.toughnessReductionDmgBoost
      x.FUA_BOOST += (e >= 1) ? 0.40 : 0

      return x
    },
    calculateBaseMultis: (c, request) => {
      let r = request.characterConditionals
      let x = c.x

      x.ELEMENTAL_DMG += Math.min(2.40, x[Stats.BE])

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]

      let hitMulti = hitMultiByFuaHits[r.fuaHits]
      let { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
    }
  }
}

function drratio(e) {
  let debuffStacksMax = 5
  let summationStacksMax = (e >= 1) ? 10 : 6

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 1.50, 1.65)
  let ultScaling = ult(e, 2.40, 2.592)
  let fuaScaling = talent(e, 2.70, 2.97)

  function e2FuaRatio(procs, fua = true) {
    return fua
      ? fuaScaling / (fuaScaling + 0.20 * procs) // for fua dmg
      : 0.20 / (fuaScaling + 0.20 * procs) // for each e2 proc
  }

  let baseHitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)
  let fuaMultiByDebuffs = {
    0: ASHBLAZING_ATK_STACK * (1 * 1 / 1), // 0
    1: ASHBLAZING_ATK_STACK * (1 * e2FuaRatio(1, true) + 2 * e2FuaRatio(1, false)), // 2
    2: ASHBLAZING_ATK_STACK * (1 * e2FuaRatio(2, true) + 5 * e2FuaRatio(2, false)), // 2 + 3
    3: ASHBLAZING_ATK_STACK * (1 * e2FuaRatio(3, true) + 9 * e2FuaRatio(3, false)), // 2 + 3 + 4
    4: ASHBLAZING_ATK_STACK * (1 * e2FuaRatio(4, true) + 14 * e2FuaRatio(4, false)), // 2 + 3 + 4 + 5
  }

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSlider name='summationStacks' text='Summation stacks' min={0} max={summationStacksMax} />
        <FormSlider name='enemyDebuffStacks' text='Enemy debuffs' min={0} max={debuffStacksMax} />
      </Flex>
    ),
    defaults: () => ({
      enemyDebuffStacks: debuffStacksMax,
      summationStacks: summationStacksMax,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.CR] += r.summationStacks * 0.025
      x[Stats.CD] += r.summationStacks * 0.05

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling

      // Boost
      x.ELEMENTAL_DMG += (r.enemyDebuffStacks >= 3) ? Math.min(0.50, r.enemyDebuffStacks * 0.10) : 0
      x.FUA_BOOST += (e >= 6) ? 0.50 : 0

      return x
    },
    calculateBaseMultis: (c, request) => {
      let r = request.characterConditionals
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      if (e >= 2) {
        let hitMulti = fuaMultiByDebuffs[Math.min(4, r.enemyDebuffStacks)]
        let { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)
        x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
      } else {
        let { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, baseHitMulti)
        x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
      }
    }
  }
}

function ruanmei(e) {
  let fieldResPenValue = ult(e, 0.25, 0.27)

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 0, 0)
  let ultScaling = ult(e, 0, 0)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='ultFieldActive' text='Ult field active' />
        <FormSwitch name='e4BeBuff' text='E4 break effect buff' disabled={e < 4} />
      </Flex>
    ),
    defaults: () => ({
      ultFieldActive: true,
      e4BeBuff: true,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.BE] += 0.20
      x[Stats.BE] += (e >= 4 && r.e4BeBuff) ? 1.00 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.RES_PEN += (r.ultFieldActive) ? fieldResPenValue : 0
      x.DEF_SHRED += (e >= 1 && r.ultFieldActive) ? 0.20 : 0
      x[Stats.ATK_P] += (e >= 2 && request.enemyWeaknessBroken) ? 0.40 : 0

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      let beOver = precisionRound((x[Stats.BE] * 100 - 120) / 10)
      x.ELEMENTAL_DMG += Math.floor(Math.max(0, beOver)) * 0.06

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    }
  }
}

function yukong(e) {
  let skillAtkBuffValue = skill(e, 0.80, 0.88)
  let ultCdBuffValue = skill(e, 0.65, 0.702)
  let ultCrBuffValue = skill(e, 0.28, 0.294)
  let talentAtkScaling = talent(e, 0.80, 0.88)

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 0, 0)
  let ultScaling = ult(e, 3.80, 4.104)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='roaringBowstrings' text='Roaring bowstrings' />
        <FormSwitch name='ultBuff' text='Ult buff' />
        <FormSwitch name='initialSpeedBuff' text='Initial speed buff' />
      </Flex>
    ),
    defaults: () => ({
      roaringBowstringsActive: true,
      ultBuff: true,
      initialSpeedBuff: true,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.ATK_P] += (r.roaringBowstrings) ? skillAtkBuffValue : 0
      x[Stats.CR] += (r.ultBuff && r.roaringBowstrings) ? ultCrBuffValue : 0
      x[Stats.CD] += (r.ultBuff && r.roaringBowstrings) ? ultCdBuffValue : 0
      x[Stats.SPD_P] += (r.initialSpeedBuff) ? 0.10 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.BASIC_SCALING += talentAtkScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.ELEMENTAL_DMG += 0.12
      x.ELEMENTAL_DMG += (e >= 4 && r.roaringBowstrings) ? 0.30 : 0

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    }
  }
}

function yanqing(e) {
  let ultCdBuffValue = ult(e, 0.50, 0.54)
  let talentCdBuffValue = ult(e, 0.30, 0.33)
  let talentCrBuffValue = ult(e, 0.20, 0.21)

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 2.20, 2.42)
  let ultScaling = ult(e, 3.50, 3.78)
  let fuaScaling = talent(e, 0.50, 0.55)

  let hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='ultBuffActive' text='Ult buff active' />
        <FormSwitch name='soulsteelBuffActive' text='Soulsteel buff active' />
        <FormSwitch name='critSpdBuff' text='Crit spd buff' />
        <FormSwitch name='e1TargetFrozen' text='E1 target frozen' disabled={e < 1} />
        <FormSwitch name='e4CurrentHp80' text='E4 self HP >= 80%' disabled={e < 4} />
      </Flex>
    ),
    defaults: () => ({
      ultBuffActive: true,
      soulsteelBuffActive: true,
      critSpdBuff: true,
      e1TargetFrozen: true,
      e4CurrentHp80: true,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.CR] += (r.ultBuffActive) ? 0.60 : 0
      x[Stats.CD] += (r.ultBuffActive && r.soulsteelBuffActive) ? ultCdBuffValue : 0
      x[Stats.CR] += (r.soulsteelBuffActive) ? talentCrBuffValue : 0
      x[Stats.CD] += (r.soulsteelBuffActive) ? talentCdBuffValue : 0
      x[Stats.RES] += (r.soulsteelBuffActive) ? 0.20 : 0
      x[Stats.SPD_P] += (r.critSpdBuff) ? 0.10 : 0
      x[Stats.ERR] += (e >= 2 && r.soulsteelBuffActive) ? 0.10 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling

      x.BASIC_SCALING += (request.enemyElementalWeak) ? 0.30 : 0
      x.SKILL_SCALING += (request.enemyElementalWeak) ? 0.30 : 0
      x.ULT_SCALING += (request.enemyElementalWeak) ? 0.30 : 0
      x.FUA_SCALING += (request.enemyElementalWeak) ? 0.30 : 0

      x.BASIC_SCALING += (e >= 1 && r.e1TargetFrozen) ? 0.60 : 0
      x.SKILL_SCALING += (e >= 1 && r.e1TargetFrozen) ? 0.60 : 0
      x.ULT_SCALING += (e >= 1 && r.e1TargetFrozen) ? 0.60 : 0
      x.FUA_SCALING += (e >= 1 && r.e1TargetFrozen) ? 0.60 : 0

      // Boost
      x.RES_PEN += (e >= 4 && r.e4CurrentHp80) ? 0.12 : 0

      return x
    },
    calculateBaseMultis: (c, request) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]

      let { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
    }
  }
}

function welt(e) {
  let skillExtraHitsMax = (e >= 6) ? 3 : 2

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 0.72, 0.792)
  let ultScaling = ult(e, 1.50, 1.62)
  let talentScaling = talent(e, 0.60, 0.66)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='enemyDmgTakenDebuff' text='Enemy dmg taken debuff' />
        <FormSwitch name='enemySlowed' text='Enemy slowed' />
        <FormSlider name='skillExtraHits' text='Skill extra hits' min={0} max={skillExtraHitsMax} />
        <FormSwitch name='e1EnhancedState' text='E1 enhanced state' disabled={e < 4} />
      </Flex>
    ),
    defaults: () => ({
      enemySlowed: true,
      enemyDmgTakenDebuff: true,
      skillExtraHits: skillExtraHitsMax,
      e1EnhancedState: true,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      x.BASIC_SCALING += (r.enemySlowed) ? talentScaling : 0
      x.SKILL_SCALING += (r.enemySlowed) ? talentScaling : 0
      x.ULT_SCALING += (r.enemySlowed) ? talentScaling : 0

      x.BASIC_SCALING += (e >= 1 && r.e1EnhancedState) ? 0.50 * basicScaling : 0
      x.SKILL_SCALING += (e >= 1 && r.e1EnhancedState) ? 0.80 * skillScaling : 0

      x.SKILL_SCALING += r.skillExtraHits * skillScaling

      // Boost
      x.ELEMENTAL_DMG += (request.enemyWeaknessBroken) ? 0.20 : 0
      x.DMG_TAKEN_MULTI += (r.enemyDmgTakenDebuff) ? 0.12 : 0

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      // x.FUA_DMG += 0
    }
  }
}

function firetrailblazer(e) {
  let skillDamageReductionValue = skill(e, 0.50, 0.52)

  let basicAtkScaling = basic(e, 1.00, 1.10)
  let basicDefScaling = (e >= 1) ? 0.25 : 0
  let basicEnhancedAtkScaling = basic(e, 1.35, 1.463)
  let basicEnhancedDefScaling = (e >= 1) ? 0.50 : 0
  let skillScaling = skill(e, 0, 0)
  let ultAtkScaling = ult(e, 1.00, 1.10)
  let ultDefScaling = ult(e, 1.50, 1.65)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='enhancedBasic' text='Enhanced basic' />
        <FormSwitch name='skillActive' text='Skill active' />
        <FormSwitch name='shieldActive' text='Shield active' />
        <FormSlider name='e6DefStacks' text='E6 def stacks' min={0} max={3} disabled={e < 6} />
      </Flex>
    ),
    defaults: () => ({
      enhancedBasic: true,
      skillActive: true,
      shieldActive: true,
      e6DefStacks: 3,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.DEF_P] += (e >= 6) ? r.e6DefStacks * 0.10 : 0
      x[Stats.ATK_P] += (r.shieldActive) ? 0.15 : 0

      // Scaling
      x.SKILL_SCALING += skillScaling

      // Boost
      x.DMG_RED_MULTI *= (r.skillActive) ? (1 - skillDamageReductionValue) : 1
      x.DMG_RED_MULTI *= (r.skillActive) ? (1 - 0.15) : 1

      return x
    },
    calculateBaseMultis: (c, request) => {
      let r = request.characterConditionals
      let x = c.x

      if (r.enhancedBasic) {
        x.BASIC_DMG += basicEnhancedAtkScaling * x[Stats.ATK]
        x.BASIC_DMG += basicEnhancedDefScaling * x[Stats.DEF]
      } else {
        x.BASIC_DMG += basicAtkScaling * x[Stats.ATK]
        x.BASIC_DMG += basicDefScaling * x[Stats.DEF]
      }

      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += ultAtkScaling * x[Stats.ATK]
      x.ULT_DMG += ultDefScaling * x[Stats.DEF]
    }
  }
}

function physicaltrailblazer(e) {
  let talentAtkScalingValue = talent(e, 0.20, 0.22)

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 1.25, 1.375)
  let ultScaling = ult(e, 4.5, 4.80)
  let ultEnhancedScaling = ult(e, 2.70, 2.88)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='enhancedUlt' text='Aoe ult' />
        <FormSlider name='talentStacks' text='Talent stacks' min={0} max={2} />
      </Flex>
    ),
    defaults: () => ({
      enhancedUlt: true,
      talentStacks: 2,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.ATK_P] += r.talentStacks * talentAtkScalingValue
      x[Stats.DEF_P] += r.talentStacks * 0.10
      x[Stats.CR] += (request.enemyWeaknessBroken) ? 0.25 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += (r.enhancedUlt) ? ultEnhancedScaling : ultScaling

      // Boost
      x.SKILL_BOOST += 0.25
      x.ULT_BOOST += (r.enhancedUlt) ? 0.25 : 0

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    }
  }
}

function topaz(e) {
  let proofOfDebtFuaVulnerability = skill(e, 0.50, 0.55)
  let enhancedStateFuaScalingBoost = ult(e, 1.50, 1.65)
  let enhancedStateFuaCdBoost = ult(e, 0.25, 0.275)

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 1.50, 1.65)
  let fuaScaling = talent(e, 1.50, 1.65)

  // 0.06
  let basicHitCountMulti = ASHBLAZING_ATK_STACK *
    (1 * 1 / 1)

  // 0.18
  let fuaHitCountMulti = ASHBLAZING_ATK_STACK *
    (1 * 1 / 7 + 2 * 1 / 7 + 3 * 1 / 7 + 4 * 1 / 7 + 5 * 1 / 7 + 6 * 1 / 7 + 7 * 1 / 7)

  // 0.252
  let fuaEnhancedHitCountMulti = ASHBLAZING_ATK_STACK *
    (1 * 1 / 10 + 2 * 1 / 10 + 3 * 1 / 10 + 4 * 1 / 10 + 5 * 1 / 10 + 6 * 1 / 10 + 7 * 1 / 10 + 8 * 3 / 10)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='enemyProofOfDebtDebuff' text='Target proof of debt debuff' />
        <FormSwitch name='numbyEnhancedState' text='Numby enhanced state' />
        <FormSlider name='e1DebtorStacks' text='E1 debtor stacks' min={0} max={2} disabled={e < 1} />
      </Flex>
    ),
    defaults: () => ({
      enemyProofOfDebtDebuff: true,
      numbyEnhancedState: true,
      e1DebtorStacks: 2,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.SKILL_SCALING += (r.numbyEnhancedState) ? enhancedStateFuaScalingBoost : 0
      x.FUA_SCALING += fuaScaling
      x.FUA_SCALING += (r.numbyEnhancedState) ? enhancedStateFuaScalingBoost : 0

      // Boost
      x.FUA_VULNERABILITY += (r.enemyProofOfDebtDebuff) ? proofOfDebtFuaVulnerability : 0
      x.ELEMENTAL_DMG += (request.enemyElementalWeak) ? 0.15 : 0
      x.FUA_CD_BOOST += (e >= 1) ? 0.25 * r.e1DebtorStacks : 0

      return x
    },
    calculateBaseMultis: (c, request) => {
      let r = request.characterConditionals
      let x = c.x

      let hitMulti = (r.numbyEnhancedState) ? fuaEnhancedHitCountMulti : fuaHitCountMulti
      let ashblazingFuaData = calculateAshblazingSet(c, request, hitMulti)
      let ashblazingBasicData = calculateAshblazingSet(c, request, basicHitCountMulti)


      x.BASIC_DMG += x.BASIC_SCALING * (x[Stats.ATK] - ashblazingBasicData.ashblazingAtk + ashblazingBasicData.ashblazingMulti)
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingFuaData.ashblazingAtk + ashblazingFuaData.ashblazingMulti)
      x.SKILL_DMG = x.FUA_DMG

      // Copy fua boosts to skill/basic
      // BOOSTS get added, while vulnerability / def pen gets replaced (?)
      x.SKILL_BOOST += x.FUA_BOOST
      x.SKILL_CD_BOOST += x.FUA_CD_BOOST
      x.SKILL_CR_BOOST += x.FUA_CR_BOOST
      x.SKILL_VULNERABILITY = x.FUA_VULNERABILITY
      x.SKILL_DEF_PEN = x.FUA_DEF_PEN
      x.SKILL_RES_PEN = x.FUA_RES_PEN

      x.BASIC_BOOST += x.FUA_BOOST
      x.BASIC_CD_BOOST += x.FUA_CD_BOOST
      x.BASIC_CR_BOOST += x.FUA_CR_BOOST
      x.BASIC_VULNERABILITY = x.FUA_VULNERABILITY
      x.BASIC_DEF_PEN = x.FUA_DEF_PEN
      x.BASIC_RES_PEN = x.FUA_RES_PEN

      // Her ult buff only applies to the skill/fua not basic
      x.FUA_CD_BOOST += (r.numbyEnhancedState) ? enhancedStateFuaCdBoost : 0
      x.SKILL_CD_BOOST += (r.numbyEnhancedState) ? enhancedStateFuaCdBoost : 0

      // Her e6 only applies to skill/fua not basic
      x.SKILL_RES_PEN += (e >= 6) ? 0.10 : 0
      x.FUA_RES_PEN += (e >= 6) ? 0.10 : 0
    }
  }
}

function tingyun(e) {
  let skillAtkBoostMax = skill(e, 0.25, 0.27)
  let ultDmgBoost = ult(e, 0.50, 0.56)
  // let skillAtkBoostScaling = skill(e, 0.50, 0.55) + ((e >= 4) ? 0.20 : 0)
  // let talentScaling = talent(e, 0.60, 0.66) + ((e >= 4) ? 0.20 : 0)

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 0, 0)
  let ultScaling = ult(e, 0, 0)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='benedictionBuff' text='Benediction buff' />
        <FormSwitch name='skillSpdBuff' text='Skill spd buff' />
        <FormSwitch name='ultSpdBuff' text='Ult spd buff' />
        <FormSwitch name='ultDmgBuff' text='Ult dmg buff' />
      </Flex>
    ),
    defaults: () => ({
      benedictionBuff: false,
      skillSpdBuff: false,
      ultSpdBuff: false,
      ultDmgBuff: false,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.SPD_P] += (e >= 1 && r.ultSpdBuff) ? 0.20 : 0
      x[Stats.SPD_P] += (r.skillSpdBuff) ? 0.20 : 0
      x[Stats.ATK_P] += (r.benedictionBuff) ? skillAtkBoostMax : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.BASIC_BOOST += 0.40
      x.ELEMENTAL_DMG += (r.ultDmgBuff) ? ultDmgBoost : 0

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    }
  }
}

function sushang(e) {
  let talentSpdBuffValue = talent(e, 0.20, 0.21)
  let ultBuffedAtk = ult(e, 0.30, 0.324)
  let talentSpdBuffStacksMax = (e >= 6) ? 2 : 1

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 2.10, 2.31)
  let skillExtraHitScaling = skill(e, 1.00, 1.10)
  let ultScaling = ult(e, 3.20, 3.456)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='ultBuffedState' text='Ult buffed state' />
        <FormSlider name='skillExtraHits' text='Skill extra hits' min={0} max={3} />
        <FormSlider name='skillTriggerStacks' text='Skill trigger stacks' min={0} max={10} />
        <FormSlider name='talentSpdBuffStacks' text='Talent spd buff stacks' min={0} max={talentSpdBuffStacksMax} />
        <FormSwitch name='e2DmgReductionBuff' text='E2 dmg reduction' disabled={e < 2} />
      </Flex>
    ),
    defaults: () => ({
      ultBuffedState: true,
      e2DmgReductionBuff: true,
      skillExtraHits: 3,
      skillTriggerStacks: 10,
      talentSpdBuffStacks: talentSpdBuffStacksMax,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.BE] += (e >= 4) ? 0.40 : 0
      x[Stats.ATK_P] += (r.ultBuffedState) ? ultBuffedAtk : 0
      x[Stats.SPD_P] += (r.talentSpdBuffStacks) * talentSpdBuffValue

      // Scaling
      // Trace only affects stance damage not skill damage - boost this based on proportion of stance : total skill dmg
      let originalSkillScaling = skillScaling
      let stanceSkillScaling = 0
      stanceSkillScaling += (r.skillExtraHits >= 1) ? skillExtraHitScaling : 0
      stanceSkillScaling += (r.ultBuffedState && r.skillExtraHits >= 2) ? skillExtraHitScaling * 0.5 : 0
      stanceSkillScaling += (r.ultBuffedState && r.skillExtraHits >= 3) ? skillExtraHitScaling * 0.5 : 0
      let stanceScalingProportion = stanceSkillScaling / (stanceSkillScaling + originalSkillScaling)

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += originalSkillScaling
      x.SKILL_SCALING += stanceSkillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.SKILL_BOOST += r.skillTriggerStacks * 0.025 * stanceScalingProportion
      x.DMG_RED_MULTI *= (e >= 2 && r.e2DmgReductionBuff) ? (1 - 0.20) : 1

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      // x.FUA_DMG += 0
    }
  }
}

function silverwolf(e) {
  let skillResShredValue = skill(e, 0.10, 0.105)
  let skillDefShredBufValue = skill(e, 0.08, 0.088)
  let ultDefShredValue = ult(e, 0.45, 0.468)

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 1.96, 2.156)
  let ultScaling = ult(e, 3.80, 4.104)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='skillResShredDebuff' text='Skill res shred' />
        <FormSwitch name='skillDefShredDebuff' text='Skill def shred' />
        <FormSwitch name='ultDefShredDebuff' text='Ult def shred' />
        <FormSlider name='targetDebuffs' text='Target debuffs' min={0} max={5} />
      </Flex>
    ),
    defaults: () => ({
      skillResShredDebuff: true,
      skillDefShredDebuff: true,
      ultDefShredDebuff: true,
      targetDebuffs: 5,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.ULT_SCALING += (e >= 4) ? r.targetDebuffs * 0.20 : 0

      // Boost
      x.RES_PEN += (r.skillResShredDebuff) ? skillResShredValue : 0
      x.RES_PEN += (r.skillResShredDebuff && r.targetDebuffs >= 3) ? 0.03 : 0
      x.DEF_SHRED += (r.skillDefShredDebuff) ? skillDefShredBufValue : 0
      x.DEF_SHRED += (r.ultDefShredDebuff) ? ultDefShredValue : 0
      x.ELEMENTAL_DMG += (e >= 6) ? r.targetDebuffs * 0.20 : 0

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      // x.FUA_DMG += 0
    }
  }
}

function serval(e) {
  let talentExtraDmgScaling = talent(e, 0.72, 0.792)

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 1.40, 1.54)
  let ultScaling = ult(e, 1.80, 1.944)
  let dotScaling = skill(e, 1.04, 1.144)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='targetShocked' text='Target shocked' />
        <FormSwitch name='enemyDefeatedBuff' text='Enemy killed buff' />
      </Flex>
    ),
    defaults: () => ({
      targetShocked: true,
      enemyDefeatedBuff: true,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.ATK_P] += (r.enemyDefeatedBuff) ? 0.20 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += dotScaling

      x.BASIC_SCALING += (r.targetShocked) ? talentExtraDmgScaling : 0
      x.SKILL_SCALING += (r.targetShocked) ? talentExtraDmgScaling : 0
      x.ULT_SCALING += (r.targetShocked) ? talentExtraDmgScaling : 0

      // Boost
      x.ELEMENTAL_DMG += (e >= 6 && r.targetShocked) ? 0.30 : 0

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]
    }
  }
}

function seele(e) {
  let buffedStateDmgBuff = talent(e, 0.80, 0.88)
  let speedBoostStacksMax = (e >= 2 ? 2 : 1)

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 2.20, 2.42)
  let ultScaling = ult(e, 4.25, 4.59)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='buffedState' text='Buffed state' />
        <FormSlider name='speedBoostStacks' text='Speed boost stacks' min={0} max={speedBoostStacksMax} />
        <FormSwitch name='e6UltTargetDebuff' text='E6 ult debuff' disabled={e < 6} />
      </Flex>
    ),
    defaults: () => ({
      buffedState: true,
      speedBoostStacks: speedBoostStacksMax,
      e6UltTargetDebuff: true
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.CR] += (e >= 1 && request.enemyHpPercent <= 0.80) ? 0.15 : 0
      x[Stats.SPD_P] += 0.25 * r.speedBoostStacks

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.ELEMENTAL_DMG += (r.buffedState) ? buffedStateDmgBuff : 0
      x.RES_PEN += (r.buffedState) ? 0.20 : 0

      return x
    },
    calculateBaseMultis: (c, request) => {
      let r = request.characterConditionals
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]

      x.BASIC_DMG += (e >= 6 && r.e6UltTargetDebuff) ? 0.15 * x.ULT_DMG : 0
      x.SKILL_DMG += (e >= 6 && r.e6UltTargetDebuff) ? 0.15 * x.ULT_DMG : 0
      x.ULT_DMG += (e >= 6 && r.e6UltTargetDebuff) ? 0.15 * x.ULT_DMG : 0
    }
  }
}

function sampo(e) {
  let dotVulnerabilityValue = ult(e, 0.30, 0.32)

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 0.56, 0.616)
  let ultScaling = ult(e, 1.60, 1.728)
  let dotScaling = talent(e, 0.52, 0.572)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='targetDotTakenDebuff' text='Ult dot taken debuff' />
        <FormSlider name='skillExtraHits' text='Skill extra hits' min={0} max={4} />
        <FormSwitch name='targetWindShear' text='Target has wind shear' />
      </Flex>
    ),
    defaults: () => ({
      targetDotTakenDebuff: true,
      skillExtraHits: 4,
      targetWindShear: true
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.SKILL_SCALING += (r.skillExtraHits) * skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += dotScaling
      x.DOT_SCALING += (e >= 6) ? 0.15 : 0

      // Boost
      x.DOT_VULNERABILITY += (r.targetDotTakenDebuff) ? dotVulnerabilityValue : 0
      x.DMG_RED_MULTI *= (r.targetWindShear) ? (1 - 0.15) : 1

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]
    }
  }
}

function qingque(e) {
  let skillStackDmg = skill(e, 0.38, 0.408)
  let talentAtkBuff = talent(e, 0.72, 0.792)

  let basicScaling = basic(e, 1.00, 1.10)
  let basicEnhancedScaling = basic(e, 2.40, 2.64)
  let skillScaling = skill(e, 0, 0)
  let ultScaling = ult(e, 2.00, 2.16)

  let hitMultiByTargetsBlast = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1), // 0.06
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 1), // 0.12
    5: ASHBLAZING_ATK_STACK * (2 * 1 / 1)  // 0.12
  }

  let hitMultiSingle = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='basicEnhanced' text='Basic enhanced' />
        <FormSwitch name='basicEnhancedSpdBuff' text='Basic enhanced spd buff' />
        <FormSlider name='skillDmgIncreaseStacks' text='Skill dmg stacks' min={0} max={4} />
      </Flex>
    ),
    defaults: () => ({
      basicEnhanced: true,
      basicEnhancedSpdBuff: true,
      skillDmgIncreaseStacks: 4,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.ATK_P] += (r.basicEnhanced) ? talentAtkBuff : 0
      x[Stats.SPD_P] += (r.basicEnhancedSpdBuff) ? 0.10 : 0

      // Scaling
      x.BASIC_SCALING += (r.basicEnhanced) ? basicEnhancedScaling : basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += (e >= 4) ? x.BASIC_SCALING : 0

      // Boost
      x.ELEMENTAL_DMG += r.skillDmgIncreaseStacks * skillStackDmg
      x.ULT_BOOST += (e >= 1) ? 0.10 : 0

      return x
    },
    calculateBaseMultis: (c, request) => {
      let r = request.characterConditionals
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]

      if (r.basicEnhanced) {
        let hitMulti = hitMultiByTargetsBlast[request.enemyCount]
        let { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)
        x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
      } else {
        let { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMultiSingle)
        x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
      }
    }
  }
}

function pela(e) {
  let ultDefPenValue = ult(e, 0.40, 0.42)

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 2.10, 2.31)
  let ultScaling = ult(e, 1.00, 1.08)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='enemyDebuffed' text='Enemy debuffed' />
        <FormSwitch name='skillRemovedBuff' text='Skill removed buff' />
        <FormSwitch name='ultDefPenDebuff' text='Ult def pen debuff' />
        <FormSwitch name='e4SkillResShred' text='E4 skill res shred' disabled={e < 4} />
      </Flex>
    ),
    defaults: () => ({
      enemyDebuffed: true,
      skillRemovedBuff: true,
      ultDefPenDebuff: true,
      e4SkillResShred: true,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.EHR] += 0.10
      x[Stats.SPD_P] += (e >= 2 && r.skillRemovedBuff) ? 0.10 : 0
      x[Stats.SPD_P] += (e >= 2 && r.skillRemovedBuff) ? 0.10 : 0
      x[Stats.SPD_P] += (e >= 2 && r.skillRemovedBuff) ? 0.10 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.BASIC_BOOST += (r.skillRemovedBuff) ? 0.20 : 0
      x.SKILL_BOOST += (r.skillRemovedBuff) ? 0.20 : 0
      x.ULT_BOOST += (r.skillRemovedBuff) ? 0.20 : 0

      x.RES_PEN += (e >= 4 && r.e4SkillResShred) ? 0.12 : 0
      x.DEF_SHRED += (r.ultDefPenDebuff) ? ultDefPenValue : 0

      x.ELEMENTAL_DMG += (r.enemyDebuffed) ? 0.20 : 0

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]

      x.BASIC_DMG += (e >= 6) ? 0.40 * x[Stats.ATK] : 0
      x.SKILL_DMG += (e >= 6) ? 0.40 * x[Stats.ATK] : 0
      x.ULT_DMG += (e >= 6) ? 0.40 * x[Stats.ATK] : 0
    }
  }
}

function natasha(e) {
  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 0, 0)
  let ultScaling = ult(e, 0, 0)

  return {
    display: () => (
      <Flex vertical gap={10} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: () => {
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.BASIC_DMG += (e >= 6) ? 0.40 * x[Stats.HP] : 0
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    }
  }
}

function march7th(e) {
  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 0, 0)
  let ultScaling = ult(e, 1.50, 1.62)
  let fuaScaling = talent(e, 1.00, 1.10)

  let hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  return {
    display: () => (
      <Flex vertical gap={10} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: () => {
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling

      // Boost

      return x
    },
    calculateBaseMultis: (c, request) => {
      let x = c.x

      let { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
      x.FUA_DMG += (e >= 4) ? 0.30 * x[Stats.DEF] : 0
    }
  }
}

function lynx(e) {
  let skillHpPercentBuff = skill(e, 0.075, 0.08)
  let skillHpFlatBuff = skill(e, 200, 223)

  let basicScaling = basic(e, 0.50, 0.55)
  let skillScaling = skill(e, 0, 0)
  let ultScaling = ult(e, 0, 0)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='skillBuff' text='Skill buff' />
      </Flex>
    ),
    defaults: () => ({
      skillBuff: true,
      e4TalentAtkBuff: true,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.HP_P] += (r.skillBuff) ? skillHpPercentBuff : 0
      x[Stats.HP] += (r.skillBuff) ? skillHpFlatBuff : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost

      return x
    },
    calculateBaseMultis: (c, request) => {
      let r = request.characterConditionals
      let x = c.x

      x[Stats.HP] += (e >= 6 && r.skillBuff) ? 0.06 * x[Stats.HP] : 0
      x[Stats.ATK] += (e >= 4 && r.skillBuff) ? 0.03 * x[Stats.HP] : 0

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.HP]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      // x.FUA_DMG += 0
    }
  }
}

function luocha(e) {
  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 0, 0)
  let ultScaling = ult(e, 2.00, 2.16)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='fieldActive' text='Field active' />
        <FormSwitch name='e6ResReduction' text='E6 res reduction' disabled={e < 6} />
      </Flex>
    ),
    defaults: () => ({
      fieldActive: true,
      e6ResReduction: true,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.ATK_P] += (r >= 1 && r.fieldActive) ? 0.20 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.RES_PEN += (e >= 6 && r.e6ResReduction) ? 0.20 : 0

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      // x.FUA_DMG += 0
    }
  }
}

function luka(e) {
  let basicEnhancedHitValue = basic(e, 0.20, 0.22)
  let targetUltDebuffDmgTakenValue = ult(e, 0.20, 0.216)

  let basicScaling = basic(e, 1.00, 1.10)
  let basicEnhancedScaling = basic(e, 0.20 * 3 + 0.80, 0.22 * 3 + 0.88)
  let skillScaling = skill(e, 1.20, 1.32)
  let ultScaling = ult(e, 3.30, 3.564)
  let dotScaling = skill(e, 3.38, 3.718)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='basicEnhanced' text='Basic enhanced' />
        <FormSwitch name='targetUltDebuffed' text='Target ult debuffed' />
        <FormSlider name='basicEnhancedExtraHits' text='Basic extra hits' min={0} max={3} />
        <FormSwitch name='e1TargetBleeding' text='E1 target bleeding' disabled={e < 1} />
        <FormSlider name='e4TalentStacks' text='E4 talent stacks' min={0} max={4} disabled={e < 4} />
      </Flex>
    ),
    defaults: () => ({
      basicEnhanced: true,
      targetUltDebuffed: true,
      e1TargetBleeding: true,
      basicEnhancedExtraHits: 3,
      e4TalentStacks: 4,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.ATK_P] += (e >= 4) ? r.e4TalentStacks * 0.05 : 0

      // Scaling
      x.BASIC_SCALING += (r.basicEnhanced) ? basicEnhancedScaling : basicScaling
      x.BASIC_SCALING += (r.basicEnhanced && r.basicEnhancedExtraHits) * basicEnhancedHitValue
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += dotScaling

      // Boost
      x.DMG_TAKEN_MULTI += (r.targetUltDebuffed) ? targetUltDebuffDmgTakenValue : 0
      x.ELEMENTAL_DMG += (e >= 1 && r.e1TargetBleeding) ? 0.15 : 0

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]
      // x.FUA_DMG += 0
    }
  }
}

function kafka(e) {

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 1.60, 1.76)
  let ultScaling = ult(e, 0.80, 0.864)
  let fuaScaling = talent(e, 1.40, 1.596)
  let dotScaling = ult(e, 2.90, 3.183)

  let hitMulti = ASHBLAZING_ATK_STACK *
    (1 * 0.15 + 2 * 0.15 + 3 * 0.15 + 4 * 0.15 + 5 * 0.15 + 6 * 0.25)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='e1DotDmgReceivedDebuff' text='E1 dot dmg debuff' disabled={e < 1} />
      </Flex>
    ),
    defaults: () => ({
      e1DotDmgReceivedDebuff: true,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling
      x.DOT_SCALING += dotScaling

      // Boost
      x.DOT_VULNERABILITY += (e >= 1 && r.e1DotDmgReceivedDebuff) ? 0.30 : 0
      x.DOT_BOOST += (e >= 2) ? 0.25 : 0
      x.DOT_SCALING += (e >= 6) ? 1.56 : 0

      return x
    },
    calculateBaseMultis: (c, request) => {
      let x = c.x

      let { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
      x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]
    }
  }
}

function jingyuan(e) {
  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 1.00, 1.10)
  let ultScaling = ult(e, 2.00, 2.16)
  let fuaScaling = talent(e, 0.66, 0.726)

  let hitMulti = 0

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='skillCritBuff' text='Skill cr buff' />
        <FormSlider name='talentHitsPerAction' text='Talent stacks' min={3} max={10} />
        <FormSlider name='talentAttacks' text='Talent hit on target' min={0} max={10} />
        <FormSwitch name='e2DmgBuff' text='E2 dmg buff' disabled={e < 2} />
        <FormSlider name='e6FuaVulnerabilityStacks' text='E6 vulnerable stacks (applies to all hits)' min={0} max={3} disabled={e < 6} />
      </Flex>
    ),
    defaults: () => ({
      skillCritBuff: true,
      talentHitsPerAction: 10,
      talentAttacks: 10,
      e2DmgBuff: true,
      e6FuaVulnerabilityStacks: 3
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      r.talentHitsPerAction = Math.max(r.talentHitsPerAction, r.talentAttacks)

      // Stats
      x[Stats.CR] += (r.skillCritBuff) ? 0.10 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling

      // Boost
      x.FUA_CD_BOOST += (r.talentHitsPerAction >= 6) ? 0.25 : 0
      x.BASIC_BOOST += (e >= 2 && r.e2DmgBuff) ? 0.20 : 0
      x.SKILL_BOOST += (e >= 2 && r.e2DmgBuff) ? 0.20 : 0
      x.ULT_BOOST += (e >= 2 && r.e2DmgBuff) ? 0.20 : 0

      x.FUA_VULNERABILITY += (e >= 6) ? r.e6FuaVulnerabilityStacks * 0.12 : 0

      // Lightning lord calcs
      let stacks = r.talentHitsPerAction
      let hits = r.talentAttacks
      let stacksPerMiss = (request.enemyCount >= 3) ? 2 : 0
      let stacksPerHit = (request.enemyCount >= 3) ? 3 : 1
      let stacksPreHit = (request.enemyCount >= 3) ? 2 : 1

      // Calc stacks on miss
      let ashblazingStacks = stacksPerMiss * (stacks - hits)

      // Calc stacks on hit
      ashblazingStacks += stacksPreHit
      let atkBoostSum = 0
      for (let i = 0; i < hits; i++) {
        atkBoostSum += Math.min(8, ashblazingStacks) * (1 / hits)
        ashblazingStacks += stacksPerHit
      }

      hitMulti = atkBoostSum * 0.06

      return x
    },
    calculateBaseMultis: (c, request) => {
      let r = request.characterConditionals
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]

      let { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)
      x.FUA_DMG += x.FUA_SCALING * r.talentAttacks * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
    }
  }
}

function imbibitorlunae(e) {
  let righteousHeartStackMax = (e >= 1) ? 10 : 6
  let outroarStackCdValue = skill(e, 0.12, 0.132)
  let righteousHeartDmgValue = talent(e, 0.10, 0.11)

  let basicScaling = basic(e, 1.00, 1.10)
  let basicEnhanced1Scaling = basic(e, 2.60, 2.86)
  let basicEnhanced2Scaling = basic(e, 3.80, 4.18)
  let basicEnhanced3Scaling = basic(e, 5.00, 5.50)
  let skillScaling = skill(e, 0, 0)
  let ultScaling = ult(e, 3.00, 3.24)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSlider name='basicEnhancements' text='Basic enhancements' min={0} max={3} />
        <FormSlider name='skillOutroarStacks' text='Outroar stacks (applied to all hits)' min={0} max={4} />
        <FormSlider name='talentRighteousHeartStacks' text='Righteous Heart stacks (applied to all hits)' min={0} max={righteousHeartStackMax} />
        <FormSlider name='e6ResPenStacks' text='E6 RES pen stacks' min={0} max={3} disabled={e < 6} />
      </Flex>
    ),
    defaults: () => ({
      basicEnhancements: 3,
      skillOutroarStacks: 4,
      talentRighteousHeartStacks: righteousHeartStackMax,
      e6ResPenStacks: 3,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.CD] += (request.enemyElementalWeak) ? 0.24 : 0
      x[Stats.CD] += r.skillOutroarStacks * outroarStackCdValue

      // Scaling
      x.BASIC_SCALING += {
        0: basicScaling,
        1: basicEnhanced1Scaling,
        2: basicEnhanced2Scaling,
        3: basicEnhanced3Scaling,
      }[r.basicEnhancements]
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.ELEMENTAL_DMG += r.talentRighteousHeartStacks * righteousHeartDmgValue
      x.BASIC_RES_PEN += (e >= 6 && r.basicEnhancements == 3) ? 0.20 * r.e6ResPenStacks : 0

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    }
  }
}

function huohuo(e) {
  let ultBuffValue = ult(e, 0.40, 0.432)
  let basicScaling = basic(e, 0.50, 0.55)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='ultBuff' text='Ult buff' />
        <FormSwitch name='skillBuff' text='Skill buff' />
        <FormSwitch name='e6DmgBuff' text='E6 dmg buff' disabled={e < 6} />
      </Flex>
    ),
    defaults: () => ({
      ultBuff: true,
      skillBuff: true,
      e6DmgBuff: true,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.SPD_P] += (e >= 1 && r.skillBuff) ? 0.12 : 0
      x[Stats.ATK_P] += (r.ultBuff) ? ultBuffValue : 0

      // Scaling
      x.BASIC_SCALING += basicScaling

      // Boost
      x.ELEMENTAL_DMG += (e >= 6 && r.skillBuff) ? 0.50 : 0

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.HP]
    }
  }
}

function hook(e) {
  let targetBurnedExtraScaling = talent(e, 1.00, 1.10)

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 2.40, 2.64)
  let skillEnhancedScaling = skill(e, 2.80, 3.08)
  let ultScaling = ult(e, 4.00, 4.32)
  let dotScaling = skill(e, 0.65, 0.715)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='enhancedSkill' text='Enhanced skill' />
        <FormSwitch name='targetBurned' text='Target burned' />
      </Flex>
    ),
    defaults: () => ({
      enhancedSkill: true,
      targetBurned: true,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += (r.enhancedSkill) ? skillEnhancedScaling : skillScaling
      x.ULT_SCALING += ultScaling
      x.BASIC_SCALING += (r.targetBurned) ? targetBurnedExtraScaling : 0
      x.SKILL_SCALING += (r.targetBurned) ? targetBurnedExtraScaling : 0
      x.ULT_SCALING += (r.targetBurned) ? targetBurnedExtraScaling : 0
      x.DOT_SCALING += dotScaling

      // Boost
      x.SKILL_BOOST += (e >= 1 && r.enhancedSkill) ? 0.20 : 0
      x.ELEMENTAL_DMG += (e >= 6 && r.targetBurned) ? 0.20 : 0

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]
    }
  }
}
function himeko(e) {
  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 2.00, 2.20)
  let ultScaling = ult(e, 2.30, 2.484)
  let fuaScaling = talent(e, 1.40, 1.54)
  let dotScaling = 0.30

  let hitMultiByTargets = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.20 + 2 * 0.20 + 3 * 0.20 + 4 * 0.40), // 0.168
    3: ASHBLAZING_ATK_STACK * (2 * 0.20 + 5 * 0.20 + 8 * 0.20 + 8 * 0.40), // 0.372
    5: ASHBLAZING_ATK_STACK * (3 * 0.20 + 8 * 0.20 + 8 * 0.20 + 8 * 0.40), // 0.42
  }

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='targetBurned' text='Target burned' />
        <FormSwitch name='selfCurrentHp80Percent' text='Self HP >= 80%' />
        <FormSwitch name='e1TalentSpdBuff' text='E1 spd buff' disabled={e < 1} />
        <FormSlider name='e6UltExtraHits' text='E6 ult extra hits' min={0} max={2} disabled={e < 6} />
      </Flex>
    ),
    defaults: () => ({
      targetBurned: true,
      selfCurrentHp80Percent: true,
      e1TalentSpdBuff: true,
      e6UltExtraHits: 2,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.CR] += (r.selfCurrentHp80Percent) ? 0.15 : 0
      x[Stats.SPD_P] += (e >= 1 && r.e1TalentSpdBuff) ? 0.20 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.ULT_SCALING += (e >= 6) ? r.e6UltExtraHits * ultScaling * 0.40 : 0
      x.FUA_SCALING += fuaScaling
      x.DOT_SCALING += dotScaling

      // Boost
      x.SKILL_BOOST += (r.targetBurned) ? 0.20 : 0
      x.ELEMENTAL_DMG += (e >= 2 && request.enemyHpPercent <= 0.50) ? 0.15 : 0

      return x
    },
    calculateBaseMultis: (c, request) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]

      let hitMulti = hitMultiByTargets[request.enemyCount]
      let { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
    }
  }
}

function herta(e) {
  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 1.00, 1.10)
  let ultScaling = ult(e, 2.00, 2.16)
  let fuaScaling = talent(e, 0.40, 0.43)

  let hitMultiByTargets = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1),
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 1),
    5: ASHBLAZING_ATK_STACK * (3 * 1 / 1)
  }

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='techniqueBuff' text='Technique buff' />
        <FormSwitch name='targetFrozen' text='Target frozen' />
        <FormSlider name='e2TalentCritStacks' text='E2 talent crit stacks' min={0} max={5} disabled={e < 2} />
        <FormSwitch name='e6UltAtkBuff' text='E6 ult atk buff' disabled={e < 6} />
      </Flex>
    ),
    defaults: () => ({
      techniqueBuff: true,
      targetFrozen: true,
      e2TalentCritStacks: 5,
      e6UltAtkBuff: true,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.ATK_P] += (r.techniqueBuff) ? 0.40 : 0
      x[Stats.CR] += (e >= 2) ? r.e2TalentCritStacks * 0.03 : 0
      x[Stats.ATK_P] += (e >= 6 && r.e6UltAtkBuff) ? 0.25 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.BASIC_SCALING += (e >= 1 && request.enemyHpPercent <= 0.50) ? 0.40 : 0
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling

      x.SKILL_BOOST += (request.enemyHpPercent >= 0.50) ? 0.45 : 0

      // Boost
      x.ULT_BOOST += (r.targetFrozen) ? 0.20 : 0
      x.FUA_BOOST += (e >= 4) ? 0.10 : 0

      return x
    },
    calculateBaseMultis: (c, request) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]

      let hitMulti = hitMultiByTargets[request.enemyCount]
      let { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
    }
  }
}

function hanya(e) {
  let ultSpdBuffValue = ult(e, 0.20, 0.21)
  let ultAtkBuffValue = ult(e, 0.60, 0.648)
  let talentDmgBoostValue = talent(e, 0.30, 0.33)

  talentDmgBoostValue += (e >= 6) ? 0.10 : 0

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 2.40, 2.64)
  let ultScaling = ult(e, 0, 0)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='ultBuff' text='Ult buff active' />
        <FormSwitch name='targetBurdenActive' text='Target burden active' />
        <FormSwitch name='burdenAtkBuff' text='Burden atk buff' />
        <FormSwitch name='e2SkillSpdBuff' text='E2 skill spd buff' disabled={e < 2} />
      </Flex>
    ),
    defaults: () => ({
      ultBuff: true,
      targetBurdenActive: true,
      burdenAtkBuff: true,
      skillSpdBuff: true,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      x[Stats.ATK_P] += (r.ultBuff) ? ultAtkBuffValue : 0
      x[Stats.ATK_P] += (r.burdenAtkBuff) ? 0.10 : 0
      x[Stats.SPD_P] += (e >= 2 && r.e2SkillSpdBuff) ? 0.20 : 0

      // Boost
      x.ALL_DMG_MULTI = (r.targetBurdenActive) ? talentDmgBoostValue : 0

      return x
    },
    calculateBaseMultis: (c, request) => {
      let r = request.characterConditionals
      let x = c.x

      x[Stats.SPD] += (r.ultBuff) ? ultSpdBuffValue * x[Stats.SPD] : 0

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    }
  }
}

function guinaifen(e) {
  let talentDebuffDmgIncreaseValue = talent(e, 0.07, 0.076)
  let talentDebuffMax = (e >= 6) ? 4 : 3

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 1.20, 1.32)
  let ultScaling = ult(e, 1.20, 1.296)
  let dotScaling = skill(e, 2.182, 2.40)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSlider name='talentDebuffStacks' text='Talent debuff stacks' min={0} max={talentDebuffMax} />
        <FormSwitch name='enemyBurned' text='Enemy burned' />
        <FormSwitch name='e2BurnMultiBoost' text='E2 burn multi boost' disabled={e < 2} />
      </Flex>
    ),
    defaults: () => ({
      talentDebuffStacks: talentDebuffMax,
      enemyBurned: true,
      e2BurnMultiBoost: true,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += dotScaling
      x.DOT_SCALING += (e >= 2 && r.e2BurnMultiBoost) ? 0.40 : 0


      // Boost
      x.ELEMENTAL_DMG += (r.enemyBurned) ? 0.20 : 0
      x.DMG_TAKEN_MULTI += r.talentDebuffStacks * talentDebuffDmgIncreaseValue

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]
    }
  }
}

function gepard(e) {
  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 2.00, 2.20)
  let ultScaling = ult(e, 0, 0)

  return {
    display: () => (
      <Flex vertical gap={10} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: () => {
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.RES] += 0.20

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x[Stats.ATK] += 0.35 * x[Stats.DEF]

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
    }
  }
}

function fuxuan(e) {
  let skillCrBuffValue = skill(e, 0.12, 0.132)
  let skillHpBuffValue = skill(e, 0.06, 0.066)
  let talentDmgReductionValue = talent(e, 0.18, 0.196)

  let basicScaling = basic(e, 0.50, 0.55)
  let skillScaling = skill(e, 0, 0)
  let ultScaling = ult(e, 1.00, 1.08)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='skillActive' text='Skill active' />
        <FormSlider name='e6TeamHpLostPercent' text='E6 team hp lost' min={0} max={1.2} percent disabled={e < 6} />
      </Flex>
    ),
    defaults: () => ({
      skillActive: true,
      e6TeamHpLostPercent: 1.2,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.CD] += (e >= 1) ? 0.30 : 0
      x[Stats.CR] += (r.skillActive) ? skillCrBuffValue : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.DMG_RED_MULTI *= (1 - talentDmgReductionValue)

      return x
    },
    calculateBaseMultis: (c, request) => {
      let r = request.characterConditionals
      let x = c.x

      x[Stats.HP] += (r.skillActive) ? skillHpBuffValue * x[Stats.HP] : 0

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.HP]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.HP]
      x.ULT_DMG += (e >= 6) ? 2.00 * r.e6TeamHpLostPercent * x[Stats.HP] : 0
    }
  }
}
function danheng(e) {
  let extraPenValue = talent(e, 0.36, 0.396)

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 2.60, 2.86)
  let ultScaling = ult(e, 4.00, 4.32)
  let ultExtraScaling = ult(e, 1.20, 1.296)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='talentPenBuff' text='Talent pen buff' />
        <FormSwitch name='enemySlowed' text='Enemy slowed' />
      </Flex>
    ),
    defaults: () => ({
      talentPenBuff: true,
      enemySlowed: true,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.CR] += (e >= 1 && request.enemyHpPercent >= 0.50) ? 0.12 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.ULT_SCALING += (r.enemySlowed) ? ultExtraScaling : 0

      // Boost
      x.BASIC_BOOST += (r.enemySlowed) ? 0.40 : 0
      x.RES_PEN += (r.talentPenBuff) ? extraPenValue : 0

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    }
  }
}

function clara(e) {
  let ultDmgReductionValue = ult(e, 0.25, 0.27)
  let ultFuaExtraScaling = ult(e, 1.60, 1.728)

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 1.20, 1.32)
  let fuaScaling = talent(e, 1.60, 1.76)

  let hitMultiByTargetsBlast = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1),
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 1),
    5: ASHBLAZING_ATK_STACK * (2 * 1 / 1) // Clara is 1 hit blast when enhanced
  }

  let hitMultiSingle = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='ultBuff' text='Ult buff' />
        <FormSwitch name='talentEnemyMarked' text='Enemy marked' />
        <FormSwitch name='e2UltAtkBuff' text='E2 ult ATK buff' disabled={e < 2} />
        <FormSwitch name='e4DmgReductionBuff' text='E4 dmg reduction buff' disabled={e < 4} />
      </Flex>
    ),
    defaults: () => ({
      ultBuff: true,
      talentEnemyMarked: true,
      e2UltAtkBuff: true,
      e4DmgReductionBuff: true,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.ATK_P] += (e >= 2 && r.e2UltAtkBuff) ? 0.30 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      // x.SKILL_SCALING += r.talentEnemyMarked ?
      x.FUA_SCALING += fuaScaling
      x.FUA_SCALING += r.ultBuff ? ultFuaExtraScaling : 0

      // Boost
      x.DMG_RED_MULTI *= (1 - 0.10)
      x.DMG_RED_MULTI *= r.ultBuff ? (1 - ultDmgReductionValue) : 1
      x.DMG_RED_MULTI *= (e >= 4 && r.e4DmgReductionBuff) ? (1 - 0.30) : 1
      x.FUA_BOOST += 0.30

      return x
    },
    calculateBaseMultis: (c, request) => {
      let r = request.characterConditionals
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]

      // Calc ashblazing: ult buff -> blast, unbuffed -> single
      if (r.ultBuff) {
        let { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMultiByTargetsBlast[request.enemyCount])
        x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
      } else {
        let { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMultiSingle)
        x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
      }
    }
  }
}

function bronya(e) {
  let skillDmgBoostValue = skill(e, 0.66, 0.726)
  let ultAtkBoostValue = ult(e, 0.55, 0.594)
  let ultCdBoostValue = ult(e, 0.16, 0.168)
  let ultCdBoostBaseValue = ult(e, 0.20, 0.216)

  let basicScaling = basic(e, 1.0, 1.1)
  let fuaScaling = basicScaling * 0.80

  let hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='techniqueBuff' text='Technique buff' />
        <FormSwitch name='battleStartDefBuff' text='Battle start DEF buff' />
        <FormSwitch name='skillBuff' text='Skill buff' />
        <FormSwitch name='ultBuff' text='Ult buff' />
        <FormSwitch name='e2SkillSpdBuff' text='E2 skill SPD buff' disabled={e < 2} />
      </Flex>
    ),
    defaults: () => ({
      techniqueBuff: true,
      battleStartDefBuff: true,
      skillBuff: true,
      ultBuff: true,
      e2SkillSpdBuff: false,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.DEF_P] += (r.battleStartDefBuff) ? 0.20 : 0
      x[Stats.SPD_P] += (r.e2SkillSpdBuff) ? 0.30 : 0
      x[Stats.ATK_P] += (r.techniqueBuff) ? 0.15 : 0
      x[Stats.ATK_P] += (r.ultBuff) ? ultAtkBoostValue : 0
      x.BASIC_CR_BOOST += 1.00

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.FUA_SCALING += (e >= 4) ? fuaScaling : 0

      // Boost
      x.ELEMENTAL_DMG += 0.10
      x.ELEMENTAL_DMG += (r.skillBuff) ? skillDmgBoostValue : 0

      return x
    },
    calculateBaseMultis: (c, request) => {
      let r = request.characterConditionals
      let x = c.x

      // Order matters?
      x[Stats.CD] += (r.ultBuff) ? ultCdBoostValue * x[Stats.CD] : 0
      x[Stats.CD] += (r.ultBuff) ? ultCdBoostBaseValue : 0

      let { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
    }
  }
}

function blade(e) {
  let enhancedStateDmgBoost = skill(e, 0.40, 0.456)
  let hpPercentLostTotalMax = 0.90

  let basicScaling = basic(e, 1.0, 1.1)
  let basicEnhancedAtkScaling = skill(e, 0.40, 0.44)
  let basicEnhancedHpScaling = skill(e, 1.00, 1.10)
  let ultAtkScaling = ult(e, 0.40, 0.432)
  let ultHpScaling = ult(e, 1.00, 1.08)
  let ultLostHpScaling = ult(e, 1.00, 1.08)
  let fuaAtkScaling = talent(e, 0.44, 0.484)
  let fuaHpScaling = talent(e, 1.10, 1.21)

  let hitMultiByTargets = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.33 + 2 * 0.33 + 3 * 0.34),
    3: ASHBLAZING_ATK_STACK * (2 * 0.33 + 5 * 0.33 + 8 * 0.34),
    5: ASHBLAZING_ATK_STACK * (3 * 0.33 + 8 * 0.33 + 8 * 0.34),
  }

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='enhancedStateActive' text='Enhanced state' />
        <FormSlider name='hpPercentLostTotal' text='HP% lost total' min={0} max={hpPercentLostTotalMax} percent />
        <FormSlider name='e4MaxHpIncreaseStacks' text='E4 max HP stacks' min={0} max={2} disabled={e < 4} />
      </Flex>
    ),
    defaults: () => ({
      enhancedStateActive: true,
      hpPercentLostTotal: hpPercentLostTotalMax,
      e4MaxHpIncreaseStacks: 2,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.CR] += (e >= 2 && r.enhancedStateActive) ? 0.15 : 0
      x[Stats.HP_P] += (e >= 4) ? r.e4MaxHpIncreaseStacks * 0.20 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      // Rest of the scalings are calculated dynamically

      // Boost
      x.ELEMENTAL_DMG += r.enhancedStateActive ? enhancedStateDmgBoost : 0
      x.FUA_BOOST += 0.20

      return x
    },
    calculateBaseMultis: (c, request) => {
      let r = request.characterConditionals
      let x = c.x

      if (r.enhancedStateActive) {
        x.BASIC_DMG += basicEnhancedAtkScaling * x[Stats.ATK]
        x.BASIC_DMG += basicEnhancedHpScaling * x[Stats.HP]
      } else {
        x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      }

      x.ULT_DMG += ultAtkScaling * x[Stats.ATK]
      x.ULT_DMG += ultHpScaling * x[Stats.HP]
      x.ULT_DMG += ultLostHpScaling * r.hpPercentLostTotal * x[Stats.HP]
      x.ULT_DMG += (e >= 1 && request.enemyCount == 1) ? 1.50 * r.hpPercentLostTotal * x[Stats.HP] : 0

      let hitMulti = hitMultiByTargets[request.enemyCount]
      let { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)
      x.FUA_DMG += fuaAtkScaling * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)

      x.FUA_DMG += fuaHpScaling * x[Stats.HP]
      x.FUA_DMG += (e >= 6) ? 0.50 * x[Stats.HP] : 0
    }
  }
}

function bailu(e) {
  let basicScaling = basic(e, 1.0, 1.1)
  let skillScaling = skill(e, 0, 0)
  let ultScaling = ult(e, 0, 0)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='healingMaxHpBuff' text='Healing max HP buff' />
        <FormSwitch name='talentDmgReductionBuff' text='Talent dmg reduced' />
        <FormSwitch name='e2UltHealingBuff' text='E2 ult heal buff' disabled={e < 2} />
        <FormSlider name='e4SkillHealingDmgBuffStacks' text='E4 dmg buff stacks' min={0} max={3} disabled={e < 4} />
      </Flex>
    ),
    defaults: () => ({
      healingMaxHpBuff: true,
      talentDmgReductionBuff: true,
      e2UltHealingBuff: true,
      e4SkillHealingDmgBuffStacks: 0,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.HP_P] += (r.healingMaxHpBuff) ? 0.10 : 0
      x[Stats.OHB] += (e >= 2 && r.e2UltHealingBuff) ? 0.15 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.DMG_RED_MULTI *= (r.talentDmgReductionBuff) ? (1 - 0.10) : 1
      x.ALL_DMG_MULTI += (e >= 4) ? r.e4SkillHealingDmgBuffStacks * 0.10 : 0

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += 0
      x.ULT_DMG += 0
      x.FUA_DMG += 0
    }
  }
}

function asta(e) {
  let ultSpdBuffValue = ult(e, 50, 52.8)
  let talentStacksAtkBuff = talent(e, 0.14, 0.154)
  let talentStacksDefBuff = 0.06
  let skillExtraDmgHitsMax = (e >= 1) ? 5 : 4

  let basicScaling = basic(e, 1.0, 1.1)
  let skillScaling = skill(e, 0.50, 0.55)
  let ultScaling = ult(e, 0, 0)
  let dotScaling = basic(e, 0.50, 0.55)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSlider name='skillExtraDmgHits' text='Skill extra hits' min={0} max={skillExtraDmgHitsMax} />
        <FormSlider name='talentBuffStacks' text='Talent ATK buff stacks' min={0} max={5} />
        <FormSwitch name='ultSpdBuff' text='Ult SPD buff active' />
      </Flex>
    ),
    defaults: () => ({
      talentBuffStacks: 5,
      skillExtraDmgHits: skillExtraDmgHitsMax,
      ultSpdBuff: true
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.ATK_P] += (r.talentBuffStacks) * talentStacksAtkBuff
      x[Stats.DEF_P] += (r.talentBuffStacks) * talentStacksDefBuff
      x[Stats.ERR] += (e >= 4 && r.talentBuffStacks >= 2) ? 0.15 : 0
      x[Stats.SPD] += (r.ultSpdBuff) ? ultSpdBuffValue : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += dotScaling

      // Boost
      x.ELEMENTAL_DMG += 0.18

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += 0
      x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]
    }
  }
}

function arlan(e) {
  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 2.40, 2.64)
  let ultScaling = ult(e, 3.20, 3.456)

  let talentMissingHpDmgBoostMax = talent(e, 0.72, 0.792)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSlider name='selfCurrentHpPercent' text='Self current HP%' min={0.01} max={1.0} percent />
      </Flex>
    ),
    defaults: () => ({
      selfCurrentHpPercent: 1.00,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x.ELEMENTAL_DMG += Math.min(talentMissingHpDmgBoostMax, 1 - r.selfCurrentHpPercent)

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.SKILL_BOOST += (e >= 1 && r.selfCurrentHpPercent <= 0.50) ? 0.10 : 0
      x.ULT_BOOST += (e >= 6 && r.selfCurrentHpPercent <= 0.50) ? 0.20 : 0

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.FUA_DMG += 0
    }
  }
}

function argenti(e) {
  let talentMaxStacks = (e >= 4) ? 12 : 10

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 1.20, 1.32)
  let ultScaling = ult(e, 1.60, 1.728)
  let ultEnhancedScaling = ult(e, 2.80, 3.024)
  let ultEnhancedExtraHitScaling = ult(e, 0.95, 1.026)
  let talentCrStackValue = talent(e, 0.025, 0.028)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='ultEnhanced' text='Enhanced ult' />
        <FormSlider name='talentStacks' text='Talent stacks' min={0} max={talentMaxStacks} />
        <FormSlider name='ultEnhancedExtraHits' text='Ult extra hits' min={0} max={6} />
        <FormSwitch name='e2UltAtkBuff' text='E2 ult ATK buff' disabled={e < 2} />
      </Flex>
    ),
    defaults: () => ({
      ultEnhanced: true,
      talentStacks: talentMaxStacks,
      ultEnhancedExtraHits: 6,
      e2UltAtkBuff: true
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Skills
      x[Stats.CR] += (r.talentStacks) * talentCrStackValue

      // Traces

      // Eidolons
      x[Stats.CD] += (e >= 1) ? (r.talentStacks) * 0.04 : 0
      x[Stats.ATK_P] += (e >= 2 && r.e2UltAtkBuff) ? 0.40 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += (r.ultEnhanced) ? ultEnhancedScaling : ultScaling
      x.ULT_SCALING += (r.ultEnhancedExtraHits) * ultEnhancedExtraHitScaling

      // BOOST
      x.ULT_BOOST += (request.enemyHpPercent <= 0.5) ? 0.15 : 0
      x.ULT_DEF_PEN += (e >= 6) ? 0.30 : 0

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.FUA_DMG += 0
    }
  }
}

function jingliu(e) {
  let talentCrBuff = talent(e, 0.50, 0.52)
  let talentHpDrainAtkBuffMax = talent(e, 1.80, 1.98)
  talentHpDrainAtkBuffMax += (e >= 4) ? 0.30 : 0

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 2.00, 2.20)
  let skillEnhancedScaling = skill(e, 2.50, 2.75)
  let ultScaling = ult(e, 3.00, 3.24)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='talentEnhancedState' text='Enhanced state' />
        <FormSlider name='talentHpDrainAtkBuff' text='HP drain ATK buff' min={0} max={talentHpDrainAtkBuffMax} percent />
        <FormSwitch name='e1CdBuff' text='E1 ult active' disabled={e < 1} />
        <FormSwitch name='e2SkillDmgBuff' text='E2 skill buff' disabled={e < 2} />
      </Flex>
    ),
    defaults: () => ({
      talentEnhancedState: true,
      talentHpDrainAtkBuff: talentHpDrainAtkBuffMax,
      e1CdBuff: true,
      e2SkillDmgBuff: true,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Skills
      x[Stats.CR] += (r.talentEnhancedState) ? talentCrBuff : 0
      x[Stats.ATK_P] += (r.talentEnhancedState) ? r.talentHpDrainAtkBuff : 0

      // Traces
      x[Stats.RES] += (r.talentEnhancedState) ? 0.35 : 0
      x.ULT_BOOST += (r.talentEnhancedState) ? 0.20 : 0

      // Eidolons
      x[Stats.CD] += (e >= 1 && r.e1CdBuff) ? 0.24 : 0
      x[Stats.CD] += (e >= 6 && r.talentEnhancedState) ? 0.50 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling

      x.SKILL_SCALING += (r.talentEnhancedState) ? skillEnhancedScaling : skillScaling
      x.SKILL_SCALING += (e >= 1 && r.talentEnhancedState && request.enemyCount == 1) ? 1 : 0

      x.ULT_SCALING += ultScaling
      x.ULT_SCALING += (e >= 1 && request.enemyCount == 1) ? 1 : 0

      x.FUA_SCALING += 0

      // BOOST
      x.SKILL_BOOST += (e >= 2 && r.talentEnhancedState && r.e2SkillDmgBuff) ? 0.80 : 0

      return x
    },
    calculateBaseMultis: (c) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.FUA_DMG += 0
    }
  }
}

function skill(e, value1, value2) {
  return e >= 3 ? value2 : value1
}

let talent = skill

function ult(e, value1, value2) {
  return e >= 5 ? value2 : value1
}
let basic = ult

function p4(set) {
  return set >> 2
}

export const CharacterConditionals = {
  get: (request) => {
    let characterFn = characterOptionMapping[request.characterId]
    return characterFn(request.characterEidolon)
  },
  getDisplayForCharacter: (id, eidolon) => {
    // console.log('getDisplayForCharacter', id)
    if (!id || !characterOptionMapping[id]) {
      return (
        <Flex justify='space-between' align='center'>
          <HeaderText>Character passives</HeaderText>
          <TooltipImage type={Hint.characterPassives()} />
        </Flex>
      )
    }

    let characterFn = characterOptionMapping[id]
    let display = characterFn(eidolon).display()

    return (
      <ConfigProvider
        theme={{
          token: {
            opacityLoading: 0.15
          }
        }}
      >
        <Flex vertical gap={5}>
          <Flex justify='space-between' align='center'>
            <HeaderText>Character passives</HeaderText>
            <TooltipImage type={Hint.characterPassives()} />
          </Flex>
          {display}
        </Flex>
      </ConfigProvider>
    )
  },
}