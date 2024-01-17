/* eslint-disable no-unused-vars  */

import { Flex } from "antd";
import React from "react";
import { HeaderText } from "../components/HeaderText";
import { Constants } from './constants'
import { FormSlider, FormSwitch } from "../components/optimizerTab/FormConditionalInputs";
import { TooltipImage } from "../components/TooltipImage";
import { Hint } from "./hint";

let Stats = Constants.Stats

let defaultGap = 5

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
  23019: PastSelfInMirror,
  23020: BaptismOfPureThought,
  24000: OnTheFallOfAnAeon,
  24001: CruisingInTheStellarSea,
  24002: TextureOfMemories,
  24003: SolitaryHealing,
}

function BaptismOfPureThought(s) {
  let sValuesCd = [0.08, 0.09, 0.10, 0.11, 0.12]
  let sValuesDmg = [0.36, 0.42, 0.48, 0.54, 0.60]
  let sValuesFuaPen = [0.24, 0.28, 0.32, 0.36, 0.40]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSlider name='debuffCdStacks' text='Debuff cd stacks' min={0} max={3} lc/>
        <FormSwitch name='postUltBuff' text='Disputation ult cd / fua def pen buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      debuffCdStacks: 3,
      postUltBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.CD] += r.debuffCdStacks * sValuesCd[s]
      x.ELEMENTAL_DMG += r.postUltBuff ? sValuesDmg[s] : 0
      x.FUA_DEF_PEN += r.postUltBuff ? sValuesFuaPen[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function PastSelfInMirror(s) {
  let sValues = [0.24, 0.28, 0.32, 0.36, 0.40]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='postUltDmgBuff' text='Post ult dmg buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      postUltDmgBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.postUltDmgBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function SolitaryHealing(s) {
  let sValues = [0.24, 0.30, 0.36, 0.42, 0.48]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='postUltDotDmgBuff' text='Post ult dot dmg buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      postUltDotDmgBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.DOT_BOOST += r.postUltDotDmgBuff ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function TextureOfMemories(s) {
  let sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='activeShieldDmgDecrease' text='Active shield dmg decrease' lc/>
      </Flex>
    ),
    defaults: () => ({
      activeShieldDmgDecrease: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.DMG_RED_MULTI += (r.activeShieldDmgDecrease) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function CruisingInTheStellarSea(s) {
  let sValuesCr = [0.08, 0.10, 0.12, 0.14, 0.16]
  let sValuesAtk = [0.20, 0.25, 0.30, 0.35, 0.40]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='enemyHp50CrBoost' text='Enemy HP <= 50% cr boost' lc/>
        <FormSwitch name='enemyDefeatedAtkBuff' text='Enemy defeated atk buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      enemyHp50CrBoost: true,
      enemyDefeatedAtkBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.CR] += (r.enemyHp50CrBoost && request.enemyHpPercent <= 0.50) ? sValuesCr[s] : 0
      x[Stats.ATK_P] += (r.enemyDefeatedAtkBuff) ? sValuesAtk[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function OnTheFallOfAnAeon(s) {
  let sValuesAtkStacks = [0.08, 0.10, 0.12, 0.14, 0.16]
  let sValuesDmgBuff = [0.12, 0.15, 0.18, 0.21, 0.24]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSlider name='atkBoostStacks' text='Atk boost stacks' min={0} max={4} lc/>
        <FormSwitch name='weaknessBreakDmgBuff' text='Weakness break dmg buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      atkBoostStacks: 4,
      weaknessBreakDmgBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.ATK_P] += r.atkBoostStacks * sValuesAtkStacks[s]
      x.ELEMENTAL_DMG += (r.weaknessBreakDmgBuff) ? sValuesDmgBuff[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function AnInstantBeforeAGaze(s) {
  let sValues = [0.0036, 0.0042, 0.0048, 0.0054, 0.006]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSlider name='maxEnergyUltDmgStacks' text='Max energy' min={0} max={180} lc/>
      </Flex>
    ),
    defaults: () => ({
      maxEnergyUltDmgStacks: 180,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ULT_BOOST += r.maxEnergyUltDmgStacks * sValues[s]
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function NightOfFright(s) {
  let sValues = [0.024, 0.028, 0.032, 0.036, 0.04]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSlider name='atkBuffStacks' text="Atk buff stacks" min={0} max={5} lc/>
      </Flex>
    ),
    defaults: () => ({
      atkBuffStacks: 5,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.ATK_P] += r.atkBuffStacks * sValues[s]
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function WorrisomeBlissful(s) {
  let sValuesFuaDmg = [0.30, 0.35, 0.40, 0.45, 0.50]
  let sValuesCd = [0.12, 0.14, 0.16, 0.18, 0.20]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='fuaDmgBoost' text='Fua dmg boost' lc/>
        <FormSlider name='targetTameStacks' text="Target tame stacks" min={0} max={2} lc/>
      </Flex>
    ),
    defaults: () => ({
      fuaDmgBoost: true,
      targetTameStacks: 2,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.CD] += r.targetTameStacks * sValuesCd[s]
      x.FUA_BOOST += (r.fuaDmgBoost) ? sValuesFuaDmg[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function BrighterThanTheSun(s) {
  let sValuesAtk = [0.18, 0.21, 0.24, 0.27, 0.30]
  let sValuesErr = [0.06, 0.07, 0.08, 0.09, 0.10]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSlider name='dragonsCallStacks' text="Dragon's call stacks" min={0} max={2} lc/>
      </Flex>
    ),
    defaults: () => ({
      dragonsCallStacks: 2,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.ATK_P] += r.dragonsCallStacks * sValuesAtk[s]
      x[Stats.ERR] += r.dragonsCallStacks * sValuesErr[s]
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function IShallBeMyOwnSword(s) {
  let sValuesStackDmg = [0.14, 0.165, 0.19, 0.215, 0.24]
  let sValuesDefPen = [0.12, 0.14, 0.16, 0.18, 0.20]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSlider name='eclipseStacks' text='Eclipse stacks' min={0} max={3} lc/>
        <FormSwitch name='maxStackDefPen' text='Max stack def pen' lc/>
      </Flex>
    ),
    defaults: () => ({
      eclipseStacks: 3,
      maxStackDefPen: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += r.eclipseStacks * sValuesStackDmg[s]
      x.DEF_SHRED += (r.maxStackDefPen && r.eclipseStacks == 3) ? sValuesDefPen[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function TimeWaitsForNoOne(s) {
  let sValues = [0, 0, 0, 0, 0]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='healingBasedDmgProc' text='Healing based dmg proc (not implemented)' lc/>
      </Flex>
    ),
    defaults: () => ({
      healingBasedDmgProc: false,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function SleepLikeTheDead(s) {
  let sValues = [0.36, 0.42, 0.48, 0.54, 0.60]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='missedCritCrBuff' text='Missed crit cr buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      missedCritCrBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.CR] += (r.missedCritCrBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function SheAlreadyShutHerEyes(s) {
  let sValues = [0.09, 0.105, 0.12, 0.135, 0.15]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='hpLostDmgBuff' text='Hp lost dmg buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      hpLostDmgBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.hpLostDmgBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function BeforeDawn(s) {
  let sValuesSkillUltDmg = [0.18, 0.21, 0.24, 0.27, 0.30]
  let sValuesFuaDmg = [0.48, 0.56, 0.64, 0.72, 0.80]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='skillUltDmgBoost' text='Skill/ult dmg boost' lc/>
        <FormSwitch name='fuaDmgBoost' text='Fua dmg boost' lc/>
      </Flex>
    ),
    defaults: () => ({
      skillUltDmgBoost: true,
      fuaDmgBoost: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.SKILL_BOOST += (r.skillUltDmgBoost) ? sValuesSkillUltDmg[s] : 0
      x.ULT_BOOST += (r.skillUltDmgBoost) ? sValuesSkillUltDmg[s] : 0
      x.FUA_BOOST += (r.fuaDmgBoost) ? sValuesFuaDmg[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function TheUnreachableSide(s) {
  let sValues = [0.24, 0.28, 0.32, 0.36, 0.40]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='dmgBuff' text='Hp consumed or attacked dmg buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      dmgBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.dmgBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function EchoesOfTheCoffin(s) {
  let sValues = [12, 14, 16, 18, 20]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='postUltSpdBuff' text='Post ult spd buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      postUltSpdBuff: false,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.SPD] += (r.postUltSpdBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function IncessantRain(s) {
  let sValuesCr = [0.12, 0.14, 0.16, 0.18, 0.20]
  let sValuesDmg = [0.12, 0.14, 0.16, 0.18, 0.20]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='enemy3DebuffsCrBoost' text='Enemy <= 3 debuffs cr boost' lc/>
        <FormSwitch name='targetCodeDebuff' text='Target code debuff' lc/>
      </Flex>
    ),
    defaults: () => ({
      enemy3DebuffsCrBoost: true,
      targetCodeDebuff: true
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.CR] += (r.enemy3DebuffsCrBoost) ? sValuesCr[s] : 0
      x.ELEMENTAL_DMG += (r.targetCodeDebuff) ? sValuesDmg[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function PatienceIsAllYouNeed(s) {
  let sValuesDmg = [0.24, 0.28, 0.32, 0.36, 0.40]
  let sValuesSpd = [0.048, 0.056, 0.064, 0.072, 0.08]

  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='dmgBoost' text='Dmg boost' lc/>
        <FormSlider name='spdStacks' text='Spd stacks' min={0} max={3} lc/>
        <FormSwitch name='dotEffect' text='Dot effect (not implemented)' lc/>
      </Flex>
    ),
    defaults: () => ({
      dmgBoost: true,
      spdStacks: 0,
      dotEffect: false
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.SPD_P] += r.spdStacks * sValuesSpd[s]
      x.ELEMENTAL_DMG += (r.dmgBoost) ? sValuesDmg[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function MomentOfVictory(s) {
  let sValues = [0.24, 0.28, 0.32, 0.36, 0.40]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='selfAttackedDefBuff' text='Self attacked def buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      selfAttackedDefBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.DEF_P] += (r.selfAttackedDefBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function InTheNameOfTheWorld(s) {
  let sValuesDmg = [0.24, 0.28, 0.32, 0.36, 0.40]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='enemyDebuffedDmgBoost' text='Enemy debuffed dmg boost' lc/>
        <FormSwitch name='skillAtkBoost' text='Skill atk boost (not implemented)' lc/>
      </Flex>
    ),
    defaults: () => ({
      enemyDebuffedDmgBoost: true,
      skillAtkBoost: false,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.enemyDebuffedDmgBoost) ? sValuesDmg[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function ButTheBattleIsntOver(s) {
  let sValuesErr = [0.10, 0.12, 0.14, 0.16, 0.18]
  let sValuesDmg = [0.30, 0.35, 0.40, 0.45, 0.50]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='postSkillDmgBuff' text='Post skill dmg buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      postSkillDmgBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.ERR] += sValuesErr[s]
      x.ELEMENTAL_DMG += (r.postSkillDmgBuff) ? sValuesDmg[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function SomethingIrreplaceable(s) {
  let sValues = [0.24, 0.28, 0.32, 0.36, 0.40]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='dmgBuff' text='Enemy defeated or self hit dmg buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      dmgBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.dmgBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function InTheNight(s) {
  let sValuesDmg = [0.06, 0.07, 0.08, 0.09, 0.10]
  let sValuesCd = [0.12, 0.14, 0.16, 0.18, 0.20]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='spdScalingBuffs' text='Speed scaling buffs enabled' lc/>
      </Flex>
    ),
    defaults: () => ({
      spdScalingBuffs: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {
      let r = request.lightConeConditionals
      let x = c.x

      let stacks = Math.max(0, Math.min(6, Math.floor((x[Stats.SPD] - 100) / 10)))

      x.BASIC_BOOST += (r.spdScalingBuffs) ? stacks * sValuesDmg[s] : 0
      x.SKILL_BOOST += (r.spdScalingBuffs) ? stacks * sValuesDmg[s] : 0
      x.ULT_CD_BOOST += (r.spdScalingBuffs) ? stacks * sValuesCd[s] : 0
    }
  }
}

function NightOnTheMilkyWay(s) {
  let sValuesAtk = [0.09, 0.105, 0.12, 0.135, 0.15]
  let sValuesDmg = [0.30, 0.35, 0.40, 0.45, 0.50]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='enemyCountAtkBuff' text='Enemy count atk buff' lc/>
        <FormSwitch name='enemyWeaknessBreakDmgBuff' text='Enemy weakness break dmg buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      enemyCountAtkBuff: true,
      enemyWeaknessBreakDmgBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.ATK_P] += (r.enemyCountAtkBuff) ? request.enemyCount * sValuesAtk[s] : 0
      x.ELEMENTAL_DMG += (r.enemyWeaknessBreakDmgBuff) ? sValuesDmg[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function HeyOverHere(s) {
  let sValues = [0.16, 0.19, 0.22, 0.25, 0.28]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='postSkillHealBuff' text='Post skill heal buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      postSkillHealBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.OHB] += (r.postSkillHealBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function BeforeTheTutorialMissionStarts(s) {
  let sValues = [0, 0, 0, 0, 0]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function TodayIsAnotherPeacefulDay(s) {
  let sValues = [0.002, 0.0025, 0.003, 0.0035, 0.004]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSlider name='maxEnergyStacks' text='Max energy' min={0} max={160} lc/>
      </Flex>
    ),
    defaults: () => ({
      maxEnergyStacks: 160,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += r.maxEnergyStacks * sValues[s]
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function NowhereToRun(s) {
  let sValues = [0, 0, 0, 0, 0]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function CarveTheMoonWeaveTheClouds(s) {
  let sValuesAtk = [0.10, 0.125, 0.15, 0.175, 0.20]
  let sValuesCd = [0.12, 0.15, 0.18, 0.21, 0.24]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='atkBuffActive' text='Atk buff active' lc/>
        <FormSwitch name='cdBuffActive' text='Cd buff active' lc/>
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
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function ReturnToDarkness(s) {
  let sValues = [0, 0, 0, 0, 0]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function ThisIsMe(s) {
  let sValues = [0.60, 0.75, 0.90, 1.05, 1.20]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='defScalingUltDmg' text='Def scaling ult dmg (not implemented)' lc/>
      </Flex>
    ),
    defaults: () => ({
      defScalingUltDmg: false,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {
      let r = request.lightConeConditionals
      let x = c.x

      // x.ULT_DEF_SCALING += (r.defScalingUltDmg) ? sValues[s] : 0
    }
  }
}

function WeWillMeetAgain(s) {
  let sValues = [0.48, 0.60, 0.72, 0.84, 0.96]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='extraDmgProc' text='Additional dmg proc' lc/>
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
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function WarmthShortensColdNights(s) {
  let sValues = [0, 0, 0, 0, 0]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function TheSeriousnessOfBreakfast(s) {
  let sValuesDmgBoost = [0.12, 0.15, 0.18, 0.21, 0.24]
  let sValuesStacks = [0.04, 0.05, 0.06, 0.07, 0.08]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='dmgBoost' text='Dmg boost' lc/>
        <FormSlider name='defeatedEnemyAtkStacks' text='Defeated enemy atk stacks' min={0} max={3} lc/>
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
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function WoofWalkTime(s) {
  let sValues = [0.16, 0.20, 0.24, 0.28, 0.32]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='enemyBurnedBleeding' text='Enemy burned / bleeding' lc/>
      </Flex>
    ),
    defaults: () => ({
      enemyBurnedBleeding: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.enemyBurnedBleeding) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function PastAndFuture(s) {
  let sValues = [0, 0, 0, 0, 0]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function RiverFlowsInSpring(s) {
  let sValuesSpd = [0.08, 0.09, 0.10, 0.11, 0.12]
  let sValuesDmg = [0.12, 0.15, 0.18, 0.21, 0.24]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='spdDmgBuff' text='Spd / dmg buff active' lc/>
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
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function WeAreWildfire(s) {
  let sValues = [0.08, 0.10, 0.12, 0.14, 0.16]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='initialDmgReductionBuff' text='Initial dmg reduction buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      initialDmgReductionBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.DMG_RED_MULTI += (r.initialDmgReductionBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function Fermata(s) {
  let sValues = [0.16, 0.20, 0.24, 0.28, 0.32]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='enemyShockWindShear' text='Enemy shocked / wind sheared' lc/>
      </Flex>
    ),
    defaults: () => ({
      enemyShockWindShear: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.enemyShockWindShear) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function QuidProQuo(s) {
  let sValues = [0, 0, 0, 0, 0]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function GeniusesRepose(s) {
  let sValues = [0.24, 0.30, 0.36, 0.42, 0.48]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='defeatedEnemyCdBuff' text='Defeated enemy cd buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      defeatedEnemyCdBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.CD] += (r.defeatedEnemyCdBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function UnderTheBlueSky(s) {
  let sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='defeatedEnemyCrBuff' text='Defeated enemy cr buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      defeatedEnemyCrBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.CR] += (r.defeatedEnemyCrBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function DanceDanceDance(s) {
  let sValues = [0, 0, 0, 0, 0]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function SubscribeForMore(s) {
  let sValues = [0.24, 0.30, 0.36, 0.42, 0.48]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='maxEnergyDmgBoost' text='Max energy dmg boost' lc/>
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
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function TrendOfTheUniversalMarket(s) {
  let sValues = [0, 0, 0, 0, 0]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function ResolutionShinesAsPearlsOfSweat(s) {
  let sValues = [0.12, 0.13, 0.14, 0.15, 0.16]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='targetEnsnared' text='Target ensnared' lc/>
      </Flex>
    ),
    defaults: () => ({
      targetEnsnared: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.DEF_SHRED += (r.targetEnsnared) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function PerfectTiming(s) {
  let sValues = [0.33, 0.36, 0.39, 0.42, 0.45]
  let sMaxValues = [0.15, 0.18, 0.21, 0.24, 0.27]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='resToHealingBoost' text='Res to healing boost' lc/>
      </Flex>
    ),
    defaults: () => ({
      resToHealingBoost: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {
      let r = request.lightConeConditionals
      let x = c.x

      let boost = Math.min(sMaxValues[s], sValues[s] * x[Stats.RES])
      x[Stats.OHB] += (r.resToHealingBoost) ? boost : 0
    }
  }
}

function MakeTheWorldClamor(s) {
  let sValues = [0.32, 0.40, 0.48, 0.56, 0.64]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='ultDmgBuff' text='Ult dmg buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      ultDmgBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ULT_BOOST += (r.ultDmgBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function ASecretVow(s) {
  let sValues = [0.20, 0.25, 0.30, 0.35, 0.40]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='enemyHpHigherDmgBoost' text='Enemy HP % higher dmg boost' lc/>
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
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function PlanetaryRendezvous(s) {
  let sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='alliesSameElement' text='Allies same element dmg boost' lc/>
      </Flex>
    ),
    defaults: () => ({
      alliesSameElement: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.alliesSameElement) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function Swordplay(s) {
  let sValues = [0.08, 0.10, 0.12, 0.14, 0.16]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSlider name='sameTargetHitStacks' text='Same target hit stacks' min={0} max={5} lc/>
      </Flex>
    ),
    defaults: () => ({
      sameTargetHitStacks: 5,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.sameTargetHitStacks) * sValues[s]
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function LandausChoice(s) {
  let sValues = [0.16, 0.18, 0.20, 0.22, 0.24]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.DMG_RED_MULTI += sValues[s]
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function EyesOfThePrey(s) {
  let sValues = [0.24, 0.30, 0.36, 0.42, 0.48]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.DOT_BOOST += sValues[s]
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function SharedFeeling(s) {
  let sValues = [0.10, 0.125, 0.15, 0.175, 0.20]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.OHB] += sValues[s]
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function TheBirthOfTheSelf(s) {
  let sValues = [0.24, 0.30, 0.36, 0.42, 0.48]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='enemyHp50FuaBuff' text='Enemy HP < 50% fua buff' lc/>
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
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function TheMolesWelcomeYou(s) {
  let sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSlider name='atkBuffStacks' text='Atk buff stacks' min={0} max={3} lc/>
      </Flex>
    ),
    defaults: () => ({
      atkBuffStacks: 3,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.ATK_P] += (r.atkBuffStacks) * sValues[s]
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function MemoriesOfThePast(s) {
  let sValues = [0, 0, 0, 0, 0]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function OnlySilenceRemains(s) {
  let sValues = [0.08, 0.09, 0.10, 0.11, 0.12]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='enemies2CrBuff' text='<= 2 enemies cr buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      enemies2CrBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.CR] += (r.enemies2CrBuff && request.enemyCount <= 2) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function DayOneOfMyNewLife(s) {
  let sValues = [0.16, 0.18, 0.20, 0.22, 0.24]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='dmgResBuff' text='Dmg RES buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      dmgResBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.DMG_RED_MULTI += (r.dmgResBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function GoodNightAndSleepWell(s) {
  let sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSlider name='debuffStacksDmgIncrease' text='Debuff stacks dmg increase' min={0} max={3} lc/>
      </Flex>
    ),
    defaults: () => ({
      debuffStacksDmgIncrease: 3,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += r.debuffStacksDmgIncrease * sValues[s]
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function PostOpConversation(s) {
  let sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='postUltHealingBoost' text='Post ult healing boost' lc/>
      </Flex>
    ),
    defaults: () => ({
      postUltHealingBoost: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.OHB] += (r.postUltHealingBoost) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function Sagacity(s) {
  let sValues = [0.24, 0.30, 0.36, 0.42, 0.48]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='postUltAtkBuff' text='Post ult atk buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      postUltAtkBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.ATK_P] += (r.postUltAtkBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function Mediation(s) {
  let sValues = [12, 14, 16, 18, 20]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='initialSpdBuff' text='Initial spd buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      initialSpdBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.SPD] += (r.initialSpdBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function HiddenShadow(s) {
  let sValues = [0.60, 0.75, 0.90, 1.05, 1.20]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='basicAtkBuff' text='Basic atk buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      basicAtkBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.BASIC_BOOST += (r.basicAtkBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function Pioneering(s) {
  let sValues = [0, 0, 0, 0, 0]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function MutualDemise(s) {
  let sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='selfHp80CrBuff' text='Self HP <80% cr buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      selfHp80CrBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.CR] += (r.selfHp80CrBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function Multiplication(s) {
  let sValues = [0, 0, 0, 0, 0]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function Adversarial(s) {
  let sValues = [0.10, 0.12, 0.14, 0.16, 0.18]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='defeatedEnemySpdBuff' text='Defeated enemy spd buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      defeatedEnemySpdBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.SPD_P] += (r.defeatedEnemySpdBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function Passkey(s) {
  let sValues = [0, 0, 0, 0, 0]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function MeshingCogs(s) {
  let sValues = [0, 0, 0, 0, 0]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function Loop(s) {
  let sValues = [0.24, 0.30, 0.36, 0.42, 0.48]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='enemySlowedDmgBuff' text='Enemy slowed dmg buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      enemySlowedDmgBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.enemySlowedDmgBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function Defense(s) {
  let sValues = [0, 0, 0, 0, 0]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function ShatteredHome(s) {
  let sValues = [0.20, 0.25, 0.30, 0.35, 0.40]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='enemyHp50Buff' text='Enemy HP >50% dmg buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      enemyHp50Buff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.enemyHp50Buff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function FineFruit(s) {
  let sValues = [0, 0, 0, 0, 0]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
      </Flex>
    ),
    defaults: () => ({
      name: true,
    }),
    precomputeEffects: (x, request) => {},
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function DartingArrow(s) {
  let sValues = [0.24, 0.30, 0.36, 0.42, 0.48]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='defeatedEnemyAtkBuff' text='Atk buff on kill' lc/>
      </Flex>
    ),
    defaults: () => ({
      defeatedEnemyAtkBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.ATK_P] += (r.defeatedEnemyAtkBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function DataBank(s) {
  let sValues = [0.28, 0.35, 0.42, 0.49, 0.56]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='ultDmgBuff' text='Ult dmg buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      ultDmgBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x.ULT_BOOST += (r.ultDmgBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function Chorus(s) {
  let sValues = [0.08, 0.09, 0.10, 0.11, 0.12]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='inBattleAtkBuff' text='In battle atk buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      inBattleAtkBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.ATK_P] += (r.inBattleAtkBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function Void(s) {
  let sValues = [0.20,0.25,0,30,0.35,0.40]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='initialEhrBuff' text='Initial EHR buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      initialEhrBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.EHR] += (r.initialEhrBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}


function Amber(s) {
  let sValues = [0.16,0.20,0.24,0.28,0.32]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='hp50DefBuff' text='HP <50% def buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      hp50DefBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.DEF_P] += (r.hp50DefBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function CollapsingSky(s) {
  let sValues = [0.20, 0.25, 0.30, 0.35, 0.40]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='basicSkillDmgBuff' text='Basic/Skill dmg buff' lc/>
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
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function Cornucopia(s) {
  let sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='healingBuff' text='Healing buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      healingBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.OHB] += (r.healingBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

function Arrows(s) {
  let sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  s = s - 1

  return {
    display: () => (
      <Flex vertical gap={defaultGap} >
        <FormSwitch name='critBuff' text='Initial crit buff' lc/>
      </Flex>
    ),
    defaults: () => ({
      critBuff: true,
    }),
    precomputeEffects: (x, request) => {
      let r = request.lightConeConditionals

      x[Stats.CR] += (r.critBuff) ? sValues[s] : 0
    },
    calculatePassives: (c, request) => {},
    calculateBaseMultis: (c, request) => {}
  }
}

export const LightConeConditionals = {
  get: (request) => {
    let lcFn = lightConeOptionMapping[request.lightCone]
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
    return lcFn(request.lightConeSuperimposition)
  },
  getDisplayForLightCone: (id, superimposition) => {
    // console.log('getDisplayForLightCone', id)
    if (!id || !lightConeOptionMapping[id]) {
      return (
        <Flex justify='space-between' align='center'>
          <HeaderText>Light cone passives</HeaderText>
          <TooltipImage type={Hint.lightConePassives()} />
        </Flex>
      )
    }

    let lcFn = lightConeOptionMapping[id]
    let display = lcFn(superimposition).display()

    return (
      <Flex vertical gap={5}>
        <Flex justify='space-between' align='center'>
          <HeaderText>Light cone passives</HeaderText>
          <TooltipImage type={Hint.lightConePassives()} />
        </Flex>
        {display}
      </Flex>
    )
  },
}