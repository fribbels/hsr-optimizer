import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Swing Dance Etiquette

Basic ATK+1+20

Deals Imaginary DMG equal to 100% of the Trailblazer's ATK to a single enemy.

 Single 10

Lv6

Halftime to Make It Rain

Skill-1+6

Deals Imaginary DMG equal to 50% of the Trailblazer's ATK to a single enemy and deals DMG for 4 extra times, dealing Imaginary DMG equal to 50% of the Trailblazer's ATK to a random enemy each time.
Hidden Stat: 2

 Single 10 | Other 10

Lv10

All-Out Footlight Parade

Ultimate140+5

Applies the Backup Dancer effect to all allies, lasting for 3 turn(s). Decreases its duration by 1 turn at the start of Trailblazer's every turn. Allies with Backup Dancer increase their Break Effect by 30%. When they attack enemy targets that are in the Weakness Broken state, they will convert the Toughness-Reducing DMG of this attack to Super Break DMG 1 time.
Hidden Stat: 1

Weakness Break State
When enemy targets' Toughness is reduced to 0, they will enter the Weakness Break State, which delays their actions.

Super Break DMG
Super Break DMG increases with higher Break Effect, higher Toughness-Reducing DMG from this attack, and higher character levels.
Super Break DMG cannot CRIT Hit and is not affected by DMG Boost effects.

 All 10

Lv10

Full-on Aerial Dance

Talent

The Trailblazer immediately regenerates 10 Energy when an enemy target's Weakness is Broken.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Now! I'm the Band!

Technique

After using the Technique, at the start of the next battle, all allies' Break Effect increases by 30%, lasting for 2 turn(s).


Stat Boosts

 +37.3% Break Effect
 +14.4% Imaginary DMG Boost
 +10.0% Effect RES

Dance With the One

When there are 5 or more/4/3/2/1 enemy target(s) currently on the field, the Super Break DMG triggered by the Backup Dancer effect increases by 20.0%/30.0%/40.0%/50.0%/60.0%.


Shuffle Along

When using Skill, increase the first Toughness-Reducing DMG inflicted in a battle by 100.0%.


Hat of the Theater

Additionally delays the enemy target's action by 30.0% when teammates Break enemy Weaknesses.



1 Best Seat in the House

Recovers 1.0 Skill Point(s) after using the Skill for the first time in a battle.



2 Jailbreaking Rainbowwalk

At the start of the battle, the Trailblazer's Energy Regeneration Rate increases by 25.0%, lasting for 3.0 turn(s).



3 Sanatorium for Rest Notes

Skill Lv. +2, up to a maximum of Lv. 15. Talent Lv. +2, up to a maximum of Lv. 15.



4 Dove in Tophat

While the Trailblazer is on the field, increase the Break Effect of all allies except the Trailblazer. The increase is equal to 15.0% of the Trailblazer's Break Effect.



5 Poem Favors Rhythms of Old

Ultimate Lv. +2, up to a maximum of Lv. 15. Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Tomorrow, Rest in Spotlight

Increases the Skill's additional DMG by 2.0 hit(s).
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TrailblazerHarmony')
  const { basic, skill, ult } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('8006')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.50, 0.55)
  const ultBeScaling = ult(e, 0.30, 0.33)
  const skillMaxHits = e >= 6 ? 6 : 4

  const targetsToSuperBreakMulti: Record<number, number> = {
    1: 1.60,
    3: 1.40,
    5: 1.20,
  }

  const defaults = {
    skillHitsOnTarget: skillMaxHits,
    backupDancer: true,
    superBreakDmg: true,
    e2EnergyRegenBuff: false,
  }

  const teammateDefaults = {
    backupDancer: true,
    superBreakDmg: true,
    teammateBeValue: 2.00,
  }

  const content: ContentDefinition<typeof defaults> = {
    backupDancer: {
      id: 'backupDancer',
      formItem: 'switch',
      text: t('Content.backupDancer.text'),
      content: t('Content.backupDancer.content', { ultBeScaling: TsUtils.precisionRound(100 * ultBeScaling) }),
    },
    superBreakDmg: {
      id: 'superBreakDmg',
      formItem: 'switch',
      text: t('Content.superBreakDmg.text'),
      content: t('Content.superBreakDmg.content'),
    },
    skillHitsOnTarget: {
      id: 'skillHitsOnTarget',
      formItem: 'slider',
      text: t('Content.skillHitsOnTarget.text'),
      content: t('Content.skillHitsOnTarget.content'),
      min: 0,
      max: skillMaxHits,
    },
    e2EnergyRegenBuff: {
      id: 'e2EnergyRegenBuff',
      formItem: 'switch',
      text: t('Content.e2EnergyRegenBuff.text'),
      content: t('Content.e2EnergyRegenBuff.content'),
      disabled: e < 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    backupDancer: content.backupDancer,
    superBreakDmg: content.superBreakDmg,
    teammateBeValue: {
      id: 'teammateBeValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateBeValue.text'),
      content: t('TeammateContent.teammateBeValue.content'),
      min: 0,
      max: 4.00,
      percent: true,
      disabled: e < 4,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_ULT)
      }
    },
    initializeTeammateConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_ULT)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ERR.buff((e >= 2 && r.e2EnergyRegenBuff) ? 0.25 : 0, SOURCE_E2)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.SKILL_ATK_SCALING.buff(r.skillHitsOnTarget * skillScaling, SOURCE_SKILL)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(10 * r.skillHitsOnTarget, SOURCE_SKILL)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.BE.buffTeam((m.backupDancer) ? ultBeScaling : 0, SOURCE_ULT)
      x.SUPER_BREAK_MODIFIER.buffTeam(
        (m.backupDancer && m.superBreakDmg)
          ? targetsToSuperBreakMulti[context.enemyCount]
          : 0,
        SOURCE_ULT)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const beBuff = (e >= 4) ? 0.15 * t.teammateBeValue : 0
      x.BE.buffTeam(beBuff, SOURCE_E4)
      x.UNCONVERTIBLE_BE_BUFF.buffTeam(beBuff, SOURCE_E4)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
    },
    gpuFinalizeCalculations: () => '',
  }
}
