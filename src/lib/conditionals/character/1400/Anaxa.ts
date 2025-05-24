import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition, countTeamPath } from 'lib/conditionals/conditionalUtils'
import { PathNames } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Pain, Brews Truth

Basic ATK+1+20

Deals Wind DMG equal to 100% of Anaxa's ATK to one designated enemy.

 Single 10

Lv6

Fractal, Exiles Fallacy

Skill-1+6

Deals Wind DMG equal to 70% of Anaxa's ATK to one designated enemy and additionally deals 4 instance(s) of DMG. Each instance of DMG deals Wind DMG equal to 70% of Anaxa's ATK to one random enemy, prioritizing Bouncing to enemy targets that have not been hit by this instance of Skill.
When used, for each attackable enemy on the field, this Skill has its DMG dealt increased by 20%.

 Single 10

Lv10

Sprouting Life Sculpts Earth

Ultimate140+5

Inflicts the "Sublimation" state on all enemies, then deals Wind DMG equal to 160% of Anaxa's ATK to all enemies.
In the "Sublimation" state, the targets will be simultaneously inflicted with Physical, Fire, Ice, Lightning, Wind, Quantum, and Imaginary Weaknesses, lasting until the start of the targets' turn. If the targets do not have Control RES, they are unable to take action in the "Sublimation" state.

 All 20

Lv10

Tetrad Wisdom Reigns Thrice

Talent

Each time Anaxa lands 1 hit on enemy targets, inflicts 1 Weakness of a random Type to the targets, lasting for 3 turn(s), with priority to the Weakness Type that the target doesn't already possess.
While Anaxa is on the field, inflicts the "Qualitative Disclosure" state on enemy targets that have at least 5 different Types of Weaknesses. Anaxa deals 30% increased DMG to targets afflicted with the "Qualitative Disclosure" state. In addition, after using Basic ATK or Skill on them, unleashes 1 additional instance of Skill on the targets. This additional Skill does not consume any Skill Points and cannot trigger this effect again. If the target has been defeated before the additional Skill is used, it will be cast on one random enemy instead.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Prism of the Pupil

Technique

After using Technique, inflicts the Terrified state on enemies in a set area. Terrified enemies will flee in a direction away from Anaxa for 10 second(s). When allies enter battle via actively attacking a Terrified enemy, it will always be considered as entering battle via attacking a Weakness. After entering battle, Anaxa applies 1 Weakness of the attacker's Type to every enemy target, lasting for 3 turn(s).


Stat Boosts

 +22.4% Wind DMG Boost
 +12.0% CRIT Rate
 +10.0% HP

Roaming Signifier

When using Basic ATK, additionally regenerates 10 Energy.
At the start of the turn, if there are no enemy targets in the "Qualitative Disclosure" state, immediately regenerates 30 Energy.


Imperative Hiatus

Based on the number of "Erudition" characters in the team, one of the following effects will be triggered in the current battle:
1 character: Increases Anaxa's CRIT DMG by 140%.
At least 2 characters: Increases DMG dealt by all allies by 50%.


Qualitative Shift

For every 1 different Weakness Type an enemy target has, the DMG that Anaxa deals to that target ignores 4% of their DEF. Up to a max of 7 Weakness Types can be taken into account for this effect.



1 Magician, Isolated by Stars

After using Skill for the first time, recovers 1 Skill Point(s). When using Skill to hit enemy targets, decreases the targets' DEF by 16%, lasting for 2 turn(s).



2 Soul, True to History

When enemy targets enter the battlefield, triggers 1 instance of the Talent's Weakness Implant effect, and reduces their All-Type RES by 20%.



3 Pupil, Etched into Cosmos

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Blaze, Plunged to Canyon

When using Skill, increases ATK by 30%, lasting for 2 turn(s). This effect can stack up to 2 time(s).



5 Embryo, Set Beyond Vortex

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Everything Is in Everything

The DMG dealt by Anaxa is 130% of the original DMG. The 2 effects in the Trace "Imperative Hiatus" will be triggered directly and will no longer depend on the number of "Erudition" characters in the team.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Anaxa.Content')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
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
  } = Source.character('1405')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.70, 0.77)
  const ultScaling = ult(e, 1.60, 1.76)
  const talentDmgScaling = talent(e, 0.30, 0.324)

  const defaults = {
    skillHits: 4,
    exposedNature: true,
    eruditionTeammateBuffs: true,
    enemyWeaknessTypes: 7,
    e1DefPen: true,
    e2ResPen: true,
    e4AtkBuffStacks: 2,
    e6Buffs: true,
  }

  const teammateDefaults = {
    eruditionTeammateBuffs: true,
    e1DefPen: true,
    e2ResPen: true,
    e6Buffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillHits: {
      id: 'skillHits',
      formItem: 'slider',
      text: t('skillHits.text'),
      content: t('skillHits.content'),
      min: 0,
      max: 4,
    },
    exposedNature: {
      id: 'exposedNature',
      formItem: 'switch',
      text: t('exposedNature.text'),
      content: t('exposedNature.content', { DmgBuff: TsUtils.precisionRound(100 * talentDmgScaling) }),
    },
    eruditionTeammateBuffs: {
      id: 'eruditionTeammateBuffs',
      formItem: 'switch',
      text: t('eruditionTeammateBuffs.text'),
      content: t('eruditionTeammateBuffs.content'),
    },
    enemyWeaknessTypes: {
      id: 'enemyWeaknessTypes',
      formItem: 'slider',
      text: t('enemyWeaknessTypes.text'),
      content: t('enemyWeaknessTypes.content'),
      min: 0,
      max: 7,
    },
    e1DefPen: {
      id: 'e1DefPen',
      formItem: 'switch',
      text: t('e1DefPen.text'),
      content: t('e1DefPen.content'),
      disabled: e < 1,
    },
    e2ResPen: {
      id: 'e2ResPen',
      formItem: 'switch',
      text: t('e2ResPen.text'),
      content: t('e2ResPen.content'),
      disabled: e < 2,
    },
    e4AtkBuffStacks: {
      id: 'e4AtkBuffStacks',
      formItem: 'slider',
      text: t('e4AtkBuffStacks.text'),
      content: t('e4AtkBuffStacks.content'),
      min: 0,
      max: 2,
      disabled: e < 4,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: t('e6Buffs.text'),
      content: t('e6Buffs.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    eruditionTeammateBuffs: content.eruditionTeammateBuffs,
    e1DefPen: content.e1DefPen,
    e2ResPen: content.e2ResPen,
    e6Buffs: content.e6Buffs,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling * (1 + r.skillHits), SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      x.SKILL_DMG_BOOST.buff(context.enemyCount * 0.20, SOURCE_SKILL)

      x.DEF_PEN.buff(r.enemyWeaknessTypes * 0.04, SOURCE_TRACE)
      x.ELEMENTAL_DMG.buff((r.exposedNature) ? talentDmgScaling : 0, SOURCE_TALENT)

      x.ATK_P.buff((e >= 4) ? r.e4AtkBuffStacks * 0.30 : 0, SOURCE_E4)
      x.FINAL_DMG_BOOST.buff((e >= 6 && r.e6Buffs) ? 0.30 : 0, SOURCE_E6)

      const eruditionMembers = countTeamPath(context, PathNames.Erudition)
      x.CD.buff((r.eruditionTeammateBuffs && eruditionMembers == 1 || e >= 6 && r.e6Buffs) ? 1.40 : 0, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(10 + (r.skillHits) * 10, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      const eruditionMembers = countTeamPath(context, PathNames.Erudition)
      x.ELEMENTAL_DMG.buff((m.eruditionTeammateBuffs && eruditionMembers >= 2 || e >= 6 && m.e6Buffs) ? 0.50 : 0, SOURCE_TRACE)

      x.DEF_PEN.buff((e >= 1 && m.e1DefPen) ? 0.16 : 0, SOURCE_E1)
      x.RES_PEN.buffTeam((e >= 2 && m.e2ResPen) ? 0.20 : 0, SOURCE_E2)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}
