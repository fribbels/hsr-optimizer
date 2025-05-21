import { AbilityType, DOT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDefPen, buffAbilityVulnerability, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Percipience, Silent Dawn

Basic ATK+1+20

Deals Wind DMG equal to 60% of Black Swan's ATK to a single target enemy, with a 65% base chance of inflicting 1 stack of Arcana on the target. Additionally, when attacking a target that suffers Wind Shear, Bleed, Burn, or Shock, there is respectively a 65% base chance of inflicting 1 extra stack of Arcana on the target.

Arcana
Arcana is a debuff that deals DMG over time. This debuff cannot be dispelled.
While in the Arcana state, the unit is also considered to be in the Wind Shear state and takes Wind DoT at the start of each turn.
The infliction of Arcana ignores the target's Wind Shear RES, Bleed RES, Burn RES, and Shock RES.

 Single 10

Lv6

Decadence, False Twilight

Skill-1+30

Deals Wind DMG equal to 90% of Black Swan's ATK to a single target enemy and any adjacent targets. At the same time, there is a 100% base chance of inflicting 1 stack of Arcana on the target enemy and the adjacent targets. Additionally, there is a 100% base chance of reducing the DEF of the target enemy and the adjacent targets by 20.8%, lasting for 3 turn(s).

 Single 20 | Other 10

Lv10

Bliss of Otherworld's Embrace

Ultimate120+5

Inflicts Epiphany on all enemies for 2 turn(s).
While afflicted with Epiphany, enemies take 25% increased DMG in their turn. Additionally, if enemies are also inflicted with Arcana, they are considered to be simultaneously afflicted with Wind Shear, Bleed, Burn, and Shock. After Arcana causes DMG at the start of each turn, its stacks are not reset. This non-reset effect of Arcana stacks can be triggered up to 1 time(s) for the duration of Epiphany. And the trigger count resets when Epiphany is applied again.
Deals Wind DMG equal to 120% of Black Swan's ATK to all enemies.

 All 20

Lv10

Loom of Fate's Caprice

Talent

Every time an enemy target receives DoT at the start of each turn, there is a 65% base chance for it to be inflicted with 1 stack of Arcana.
While afflicted with Arcana, enemy targets receive Wind DoT equal to 240% of Black Swan's ATK at the start of each turn. Each stack of Arcana increases this DMG multiplier by 12%. Then Arcana resets to 1 stack. Arcana can stack up to 50 times.
Only when Arcana causes DMG at the start of an enemy target's turn, Black Swan triggers additional effects based on the number of Arcana stacks inflicted on the target:
When there are 3 or more Arcana stacks, deals Wind DoT equal to 180% of Black Swan's ATK to adjacent targets, with a 65% base chance of inflicting 1 stack of Arcana on adjacent targets.
When there are 7 or more Arcana stacks, enables the current DoT dealt this time to ignore 20% of the target's and adjacent targets' DEF.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


From Façade to Vérité

Technique

After this Technique is used, there is a 150% base chance for each enemy to be inflicted with 1 stack of Arcana at the start of the next battle. For each successful application of Arcana on a target, inflicts another stack of Arcana on the same target. This process repeats until Arcana fails to be inflicted on this target. For each successive application of Arcana on a target, its base chance of success is equal to 50% of the base chance of the previous successful infliction of Arcana on that target.


Stat Boosts

 +28.0% ATK
 +14.4% Wind DMG Boost
 +10.0% Effect Hit Rate

Viscera's Disquiet

After using Skill to attack one designated enemy that has Wind Shear, Bleed, Burn, or Shock, each of these debuffs respectively has a 65% base chance of inflicting 1 extra stack of Arcana.

Arcana
Arcana is a debuff that deals DMG over time. This debuff cannot be dispelled.
While in the Arcana state, the unit is also considered to be in the Wind Shear state and takes Wind DoT at the start of each turn.
The infliction of Arcana ignores the target's Wind Shear RES, Bleed RES, Burn RES, and Shock RES.


Goblet's Dredges

When an enemy target enters battle, there is a 65% base chance for it to be inflicted with 1 stack of Arcana.
Every time an enemy target receives 1 instance of DoT during a single attack by an ally, there is a 65% base chance for the target to be inflicted with 1 stack of Arcana. The maximum number of stacks that can be inflicted during 1 single attack is 3.


Candleflame's Portent

Increases this unit's DMG by an amount equal to 60% of Effect Hit Rate, up to a maximum DMG increase of 72%.



1 Seven Pillars of Wisdom

While Black Swan is active in battle, enemies afflicted with Wind Shear, Bleed, Burn, or Shock will have their corresponding Wind, Physical, Fire, or Lightning RES respectively reduced by 25%.



2 Weep Not For Me, My Lamb

When an enemy target afflicted with "Arcana" is defeated, there is a 100% base chance of inflicting 6 stack(s) of "Arcana" on adjacent targets.

Arcana
Arcana is a debuff that deals DMG over time. This debuff cannot be dispelled.
While in the Arcana state, the unit is also considered to be in the Wind Shear state and takes Wind DoT at the start of each turn.
The infliction of Arcana ignores the target's Wind Shear RES, Bleed RES, Burn RES, and Shock RES.



3 As Above, So Below

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 In Tears We Gift

While in the Epiphany state, enemy targets have their Effect RES reduced by 10% and Black Swan regenerates 8 Energy at the start of these targets' turns or when they are defeated. This Energy Regeneration effect can only trigger up to 1 time while Epiphany lasts. The trigger count is reset when Epiphany is applied again.



5 Linnutee Flyway

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Pantheon Merciful, Masses Pitiful

When an enemy target is attacked by Black Swan's teammates, Black Swan has a 65% base chance of inflicting 1 stack of "Arcana" on the target.
Every time Black Swan inflicts "Arcana" on an enemy target, there is a 50% fixed chance to additionally increase the number of "Arcana" stacked this time by 1.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.BlackSwan')
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
  } = Source.character('1307')

  const arcanaStackMultiplier = talent(e, 0.12, 0.132)
  const epiphanyDmgTakenBoost = ult(e, 0.25, 0.27)
  const defShredValue = skill(e, 0.208, 0.22)

  const basicScaling = basic(e, 0.60, 0.66)
  const skillScaling = skill(e, 0.90, 0.99)
  const ultScaling = ult(e, 1.20, 1.30)
  const dotScaling = talent(e, 2.40, 2.64)

  const dotChance = talent(e, 0.65, 0.68)

  const defaults = {
    ehrToDmgBoost: true,
    epiphanyDebuff: true,
    defDecreaseDebuff: true,
    arcanaStacks: 7,
    e1ResReduction: true,
    e4EffResPen: true,
  }
  const teammateDefaults = {
    epiphanyDebuff: true,
    defDecreaseDebuff: true,
    e1ResReduction: true,
    e4EffResPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ehrToDmgBoost: {
      id: 'ehrToDmgBoost',
      formItem: 'switch',
      text: t('Content.ehrToDmgBoost.text'),
      content: t('Content.ehrToDmgBoost.content'),
    },
    epiphanyDebuff: {
      id: 'epiphanyDebuff',
      formItem: 'switch',
      text: t('Content.epiphanyDebuff.text'),
      content: t('Content.epiphanyDebuff.content', { epiphanyDmgTakenBoost: TsUtils.precisionRound(100 * epiphanyDmgTakenBoost) }),
    },
    defDecreaseDebuff: {
      id: 'defDecreaseDebuff',
      formItem: 'switch',
      text: t('Content.defDecreaseDebuff.text'),
      content: t('Content.defDecreaseDebuff.content', { defShredValue: TsUtils.precisionRound(100 * defShredValue) }),
    },
    arcanaStacks: {
      id: 'arcanaStacks',
      formItem: 'slider',
      text: t('Content.arcanaStacks.text'),
      content: t('Content.arcanaStacks.content', {
        dotScaling: TsUtils.precisionRound(100 * dotScaling),
        arcanaStackMultiplier: TsUtils.precisionRound(100 * arcanaStackMultiplier),
      }),
      min: 1,
      max: 50,
    },
    e1ResReduction: {
      id: 'e1ResReduction',
      formItem: 'switch',
      text: t('Content.e1ResReduction.text'),
      content: t('Content.e1ResReduction.content'),
      disabled: e < 1,
    },
    e4EffResPen: {
      id: 'e4EffResPen',
      formItem: 'switch',
      text: t('Content.e4EffResPen.text'),
      content: t('Content.e4EffResPen.content'),
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    epiphanyDebuff: content.epiphanyDebuff,
    defDecreaseDebuff: content.defDecreaseDebuff,
    e1ResReduction: content.e1ResReduction,
    e4EffResPen: content.e4EffResPen,
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
      x.DOT_ATK_SCALING.buff(dotScaling + arcanaStackMultiplier * r.arcanaStacks, SOURCE_TALENT)

      buffAbilityDefPen(x, DOT_DMG_TYPE, (r.arcanaStacks >= 7) ? 0.20 : 0, SOURCE_TALENT)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      x.DOT_CHANCE.set(dotChance, SOURCE_TALENT)
      x.DOT_SPLIT.set(0.05, SOURCE_TALENT)
      x.DOT_STACKS.set(r.arcanaStacks, SOURCE_TALENT)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // TODO: Technically this isnt a DoT vulnerability but rather vulnerability to damage on the enemy's turn which includes ults/etc.
      buffAbilityVulnerability(x, DOT_DMG_TYPE, (m.epiphanyDebuff) ? epiphanyDmgTakenBoost : 0, SOURCE_ULT, Target.TEAM)

      x.DEF_PEN.buffTeam((m.defDecreaseDebuff) ? defShredValue : 0, SOURCE_SKILL)
      x.WIND_RES_PEN.buffTeam((e >= 1 && m.e1ResReduction) ? 0.25 : 0, SOURCE_E1)
      x.FIRE_RES_PEN.buffTeam((e >= 1 && m.e1ResReduction) ? 0.25 : 0, SOURCE_E1)
      x.PHYSICAL_RES_PEN.buffTeam((e >= 1 && m.e1ResReduction) ? 0.25 : 0, SOURCE_E1)
      x.LIGHTNING_RES_PEN.buffTeam((e >= 1 && m.e1ResReduction) ? 0.25 : 0, SOURCE_E1)

      x.EFFECT_RES_PEN.buffTeam((e >= 4 && m.epiphanyDebuff && m.e4EffResPen) ? 0.10 : 0, SOURCE_E4)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.ELEMENTAL_DMG.buff((r.ehrToDmgBoost) ? Math.min(0.72, 0.60 * x.a[Key.EHR]) : 0, SOURCE_TRACE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.ehrToDmgBoost)}) {
  x.ELEMENTAL_DMG += min(0.72, 0.60 * x.EHR);
}
`
    },
  }
}
