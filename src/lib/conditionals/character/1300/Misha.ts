import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

E—Excuse Me, Please!

Basic ATK+1+20

Deals Ice DMG equal to 100% of Misha's ATK to a single target enemy.

 Single 10

Lv6

R—Room Service!

Skill-1+30

Increases the Hits Per Action for Misha's next Ultimate by 1 hit(s). Deals Ice DMG equal to 200% of Misha's ATK to a single target enemy, and Ice DMG equal to 80% of Misha's ATK to adjacent targets.

 Single 20 | Other 10

Lv10

G—Gonna Be Late!

Ultimate100+5

Has 3 Hits Per Action by default. First, uses 1 hit to deal Ice DMG equal to 60% of Misha's ATK to a single target enemy. Then, the rest of the hits each deals Ice DMG equal to 60% of Misha's ATK to a single random enemy. Just before each hit lands, there is a 20% base chance to Freeze the target, lasting for 1 turn.
While Frozen, enemy targets cannot take any actions, and at the start of their turn, they receive Ice Additional DMG equal to 30% of Misha's ATK.
This Ultimate can possess up to 10 Hits Per Action. After the Ultimate is used, its Hits Per Action will be reset to the default level.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

 Single 10

Lv10

Horological Escapement

Talent

For every 1 Skill Point allies consume, Misha's next Ultimate delivers 1 more Hit(s) Per Action, and Misha regenerates 2 Energy.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Wait, You Are So Beautiful!

Technique

After using the Technique, creates a Special Dimension that lasts for 15 seconds. Enemies caught in the Special Dimension are inflicted with Dream Prison and stop all their actions. Upon entering battle against enemies afflicted with Dream Prison, increases the Hits Per Action for Misha's next Ultimate by 2 hit(s). Only 1 Dimension Effect created by allies can exist at the same time.


Stat Boosts

 +22.4% Ice DMG Boost
 +22.5% DEF
 +6.7% CRIT Rate

Release

Before the Ultimate's first hit, increases the base chance of Freezing the target by 80%.


Interlock

When using the Ultimate, increases the Effect Hit Rate by 60%, lasting until the end of the current Ultimate's action.


Transmission

When dealing DMG to Frozen enemies, increases CRIT DMG by 30%.



1 Whimsicality of Fancy

When using the Ultimate, for every enemy on the field, additionally increases the Hits Per Action for the current Ultimate by 1 hit(s), up to a maximum increase of 5 hit(s).



2 Yearning of Youth

Before each hit of the Ultimate lands, there is a 24% base chance of reducing the target's DEF by 16% for 3 turn(s).



3 Vestige of Happiness

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Visage of Kinship

Increases the DMG multiplier for each hit of the Ultimate by 6%.



5 Genesis of First Love

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Estrangement of Dream

When using the Ultimate, increases own DMG by 30%, lasting until the end of the turn. In addition, the next time the Skill is used, recovers 1 Skill Point(s) for the team.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Misha')
  const { basic, skill, ult } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
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
  } = Source.character('1312')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)
  let ultStackScaling = ult(e, 0.60, 0.65)
  ultStackScaling += (e >= 4 ? 0.06 : 0)

  const defaults = {
    ultHitsOnTarget: 10,
    enemyFrozen: true,
    e2DefReduction: true,
    e6UltDmgBoost: true,
  }

  const teammateDefaults = {
    e2DefReduction: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultHitsOnTarget: {
      id: 'ultHitsOnTarget',
      formItem: 'slider',
      text: t('Content.ultHitsOnTarget.text'),
      content: t('Content.ultHitsOnTarget.content', { ultStackScaling: TsUtils.precisionRound(100 * ultStackScaling) }),
      min: 1,
      max: 10,
    },
    enemyFrozen: {
      id: 'enemyFrozen',
      formItem: 'switch',
      text: t('Content.enemyFrozen.text'),
      content: t('Content.enemyFrozen.content'),
    },
    e2DefReduction: {
      id: 'e2DefReduction',
      formItem: 'switch',
      text: t('Content.e2DefReduction.text'),
      content: t('Content.e2DefReduction.content'),
      disabled: e < 2,
    },
    e6UltDmgBoost: {
      id: 'e6UltDmgBoost',
      formItem: 'switch',
      text: t('Content.e6UltDmgBoost.text'),
      content: t('Content.e6UltDmgBoost.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    e2DefReduction: content.e2DefReduction,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.CD.buff((r.enemyFrozen) ? 0.30 : 0, SOURCE_TRACE)

      x.ELEMENTAL_DMG.buff((e >= 6 && r.e6UltDmgBoost) ? 0.30 : 0, SOURCE_E6)

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultStackScaling * (r.ultHitsOnTarget), SOURCE_ULT)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(10 + 5 * (r.ultHitsOnTarget - 1), SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.DEF_PEN.buffTeam((e >= 2 && m.e2DefReduction) ? 0.16 : 0, SOURCE_E2)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {},
    gpuFinalizeCalculations: () => '',
  }
}
