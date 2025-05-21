import { AbilityType, BREAK_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Radiant Streak

Basic ATK+1+20

Deals Fire DMG equal to 100% of Fugue's ATK to one designated enemy.

 Single 10

Lv6

Fiery Caress

Basic ATK+1+20

Deals Fire DMG equal to 100% of Fugue's ATK to one designated enemy and Fire DMG equal to 50% of Fugue's ATK to adjacent targets.

 Single 10 | Other 5

Lv6

Virtue Beckons Bliss

Skill-1+30

Grants one designated ally "Foxian Prayer". Enters the "Torrid Scorch" state, lasting for 3 turn(s). The duration reduces by 1 at the start of Fugue's every turn. "Foxian Prayer" only takes effect on the most recent target of Fugue's Skill.
The ally target with "Foxian Prayer" increases their Break Effect by 30% and can also reduce Toughness even when attacking enemies that don't have the corresponding Weakness Type, with the effect equivalent to 50% of the original Toughness Reduction value. This cannot stack with other Toughness Reduction effects that also ignore Weakness Type.
While in the "Torrid Scorch" state, Fugue enhances her Basic ATK. Every time an ally target with "Foxian Prayer" attacks, Fugue has a 100% base chance to reduce the attacked enemy target's DEF by 18%, lasting for 2 turn(s).

Lv10

Solar Splendor Shines Upon All

Ultimate130+5

Deals Fire DMG equal to 200% of Fugue's ATK to all enemies. This attack ignores Weakness Type to reduce all enemies' Toughness. And when breaking Weakness, triggers the Fire Weakness Break effect.

 All 20

Lv10

Fortune Follows Where Virtue Spreads

Talent

While Fugue is on the field, enemy targets will get additionally afflicted with "Cloudflame Luster," equal to 40% of their Max Toughness. When the initial Toughness is reduced to 0, "Cloudflame Luster" can continue to be reduced. When "Cloudflame Luster" is reduced to 0, the enemy will receive Weakness Break DMG again.
While Fugue is on the field and after allies attack Weakness Broken enemy targets, converts the Toughness Reduction of this attack into 1 instance of 100% Super Break DMG.

Super Break DMG
Super Break DMG increases with higher Break Effect, higher Toughness Reduction of the attack, and higher character levels.
Super Break DMG cannot CRIT Hit and is not affected by DMG Boost effects.
Super Break DMG is also considered Break DMG.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Percipient Shine

Technique

After using Technique, inflicts Daze on enemies within a certain area, lasting for 10 second(s). While Dazed, enemies will not actively attack ally targets.
After entering battle via actively attacking Dazed enemies, Fugue's action advances by 40%, with a 100% base chance to inflict each enemy target with the same DEF Reduction state as that applied by Fugue's Skill, lasting for 2 turn(s).


Stat Boosts

 +14.0 SPD
 +24.0% Break Effect
 +10.0% HP

Verdantia Renaissance

After ally targets break weakness, additionally delays the action of the enemy target by 15%.


Sylvan Enigma

Increases this unit's Break Effect by 30%. After using Skill for the first time, immediately recovers 1 Skill Point(s).


Phecda Primordia

When an enemy target's Weakness gets broken, increases teammates' (i.e., excluding this unit) Break Effect by 6%. If Fugue's Break Effect is 220% or higher, the Break Effect increase is boosted by an additional 12%, lasting for 2 turn(s). This effect can stack up to 2 time(s).



1 Earthbound I Was, Cloudward I Be

Ally target with "Foxian Prayer" increases their Weakness Break Efficiency by 50%.



2 Beatitude Dawns for the Worthy

When an enemy target's Weakness gets broken, Fugue regenerates 3 Energy. After using Ultimate, advances the action of all allies by 24%.



3 Verity Weaves Thoughts to Blade

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Bereft of Form, Which Name to Bear

Ally target with "Foxian Prayer" increases their Break DMG dealt by 20%.



5 Colored Cloud Rains Fortune

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Clairvoyance of Boom and Doom

Increases Fugue's Weakness Break Efficiency by 50%. While Fugue is in the "Torrid Scorch" state, "Foxian Prayer" takes effect on all allies.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Fugue')
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
  } = Source.character('1225')

  const skillBeValue = skill(e, 0.30, 0.33)
  const skillDefPenValue = skill(e, 0.18, 0.20)

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.00, 2.20)
  const superBreakScaling = talent(e, 1.00, 1.10)

  const defaults = {
    torridScorch: true,
    foxianPrayer: false,
    defReduction: true,
    superBreakDmg: true,
    e4BreakDmg: true,
    e6BreakEfficiency: true,
  }

  const teammateDefaults = {
    foxianPrayer: true,
    be220Buff: true,
    weaknessBreakBeStacks: 2,
    defReduction: true,
    superBreakDmg: true,
    e4BreakDmg: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    torridScorch: {
      id: 'torridScorch',
      formItem: 'switch',
      text: t('Content.torridScorch.text'),
      content: t('Content.torridScorch.content'),
    },
    foxianPrayer: {
      id: 'foxianPrayer',
      formItem: 'switch',
      text: t('Content.foxianPrayer.text'),
      content: t('Content.foxianPrayer.content', { BreakBuff: TsUtils.precisionRound(100 * skillBeValue) }),
    },
    defReduction: {
      id: 'defReduction',
      formItem: 'switch',
      text: t('Content.defReduction.text'),
      content: t('Content.defReduction.content', { DefShred: TsUtils.precisionRound(100 * skillDefPenValue) }),
    },
    superBreakDmg: {
      id: 'superBreakDmg',
      formItem: 'switch',
      text: t('Content.superBreakDmg.text'),
      content: t('Content.superBreakDmg.content', { SuperBreakMultiplier: TsUtils.precisionRound(100 * superBreakScaling) }),
    },
    e4BreakDmg: {
      id: 'e4BreakDmg',
      formItem: 'switch',
      text: t('Content.e4BreakDmg.text'),
      content: t('Content.e4BreakDmg.content'),
      disabled: e < 4,
    },
    e6BreakEfficiency: {
      id: 'e6BreakEfficiency',
      formItem: 'switch',
      text: t('Content.e6BreakEfficiency.text'),
      content: t('Content.e6BreakEfficiency.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    foxianPrayer: content.foxianPrayer,
    be220Buff: {
      id: 'be220Buff',
      formItem: 'switch',
      text: t('TeammateContent.be220Buff.text'),
      content: t('TeammateContent.be220Buff.content'),
    },
    weaknessBreakBeStacks: {
      id: 'weaknessBreakBeStacks',
      formItem: 'slider',
      text: t('TeammateContent.weaknessBreakBeStacks.text'),
      content: t('TeammateContent.weaknessBreakBeStacks.content'),
      min: 0,
      max: 2,
    },
    defReduction: content.defReduction,
    superBreakDmg: content.superBreakDmg,
    e4BreakDmg: content.e4BreakDmg,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_TALENT)
      }
    },
    initializeTeammateConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_TALENT)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BE.buff(0.30, SOURCE_TRACE)

      x.BREAK_EFFICIENCY_BOOST.buff((e >= 6 && r.e6BreakEfficiency) ? 0.50 : 0, SOURCE_E6)

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.BE.buffSingle((m.foxianPrayer) ? skillBeValue : 0, SOURCE_SKILL)

      x.SUPER_BREAK_MODIFIER.buffTeam((m.superBreakDmg) ? superBreakScaling : 0, SOURCE_TALENT)
      x.DEF_PEN.buffTeam((m.defReduction) ? skillDefPenValue : 0, SOURCE_SKILL)

      x.BREAK_EFFICIENCY_BOOST.buffSingle((e >= 1 && m.foxianPrayer) ? 0.50 : 0, SOURCE_E1)
      buffAbilityDmg(x, BREAK_DMG_TYPE, (e >= 4 && m.foxianPrayer && m.e4BreakDmg) ? 0.20 : 0, SOURCE_E4, Target.SINGLE)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.BE.buffTeam(t.weaknessBreakBeStacks * (0.06 + (t.be220Buff ? 0.12 : 0)), SOURCE_TRACE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {},
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}
