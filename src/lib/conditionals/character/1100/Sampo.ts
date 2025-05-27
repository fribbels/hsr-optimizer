import { AbilityType, DOT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityVulnerability, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Dazzling Blades

Basic ATK+1+20

Deals Wind DMG equal to 100% of Sampo's ATK to a single enemy.

 Single 10

Lv6

Ricochet Love

Skill-1+6

Deals Wind DMG equal to 56% of Sampo's ATK to a single enemy, and further deals DMG for 4 extra time(s), with each time dealing Wind DMG equal to 56% of Sampo's ATK to a random enemy.

 Single 10

Lv10

Surprise Present

Ultimate120+5

Deals Wind DMG equal to 160% of Sampo's ATK to all enemies, with a 100% base chance to increase the targets' DoT taken by 30% for 2 turn(s).

 All 20

Lv10

Windtorn Dagger

Talent

Sampo's attacks have a 65% base chance to inflict Wind Shear for 3 turn(s).
Enemies inflicted with Wind Shear will take Wind DoT equal to 52% of Sampo's ATK at the beginning of each turn. Wind Shear can stack up to 5 time(s).

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Shining Bright

Technique

After Sampo uses his Technique, enemies in a set area are afflicted with Blind for 10 second(s). Blinded enemies cannot detect ally targets.
When initiating combat against a Blinded enemy, there is a 100% fixed chance to delay all enemies' action by 25%.


Stat Boosts

 +28.0% ATK
 +18.0% Effect Hit Rate
 +10.0% Effect RES

Trap

Extends the duration of Wind Shear caused by Talent by 1 turn(s).


Defensive Position

Using Ultimate additionally regenerates 10 Energy.


Spice Up

Enemies with Wind Shear effect deal 15% less DMG to Sampo.



1 Rising Love

When using Skill, deals DMG for 1 extra time(s) to a random enemy.



2 Infectious Enthusiasm

Defeating an enemy afflicted with Wind Shear has a 100% base chance to inflict all enemies with 1 stack(s) of Wind Shear, equivalent to that of Skill.



3 Big Money!

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 The Deeper the Love, the Stronger the Hate

When Skill hits an enemy with 5 or more stack(s) of Wind Shear, the enemy immediately takes 8% of current Wind Shear DMG.



5 Huuuuge Money!

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Increased Spending

Talent's Wind Shear DMG multiplier increases by 15%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sampo')
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
  } = Source.character('1108')

  const dotVulnerabilityValue = ult(e, 0.30, 0.32)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.56, 0.616)
  const ultScaling = ult(e, 1.60, 1.728)
  const dotScaling = talent(e, 0.52, 0.572)

  const maxExtraHits = e < 1 ? 4 : 5
  const defaults = {
    targetDotTakenDebuff: true,
    skillExtraHits: maxExtraHits,
    targetWindShear: true,
  }

  const teammateDefaults = {
    targetDotTakenDebuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    targetDotTakenDebuff: {
      id: 'targetDotTakenDebuff',
      formItem: 'switch',
      text: t('Content.targetDotTakenDebuff.text'),
      content: t('Content.targetDotTakenDebuff.content', { dotVulnerabilityValue: TsUtils.precisionRound(100 * dotVulnerabilityValue) }),
    },
    skillExtraHits: {
      id: 'skillExtraHits',
      formItem: 'slider',
      text: t('Content.skillExtraHits.text'),
      content: t('Content.skillExtraHits.content'),
      min: 1,
      max: maxExtraHits,
    },
    targetWindShear: {
      id: 'targetWindShear',
      formItem: 'switch',
      text: t('Content.targetWindShear.text'),
      content: t('Content.targetWindShear.content'),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    targetDotTakenDebuff: content.targetDotTakenDebuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.SKILL_ATK_SCALING.buff((r.skillExtraHits) * skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.DOT_ATK_SCALING.buff(dotScaling, SOURCE_TALENT)
      x.DOT_ATK_SCALING.buff((e >= 6) ? 0.15 : 0, SOURCE_E6)

      // Boost
      x.DMG_RED_MULTI.multiply((r.targetWindShear) ? (1 - 0.15) : 1, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(10 + 5 * r.skillExtraHits, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      x.DOT_CHANCE.set(0.65, SOURCE_TALENT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      buffAbilityVulnerability(x, DOT_DMG_TYPE, (m.targetDotTakenDebuff) ? dotVulnerabilityValue : 0, SOURCE_ULT, Target.TEAM)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}
