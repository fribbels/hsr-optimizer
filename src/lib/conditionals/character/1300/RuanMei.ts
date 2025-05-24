import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Threading Fragrance

Basic ATK+1+20

Deals Ice DMG equal to 100% of Ruan Mei's ATK to a single target enemy.

 Single 10

Lv6

String Sings Slow Swirls

Skill-1+30

After using her Skill, Ruan Mei gains Overtone, lasting for 3 turn(s). This duration decreases by 1 at the start of Ruan Mei's every turn. When Ruan Mei has Overtone, all allies' DMG increases by 32% and Weakness Break Efficiency increases by 50%.

Lv10

Petals to Stream, Repose in Dream

Ultimate130+5

Ruan Mei deploys a Zone that lasts for 2 turns. The Zone's duration decreases by 1 at the start of her turn.
While inside the Zone, all allies' All-Type RES PEN increases by 25% and their attacks apply Thanatoplum Rebloom to the enemies hit.
When these enemies attempt to recover from Weakness Break, Thanatoplum Rebloom is triggered, extending the duration of their Weakness Break, delaying their action by an amount equal to 20% of Ruan Mei's Break Effect plus 10%, and dealing Break DMG equal to 50% of Ruan Mei's Ice Break DMG.
Enemy targets cannot have Thanatoplum Rebloom re-applied to them until they recover from Weakness Break.

Break DMG
Break DMG increases with higher Break Effect, higher target max Toughness, and higher character levels.
Break DMG cannot CRIT Hit and is not affected by DMG Boost effects.

Lv10

Somatotypical Helix

Talent

Increases SPD by 10% for all teammates (i.e., excluding this unit). When allies Break an enemy target's Weakness, Ruan Mei deals to this enemy target Break DMG equal to 120% of her Ice Break DMG.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Silken Serenade

Technique

After using the Technique, gains Silken Serenade. At the start of the next battle, automatically triggers the Skill for 1 time(s) without consuming Skill Points.
In Simulated Universe or Divergent Universe, when Ruan Mei has Silken Serenade, the team actively attacking enemies will always be regarded as attacking their Weakness to enter battle, and this attack can reduce all enemies' Toughness regardless of Weakness types. When breaking Weakness, triggers Weakness Break Effect corresponding to the attacker's Type. For every Blessing in possession (up to a max of 20 Blessings will be taken into account), additionally increases the Toughness Reduction of this attack by 100%. After breaking an enemy target's Weakness, additionally deals to the enemy target Break DMG equal to 100% of Ruan Mei's Ice Break DMG.


Stat Boosts

 +37.3% Break Effect
 +22.5% DEF
 +5.0 SPD

Inert Respiration

Increases Break Effect by 20% for all allies.


Days Wane, Thoughts Wax

Ruan Mei regenerates 5 Energy at the start of her turn.


Candle Lights on Still Waters

In battle, for every 10% of Ruan Mei's Break Effect that exceeds 120%, her Skill additionally increases allies' DMG by 6%, up to a maximum of 36%.



1 Neuronic Embroidery

While the Ultimate's Zone is deployed, the DMG dealt by all allies ignores 20% of the target's DEF.



2 Reedside Promenade

While Ruan Mei is on the field, all allies increase their ATK by 40% when dealing DMG to enemies that are Weakness Broken.



3 Viridescent Pirouette

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Chatoyant Éclat

When an enemy target's Weakness is Broken, Ruan Mei's Break Effect increases by 100% for 3 turn(s).



5 Languid Barrette

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Sash Cascade

Extends the duration of the Ultimate's Zone by 1 turn(s). The Talent's Break DMG multiplier additionally increases by 200%.

Break DMG
Break DMG increases with higher Break Effect, higher target max Toughness, and higher character levels.
Break DMG cannot CRIT Hit and is not affected by DMG Boost effects.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.RuanMei')
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
  } = Source.character('1303')

  const fieldResPenValue = ult(e, 0.25, 0.27)
  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.32, 0.352)
  const talentSpdScaling = talent(e, 0.10, 0.104)

  const defaults = {
    skillOvertoneBuff: true,
    teamBEBuff: true,
    ultFieldActive: true,
    e2AtkBoost: false,
    e4BeBuff: false,
  }

  const teammateDefaults = {
    skillOvertoneBuff: true,
    teamSpdBuff: true,
    teamBEBuff: true,
    ultFieldActive: true,
    e2AtkBoost: false,
    teamDmgBuff: 0.36,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillOvertoneBuff: {
      id: 'skillOvertoneBuff',
      formItem: 'switch',
      text: t('Content.skillOvertoneBuff.text'),
      content: t('Content.skillOvertoneBuff.content', { skillScaling: TsUtils.precisionRound(100 * skillScaling) }),
    },
    teamBEBuff: {
      id: 'teamBEBuff',
      formItem: 'switch',
      text: t('Content.teamBEBuff.text'),
      content: t('Content.teamBEBuff.content'),
    },
    ultFieldActive: {
      id: 'ultFieldActive',
      formItem: 'switch',
      text: t('Content.ultFieldActive.text'),
      content: t('Content.ultFieldActive.content', { fieldResPenValue: TsUtils.precisionRound(100 * fieldResPenValue) }),
    },
    e2AtkBoost: {
      id: 'e2AtkBoost',
      formItem: 'switch',
      text: t('Content.e2AtkBoost.text'),
      content: t('Content.e2AtkBoost.content'),
      disabled: (e < 2),
    },
    e4BeBuff: {
      id: 'e4BeBuff',
      formItem: 'switch',
      text: t('Content.e4BeBuff.text'),
      content: t('Content.e4BeBuff.content'),
      disabled: (e < 4),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillOvertoneBuff: content.skillOvertoneBuff,
    teamSpdBuff: {
      id: 'teamSpdBuff',
      formItem: 'switch',
      text: t('TeammateContent.teamSpdBuff.text'),
      content: t('TeammateContent.teamSpdBuff.content', { talentSpdScaling: TsUtils.precisionRound(100 * talentSpdScaling) }),
    },
    teamBEBuff: content.teamBEBuff,
    teamDmgBuff: {
      id: 'teamDmgBuff',
      formItem: 'slider',
      text: t('TeammateContent.teamDmgBuff.text'),
      content: t('TeammateContent.teamDmgBuff.content'),
      min: 0,
      max: 0.36,
      percent: true,
    },
    ultFieldActive: content.ultFieldActive,
    e2AtkBoost: content.e2AtkBoost,
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ATK_P.buff((e >= 2 && r.e2AtkBoost) ? 0.40 : 0, SOURCE_E2)
      x.BE.buff((e >= 4 && r.e4BeBuff) ? 1.00 : 0, SOURCE_E4)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.BE.buffTeam((m.teamBEBuff) ? 0.20 : 0, SOURCE_TRACE)

      x.ELEMENTAL_DMG.buffTeam((m.skillOvertoneBuff) ? skillScaling : 0, SOURCE_SKILL)
      x.BREAK_EFFICIENCY_BOOST.buffTeam((m.skillOvertoneBuff) ? 0.50 : 0, SOURCE_SKILL)

      x.RES_PEN.buffTeam((m.ultFieldActive) ? fieldResPenValue : 0, SOURCE_ULT)
      x.DEF_PEN.buffTeam((e >= 1 && m.ultFieldActive) ? 0.20 : 0, SOURCE_E1)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.SPD_P.buffTeam((t.teamSpdBuff) ? talentSpdScaling : 0, SOURCE_TALENT)
      x.ELEMENTAL_DMG.buffTeam(t.teamDmgBuff, SOURCE_TRACE)

      x.ATK_P_BOOST.buffTeam((e >= 2 && t.e2AtkBoost) ? 0.40 : 0, SOURCE_E2)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const beOver = Math.floor(TsUtils.precisionRound((x.a[Key.BE] * 100 - 120) / 10))
      const buffValue = Math.min(0.36, Math.max(0, beOver) * 0.06)
      x.ELEMENTAL_DMG.buff(buffValue, SOURCE_TRACE)
    },
    gpuFinalizeCalculations: () => {
      return `
let beOver = (x.BE * 100 - 120) / 10;
let buffValue: f32 = min(0.36, floor(max(0, beOver)) * 0.06);
x.ELEMENTAL_DMG += buffValue;
      `
    },
  }
}
