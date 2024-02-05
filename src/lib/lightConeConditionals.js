/* eslint-disable no-unused-vars  */

import React from 'react';
import { Flex, Typography } from 'antd';
import { HeaderText } from 'components/HeaderText';
import { FormSlider, FormSwitch } from 'components/optimizerTab/FormConditionalInputs';
import { TooltipImage } from 'components/TooltipImage';
import { Constants } from 'lib/constants.ts'
import { Hint } from 'lib/hint';

import AnInstantBeforeAGaze from 'lib/conditionals/lightcone/5star/AnInstantBeforeAGaze';
import ASecretVow from 'lib/conditionals/lightcone/4star/ASecretVow';
import BaptismOfPureThought from 'lib/conditionals/lightcone/5star/BaptismOfPureThought';
import BeforeDawn from 'lib/conditionals/lightcone/5star/BeforeDawn';
import BeforeTheTutorialMissionStarts from 'lib/conditionals/lightcone/4star/BeforeTheTutorialMissionStarts';
import BrighterThanTheSun from 'lib/conditionals/lightcone/5star/BrighterThanTheSun';
import ButTheBattleIsntOver from 'lib/conditionals/lightcone/5star/ButTheBattleIsntOver';
import CarveTheMoonWeaveTheClouds from 'lib/conditionals/lightcone/4star/CarveTheMoonWeaveTheClouds';
import CruisingInTheStellarSea from 'lib/conditionals/lightcone/5star/CruisingInTheStellarSea';
import DanceDanceDance from 'lib/conditionals/lightcone/4star/DanceDanceDance';
import DayOneOfMyNewLife from 'lib/conditionals/lightcone/4star/DayOneOfMyNewLife';
import EchoesOfTheCoffin from 'lib/conditionals/lightcone/5star/EchoesOfTheCoffin';
import EyesOfThePrey from 'lib/conditionals/lightcone/4star/EyesOfThePrey';
import Fermata from 'lib/conditionals/lightcone/4star/Fermata';
import GeniusesRepose from 'lib/conditionals/lightcone/4star/GeniusesRepose';
import GoodNightAndSleepWell from 'lib/conditionals/lightcone/4star/GoodNightAndSleepWell';
import HeyOverHere from 'lib/conditionals/lightcone/4star/HeyOverHere';
import IncessantRain from 'lib/conditionals/lightcone/5star/IncessantRain';
import InTheNameOfTheWorld from 'lib/conditionals/lightcone/5star/InTheNameOfTheWorld';
import InTheNight from 'lib/conditionals/lightcone/5star/InTheNight';
import IShallBeMyOwnSword  from 'lib/conditionals/lightcone/5star/IShallBeMyOwnSword';
import LandausChoice from 'lib/conditionals/lightcone/4star/LandausChoice';
import MakeTheWorldClamor from 'lib/conditionals/lightcone/4star/MakeTheWorldClamor';
import MemoriesOfThePast from 'lib/conditionals/lightcone/4star/MemoriesOfThePast';
import MomentOfVictory from 'lib/conditionals/lightcone/5star/MomentOfVictory';
import NightOfFright from 'lib/conditionals/lightcone/5star/NightOfFright';
import NightOnTheMilkyWay from 'lib/conditionals/lightcone/5star/NightOnTheMilkyWay';
import NowhereToRun from 'lib/conditionals/lightcone/4star/NowhereToRun';
import OnlySilenceRemains from 'lib/conditionals/lightcone/4star/OnlySilenceRemains';
import OnTheFallOfAnAeon from 'lib/conditionals/lightcone/5star/OnTheFallOfAnAeon';
import PastAndFuture from 'lib/conditionals/lightcone/4star/PastAndFuture';
import PastSelfInTheMirror from 'lib/conditionals/lightcone/5star/PastSelfInTheMirror';
import PatienceIsAllYouNeed from 'lib/conditionals/lightcone/5star/PatienceIsAllYouNeed';
import PerfectTiming from 'lib/conditionals/lightcone/4star/PerfectTiming';
import PlanetaryRendezvous from 'lib/conditionals/lightcone/4star/PlanetaryRendezvous';
import PostOpConversation from 'lib/conditionals/lightcone/4star/PostOpConversation';
import QuidProQuo from 'lib/conditionals/lightcone/4star/QuidProQuo';
import ResolutionShinesAsPearlsOfSweat from 'lib/conditionals/lightcone/4star/ResolutionShinesAsPearlsOfSweat';
import ReturnToDarkness from 'lib/conditionals/lightcone/4star/ReturnToDarkness';
import RiverFlowsInSpring from 'lib/conditionals/lightcone/4star/RiverFlowsInSpring';
import SharedFeeling from 'lib/conditionals/lightcone/4star/SharedFeeling';
import SheAlreadyShutHerEyes from 'lib/conditionals/lightcone/5star/SheAlreadyShutHerEyes';
import SleepLikeTheDead from 'lib/conditionals/lightcone/5star/SleepLikeTheDead';
import SolitaryHealing from 'lib/conditionals/lightcone/5star/SolitaryHealing';
import SomethingIrreplaceable from 'lib/conditionals/lightcone/5star/SomethingIrreplaceable';
import SubscribeForMore from 'lib/conditionals/lightcone/4star/SubscribeForMore';
import Swordplay from 'lib/conditionals/lightcone/4star/Swordplay';
import TextureOfMemories from 'lib/conditionals/lightcone/5star/TextureOfMemories';
import TheBirthOfTheSelf from 'lib/conditionals/lightcone/4star/TheBirthOfTheSelf';
import TheMolesWelcomeYou from 'lib/conditionals/lightcone/4star/TheMolesWelcomeYou';
import TheSeriousnessOfBreakfast from 'lib/conditionals/lightcone/4star/TheSeriousnessOfBreakfast';
import TheUnreachableSide from 'lib/conditionals/lightcone/5star/TheUnreachableSide';
import ThisIsMe from 'lib/conditionals/lightcone/4star/ThisIsMe';
import TimeWaitsForNoOne from 'lib/conditionals/lightcone/5star/TimeWaitsForNoOne';
import TodayIsAnotherPeacefulDay from 'lib/conditionals/lightcone/4star/TodayIsAnotherPeacefulDay';
import TrendOfTheUniversalMarket from 'lib/conditionals/lightcone/4star/TrendOfTheUniversalMarket';
import UnderTheBlueSky from 'lib/conditionals/lightcone/4star/UnderTheBlueSky';
import WarmthShortensColdNights from 'lib/conditionals/lightcone/4star/WarmthShortensColdNights';
import WeAreWildfire from 'lib/conditionals/lightcone/4star/WeAreWildfire';
import WeWillMeetAgain from 'lib/conditionals/lightcone/4star/WeWillMeetAgain';
import WoofWalkTime from 'lib/conditionals/lightcone/4star/WoofWalkTime';
import WorrisomeBlissful from 'lib/conditionals/lightcone/5star/WorrisomeBlissful';

const Stats = Constants.Stats

const defaultGap = 5;

const fiveStar = {
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
};

const fourStar = {
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
};

const threeStar = {
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
}  

const lightConeOptionMapping = {
  ...fiveStar,
  ...fourStar,
  ...threeStar
};



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