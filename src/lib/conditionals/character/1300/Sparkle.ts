import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition, countTeamElement } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, ElementNames, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Monodrama

Basic ATK+1+20

Deals Quantum DMG equal to 100% of Sparkle's ATK to a single target enemy.

 Single 10

Lv6

Dreamdiver

Skill-1+30

Increases the CRIT DMG of a single target ally by 24% of Sparkle's CRIT DMG plus 45%, lasting for 1 turn(s). And at the same time, Advances Forward this ally's action by 50%.
When Sparkle uses this ability on herself, the Action Advance effect will not trigger.

Lv10

The Hero with a Thousand Faces

Ultimate110+5

Recovers 4 Skill Points for the team and grants all allies Cipher. For allies with Cipher, each stack of the DMG Boost effect provided by Sparkle's Talent additionally increases by 10%, lasting for 2 turns.
Hidden Stat: 2

Lv10

Red Herring

Talent

While Sparkle is on the battlefield, additionally increases the max number of Skill Points by 2. Whenever an ally consumes 1 Skill Point, all allies' DMG dealt increases by 6%. This effect lasts for 2 turn(s) and can stack up to 3 time(s).

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Unreliable Narrator

Technique

Using the Technique grants all allies Misdirect for 20 seconds. Characters with Misdirect will not be detected by enemies, and entering battle in the Misdirect state recovers 3 Skill Point(s) for the team.


Stat Boosts

 +28.0% HP
 +24.0% CRIT DMG
 +10.0% Effect RES

Almanac

When using Basic ATK, additionally regenerates 10 Energy.


Artificial Flower

The CRIT DMG Boost effect provided by the Skill will be extended until the start of the target's next turn.


Nocturne

Increases all allies' ATK by 15%. When there are 1/2/3 Quantum-Type allies in the team, additionally increases Quantum-Type allies' ATK by 5%/15%/30%.



1 Suspension of Disbelief

The Cipher effect granted by the Ultimate lasts for 1 extra turn. All allies with Cipher have their ATK increased by 40%.



2 Purely Fictitious

Every stack of the Talent's effect allows allies to additionally ignore 8% of the target's DEF when dealing DMG.



3 Pipedream

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Life Is a Gamble

The Ultimate recovers 1 more Skill Point. The Talent additionally increases the Max Skill Points by 1.



5 Parallax Truth

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Narrative Polysemy

The CRIT DMG Boost effect provided by the Skill additionally increases by an amount equal to 30% of Sparkle's CRIT DMG. When Sparkle uses Skill, her Skill's CRIT DMG Boost effect will apply to all teammates with Cipher. When Sparkle uses her Ultimate, any single ally who benefits from her Skill's CRIT DMG Boost will spread that effect to teammates with Cipher.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sparkle')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TALENT,
    SOURCE_TECHNIQUE,
    SOURCE_TRACE,
    SOURCE_MEMO,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character('1306')

  const skillCdBuffScaling = skill(e, 0.24, 0.264)
  const skillCdBuffBase = skill(e, 0.45, 0.486)
  const cipherTalentStackBoost = ult(e, 0.10, 0.108)
  const talentBaseStackBoost = talent(e, 0.06, 0.066)

  const basicScaling = basic(e, 1.00, 1.10)

  const atkBoostByQuantumAllies: Record<number, number> = {
    0: 0,
    1: 0.05,
    2: 0.15,
    3: 0.30,
    4: 0.30,
  }

  const defaults = {
    skillCdBuff: false,
    cipherBuff: true,
    talentStacks: 3,
    quantumAlliesAtkBuff: true,
  }

  const teammateDefaults = {
    ...defaults,
    ...{
      skillCdBuff: true,
      teammateCDValue: 2.5,
    },
  }

  const content: ContentDefinition<typeof defaults> = {
    skillCdBuff: {
      id: 'skillCdBuff',
      formItem: 'switch',
      text: t('Content.skillCdBuff.text'),
      content: t('Content.skillCdBuff.content', {
        skillCdBuffScaling: TsUtils.precisionRound(100 * skillCdBuffScaling),
        skillCdBuffBase: TsUtils.precisionRound(100 * skillCdBuffBase),
      }),
    },
    cipherBuff: {
      id: 'cipherBuff',
      formItem: 'switch',
      text: t('Content.cipherBuff.text'),
      content: t('Content.cipherBuff.content', { cipherTalentStackBoost: TsUtils.precisionRound(100 * cipherTalentStackBoost) }),
    },
    talentStacks: {
      id: 'talentStacks',
      formItem: 'slider',
      text: t('Content.talentStacks.text'),
      content: t('Content.talentStacks.content', { talentBaseStackBoost: TsUtils.precisionRound(100 * talentBaseStackBoost) }),
      min: 0,
      max: 3,
    },
    quantumAlliesAtkBuff: {
      id: 'quantumAlliesAtkBuff',
      formItem: 'switch',
      text: t('Content.quantumAlliesAtkBuff.text'),
      content: t('Content.quantumAlliesAtkBuff.content'),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillCdBuff: content.skillCdBuff,
    teammateCDValue: {
      id: 'teammateCDValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateCDValue.text'),
      content: t('TeammateContent.teammateCDValue.content', {
        skillCdBuffScaling: TsUtils.precisionRound(100 * skillCdBuffScaling),
        skillCdBuffBase: TsUtils.precisionRound(100 * skillCdBuffBase),
      }),
      min: 0,
      max: 3.50,
      percent: true,
    },
    cipherBuff: content.cipherBuff,
    talentStacks: content.talentStacks,
    quantumAlliesAtkBuff: content.quantumAlliesAtkBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)

      if (r.skillCdBuff) {
        x.CD.buff(skillCdBuffBase, SOURCE_SKILL)
        x.UNCONVERTIBLE_CD_BUFF.buff(skillCdBuffBase, SOURCE_SKILL)
      }
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Main damage type
      x.ATK_P.buffTeam(0.15, SOURCE_TRACE)
      x.ATK_P.buffDual(context.element == ElementNames.Quantum && m.quantumAlliesAtkBuff
        ? atkBoostByQuantumAllies[countTeamElement(context, ElementNames.Quantum)]
        : 0, SOURCE_TRACE)
      x.ATK_P.buffTeam((e >= 1 && m.cipherBuff) ? 0.40 : 0, SOURCE_E1)

      x.ELEMENTAL_DMG.buffTeam(
        (m.cipherBuff)
          ? m.talentStacks * (talentBaseStackBoost + cipherTalentStackBoost)
          : m.talentStacks * talentBaseStackBoost,
        SOURCE_TALENT)
      x.DEF_PEN.buffTeam((e >= 2) ? 0.08 * m.talentStacks : 0, SOURCE_E2)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const cdBuff = t.skillCdBuff
        ? skillCdBuffBase + (skillCdBuffScaling + (e >= 6 ? 0.30 : 0)) * t.teammateCDValue
        : 0
      if (e >= 6) {
        x.CD.buffTeam(cdBuff, SOURCE_SKILL)
        x.UNCONVERTIBLE_CD_BUFF.buffTeam(cdBuff, SOURCE_SKILL)
      } else {
        x.CD.buffSingle(cdBuff, SOURCE_SKILL)
        x.UNCONVERTIBLE_CD_BUFF.buffSingle(cdBuff, SOURCE_SKILL)
      }
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
    },
    gpuFinalizeCalculations: () => '',
    dynamicConditionals: [
      {
        id: 'SparkleCdConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CD],
        chainsTo: [Stats.CD],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.skillCdBuff
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.CD, Stats.CD, this, x, action, context, SOURCE_SKILL,
            (convertibleValue) => convertibleValue * (skillCdBuffScaling + (e >= 6 ? 0.30 : 0)),
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.CD, Stats.CD, this, action, context,
            `${skillCdBuffScaling + (e >= 6 ? 0.30 : 0)} * convertibleValue`,
            `${wgslTrue(r.skillCdBuff)}`,
          )
        },
      },
    ],
  }
}
