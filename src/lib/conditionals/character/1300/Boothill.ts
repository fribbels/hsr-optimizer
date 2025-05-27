import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Skullcrush Spurs

Basic ATK+1+20

Deals Physical DMG equal to 100% of Boothill's ATK to a single enemy.

 Single 10

Lv6

Fanning the Hammer

Basic ATK+30

Deals Physical DMG equal to 220% of Boothill's ATK to a single enemy target.
The Enhanced Basic Attack cannot recover Skill Points and can only target the enemy currently with Standoff.

 Single 20

Lv6

Sizzlin' Tango

Skill-1

Make a targeted enemy and Boothill enter the Standoff state. Boothill's Basic ATK becomes Enhanced, and he cannot use his Skill, lasting for 2 turn(s). The remaining turn count reduces by 1 at the start of Boothill's turn.
The enemy target in Standoff becomes Taunted. When the enemy target/Boothill receives an attack from the other, the DMG they receive increases by 30%/15%.
After this target is defeated or becomes Weakness Broken, Boothill obtains 1 stack of Pocket Trickshot, then dispels Standoff.
This Skill cannot regenerate Energy. This turn will not end after using this Skill.

Lv10

Dust Devil's Sunset Rodeo

Ultimate115+5

Apply Physical Weakness to a target enemy, lasting for 2 turn(s).
Deals Physical DMG equal to 400% of Boothill's ATK to the target and delays their action by 40%.

Action delayed
Increases the target's waiting interval before the next action.

 Single 30

Lv10

Five Peas in a Pod

Talent

Every stack of Pocket Trickshot increases the Enhanced Basic Attack's Toughness-Reducing DMG by 50%, stacking up to 3 stacks.
If the target is Weakness Broken when the Enhanced Basic Attack is used, for every stack of Pocket Trickshot, deals Break DMG to this target equal to 70%/120%/170% of Boothill's Physical Break DMG. The max Toughness taken into account by this attack cannot exceed ×16 times of the base Toughness-Reducing DMG dealt by the Basic Attack "Skullcrush Spurs."
After winning the battle, Boothill can retain Pocket Trickshot for the next battle.

Weakness Break State
When enemy targets' Toughness is reduced to 0, they will enter the Weakness Break State, which delays their actions.

Break DMG
Break DMG increases with higher Break Effect, higher target max Toughness, and higher character levels.
Break DMG cannot CRIT Hit and is not affected by DMG Boost effects.

Lv10

Attack

Attack an enemy, and when the battle starts, reduce their Toughness of the corresponding Type.

 Single 10


3-9× Smile

Technique

After the Technique is used, when using the Skill for the first time in the next battle, add Physical Weakness equal to that applied by the Ultimate to the target, lasting for 2 turn(s).

 Single 20


Stat Boosts

 +37.3% Break Effect
 +18.0% ATK
 +10.0% HP

Ghost Load

Increase this character's CRIT Rate / CRIT DMG. The amount increased is equal to 10.0% / 50.0% of Break Effect. CRIT Rate / CRIT DMG can be increased by a max of 30.0% / 150.0%.


Above Snakes

Decreases the DMG this character receives from targets not in Standoff by 30.0%.


Point Blank

When obtaining Pocket Trickshot in Standoff, regenerates 10.0 Energy. This effect will also be triggered when obtaining Pocket Trickshot stacks that exceed the max.



1 Dusty Trail's Lone Star

At the start of battle, obtain 1 stack of Pocket Trickshot, allowing Boothill to deal DMG that ignores 16.0% of enemy target's DEF.



2 Milestonemonger

When obtaining Pocket Trickshot in Standoff, recovers 1.0 Skill Point(s) and increases Break Effect by 30.0%, lasting for 2.0 turn(s). This effect cannot be triggered repeatedly in one turn, and will also be triggered when obtaining Pocket Trickshot stacks that exceed the max.



3 Marble Orchard's Guard

Ultimate Lv. +2, up to a maximum of Lv. 15. Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Cold Cuts Chef

When the enemy target in Standoff is attacked by Boothill, the DMG they receive increases by 12.0%. When Boothill is attacked by the enemy target in Standoff, the effect of receiving more DMG is reduced by 12.0% on him.



5 Stump Speech

Skill Lv. +2, up to a maximum of Lv. 15. Talent Lv. +2, up to a maximum of Lv. 15.



6 Crowbar Hotel's Raccoon

When triggering the Talent's Break DMG, additionally deals Break DMG to the target equal to 40.0% of the original DMG multiplier and deals Break DMG to adjacent targets equal to 70.0% of the original DMG multiplier.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Boothill')
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
  } = Source.character('1315')

  const standoffVulnerabilityBoost = skill(e, 0.30, 0.33)

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.20, 2.42)
  const ultScaling = ult(e, 4.00, 4.32)

  const pocketTrickshotsToTalentBreakDmg: NumberToNumberMap = {
    0: 0,
    1: talent(e, 0.70, 0.77),
    2: talent(e, 1.20, 1.32),
    3: talent(e, 1.70, 1.87),
  }

  const defaults = {
    standoffActive: true,
    pocketTrickshotStacks: 3,
    beToCritBoost: true,
    talentBreakDmgScaling: true,
    e1DefShred: true,
    e2BeBuff: true,
    e4TargetStandoffVulnerability: true,
    e6AdditionalBreakDmg: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    standoffActive: {
      id: 'standoffActive',
      formItem: 'switch',
      text: t('Content.standoffActive.text'),
      content: t('Content.standoffActive.content', { standoffVulnerabilityBoost: TsUtils.precisionRound(100 * standoffVulnerabilityBoost) }),
    },
    pocketTrickshotStacks: {
      id: 'pocketTrickshotStacks',
      formItem: 'slider',
      text: t('Content.pocketTrickshotStacks.text'),
      content: t('Content.pocketTrickshotStacks.content'),
      min: 0,
      max: 3,
    },
    beToCritBoost: {
      id: 'beToCritBoost',
      formItem: 'switch',
      text: t('Content.beToCritBoost.text'),
      content: t('Content.beToCritBoost.content'),
    },
    talentBreakDmgScaling: {
      id: 'talentBreakDmgScaling',
      formItem: 'switch',
      text: t('Content.talentBreakDmgScaling.text'),
      content: t('Content.talentBreakDmgScaling.content'),
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
    e4TargetStandoffVulnerability: {
      id: 'e4TargetStandoffVulnerability',
      formItem: 'switch',
      text: t('Content.e4TargetStandoffVulnerability.text'),
      content: t('Content.e4TargetStandoffVulnerability.content'),
      disabled: e < 4,
    },
    e6AdditionalBreakDmg: {
      id: 'e6AdditionalBreakDmg',
      formItem: 'switch',
      text: t('Content.e6AdditionalBreakDmg.text'),
      content: t('Content.e6AdditionalBreakDmg.content'),
      disabled: e < 6,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.talentBreakDmgScaling) {
        x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_TALENT)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BE.buff((e >= 2 && r.e2BeBuff) ? 0.30 : 0, SOURCE_E2)
      x.VULNERABILITY.buff((r.standoffActive) ? standoffVulnerabilityBoost : 0, SOURCE_SKILL)

      x.DEF_PEN.buff((e >= 1 && r.e1DefShred) ? 0.16 : 0, SOURCE_E1)
      x.VULNERABILITY.buff((e >= 4 && r.standoffActive && r.e4TargetStandoffVulnerability) ? 0.12 : 0, SOURCE_E4)

      x.BASIC_ATK_SCALING.buff((r.standoffActive) ? basicEnhancedScaling : basicScaling, SOURCE_BASIC)
      x.BASIC_BREAK_EFFICIENCY_BOOST.buff((r.standoffActive) ? r.pocketTrickshotStacks * 0.50 : 0, SOURCE_TALENT)

      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      x.BASIC_TOUGHNESS_DMG.buff((r.standoffActive) ? 20 : 10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)

      // Since his toughness scaling is capped at 1600% x 30, we invert the toughness scaling on the original break dmg and apply the new scaling
      const newMaxToughness = Math.min(16.00 * 30, context.enemyMaxToughness)
      const inverseBreakToughnessMultiplier = 1 / (0.5 + context.enemyMaxToughness / 120)
      const newBreakToughnessMultiplier = (0.5 + newMaxToughness / 120)
      let talentBreakDmgScaling = pocketTrickshotsToTalentBreakDmg[r.pocketTrickshotStacks]
      talentBreakDmgScaling += (e >= 6 && r.e6AdditionalBreakDmg) ? 0.40 : 0
      x.BASIC_BREAK_DMG_MODIFIER.buff(
        (r.talentBreakDmgScaling && r.standoffActive)
          ? inverseBreakToughnessMultiplier * newBreakToughnessMultiplier * talentBreakDmgScaling
          : 0
        , SOURCE_TALENT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
    dynamicConditionals: [{
      id: 'BoothillConversionConditional',
      type: ConditionalType.ABILITY,
      activation: ConditionalActivation.CONTINUOUS,
      dependsOn: [Stats.BE],
      chainsTo: [Stats.CR, Stats.CD],
      condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>

        return r.beToCritBoost
      },
      effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
        const stateValue = action.conditionalState[this.id] || 0

        const stateCrBuffValue = Math.min(0.30, 0.10 * stateValue)
        const stateCdBuffValue = Math.min(1.50, 0.50 * stateValue)

        const crBuffValue = Math.min(0.30, 0.10 * x.a[Key.BE])
        const cdBuffValue = Math.min(1.50, 0.50 * x.a[Key.BE])

        action.conditionalState[this.id] = x.a[Key.BE]

        x.CR.buffDynamic(crBuffValue - stateCrBuffValue, SOURCE_TRACE, action, context)
        x.CD.buffDynamic(cdBuffValue - stateCdBuffValue, SOURCE_TRACE, action, context)
      },
      gpu: function (action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>

        return conditionalWgslWrapper(this, `
if (${wgslFalse(r.beToCritBoost)}) {
  return;
}

let be = x.BE;
let stateValue = (*p_state).BoothillConversionConditional;

let stateCrBuffValue = min(0.30, 0.10 * stateValue);
let stateCdBuffValue = min(1.50, 0.50 * stateValue);

let crBuffValue = min(0.30, 0.10 * be);
let cdBuffValue = min(1.50, 0.50 * be);

(*p_state).BoothillConversionConditional = be;

(*p_x).CR += crBuffValue - stateCrBuffValue;
(*p_x).CD += cdBuffValue - stateCdBuffValue;
    `)
      },
    }],
  }
}
