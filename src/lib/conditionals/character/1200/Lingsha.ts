import { AbilityType, ASHBLAZING_ATK_STACK, BREAK_DMG_TYPE, NONE_TYPE, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkP, gpuBoostAshblazingAtkP, gpuStandardAtkHealFinalizer, standardAtkHealFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityVulnerability, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Votive Incense

Basic ATK+1+20

Deals Fire DMG equal to 100% of Lingsha's ATK to a single target enemy.

 Single 10

Lv6

Smoke and Splendor

Skill-1+30

Deals Fire DMG equal to 80% of Lingsha's ATK to all enemies and at the same time, restores HP equal to 14% of Lingsha's ATK plus 420 for all allies. Fuyuan's action advances by 20%.

 All 10

Lv10

Dripping Mistscape

Ultimate110+5

Inflicts "Befog" on all enemies. While in "Befog," targets receive 25% increased Break DMG, lasting for 2 turn(s).
Deals Fire DMG equal to 150% of Lingsha's ATK to all enemies, and at the same time restores HP equal to 12% of Lingsha's ATK plus 360 for all allies. Fuyuan's action advances by 100%.

Break DMG
Break DMG increases with higher Break Effect, higher target max Toughness, and higher character levels.
Break DMG cannot CRIT Hit and is not affected by DMG Boost effects.

 All 20

Lv10

Mistdance Manifest

Talent

When using Skill, summons Fuyuan, with an initial SPD of 90 and an initial action count of 3.
When taking action, Fuyuan launches Follow-up ATK, dealing Fire DMG equal to 75% of Lingsha's ATK to all enemies. Additionally deals Fire DMG equal to 75% of Lingsha's ATK to a single random enemy, and this DMG prioritizes targets that have both Toughness greater than 0 and Fire Weakness. Dispels 1 debuff(s) from all allies and restores HP equal to 12% of Lingsha's ATK plus 360.
Fuyuan's action count can accumulate up to 5. When the action count reaches 0 or when Lingsha is knocked down, Fuyuan disappears.
While Fuyuan is on the field, using Skill can increase Fuyuan's action count by 3.

 All 10

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Wisps of Aurora

Technique

After using Technique, immediately summons Fuyuan at the start of the next battle and inflicts "Befog" on all enemies, lasting for 2 turn(s).


Stat Boosts

 +37.3% Break Effect
 +18.0% HP
 +10.0% ATK

Vermilion Waft

Increases this unit's ATK or Outgoing Healing by an amount equal to 25%/10% of Break Effect, up to a maximum increase of 50%/20% respectively.


Sylvan Smoke

When using Basic ATK, additionally regenerates 10 Energy.


Ember's Echo

While "Fuyuan" is on the field and any ally character takes DMG or consumes HP, if a character in the team has their current HP percentage lower than or equal to 60%, "Fuyuan" will immediately launch the Talent's Follow-up ATK against enemies. This does not consume Fuyuan's action count. This effect can trigger again after 2 turn(s).



1 Bloom on Vileward Bouquet

Lingsha's Weakness Break Efficiency increases by 50%. When an enemy unit's Weakness is Broken, reduces their DEF by 20%.



2 Leisure in Carmine Smokeveil

When using Ultimate, increases all allies' Break Effect by 40%, lasting for 3 turn(s).



3 Shine of Floral Wick

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Redolence from Canopied Banquet

When Fuyuan takes action, restores HP equal to 40% of Lingsha's ATK for the ally target whose current HP is the lowest.



5 Poise Atop Twists and Turns

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Arcadia Under Deep Seclusion

While "Fuyuan" is on the field, reduces all enemies' All-Type RES by 20%. When "Fuyuan" attacks, additionally deals 4 instance(s) of DMG, with each instance dealing Fire DMG equal to 50% of Lingsha's ATK and 5 Toughness Reduction to one random enemy. This prioritizes targets with both Toughness greater than 0 and Fire Weakness.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Lingsha')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
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
  } = Source.character('1222')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.80, 0.88)
  const ultScaling = ult(e, 1.50, 1.65)
  const ultBreakVulnerability = ult(e, 0.25, 0.27)
  const fuaScaling = talent(e, 0.75, 0.825)

  const skillHealScaling = skill(e, 0.14, 0.148)
  const skillHealFlat = skill(e, 420, 467.25)

  const ultHealScaling = ult(e, 0.12, 0.128)
  const ultHealFlat = ult(e, 360, 400.5)

  const talentHealScaling = talent(e, 0.12, 0.128)
  const talentHealFlat = talent(e, 360, 400.5)

  const hitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 2 + 2 * 1 / 2),
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 2 + 3 * 1 / 2),
    5: ASHBLAZING_ATK_STACK * (3 * 1 / 2 + 4 * 1 / 2),
  }

  const defaults = {
    healAbility: NONE_TYPE,
    beConversion: true,
    befogState: true,
    e1DefShred: true,
    e2BeBuff: true,
    e6ResShred: true,
  }

  const teammateDefaults = {
    befogState: true,
    e1DefShred: true,
    e2BeBuff: true,
    e6ResShred: true,
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
    beConversion: {
      id: 'beConversion',
      formItem: 'switch',
      text: t('Content.beConversion.text'),
      content: t('Content.beConversion.content'),
    },
    befogState: {
      id: 'befogState',
      formItem: 'switch',
      text: t('Content.befogState.text'),
      content: t('Content.befogState.content', {
        BefogVulnerability: TsUtils.precisionRound(100 * ultBreakVulnerability),
      }),
    },
    e1DefShred: {
      id: 'e1DefShred',
      formItem: 'switch',
      text: t('Content.e1DefShred.text'),
      content: t('Content.e1DefShred.content'),
      disabled: e < 1,
    },
    e2BeBuff: {
      id: 'e2BeBuff',
      formItem: 'switch',
      text: t('Content.e2BeBuff.text'),
      content: t('Content.e2BeBuff.content'),
      disabled: e < 2,
    },
    e6ResShred: {
      id: 'e6ResShred',
      formItem: 'switch',
      text: t('Content.e6ResShred.text'),
      content: t('Content.e6ResShred.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    befogState: content.befogState,
    e1DefShred: content.e1DefShred,
    e2BeBuff: content.e2BeBuff,
    e6ResShred: content.e6ResShred,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.SUMMONS.set(1, SOURCE_TALENT)
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.FUA_ATK_SCALING.buff(fuaScaling * 2, SOURCE_TALENT)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      x.BREAK_EFFICIENCY_BOOST.buff((e >= 1) ? 0.50 : 0, SOURCE_E1)
      x.FUA_ATK_SCALING.buff((e >= 6 && r.e6ResShred) ? 0.50 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(10, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(10 * 2, SOURCE_TALENT)
      x.FUA_TOUGHNESS_DMG.buff((e >= 6) ? 5 : 0, SOURCE_E6)

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
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      if (x.a[Key.ENEMY_WEAKNESS_BROKEN]) {
        x.DEF_PEN.buffTeam((e >= 1 && m.e1DefShred) ? 0.20 : 0, SOURCE_E1)
      }

      buffAbilityVulnerability(x, BREAK_DMG_TYPE, (m.befogState) ? ultBreakVulnerability : 0, SOURCE_ULT, Target.TEAM)

      x.BE.buffTeam((e >= 2 && m.e2BeBuff) ? 0.40 : 0, SOURCE_E2)
      x.RES_PEN.buffTeam((e >= 6 && m.e6ResShred) ? 0.20 : 0, SOURCE_E6)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, hitMultiByTargets[context.enemyCount])
      standardAtkHealFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkP(hitMultiByTargets[context.enemyCount]) + gpuStandardAtkHealFinalizer()
    },
    dynamicConditionals: [{
      id: 'LingshaConversionConditional',
      type: ConditionalType.ABILITY,
      activation: ConditionalActivation.CONTINUOUS,
      dependsOn: [Stats.BE],
      chainsTo: [Stats.ATK, Stats.OHB],
      condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
        return true
      },
      effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>
        if (!r.beConversion) {
          return
        }

        const stateValue = action.conditionalState[this.id] || 0
        const buffValueAtk = Math.min(0.50, 0.25 * x.a[Key.BE]) * context.baseATK
        const buffValueOhb = Math.min(0.20, 0.10 * x.a[Key.BE])

        const stateBuffValueAtk = Math.min(0.50, 0.25 * stateValue) * context.baseATK
        const stateBuffValueOhb = Math.min(0.20, 0.10 * stateValue)

        action.conditionalState[this.id] = x.a[Key.BE]

        const finalBuffAtk = buffValueAtk - (stateValue ? stateBuffValueAtk : 0)
        const finalBuffOhb = buffValueOhb - (stateValue ? stateBuffValueOhb : 0)

        x.ATK.buffDynamic(finalBuffAtk, SOURCE_TRACE, action, context)
        x.OHB.buffDynamic(finalBuffOhb, SOURCE_TRACE, action, context)
      },
      gpu: function (action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>

        return conditionalWgslWrapper(this, `
if (${wgslFalse(r.beConversion)}) {
  return;
}

let stateValue: f32 = (*p_state).LingshaConversionConditional;

let buffValueAtk = min(0.50, 0.25 * x.BE) * baseATK;
let buffValueOhb = min(0.20, 0.10 * x.BE);

let stateBuffValueAtk = min(0.50, 0.25 * stateValue) * baseATK;
let stateBuffValueOhb = min(0.20, 0.10 * stateValue);

(*p_state).LingshaConversionConditional = x.BE;

let finalBuffAtk = buffValueAtk - select(0.0, stateBuffValueAtk, stateValue > 0.0);
let finalBuffOhb = buffValueOhb - select(0.0, stateBuffValueOhb, stateValue > 0.0);

(*p_x).ATK += finalBuffAtk;
(*p_x).OHB += finalBuffOhb;
`)
      },
    }],
  }
}
