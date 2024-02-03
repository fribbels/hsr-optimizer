/* eslint-disable no-unused-vars  */

import React from "react";
import { Flex, Typography } from "antd";
import { HeaderText } from "components/HeaderText";
import { FormSlider, FormSwitch } from "components/optimizerTab/FormConditionalInputs";
import { TooltipImage } from "components/TooltipImage";
import { Constants } from 'lib/constants.ts'
import { Hint } from "lib/hint";

import AnInstantBeforeAGaze from "lib/conditionals/lightcone/5star/AnInstantBeforeAGaze";
import BaptismOfPureThought from 'lib/conditionals/lightcone/5star/BaptismOfPureThought';
import BeforeDawn from "./conditionals/lightcone/5star/BeforeDawn";
import BrighterThanTheSun from "lib/conditionals/lightcone/5star/BrighterThanTheSun";
import ButTheBattleIsntOver from "./conditionals/lightcone/5star/ButTheBattleIsntOver";
import CruisingInTheStellarSea from "lib/conditionals/lightcone/5star/CruisingInTheStellarSea";
import EchoesOfTheCoffin from "./conditionals/lightcone/5star/EchoesOfTheCoffin";
import IncessantRain from "./conditionals/lightcone/5star/IncessantRain";
import InTheNameOfTheWorld from "./conditionals/lightcone/5star/InTheNameOfTheWorld";
import InTheNight from "./conditionals/lightcone/5star/InTheNight";
import IShallBeMyOwnSword  from 'lib/conditionals/lightcone/5star/IShallBeMyOwnSword';
import MomentOfVictory from "./conditionals/lightcone/5star/MomentOfVictory";
import NightOfFright from "lib/conditionals/lightcone/5star/NightOfFright";
import NightOnTheMilkyWay from "./conditionals/lightcone/5star/NightOnTheMilkyWay";
import OnTheFallOfAnAeon from "lib/conditionals/lightcone/5star/OnTheFallOfAnAeon";
import PastSelfInTheMirror from "lib/conditionals/lightcone/5star/PastSelfInTheMirror";
import PatienceIsAllYouNeed from "./conditionals/lightcone/5star/PatienceIsAllYouNeed";
import SheAlreadyShutHerEyes from "./conditionals/lightcone/5star/SheAlreadyShutHerEyes";
import SleepLikeTheDead from "lib/conditionals/lightcone/5star/SleepLikeTheDead";
import SolitaryHealing from "lib/conditionals/lightcone/5star/SolitaryHealing";
import SomethingIrreplaceable from "./conditionals/lightcone/5star/SomethingIrreplaceable";
import TextureOfMemories from "lib/conditionals/lightcone/5star/TextureOfMemories";
import TheUnreachableSide from "lib/conditionals/lightcone/5star/TheUnreachableSide";
import TimeWaitsForNoOne from "lib/conditionals/lightcone/5star/TimeWaitsForNoOne";
import WorrisomeBlissful from "lib/conditionals/lightcone/5star/WorrisomeBlissful";

const Stats = Constants.Stats

const defaultGap = 5;

const lightConeOptionMapping = {
  20000: Arrows,
  20001: Cornucopia,
  20002: CollapsingSky,
  20003: Amber,
  20004: Void,
  20005: Chorus,
  20006: DataBank,
  20007: DartingArrow,
  20008: FineFruit,
  20009: ShatteredHome,
  20010: Defense,
  20011: Loop,
  20012: MeshingCogs,
  20013: Passkey,
  20014: Adversarial,
  20015: Multiplication,
  20016: MutualDemise,
  20017: Pioneering,
  20018: HiddenShadow,
  20019: Mediation,
  20020: Sagacity,
  21000: PostOpConversation,
  21001: GoodNightAndSleepWell,
  21002: DayOneOfMyNewLife,
  21003: OnlySilenceRemains,
  21004: MemoriesOfThePast,
  21005: TheMolesWelcomeYou,
  21006: TheBirthOfTheSelf,
  21007: SharedFeeling,
  21008: EyesOfThePrey,
  21009: LandausChoice,
  21010: Swordplay,
  21011: PlanetaryRendezvous,
  21012: ASecretVow,
  21013: MakeTheWorldClamor,
  21014: PerfectTiming, // Does the ohb apply after passives?
  21015: ResolutionShinesAsPearlsOfSweat,
  21016: TrendOfTheUniversalMarket, // Revisit dot
  21017: SubscribeForMore,
  21018: DanceDanceDance,
  21019: UnderTheBlueSky,
  21020: GeniusesRepose,
  21021: QuidProQuo,
  21022: Fermata,
  21023: WeAreWildfire,
  21024: RiverFlowsInSpring,
  21025: PastAndFuture,
  21026: WoofWalkTime,
  21027: TheSeriousnessOfBreakfast,
  21028: WarmthShortensColdNights,
  21029: WeWillMeetAgain, // Does this get affected by crit / dmg boosts?
  21030: ThisIsMe, // Def scaling dmg not implemented
  21031: ReturnToDarkness,
  21032: CarveTheMoonWeaveTheClouds,
  21033: NowhereToRun,
  21034: TodayIsAnotherPeacefulDay,
  22000: BeforeTheTutorialMissionStarts,
  22001: HeyOverHere,
  23000: NightOnTheMilkyWay,
  23001: InTheNight,
  23002: SomethingIrreplaceable,
  23003: ButTheBattleIsntOver,
  23004: InTheNameOfTheWorld, // Skill atk buff not implemented
  23005: MomentOfVictory,
  23006: PatienceIsAllYouNeed, // Revisit dot
  23007: IncessantRain,
  23008: EchoesOfTheCoffin,
  23009: TheUnreachableSide,
  23010: BeforeDawn,
  23011: SheAlreadyShutHerEyes,
  23012: SleepLikeTheDead,
  23013: TimeWaitsForNoOne,
  23014: IShallBeMyOwnSword,
  23015: BrighterThanTheSun,
  23016: WorrisomeBlissful,
  23017: NightOfFright,
  23018: AnInstantBeforeAGaze,
  23019: PastSelfInTheMirror,
  23020: BaptismOfPureThought,
  24000: OnTheFallOfAnAeon,
  24001: CruisingInTheStellarSea,
  24002: TextureOfMemories,
  24003: SolitaryHealing,
  23021: EarthlyEscapade,
  23022: ReforgedRemembrance,
}









function HeyOverHere(s) {
  const sValues = [0.16, 0.19, 0.22, 0.25, 0.28]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='postSkillHealBuff' text='Post skill heal buff' lc />
      </Flex>
    ),
    defaults: () => ({
      postSkillHealBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.OHB] += (r.postSkillHealBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function BeforeTheTutorialMissionStarts(/* s */) {
  // const sValues = [0, 0, 0, 0, 0]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (/* x, request */) => {
      // let r = request.lightConeConditionals
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function TodayIsAnotherPeacefulDay(s) {
  const sValues = [0.002, 0.0025, 0.003, 0.0035, 0.004]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSlider name='maxEnergyStacks' text='Max energy' min={0} max={160} lc />
      </Flex>
    ),
    defaults: () => ({
      maxEnergyStacks: 160,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += r.maxEnergyStacks * sValues[s]
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function NowhereToRun(/* s */) {
  // const sValues = [0, 0, 0, 0, 0]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (/* x, request */) => {
      // let r = request.lightConeConditionals
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function CarveTheMoonWeaveTheClouds(s) {
  let sValuesAtk = [0.10, 0.125, 0.15, 0.175, 0.20]
  let sValuesCd = [0.12, 0.15, 0.18, 0.21, 0.24]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='atkBuffActive' text='Atk buff active' lc />
        <FormSwitch name='cdBuffActive' text='Cd buff active' lc />
      </Flex>
    ),
    defaults: () => ({
      atkBuffActive: true,
      cdBuffActive: false,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.ATK_P] += (r.atkBuffActive) ? sValuesAtk[s] : 0
      x[Stats.CD] += (r.cdBuffActive) ? sValuesCd[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function ReturnToDarkness(/* s */) {
  // const sValues = [0, 0, 0, 0, 0]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (/* x, request */) => {
      //  let r = request.lightConeConditionals
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function ThisIsMe(/* s */) {
  // const sValues = [0.60, 0.75, 0.90, 1.05, 1.20]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='defScalingUltDmg' text='Def scaling ult dmg (not implemented)' lc />
      </Flex>
    ),
    defaults: () => ({
      defScalingUltDmg: false,
    }),
    precomputeEffects: (/* x, request */) => {
      //  let r = request.lightConeConditionals
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (c, request) => {
      console.warn('not implemented', c, request)
      // let r = request.lightConeConditionals
      // let x = c.x

      // x.ULT_DEF_SCALING += (r.defScalingUltDmg) ? sValues[s] : 0
    }
  }
}

function WeWillMeetAgain(s) {
  const sValues = [0.48, 0.60, 0.72, 0.84, 0.96]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='extraDmgProc' text='Additional dmg proc' lc />
      </Flex>
    ),
    defaults: () => ({
      extraDmgProc: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.BASIC_SCALING += (r.extraDmgProc) ? sValues[s] : 0
      x.SKILL_SCALING += (r.extraDmgProc) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function WarmthShortensColdNights(/* s */) {
  // const sValues = [0, 0, 0, 0, 0]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (/* x, request */) => {
      //  let r = request.lightConeConditionals
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function TheSeriousnessOfBreakfast(s) {
  let sValuesDmgBoost = [0.12, 0.15, 0.18, 0.21, 0.24]
  let sValuesStacks = [0.04, 0.05, 0.06, 0.07, 0.08]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='dmgBoost' text='Dmg boost' lc />
        <FormSlider name='defeatedEnemyAtkStacks' text='Defeated enemy atk stacks' min={0} max={3} lc />
      </Flex>
    ),
    defaults: () => ({
      dmgBoost: true,
      defeatedEnemyAtkStacks: 3,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.ATK_P] += r.defeatedEnemyAtkStacks * sValuesStacks[s]
      x.ELEMENTAL_DMG += (r.dmgBoost) ? sValuesDmgBoost[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function WoofWalkTime(s) {
  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='enemyBurnedBleeding' text='Enemy burned / bleeding' lc />
      </Flex>
    ),
    defaults: () => ({
      enemyBurnedBleeding: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.enemyBurnedBleeding) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function PastAndFuture(/* s */) {
  // const sValues = [0, 0, 0, 0, 0]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (/* x, request */) => {
      //  let r = request.lightConeConditionals
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function RiverFlowsInSpring(s) {
  let sValuesSpd = [0.08, 0.09, 0.10, 0.11, 0.12]
  let sValuesDmg = [0.12, 0.15, 0.18, 0.21, 0.24]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='spdDmgBuff' text='Spd / dmg buff active' lc />
      </Flex>
    ),
    defaults: () => ({
      spdDmgBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.SPD_P] += (r.spdDmgBuff) ? sValuesSpd[s] : 0
      x.ELEMENTAL_DMG += (r.spdDmgBuff) ? sValuesDmg[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function WeAreWildfire(s) {
  const sValues = [0.08, 0.10, 0.12, 0.14, 0.16]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='initialDmgReductionBuff' text='Initial dmg reduction buff' lc />
      </Flex>
    ),
    defaults: () => ({
      initialDmgReductionBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.DMG_RED_MULTI += (r.initialDmgReductionBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function Fermata(s) {
  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32];

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='enemyShockWindShear' text='Enemy shocked / wind sheared' lc />
      </Flex>
    ),
    defaults: () => ({
      enemyShockWindShear: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.enemyShockWindShear) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function QuidProQuo(/* s */) {
  // const sValues = [0, 0, 0, 0, 0]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (/* x, request */) => {
      //  let r = request.lightConeConditionals
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function GeniusesRepose(s) {
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='defeatedEnemyCdBuff' text='Defeated enemy cd buff' lc />
      </Flex>
    ),
    defaults: () => ({
      defeatedEnemyCdBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.CD] += (r.defeatedEnemyCdBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function UnderTheBlueSky(s) {
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='defeatedEnemyCrBuff' text='Defeated enemy cr buff' lc />
      </Flex>
    ),
    defaults: () => ({
      defeatedEnemyCrBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.CR] += (r.defeatedEnemyCrBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function DanceDanceDance(/* s */) {
  // const sValues = [0, 0, 0, 0, 0]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (/* x, request */) => {
      //  let r = request.lightConeConditionals
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function SubscribeForMore(s) {
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='maxEnergyDmgBoost' text='Max energy dmg boost' lc />
      </Flex>
    ),
    defaults: () => ({
      maxEnergyDmgBoost: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.BASIC_BOOST += sValues[s]
      x.SKILL_BOOST += sValues[s]
      x.BASIC_BOOST += (r.maxEnergyDmgBoost) ? sValues[s] : 0
      x.SKILL_BOOST += (r.maxEnergyDmgBoost) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function TrendOfTheUniversalMarket(/* s */) {
  // const sValues = [0, 0, 0, 0, 0]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (/* x, request */) => {
      //  let r = request.lightConeConditionals
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function ResolutionShinesAsPearlsOfSweat(s) {
  const sValues = [0.12, 0.13, 0.14, 0.15, 0.16]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='targetEnsnared' text='Target ensnared' lc />
      </Flex>
    ),
    defaults: () => ({
      targetEnsnared: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.DEF_SHRED += (r.targetEnsnared) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function PerfectTiming(s) {
  const sValues = [0.33, 0.36, 0.39, 0.42, 0.45]
  let sMaxValues = [0.15, 0.18, 0.21, 0.24, 0.27]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='resToHealingBoost' text='Res to healing boost' lc />
      </Flex>
    ),
    defaults: () => ({
      resToHealingBoost: true,
    }),
    precomputeEffects: (/* x, request */) => {
      //  let r = request.lightConeConditionals
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (c, request) => {
      let r = request.lightConeConditionals
      let x = c.x

      let boost = Math.min(sMaxValues[s], sValues[s] * x[Stats.RES])
      x[Stats.OHB] += (r.resToHealingBoost) ? boost : 0
    }
  }
}

function MakeTheWorldClamor(s) {
  const sValues = [0.32, 0.40, 0.48, 0.56, 0.64]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='ultDmgBuff' text='Ult dmg buff' lc />
      </Flex>
    ),
    defaults: () => ({
      ultDmgBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ULT_BOOST += (r.ultDmgBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function ASecretVow(s) {
  const sValues = [0.20, 0.25, 0.30, 0.35, 0.40]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='enemyHpHigherDmgBoost' text='Enemy HP % higher dmg boost' lc />
      </Flex>
    ),
    defaults: () => ({
      enemyHpHigherDmgBoost: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += sValues[s]
      x.ELEMENTAL_DMG += (r.enemyHpHigherDmgBoost) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function PlanetaryRendezvous(s) {
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='alliesSameElement' text='Allies same element dmg boost' lc />
      </Flex>
    ),
    defaults: () => ({
      alliesSameElement: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.alliesSameElement) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function Swordplay(s) {
  const sValues = [0.08, 0.10, 0.12, 0.14, 0.16]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSlider name='sameTargetHitStacks' text='Same target hit stacks' min={0} max={5} lc />
      </Flex>
    ),
    defaults: () => ({
      sameTargetHitStacks: 5,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.sameTargetHitStacks) * sValues[s]
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function LandausChoice(s) {
  const sValues = [0.16, 0.18, 0.20, 0.22, 0.24]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (x, /* request */) => {
      // let r = request.lightConeConditionals

      x.DMG_RED_MULTI += sValues[s]
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function EyesOfThePrey(s) {
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (x, /* request */) => {
      // let r = request.lightConeConditionals

      x.DOT_BOOST += sValues[s]
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function SharedFeeling(s) {
  const sValues = [0.10, 0.125, 0.15, 0.175, 0.20]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (x, /* request */) => {
      // let r = request.lightConeConditionals

      x[Stats.OHB] += sValues[s]
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function TheBirthOfTheSelf(s) {
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='enemyHp50FuaBuff' text='Enemy HP < 50% fua buff' lc />
      </Flex>
    ),
    defaults: () => ({
      enemyHp50FuaBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.xxxxxxxxxxxxxxxxxxxxx] += (r.name) ? sValues[s] : 0
      x.FUA_BOOST += sValues[s]
      x.FUA_BOOST += (r.enemyHp50FuaBuff && request.enemyHpPercent < 0.50) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function TheMolesWelcomeYou(s) {
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSlider name='atkBuffStacks' text='Atk buff stacks' min={0} max={3} lc />
      </Flex>
    ),
    defaults: () => ({
      atkBuffStacks: 3,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.ATK_P] += (r.atkBuffStacks) * sValues[s]
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function MemoriesOfThePast() {
  // const sValues = [0, 0, 0, 0, 0]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (/* x, request */) => {
      //  let r = request.lightConeConditionals
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function OnlySilenceRemains(s) {
  let sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='enemies2CrBuff' text='<= 2 enemies cr buff' lc />
      </Flex>
    ),
    defaults: () => ({
      enemies2CrBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.CR] += (r.enemies2CrBuff && request.enemyCount <= 2) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function DayOneOfMyNewLife(s) {
  const sValues = [0.16, 0.18, 0.20, 0.22, 0.24]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='dmgResBuff' text='Dmg RES buff' lc />
      </Flex>
    ),
    defaults: () => ({
      dmgResBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.DMG_RED_MULTI += (r.dmgResBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function GoodNightAndSleepWell(s) {
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSlider name='debuffStacksDmgIncrease' text='Debuff stacks dmg increase' min={0} max={3} lc />
      </Flex>
    ),
    defaults: () => ({
      debuffStacksDmgIncrease: 3,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += r.debuffStacksDmgIncrease * sValues[s]
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function PostOpConversation(s) {
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='postUltHealingBoost' text='Post ult healing boost' lc />
      </Flex>
    ),
    defaults: () => ({
      postUltHealingBoost: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.OHB] += (r.postUltHealingBoost) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function Sagacity(s) {
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='postUltAtkBuff' text='Post ult atk buff' lc />
      </Flex>
    ),
    defaults: () => ({
      postUltAtkBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.ATK_P] += (r.postUltAtkBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function Mediation(s) {
  const sValues = [12, 14, 16, 18, 20]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='initialSpdBuff' text='Initial spd buff' lc />
      </Flex>
    ),
    defaults: () => ({
      initialSpdBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.SPD] += (r.initialSpdBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function HiddenShadow(s) {
  const sValues = [0.60, 0.75, 0.90, 1.05, 1.20]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='basicAtkBuff' text='Basic atk buff' lc />
      </Flex>
    ),
    defaults: () => ({
      basicAtkBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.BASIC_BOOST += (r.basicAtkBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function Pioneering() {
  // const sValues = [0, 0, 0, 0, 0]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (/* x, request */) => {
      //  let r = request.lightConeConditionals
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function MutualDemise(s) {
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='selfHp80CrBuff' text='Self HP <80% cr buff' lc />
      </Flex>
    ),
    defaults: () => ({
      selfHp80CrBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.CR] += (r.selfHp80CrBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function Multiplication() {
  // const sValues = [0, 0, 0, 0, 0]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (/* x, request */) => {
      //  let r = request.lightConeConditionals
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function Adversarial(s) {
  const sValues = [0.10, 0.12, 0.14, 0.16, 0.18]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='defeatedEnemySpdBuff' text='Defeated enemy spd buff' lc />
      </Flex>
    ),
    defaults: () => ({
      defeatedEnemySpdBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.SPD_P] += (r.defeatedEnemySpdBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function Passkey() {
  // const sValues = [0, 0, 0, 0, 0]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (/* x, request */) => {
      //  let r = request.lightConeConditionals
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function MeshingCogs() {
  // const sValues = [0, 0, 0, 0, 0]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (/* x, request */) => {
      //  let r = request.lightConeConditionals
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function Loop(s) {
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='enemySlowedDmgBuff' text='Enemy slowed dmg buff' lc />
      </Flex>
    ),
    defaults: () => ({
      enemySlowedDmgBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.enemySlowedDmgBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function Defense() {
  // const sValues = [0, 0, 0, 0, 0]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (/* x, request */) => {
      // let r = request.lightConeConditionals
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function ShatteredHome(s) {
  const sValues = [0.20, 0.25, 0.30, 0.35, 0.40]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='enemyHp50Buff' text='Enemy HP >50% dmg buff' lc />
      </Flex>
    ),
    defaults: () => ({
      enemyHp50Buff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.enemyHp50Buff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function FineFruit() {
  // const sValues = [0, 0, 0, 0, 0]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
      name: true,
    }),
    precomputeEffects: (x, request) => { console.warn('not implemented', x, request) },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function DartingArrow(s) {
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='defeatedEnemyAtkBuff' text='Atk buff on kill' lc />
      </Flex>
    ),
    defaults: () => ({
      defeatedEnemyAtkBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.ATK_P] += (r.defeatedEnemyAtkBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function DataBank(s) {
  const sValues = [0.28, 0.35, 0.42, 0.49, 0.56]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='ultDmgBuff' text='Ult dmg buff' lc />
      </Flex>
    ),
    defaults: () => ({
      ultDmgBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ULT_BOOST += (r.ultDmgBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function Chorus(s) {
  const sValues = [0.08, 0.09, 0.10, 0.11, 0.12]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='inBattleAtkBuff' text='In battle atk buff' lc />
      </Flex>
    ),
    defaults: () => ({
      inBattleAtkBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.ATK_P] += (r.inBattleAtkBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function Void(s) {
  const sValues = [0.20, 0.25, 0, 30, 0.35, 0.40]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='initialEhrBuff' text='Initial EHR buff' lc />
      </Flex>
    ),
    defaults: () => ({
      initialEhrBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.EHR] += (r.initialEhrBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}


function Amber(s) {
  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='hp50DefBuff' text='HP <50% def buff' lc />
      </Flex>
    ),
    defaults: () => ({
      hp50DefBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.DEF_P] += (r.hp50DefBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function CollapsingSky(s) {
  const sValues = [0.20, 0.25, 0.30, 0.35, 0.40]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='basicSkillDmgBuff' text='Basic/Skill dmg buff' lc />
      </Flex>
    ),
    defaults: () => ({
      basicSkillDmgBuff: true
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.BASIC_BOOST += (r.basicSkillDmgBuff) ? sValues[s] : 0
      x.SKILL_BOOST += (r.basicSkillDmgBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function Cornucopia(s) {
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='healingBuff' text='Healing buff' lc />
      </Flex>
    ),
    defaults: () => ({
      healingBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.OHB] += (r.healingBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function Arrows(s) {
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='critBuff' text='Initial crit buff' lc />
      </Flex>
    ),
    defaults: () => ({
      critBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.CR] += (r.critBuff) ? sValues[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function ReforgedRemembrance(s) {
  let sValuesAtk = [0.05, 0.06, 0.07, 0.08, 0.09]
  let sValuesDotPen = [0.072, 0.079, 0.086, 0.093, 0.10]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSlider name='prophetStacks' text='Prophet stacks' min={0} max={4} lc />
      </Flex>
    ),
    defaults: () => ({
      prophetStacks: 4,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.ATK_P] += r.prophetStacks * sValuesAtk[s]
      x.DOT_DEF_PEN += r.prophetStacks * sValuesDotPen[s]
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}

function EarthlyEscapade(s) {
  const sValuesCr = [0.10, 0.11, 0.12, 0.13, 0.14]
  const sValuesCd = [0.28, 0.35, 0.42, 0.49, 0.56]

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='maskActive' text='Mask active' lc />
      </Flex>
    ),
    defaults: () => ({
      maskActive: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.CR] += (r.maskActive) ? sValuesCr[s] : 0
      x[Stats.CD] += (r.maskActive) ? sValuesCd[s] : 0
    },
    calculatePassives: (/*c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { }
  }
}






export const LightConeConditionals = {
  get: (request) => {
    let lcFn = lightConeOptionMapping[request.lightCone];
    
    if (!lcFn) {
      return {
        display: () => (
          <Flex vertical gap={5}>
            <HeaderText>Light cone passives</HeaderText>
          </Flex>
        ),
        defaults: () => ({})
      }
    }
    return lcFn(request.lightConeSuperimposition - 1)
  },
  getDisplayLightConePassives: (id, superimposition) => {
    if (!id || !lightConeOptionMapping[id]) {
      return (
        <Flex vertical gap={5}>
          <Flex justify='space-between' align='center'>
            <HeaderText>Light cone passives</HeaderText>
            <TooltipImage type={Hint.lightConePassives()} lc />
          </Flex>
          <Typography.Text italic>Select a Light cone to view passives</Typography.Text>
        </Flex>
      )
    }

    let lcFn = lightConeOptionMapping[id];
    let display = lcFn(superimposition - 1).display();

    return (
      <Flex vertical gap={5}>
        <Flex justify='space-between' align='center'>
          <HeaderText>Light cone passives</HeaderText>
          <TooltipImage type={Hint.lightConePassives()} lc />
        </Flex>
        {display}
      </Flex>
    )
  },
}