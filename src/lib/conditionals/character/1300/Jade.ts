import { AbilityType, ASHBLAZING_ATK_STACK, FUA_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkP, gpuBoostAshblazingAtkP } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Lash of Riches

Basic ATK+1+20

Deals Quantum DMG equal to 90% of Jade's ATK to a single target enemy, and Quantum DMG equal to 30% of Jade's ATK to adjacent enemies.

 Single 10 | Other 5

Lv6

Acquisition Surety

Skill-1+30

Makes a single target ally become the Debt Collector and increases their SPD by 30, lasting for 3 turn(s).
After the Debt Collector attacks, deals 1 instance of Quantum Additional DMG equal to 25% of Jade's ATK to each enemy target hit, and consumes the Debt Collector's HP by an amount equal to 2% of their Max HP. If the current HP is insufficient, reduces HP to 1.
If Jade becomes the Debt Collector, she cannot gain the SPD boost effect, and her attacks do not consume HP.
When the Debt Collector exists on the field, Jade cannot use her Skill. At the start of Jade's every turn, the Debt Collector's duration decreases by 1 turn.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

Lv10

Vow of the Deep

Ultimate140+5

Deals Quantum DMG equal to 240% of Jade's ATK to all enemies. At the same time, Jade enhances her Talent's Follow-up ATK, increasing its DMG multiplier by 80%. This enhancement can take effect 2 time(s).

 All 20

Lv10

Fang of Flare Flaying

Talent+10

After Jade or the Debt Collector unit attacks, gains 1 point of Charge for each enemy target hit. Upon reaching 8 points of Charge, consumes the 8 points to launch 1 instance of Follow-up ATK, dealing Quantum DMG equal to 120% of Jade's ATK to all enemies. This Follow-up ATK does not generate Charge.
When launching her Talent's Follow-up ATK, Jade immediately gains 5 stack(s) of Pawned Asset, with each stack increasing CRIT DMG by 2.4%, stacking up to 50 times.

 All 10

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Visionary Predation

Technique

After using the Technique, inflicts enemies within a set area with Blind Fealty for 10 second(s). Enemies inflicted with Blind Fealty will not initiate attacks on allies. When entering battle via actively attacking enemies inflicted with Blind Fealty, all enemies with Blind Fealty will enter combat simultaneously. After entering battle, deals Quantum DMG equal to 50% of Jade's ATK to all enemies, and immediately gains 15 stack(s) of Pawned Asset.


Stat Boosts

 +22.4% Quantum DMG Boost
 +18.0% ATK
 +10.0% Effect RES

Reverse Repo

When an enemy target enters combat, Jade gains 1 stack(s) of Pawned Asset. When the Debt Collector character's turn starts, additionally gains 3 stack(s) of Pawned Asset.


Collateral Ticket

When the battle starts, action advances Jade by 50%.


Asset Forfeiture

Each Pawned Asset stack from the Talent additionally increases Jade's ATK by 0.5%.



1 Altruism? Nevertheless Tradable

The Follow-up ATK DMG from Jade's Talent increases by 32%. After the "Debt Collector" character attacks and the number of the enemy target(s) hit is either 2 or 1, Jade additionally gains 1 or 2 point(s) of Charge respectively.



2 Morality? Herein Authenticated

When there are 15 stacks of Pawned Asset, Jade's CRIT Rate increases by 18%.



3 Honesty? Soon Mortgaged

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Sincerity? Put Option Only

When using Ultimate, enables the DMG dealt by Jade to ignore 12% of enemy targets' DEF, lasting for 3 turn(s).



5 Hope? Hitherto Forfeited

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Equity? Pending Sponsorship

While the "Debt Collector" character exists on the field, Jade's Quantum RES PEN increases by 20%, and Jade gains the "Debt Collector" state.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Jade')
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
  } = Source.character('1314')

  const basicScaling = basic(e, 0.90, 0.99)
  // Assuming jade is not the debt collector - skill disabled
  const skillScaling = skill(e, 0.25, 0.27)
  const ultScaling = ult(e, 2.40, 2.64)
  const ultFuaScalingBuff = ult(e, 0.80, 0.88)
  const fuaScaling = talent(e, 1.20, 1.32)
  const pawnedAssetCdScaling = talent(e, 0.024, 0.0264)

  const unenhancedHitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.25 + 2 * 0.25 + 3 * 0.25 + 4 * 0.25), // 0.15
    3: ASHBLAZING_ATK_STACK * (2 * 0.25 + 5 * 0.25 + 8 * 0.25 + 8 * 0.25), // 0.345
    5: ASHBLAZING_ATK_STACK * (3 * 0.25 + 8 * 0.25 + 8 * 0.25 + 8 * 0.25), // 0.405
  }

  const enhancedHitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.10 + 2 * 0.10 + 3 * 0.10 + 4 * 0.10 + 5 * 0.60), // 0.24
    3: ASHBLAZING_ATK_STACK * (2 * 0.10 + 5 * 0.10 + 8 * 0.10 + 8 * 0.10 + 8 * 0.60), // 0.426
    5: ASHBLAZING_ATK_STACK * (3 * 0.10 + 8 * 0.10 + 8 * 0.10 + 8 * 0.10 + 8 * 0.60), // 0.45
  }

  function getHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals as Conditionals<typeof content>
    return r.enhancedFollowUp
      ? enhancedHitMultiByTargets[context.enemyCount]
      : unenhancedHitMultiByTargets[context.enemyCount]
  }

  const defaults = {
    enhancedFollowUp: true,
    pawnedAssetStacks: 50,
    e1FuaDmgBoost: true,
    e2CrBuff: true,
    e4DefShredBuff: true,
    e6ResShredBuff: true,
  }

  const teammateDefaults = {
    debtCollectorSpdBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedFollowUp: {
      id: 'enhancedFollowUp',
      formItem: 'switch',
      text: t('Content.enhancedFollowUp.text'),
      content: t('Content.enhancedFollowUp.content', { ultFuaScalingBuff: TsUtils.precisionRound(100 * ultFuaScalingBuff) }),
    },
    pawnedAssetStacks: {
      id: 'pawnedAssetStacks',
      formItem: 'slider',
      text: t('Content.pawnedAssetStacks.text'),
      content: t('Content.pawnedAssetStacks.content', { pawnedAssetCdScaling: TsUtils.precisionRound(100 * pawnedAssetCdScaling) }),
      min: 0,
      max: 50,
    },
    e1FuaDmgBoost: {
      id: 'e1FuaDmgBoost',
      formItem: 'switch',
      text: t('Content.e1FuaDmgBoost.text'),
      content: t('Content.e1FuaDmgBoost.content'),
      disabled: e < 1,
    },
    e2CrBuff: {
      id: 'e2CrBuff',
      formItem: 'switch',
      text: t('Content.e2CrBuff.text'),
      content: t('Content.e2CrBuff.content'),
      disabled: e < 2,
    },
    e4DefShredBuff: {
      id: 'e4DefShredBuff',
      formItem: 'switch',
      text: t('Content.e4DefShredBuff.text'),
      content: t('Content.e4DefShredBuff.content'),
      disabled: e < 4,
    },
    e6ResShredBuff: {
      id: 'e6ResShredBuff',
      formItem: 'switch',
      text: t('Content.e6ResShredBuff.text'),
      content: t('Content.e6ResShredBuff.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    debtCollectorSpdBuff: {
      id: 'debtCollectorSpdBuff',
      formItem: 'switch',
      text: t('TeammateContent.debtCollectorSpdBuff.text'),
      content: t('TeammateContent.debtCollectorSpdBuff.content'),
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => (teammateDefaults),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.CD.buff(r.pawnedAssetStacks * pawnedAssetCdScaling, SOURCE_TALENT)
      x.ATK_P.buff(r.pawnedAssetStacks * 0.005, SOURCE_TRACE)
      x.CR.buff((e >= 2 && r.e2CrBuff && r.pawnedAssetStacks >= 15) ? 0.18 : 0, SOURCE_E2)

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff(fuaScaling, SOURCE_TALENT)
      x.FUA_ATK_SCALING.buff((r.enhancedFollowUp) ? ultFuaScalingBuff : 0, SOURCE_ULT)

      buffAbilityDmg(x, FUA_DMG_TYPE, (e >= 1 && r.e1FuaDmgBoost) ? 0.32 : 0, SOURCE_E1)
      x.DEF_PEN.buff((e >= 4 && r.e4DefShredBuff) ? 0.12 : 0, SOURCE_E4)
      x.QUANTUM_RES_PEN.buff((e >= 6 && r.e6ResShredBuff) ? 0.20 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(10, SOURCE_TALENT)

      return x
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.SPD.buffSingle((t.debtCollectorSpdBuff) ? 30 : 0, SOURCE_SKILL)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, getHitMulti(action, context))
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkP(getHitMulti(action, context))
    },
  }
}
