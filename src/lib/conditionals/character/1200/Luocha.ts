import { AbilityType, NONE_TYPE, SKILL_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardAtkHealFinalizer, standardAtkHealFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Thorns of the Abyss

Basic ATK+1+20

Deals Imaginary DMG equal to 100% of Luocha's ATK to a single enemy.

 Single 10

Lv6

Prayer of Abyss Flower

Skill-1+30

After using his Skill, Luocha immediately restores the target ally's HP equal to 60% of Luocha's ATK plus 800. Meanwhile, Luocha gains 1 stack of Abyss Flower.
When any ally's HP percentage drops to 50% or lower, an effect equivalent to Luocha's Skill will immediately be triggered and applied to this ally for one time (without consuming Skill Points). This effect can be triggered again after 2 turn(s).

Lv10

Death Wish

Ultimate100+5

Removes 1 buff(s) from all enemies and deals all enemies Imaginary DMG equal to 200% of Luocha's ATK. At the same time, Luocha gains 1 stack of Abyss Flower.

 All 20

Lv10

Cycle of Life

Talent

When Abyss Flower reaches 2 stacks, Luocha consumes all stacks of Abyss Flower to deploy a Zone against the enemy.
When any enemy in the Zone is attacked by an ally, the attacking ally's HP is immediately restored by an amount equal to 18% of Luocha's ATK plus 240.
The Zone's effect lasts for 2 turns. When Luocha is knocked down, the Zone will be dispelled.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Mercy of a Fool

Technique

After the Technique is used, the Talent will be immediately triggered at the start of the next battle.


Stat Boosts

 +28.0% ATK
 +18.0% HP
 +12.5% DEF

Cleansing Revival

When Skill's effect is triggered, dispel 1 debuff(s) from one designated ally.


Sanctified

When any enemy in the Zone is attacked by an ally, all allies (except the attacker) restore HP equal to 7% of Luocha's ATK plus 93.


Through the Valley

Increases the chance to resist Crowd Control debuffs by 70%.

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.



1 Ablution of the Quick

While the Zone is active, ATK of all allies increases by 20%.



2 Bestowal From the Pure

When his Skill is triggered, if the target ally's HP percentage is lower than 50%, Luocha's Outgoing Healing increases by 30%. If the target ally's HP percentage is at 50% or higher, the ally receives a Shield that can absorb DMG equal to 18% of Luocha's ATK plus 240, lasting for 2 turns.



3 Surveyal by the Fool

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Heavy Lies the Crown

When Luocha's Zone is active, enemies become Weakened and deal 12% less DMG.



5 Cicatrix 'Neath the Pain

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Reunion With the Dust

When Ultimate is used, there is a 100% fixed chance to reduce all enemies' All-Type RES by 20% for 2 turn(s).
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Luocha')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
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
  } = Source.character('1203')

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.00, 2.16)

  const skillHealScaling = skill(e, 0.60, 0.64)
  const skillHealFlat = skill(e, 800, 890)

  const talentHealScaling = talent(e, 0.18, 0.192)
  const talentHealFlat = talent(e, 240, 267)

  const defaults = {
    healAbility: NONE_TYPE,
    fieldActive: true,
    e6ResReduction: true,
  }

  const teammateDefaults = {
    fieldActive: true,
    e6ResReduction: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    healAbility: {
      id: 'healAbility',
      formItem: 'select',
      text: tHeal('Text'),
      content: tHeal('Content'),
      options: [
        {
          display: tHeal('Skill'),
          value: SKILL_DMG_TYPE,
          label: tHeal('Skill'),
        },
        {
          display: tHeal('Talent'),
          value: NONE_TYPE,
          label: tHeal('Talent'),
        },
      ],
      fullWidth: true,
    },
    fieldActive: {
      id: 'fieldActive',
      formItem: 'switch',
      text: t('Content.fieldActive.text'),
      content: t('Content.fieldActive.content'),
      // disabled: e < 1, Not disabling this one since technically the field can be active at E0
    },
    e6ResReduction: {
      id: 'e6ResReduction',
      formItem: 'switch',
      text: t('Content.e6ResReduction.text'),
      content: t('Content.e6ResReduction.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    fieldActive: content.fieldActive,
    e6ResReduction: content.e6ResReduction,
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
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      if (r.healAbility == SKILL_DMG_TYPE) {
        x.HEAL_TYPE.set(SKILL_DMG_TYPE, SOURCE_SKILL)
        x.HEAL_SCALING.buff(skillHealScaling, SOURCE_SKILL)
        x.HEAL_FLAT.buff(skillHealFlat, SOURCE_SKILL)
      }
      if (r.healAbility == NONE_TYPE) {
        x.HEAL_TYPE.set(NONE_TYPE, SOURCE_TALENT)
        x.HEAL_SCALING.buff(talentHealScaling, SOURCE_TALENT)
        x.HEAL_FLAT.buff(talentHealFlat, SOURCE_TALENT)
      }

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.ATK_P.buffTeam((e >= 1 && m.fieldActive) ? 0.20 : 0, SOURCE_E1)

      x.RES_PEN.buffTeam((e >= 6 && m.e6ResReduction) ? 0.20 : 0, SOURCE_E6)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
      standardAtkHealFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardAtkHealFinalizer(),
  }
}
