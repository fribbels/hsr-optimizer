import { AbilityType, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityVulnerability, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Heart Afire

Basic ATK+1+20

Deals Fire DMG equal to 100% of Jiaoqiu's ATK to a single target enemy.

 Single 10

Lv6

Scorch Onslaught

Skill-1+30

Deals Fire DMG equal to 150% of Jiaoqiu's ATK to a single target enemy and Fire DMG equal to 90% of Jiaoqiu's ATK to adjacent targets, with a 100% base chance to inflict 1 stack of Ashen Roast on the primary target.

 Single 20 | Other 10

Lv10

Pyrograph Arcanum

Ultimate100+5

Sets the number of "Ashen Roast" stacks on enemy targets to the highest number of "Ashen Roast" stacks present on the battlefield. Then, activates a Zone and deals Fire DMG equal to 100% of Jiaoqiu's ATK to all enemies.
While inside the Zone, enemy targets receive 15% increased Ultimate DMG, with a 60% base chance of being inflicted with 1 stack of Ashen Roast when taking action. While the Zone exists, this effect can trigger up to 6 time(s). And for each enemy target, it can only trigger once per turn. This trigger count resets every time Jiaoqiu uses Ultimate.
The Zone lasts for 3 turn(s), and its duration decreases by 1 at the start of this unit's every turn. If Jiaoqiu gets knocked down, the Zone will also be dispelled.

 All 20

Lv10

Quartet Finesse, Octave Finery

Talent

When Jiaoqiu hits an enemy with Basic ATK, Skill or Ultimate, there is a 100% base chance to inflict 1 stack of Ashen Roast on them. At 1 stack, increases DMG received by the enemy by 15%. Then, each subsequent stack increases this by 5%.
Ashen Roast is capped at 5 stack(s) and lasts for 2 turn(s).
When an enemy target is afflicted with Ashen Roast, they are also considered as being Burned at the same time, taking Fire DoT equal to 180% of Jiaoqiu's ATK at the start of each turn.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Fiery Queller

Technique

After using Technique, creates a Special Dimension that lasts for 15 second(s). After entering combat with enemies in this Special Dimension, deals Fire DMG equal to 100% of Jiaoqiu's ATK to all enemies, with a 100% base chance of applying 1 "Ashen Roast" stack. Only 1 dimension created by allies can exist at the same time.


Stat Boosts

 +28.0% Effect Hit Rate
 +14.4% Fire DMG Boost
 +5.0 SPD

Pyre Cleanse

When battle starts, immediately regenerates 15 Energy.


Hearth Kindle

For every 15% of Jiaoqiu's Effect Hit Rate that exceeds 80%, additionally increases ATK by 60%, up to 240%.


Seared Scent

While the Zone exists, enemies entering combat will be inflicted with Ashen Roast. The number of stacks applied will match the highest number of "Ashen Roast" stacks possessed by any unit while the Zone is active, with a minimum of 1 stack(s).



1 Pentapathic Transference

Allies deal 40% increased DMG to enemy targets afflicted with Ashen Roast. Whenever inflicting Ashen Roast on an enemy target via triggering the Talent's effect, additionally increases the number of "Ashen Roast" stacks applied this time by 1.



2 From Savor Comes Suffer

When an enemy target is afflicted with Ashen Roast, increases the multiplier for the Fire DoT dealt by Ashen Roast to this target by 300%.



3 Flavored Euphony Reigns Supreme

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Leisure In, Luster Out

When the Zone exists, reduces enemy target's ATK by 15%.



5 Duel in Dawn, Dash in Dusk

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Nonamorphic Pyrobind

When an enemy target gets defeated, their accumulated "Ashen Roast" stacks will transfer to the enemy with the lowest number of "Ashen Roast" stacks on the battlefield. The maximum stack limit of Ashen Roast increases to 9, and each "Ashen Roast" stack reduces the target's All-Type RES by 3%.
Hidden Stat: 1.0
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Jiaoqiu')
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
  } = Source.character('1218')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.50, 1.65)
  const ultScaling = ult(e, 1.00, 1.08)

  const ultVulnerabilityScaling = ult(e, 0.15, 0.162)

  const talentVulnerabilityBase = talent(e, 0.15, 0.165)
  const talentVulnerabilityScaling = talent(e, 0.05, 0.055)

  const talentDotScaling = talent(e, 1.80, 1.98)

  const maxAshenRoastStacks = e >= 6 ? 9 : 5

  const defaults = {
    ashenRoastStacks: maxAshenRoastStacks,
    ultFieldActive: true,
    ehrToAtkBoost: true,
    e1DmgBoost: true,
    e2Dot: true,
    e6ResShred: true,
  }

  const teammateDefaults = {
    ashenRoastStacks: maxAshenRoastStacks,
    ultFieldActive: true,
    e1DmgBoost: true,
    e6ResShred: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ashenRoastStacks: {
      id: 'ashenRoastStacks',
      formItem: 'slider',
      text: t('Content.ashenRoastStacks.text'),
      content: t('Content.ashenRoastStacks.content', {
        AshenRoastInitialVulnerability: TsUtils.precisionRound(100 * talentVulnerabilityBase),
        AshenRoastAdditionalVulnerability: TsUtils.precisionRound(100 * talentVulnerabilityScaling),
        AshenRoastDotMultiplier: TsUtils.precisionRound(100 * talentDotScaling),
      }),
      min: 0,
      max: maxAshenRoastStacks,
    },
    ultFieldActive: {
      id: 'ultFieldActive',
      formItem: 'switch',
      text: t('Content.ultFieldActive.text'),
      content: t('Content.ultFieldActive.content', {
        UltScaling: TsUtils.precisionRound(100 * ultScaling),
        UltVulnerability: TsUtils.precisionRound(100 * ultVulnerabilityScaling),
        ZoneDebuffChance: TsUtils.precisionRound(100 * ult(e, 0.6, 0.62)),
      }),
    },
    ehrToAtkBoost: {
      id: 'ehrToAtkBoost',
      formItem: 'switch',
      text: t('Content.ehrToAtkBoost.text'),
      content: t('Content.ehrToAtkBoost.content'),
    },
    e1DmgBoost: {
      id: 'e1DmgBoost',
      formItem: 'switch',
      text: t('Content.e1DmgBoost.text'),
      content: t('Content.e1DmgBoost.content'),
      disabled: e < 1,
    },
    e2Dot: {
      id: 'e2Dot',
      formItem: 'switch',
      text: t('Content.e2Dot.text'),
      content: t('Content.e2Dot.content'),
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
    ashenRoastStacks: content.ashenRoastStacks,
    ultFieldActive: content.ultFieldActive,
    e1DmgBoost: content.e1DmgBoost,
    e6ResShred: content.e6ResShred,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.DOT_ATK_SCALING.buff((r.ashenRoastStacks > 0) ? talentDotScaling : 0, SOURCE_TALENT)
      x.DOT_ATK_SCALING.buff((e >= 2 && r.e2Dot && r.ashenRoastStacks > 0) ? 3.00 : 0, SOURCE_E2)
      x.DOT_CHANCE.set(100, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      buffAbilityVulnerability(x, ULT_DMG_TYPE, (m.ultFieldActive) ? ultVulnerabilityScaling : 0, SOURCE_ULT, Target.TEAM)

      x.VULNERABILITY.buffTeam((m.ashenRoastStacks > 0) ? talentVulnerabilityBase : 0, SOURCE_TALENT)
      x.VULNERABILITY.buffTeam(Math.max(0, m.ashenRoastStacks - 1) * talentVulnerabilityScaling, SOURCE_TALENT)

      x.ELEMENTAL_DMG.buffTeam((e >= 1 && m.e1DmgBoost && m.ashenRoastStacks > 0) ? 0.40 : 0, SOURCE_E1)

      x.RES_PEN.buffTeam((e >= 6 && m.e6ResShred) ? m.ashenRoastStacks * 0.03 : 0, SOURCE_E6)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    gpuFinalizeCalculations: () => '',
    dynamicConditionals: [
      {
        id: 'JiaoqiuConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.EHR],
        chainsTo: [Stats.ATK],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.ehrToAtkBoost && x.a[Key.EHR] > 0.80
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.EHR, Stats.ATK, this, x, action, context, SOURCE_TRACE,
            (convertibleValue) => Math.min(2.40, 0.60 * Math.floor((convertibleValue - 0.80) / 0.15)) * context.baseATK,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.EHR, Stats.ATK, this, action, context,
            `min(2.40, 0.60 * floor((convertibleValue - 0.80) / 0.15)) * baseATK`,
            `${wgslTrue(r.ehrToAtkBoost)} && x.EHR > 0.80`,
          )
        },
      },
    ],
  }
}
