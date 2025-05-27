import { AbilityType, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Lucent Moonglow

Basic ATK+1+20

Deals Ice DMG equal to 100% of Jingliu's ATK to a single enemy.

 Single 10

Lv6

Moon On Glacial River

Skill+30

Deals Ice DMG equal to 250% of Jingliu's ATK to a single enemy, and deals Ice DMG equal to 125% of Jingliu's ATK to adjacent enemies. Consumes 1 stack(s) of Syzygy. Using this ability does not consume Skill Points.

 Single 20 | Other 10

Lv10

Transcendent Flash

Skill-1+20

Deals Ice DMG equal to 200% of Jingliu's ATK to a single enemy and obtains 1 stack(s) of Syzygy.

 Single 20

Lv10

Florephemeral Dreamflux

Ultimate140+5

Deals Ice DMG equal to 300% of Jingliu's ATK to a single enemy, and deals Ice DMG equal to 150% of Jingliu's ATK to any adjacent enemies. Gains 1 stack(s) of Syzygy after attack ends.
Hidden Stat: 1

 Single 20 | Other 20

Lv10

Crescent Transmigration

Talent

When Jingliu has 2 stack(s) of Syzygy, she enters the Spectral Transmigration state with her action advanced by 100% and her CRIT Rate increases by 50%. Then, Jingliu's Skill "Transcendent Flash" is enhanced to "Moon On Glacial River," and only this enhanced Skill is available for use in battle. When Jingliu uses an attack in the Spectral Transmigration state, she consumes HP from her teammates equal to 4% of their respective Max HP (this cannot reduce teammates' HP to lower than 1). Jingliu's ATK increases by 540% of the total HP consumed from all allies in this attack, capped at 180% of her base ATK, lasting until the current attack ends. Jingliu cannot enter the Spectral Transmigration state again until the current Spectral Transmigration state ends. Syzygy can stack up to 3 times. When Syzygy stacks become 0, Jingliu will exit the Spectral Transmigration state.
Hidden Stat: 0.3

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Shine of Truth

Technique

After using this Technique, creates a Special Dimension around Jingliu that lasts for 20 seconds, and all enemies in this Special Dimension will become Frozen. After entering combat with enemies in the Special Dimension, Jingliu immediately regenerates 15 Energy and obtains 1 stack(s) of Syzygy, with a 100% base chance of Freezing enemy targets for 1 turn(s). While Frozen, enemy targets cannot take action, and receive Ice Additional DMG equal to 80% of Jingliu's ATK at the start of every turn. Only 1 Dimension Effect created by allies can exist at the same time.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.


Stat Boosts

 +37.3% CRIT DMG
 +9.0 SPD
 +10.0% HP

Deathrealm

While in the Spectral Transmigration state, increases Effect RES by 35%.


Sword Champion

After using "Transcendent Flash," the next action advances by 10%.


Frost Wraith

While in the Spectral Transmigration state, increases DMG dealt by Ultimate by 20%.



1 Moon Crashes Tianguan Gate

When using her Ultimate or Enhanced Skill, Jingliu's CRIT DMG increases by 24% for 1 turn(s). If only one enemy target is attacked, the target will additionally be dealt Ice DMG equal to 100% of Jingliu's ATK.



2 Crescent Shadows Qixing Dipper

After using Ultimate, increases the DMG of the next Enhanced Skill by 80%.



3 Halfmoon Gapes Mercurial Haze

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Lunarlance Shines Skyward Dome

During the Spectral Transmigration state, the ATK gained from consuming teammates' HP is additionally increased by 90% of the total HP consumed from the entire team. The cap for ATK gained this way also increases by 30%.



5 Night Shades Astral Radiance

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Eclipse Hollows Corporeal Husk

When Jingliu enters the Spectral Transmigration state, the Syzygy stack limit increases by 1, and Jingliu obtains 1 stack(s) of Syzygy. While she is in the Spectral Transmigration state, her CRIT DMG increases by 50%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Jingliu')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character('1212')

  const talentCrBuff = talent(e, 0.50, 0.52)
  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)
  const skillEnhancedScaling = skill(e, 2.50, 2.75)
  const ultScaling = ult(e, 3.00, 3.24)

  const talentHpDrainAtkBuffMax = talent(e, 1.80, 1.98) + ((e >= 4) ? 0.30 : 0)

  const defaults = {
    talentEnhancedState: true,
    talentHpDrainAtkBuff: talentHpDrainAtkBuffMax,
    e1CdBuff: true,
    e2SkillDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    talentEnhancedState: {
      id: 'talentEnhancedState',
      formItem: 'switch',
      text: t('Content.talentEnhancedState.text'),
      content: t('Content.talentEnhancedState.content', { talentCrBuff: TsUtils.precisionRound(100 * talentCrBuff) }),
    },
    talentHpDrainAtkBuff: {
      id: 'talentHpDrainAtkBuff',
      formItem: 'slider',
      text: t('Content.talentHpDrainAtkBuff.text'),
      content: t('Content.talentHpDrainAtkBuff.content', { talentHpDrainAtkBuffMax: TsUtils.precisionRound(100 * talentHpDrainAtkBuffMax) }),
      min: 0,
      max: talentHpDrainAtkBuffMax,
      percent: true,
    },
    e1CdBuff: {
      id: 'e1CdBuff',
      formItem: 'switch',
      text: t('Content.e1CdBuff.text'),
      content: t('Content.e1CdBuff.content'),
      disabled: e < 1,
    },
    e2SkillDmgBuff: {
      id: 'e2SkillDmgBuff',
      formItem: 'switch',
      text: t('Content.e2SkillDmgBuff.text'),
      content: t('Content.e2SkillDmgBuff.content'),
      disabled: e < 2,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Skills
      x.CR.buff((r.talentEnhancedState) ? talentCrBuff : 0, SOURCE_TALENT)
      x.ATK_P.buff((r.talentEnhancedState) ? r.talentHpDrainAtkBuff : 0, SOURCE_TALENT)

      // Traces
      x.RES.buff((r.talentEnhancedState) ? 0.35 : 0, SOURCE_TRACE)

      r.talentEnhancedState && buffAbilityDmg(x, ULT_DMG_TYPE, 0.20, SOURCE_TRACE)

      // Eidolons
      x.CD.buff((e >= 1 && r.e1CdBuff) ? 0.24 : 0, SOURCE_E1)
      x.CD.buff((e >= 6 && r.talentEnhancedState) ? 0.50 : 0, SOURCE_E6)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)

      x.SKILL_ATK_SCALING.buff((r.talentEnhancedState) ? skillEnhancedScaling : skillScaling, SOURCE_SKILL)
      x.SKILL_ATK_SCALING.buff((e >= 1 && r.talentEnhancedState && (context.enemyCount ?? context.enemyCount) == 1) ? 1 : 0, SOURCE_SKILL)

      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.ULT_ATK_SCALING.buff((e >= 1 && (context.enemyCount ?? context.enemyCount) == 1) ? 1 : 0, SOURCE_ULT)

      // BOOST
      buffAbilityDmg(x, SKILL_DMG_TYPE, (e >= 2 && r.talentEnhancedState && r.e2SkillDmgBuff) ? 0.80 : 0, SOURCE_E2)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}
