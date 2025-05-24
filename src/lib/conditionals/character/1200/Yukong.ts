import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Arrowslinger

Basic ATK+1+20

Deals 100% of Yukong's ATK as Imaginary DMG to a target enemy.

 Single 10

Lv6

Emboldening Salvo

Skill-1+30

Obtains 2 stack(s) of "Roaring Bowstrings" (to a maximum of 2 stacks). When "Roaring Bowstrings" is active, the ATK of all allies increases by 80%, and every time an ally's turn (including Yukong's) ends, Yukong loses 1 stack of "Roaring Bowstrings."
When it's the turn where Yukong gains "Roaring Bowstrings" by using Skill, "Roaring Bowstrings" will not be removed.

Lv10

Diving Kestrel

Ultimate130+5

If "Roaring Bowstrings" is active on Yukong when her Ultimate is used, additionally increases all allies' CRIT Rate by 28% and CRIT DMG by 65%. At the same time, deals Imaginary DMG equal to 380% of Yukong's ATK to a single enemy.

 Single 30

Lv10

Seven Layers, One Arrow

Talent

Basic ATK additionally deals Imaginary DMG equal to 80% of Yukong's ATK, and increases the Toughness Reduction of this attack by 100%. This effect can be triggered again after 1 turn(s).

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Windchaser

Technique

After using her Technique, Yukong enters Sprint mode for 20 seconds. In Sprint mode, her movement speed increases by 35%, and Yukong gains 2 stack(s) of "Roaring Bowstrings" when she enters battle by attacking enemies.


Stat Boosts

 +22.4% Imaginary DMG Boost
 +18.0% HP
 +10.0% ATK

Archerion

Yukong can resist 1 debuff application for 1 time. This effect can be triggered again after 2 turn(s).


Bowmaster

When Yukong is on the field, Imaginary DMG dealt by all allies increases by 12%.


Majestas

When "Roaring Bowstrings" is active, Yukong regenerates 2 additional Energy every time an ally takes action.



1 Aerial Marshal

At the start of battle, increases the SPD of all allies by 10% for 2 turn(s).



2 Skyward Command

When any ally's current energy is equal to its energy limit, Yukong regenerates an additional 5 energy. This effect can only be triggered once for each ally. The trigger count is reset after Yukong uses her Ultimate.



3 Torrential Fusillade

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Zephyrean Echoes

When "Roaring Bowstrings" is active, Yukong deals 30% more DMG to enemies.



5 August Deadshot

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Bowstring Thunderclap

When Yukong uses her Ultimate, she immediately gains 1 stack(s) of "Roaring Bowstrings."
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Yukong')
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
  } = Source.character('1207')

  const skillAtkBuffValue = skill(e, 0.80, 0.88)
  const ultCdBuffValue = skill(e, 0.65, 0.702)
  const ultCrBuffValue = skill(e, 0.28, 0.294)
  const talentAtkScaling = talent(e, 0.80, 0.88)

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 3.80, 4.104)

  const defaults = {
    teamImaginaryDmgBoost: true,
    roaringBowstringsActive: true,
    ultBuff: true,
    initialSpeedBuff: true,
  }

  const teammateDefaults = {
    teamImaginaryDmgBoost: true,
    roaringBowstringsActive: true,
    ultBuff: true,
    initialSpeedBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    teamImaginaryDmgBoost: {
      id: 'teamImaginaryDmgBoost',
      formItem: 'switch',
      text: t('Content.teamImaginaryDmgBoost.text'),
      content: t('Content.teamImaginaryDmgBoost.content'),
    },
    roaringBowstringsActive: {
      id: 'roaringBowstringsActive',
      formItem: 'switch',
      text: t('Content.roaringBowstringsActive.text'),
      content: t('Content.roaringBowstringsActive.content', { skillAtkBuffValue: TsUtils.precisionRound(100 * skillAtkBuffValue) }),
    },
    ultBuff: {
      id: 'ultBuff',
      formItem: 'switch',
      text: t('Content.ultBuff.text'),
      content: t('Content.ultBuff.content', {
        ultCrBuffValue: TsUtils.precisionRound(100 * ultCrBuffValue),
        ultCdBuffValue: TsUtils.precisionRound(100 * ultCdBuffValue),
        ultScaling: TsUtils.precisionRound(100 * ultScaling),
      }),
    },
    initialSpeedBuff: {
      id: 'initialSpeedBuff',
      formItem: 'switch',
      text: t('Content.initialSpeedBuff.text'),
      content: t('Content.initialSpeedBuff.content'),
      disabled: e < 1,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    teamImaginaryDmgBoost: content.teamImaginaryDmgBoost,
    roaringBowstringsActive: content.roaringBowstringsActive,
    ultBuff: content.ultBuff,
    initialSpeedBuff: content.initialSpeedBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.BASIC_ATK_SCALING.buff(talentAtkScaling, SOURCE_TALENT)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      // Boost
      x.ELEMENTAL_DMG.buff((e >= 4 && r.roaringBowstringsActive) ? 0.30 : 0, SOURCE_E4)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.ATK_P.buffTeam((m.roaringBowstringsActive) ? skillAtkBuffValue : 0, SOURCE_SKILL)
      x.CR.buffTeam((m.ultBuff && m.roaringBowstringsActive) ? ultCrBuffValue : 0, SOURCE_ULT)
      x.CD.buffTeam((m.ultBuff && m.roaringBowstringsActive) ? ultCdBuffValue : 0, SOURCE_ULT)
      x.SPD_P.buffTeam((e >= 1 && m.initialSpeedBuff) ? 0.10 : 0, SOURCE_E1)

      x.IMAGINARY_DMG_BOOST.buffTeam((m.teamImaginaryDmgBoost) ? 0.12 : 0, SOURCE_TRACE)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}
