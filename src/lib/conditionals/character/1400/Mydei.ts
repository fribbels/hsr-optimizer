import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Vow of Voyage

Basic ATK+1+20

Deals Imaginary DMG equal to 50% of Mydei's Max HP to one designated enemy.

 Single 10

Lv6

Deaths are Legion, Regrets are None

Skill+30

Consumes HP by an amount equal to 50% of Mydei's current HP. Deals Imaginary DMG equal to 90% of Mydei's Max HP to one designated enemy and Imaginary DMG equal to 50% of Mydei's Max HP to adjacent targets.
If the current HP is not sufficient, using Skill reduces Mydei's current HP to 1.

 Single 20 | Other 10

Lv10

Throne of Bones

Ultimate160+5

Restores HP by 20% of Mydei's Max HP and accumulates 20 Talent's Charge point(s). Deals Imaginary DMG equal to 160% of Mydei's Max HP to one designated enemy, and deals Imaginary DMG equal to 100% of Mydei's Max HP to adjacent targets. Additionally, Taunts the target and targets adjacent to it, lasting for 2 turn(s). The next use of "Godslayer Be God" prioritizes attacking one designated enemy, and this effect only works on the latest target.

 Single 20 | Other 20

Lv10

Blood for Blood

Talent

For each 1% of HP lost, accumulates 1 point of Charge (up to 200 points). When Charge reaches 100, consumes 100 points of Charge to enter the "Vendetta" state, restores HP equal to 25% of Mydei's Max HP, and advances action by 100%. While the "Vendetta" state is active, Max HP increases by 50% of the current Max HP and DEF remains at 0. At the start of this unit's turn, automatically uses "Kingslayer Be King."
When Charge reaches 150 points during the "Vendetta" state, Mydei immediately gains 1 extra turn and automatically uses "Godslayer Be God."
When receiving a killing blow during the "Vendetta" state, Mydei will not be knocked down, but will clear his Charge, exits the "Vendetta" state, and restores HP by 50% of his Max HP.
Hidden Stat: 0

Extra Turn
Gain 1 extra turn that won't expend your remaining turns when taking action. During this extra turn, no Ultimate can be used.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Cage of Broken Lance

Technique

After using Technique, pulls in enemies within a certain area and inflicts Daze on them for 10 second(s). Dazed enemies will not actively attack ally targets.
If actively attacking Dazed enemies, when entering battle, deals Imaginary DMG equal to 80% of Mydei's Max HP to all enemies, and Taunts the targets, lasting for 1 turn(s). This unit accumulates 50 point(s) of Talent's Charge.
Hidden Stat: 1


Kingslayer Be King

Skill+30

Consumes HP by an amount equal to 35% of Mydei's current HP. Deals Imaginary DMG equal to 110% of Mydei's Max HP to one enemy and Imaginary DMG equal to 66% of Mydei's Max HP to adjacent targets.
If the current HP is not sufficient, using Skill reduces Mydei's current HP to 1.
This ability will be automatically used.

 Single 20 | Other 10

Lv10

Godslayer Be God

Skill+10

Consumes 150 point(s) of Charge. Deals Imaginary DMG equal to 280% of Mydei's Max HP to one enemy and Imaginary DMG equal to 168% of Mydei's Max HP to adjacent targets.
This ability will be automatically used. While this ability is in use, Charge cannot be accumulated.

 Single 30 | Other 20

Lv10

Stat Boosts

 +37.3% CRIT DMG
 +18.0% HP
 +5.0 SPD

Earth and Water

During the "Vendetta" state, Mydei will not exit the "Vendetta" state when receiving a killing blow. This effect can trigger 3 time(s) per battle.


Thirty Tyrants

While in the "Vendetta" state, Mydei is immune to Crowd Control debuffs.

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.


Bloodied Chiton

When battle starts, if Mydei's Max HP exceeds 4000, for every 100 excess HP, Mydei's CRIT Rate increases by 1.2%, his Charge ratio from enemy targets' DMG increases by 2.5%, and his HP restored when receiving healing increases by 0.75%. Up to 4000 excess HP can be taken into account for this effect.



1 Frost Hones Spine of Steel

Increases the DMG multiplier dealt by "Godslayer Be God" to the primary target by 30%. This ability now deals to all enemies Imaginary DMG equal to the DMG multiplier dealt to the primary target.



2 Strife Beholds Cry of Dead

During "Vendetta," the DMG dealt by Mydei ignores 15% of enemy targets' DEF. After he receives healing, converts 40% of the healed amount to Charge. The tally of the converted Charge cannot exceed 40 point(s). Resets this tally of Charge after any unit takes action.



3 Honor Exalts Feast of Faith

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Siren Jolts the Laconic Lion

While in "Vendetta," increases CRIT DMG by 30% and restores HP by 10% of this unit's Max HP after receiving attacks from enemy targets.



5 War Chisels Flesh of Flame

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Legacy Scales Mound of Blood

When entering battle, immediately enters the "Vendetta" state, and lowers the Charge required for "Godslayer Be God" to 100 point(s).
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Mydei.Content')
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
  } = Source.character('1404')

  const basicScaling = basic(e, 0.50, 0.55)

  const skillScaling = skill(e, 0.90, 0.99)
  const skillEnhanced1Scaling = skill(e, 1.10, 1.21)
  const skillEnhanced2Scaling = skill(e, 2.80, 3.08)

  const ultScaling = ult(e, 1.60, 1.728)

  const defaults = {
    skillEnhances: 2,
    vendettaState: true,
    hpToCrConversion: true,
    e1EnhancedSkillBuff: true,
    e2DefPen: true,
    e4CdBuff: true,
  }

  const teammateDefaults = {}

  const content: ContentDefinition<typeof defaults> = {
    skillEnhances: {
      id: 'skillEnhances',
      formItem: 'slider',
      text: t('skillEnhances.text'),
      content: t('skillEnhances.content', {
        SkillPrimaryScaling: TsUtils.precisionRound(skillScaling * 100),
        SkillAdjacentScaling: TsUtils.precisionRound(skill(e, 50, 55)),
        EnhancedSkillPrimaryScaling: TsUtils.precisionRound(skillEnhanced1Scaling * 100),
        EnhancedSkillAdjacentScaling: TsUtils.precisionRound(skill(e, 66, 72.6)),
        EnhancedSkill2PrimaryScaling: TsUtils.precisionRound(skillEnhanced2Scaling * 100),
        EnhancedSkill2AdjacentScaling: TsUtils.precisionRound(skill(e, 168, 184.8)),
      }),
      min: 0,
      max: 2,
    },
    vendettaState: {
      id: 'vendettaState',
      formItem: 'switch',
      text: t('vendettaState.text'),
      content: t('vendettaState.content', { HpRestoration: TsUtils.precisionRound(talent(e, 25, 27)) }),
    },
    hpToCrConversion: {
      id: 'hpToCrConversion',
      formItem: 'switch',
      text: t('hpToCrConversion.text'),
      content: t('hpToCrConversion.content'),
    },
    e1EnhancedSkillBuff: {
      id: 'e1EnhancedSkillBuff',
      formItem: 'switch',
      text: t('e1EnhancedSkillBuff.text'),
      content: t('e1EnhancedSkillBuff.content'),
      disabled: e < 1,
    },
    e2DefPen: {
      id: 'e2DefPen',
      formItem: 'switch',
      text: t('e2DefPen.text'),
      content: t('e2DefPen.content'),
      disabled: e < 2,
    },
    e4CdBuff: {
      id: 'e4CdBuff',
      formItem: 'switch',
      text: t('e4CdBuff.text'),
      content: t('e4CdBuff.content'),
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {}

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_HP_SCALING.buff(basicScaling, SOURCE_BASIC)

      x.SKILL_HP_SCALING.buff((r.skillEnhances == 0) ? skillScaling : 0, SOURCE_SKILL)
      x.SKILL_HP_SCALING.buff((r.skillEnhances == 1) ? skillEnhanced1Scaling : 0, SOURCE_SKILL)
      x.SKILL_HP_SCALING.buff((r.skillEnhances == 2) ? skillEnhanced2Scaling : 0, SOURCE_SKILL)
      x.SKILL_HP_SCALING.buff((e >= 1 && r.e1EnhancedSkillBuff && r.skillEnhances == 2) ? 0.30 : 0, SOURCE_E1)

      x.ULT_HP_SCALING.buff(ultScaling, SOURCE_ULT)

      x.DEF_PEN.buff((e >= 2 && r.e2DefPen && r.vendettaState) ? 0.15 : 0, SOURCE_E2)
      x.CD.buff((e >= 4 && r.e4CdBuff) ? 0.30 : 0, SOURCE_E4)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff((r.skillEnhances > 1) ? 30 : 20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
    },
    calculateBasicEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const crBuff = (r.hpToCrConversion) ? Math.max(0, Math.min(0.48, 0.016 * Math.floor((x.c.a[Key.HP] - 5000) / 100))) : 0
      x.CR.buff(crBuff, SOURCE_TRACE)
      x.UNCONVERTIBLE_CR_BUFF.buff(crBuff, SOURCE_TRACE)
    },
    gpuCalculateBasicEffects: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.hpToCrConversion)}) {
  let buffValue: f32 = max(0, min(0.48, 0.016 * floor((c.HP - 5000) / 100)));
  x.CR += buffValue;
  x.UNCONVERTIBLE_CR_BUFF += buffValue;
}
`
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.vendettaState) {
        x.DEF.set(0, SOURCE_TALENT)
      }
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.vendettaState)}) {
  x.DEF = 0;
}
`
    },
    dynamicConditionals: [
      {
        id: 'MydeiHpConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.HP],
        chainsTo: [Stats.HP],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.vendettaState
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          dynamicStatConversion(Stats.HP, Stats.HP, this, x, action, context, SOURCE_TALENT,
            (convertibleValue) => convertibleValue * 0.50,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.HP, Stats.HP, this, action, context,
            `0.50 * convertibleValue`,
            `${wgslTrue(r.vendettaState)}`,
          )
        },
      },
    ],
  }
}
