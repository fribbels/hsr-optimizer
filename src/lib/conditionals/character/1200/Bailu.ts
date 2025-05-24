import { AbilityType, NONE_TYPE, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardHpHealFinalizer, standardHpHealFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Diagnostic Kick

Basic ATK+1+20

Deals Lightning DMG equal to 100% of Bailu's ATK to a single enemy.

 Single 10

Lv6

Singing Among Clouds

Skill-1+30

Heals a single ally for 11.7% of Bailu's Max HP plus 312. Bailu then heals random allies 2 time(s). After each healing, HP restored from the next healing is reduced by 15%.

Lv10

Felicitous Thunderleap

Ultimate100+5

Heals all allies for 13.5% of Bailu's Max HP plus 360.
Bailu applies Invigoration to allies that are not already Invigorated. For those already Invigorated, Bailu extends the duration of their Invigoration by 1 turn.
The effect of Invigoration can last for 2 turn(s). This effect cannot stack.

Lv10

Gourdful of Elixir

Talent

After an ally target with Invigoration is hit, restores the ally's HP for 5.4% of Bailu's Max HP plus 144. This effect can trigger 2 time(s).
When Bailu's teammate receives a killing blow, they will not be knocked down. Bailu immediately heals the ally for 18% of Bailu's Max HP plus 480 HP. This effect can be triggered 1 time per battle.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Saunter in the Rain

Technique

After Technique is used, at the start of the next battle, all allies are granted Invigoration for 2 turn(s).


Stat Boosts

 +28.0% HP
 +22.5% DEF
 +10.0% Effect RES

Qihuang Analects

When Bailu heals a target ally above their normal Max HP, the target's Max HP increases by 10% for 2 turns.


Vidyadhara Ichor Lines

Invigoration can trigger 1 more time(s).


Aquatic Benediction

Characters with Invigoration receive 10% less DMG.



1 Ambrosial Aqua

If the target ally's current HP is equal to their Max HP when Invigoration ends, regenerates 8 extra Energy for this target.



2 Sylphic Slumber

After using her Ultimate, Bailu's Outgoing Healing increases by an additional 15% for 2 turn(s).



3 Omniscient Opulence

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Evil Excision

Every healing provided by the Skill makes the recipient deal 10% more DMG for 2 turn(s). This effect can stack up to 3 time(s).



5 Waning Worries

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Drooling Drop of Draconic Divinity

Bailu can heal allies who received a killing blow 1 more time(s) in a single battle.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Bailu')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('1211')

  const basicScaling = basic(e, 1.0, 1.1)

  const skillHealScaling = skill(e, 0.117, 0.1248)
  const skillHealFlat = skill(e, 312, 347.1)

  const ultHealScaling = ult(e, 0.135, 0.144)
  const ultHealFlat = ult(e, 360, 400.5)

  const talentHealScaling = talent(e, 0.054, 0.0576)
  const talentHealFlat = talent(e, 144, 160.2)

  const defaults = {
    healAbility: ULT_DMG_TYPE,
    healingMaxHpBuff: true,
    talentDmgReductionBuff: true,
    e2UltHealingBuff: true,
    e4SkillHealingDmgBuffStacks: 0,
  }

  const teammateDefaults = {
    healingMaxHpBuff: true,
    talentDmgReductionBuff: true,
    e4SkillHealingDmgBuffStacks: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    healAbility: {
      id: 'healAbility',
      formItem: 'select',
      text: tHeal('Text'),
      content: tHeal('Content'),
      options: [
        { display: tHeal('Skill'), value: SKILL_DMG_TYPE, label: tHeal('Skill') },
        { display: tHeal('Ult'), value: ULT_DMG_TYPE, label: tHeal('Ult') },
        { display: tHeal('Talent'), value: NONE_TYPE, label: tHeal('Talent') },
      ],
      fullWidth: true,
    },
    healingMaxHpBuff: {
      id: 'healingMaxHpBuff',
      formItem: 'switch',
      text: t('Content.healingMaxHpBuff.text'),
      content: t('Content.healingMaxHpBuff.content'),
    },
    talentDmgReductionBuff: {
      id: 'talentDmgReductionBuff',
      formItem: 'switch',
      text: t('Content.talentDmgReductionBuff.text'),
      content: t('Content.talentDmgReductionBuff.content'),
    },
    e2UltHealingBuff: {
      id: 'e2UltHealingBuff',
      formItem: 'switch',
      text: t('Content.e2UltHealingBuff.text'),
      content: t('Content.e2UltHealingBuff.content'),
      disabled: e < 2,
    },
    e4SkillHealingDmgBuffStacks: {
      id: 'e4SkillHealingDmgBuffStacks',
      formItem: 'slider',
      text: t('Content.e4SkillHealingDmgBuffStacks.text'),
      content: t('Content.e4SkillHealingDmgBuffStacks.content'),
      min: 0,
      max: 3,
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    healingMaxHpBuff: content.healingMaxHpBuff,
    talentDmgReductionBuff: content.talentDmgReductionBuff,
    e4SkillHealingDmgBuffStacks: content.e4SkillHealingDmgBuffStacks,
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
      x.OHB.buff((e >= 2 && r.e2UltHealingBuff) ? 0.15 : 0, SOURCE_E2)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)

      if (r.healAbility == SKILL_DMG_TYPE) {
        x.HEAL_TYPE.set(SKILL_DMG_TYPE, SOURCE_SKILL)
        x.HEAL_SCALING.buff(skillHealScaling, SOURCE_SKILL)
        x.HEAL_FLAT.buff(skillHealFlat, SOURCE_SKILL)
      }
      if (r.healAbility == ULT_DMG_TYPE) {
        x.HEAL_TYPE.set(ULT_DMG_TYPE, SOURCE_ULT)
        x.HEAL_SCALING.buff(ultHealScaling, SOURCE_ULT)
        x.HEAL_FLAT.buff(ultHealFlat, SOURCE_ULT)
      }
      if (r.healAbility == NONE_TYPE) {
        x.HEAL_TYPE.set(NONE_TYPE, SOURCE_TALENT)
        x.HEAL_SCALING.buff(talentHealScaling, SOURCE_TALENT)
        x.HEAL_FLAT.buff(talentHealFlat, SOURCE_TALENT)
      }

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.HP_P.buffTeam((m.healingMaxHpBuff) ? 0.10 : 0, SOURCE_TRACE)

      x.ELEMENTAL_DMG.buffTeam((e >= 4) ? m.e4SkillHealingDmgBuffStacks * 0.10 : 0, SOURCE_E4)
      x.DMG_RED_MULTI.multiplyTeam((m.talentDmgReductionBuff) ? (1 - 0.10) : 1, SOURCE_TRACE)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
      standardHpHealFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardHpHealFinalizer(),
  }
}
