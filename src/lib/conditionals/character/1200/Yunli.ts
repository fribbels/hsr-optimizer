import {
  AbilityType,
  ASHBLAZING_ATK_STACK,
  FUA_DMG_TYPE,
  ULT_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'
import {
  boostAshblazingAtkP,
  gpuBoostAshblazingAtkP,
} from 'lib/conditionals/conditionalFinalizers'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  buffAbilityCd,
  buffAbilityCr,
  buffAbilityDefPen,
  buffAbilityDmg,
  buffAbilityResPen,
} from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Yunli')
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
  } = Source.character('1221')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.20, 1.32)
  const ultSlashScaling = ult(e, 2.20, 2.376)
  const ultCullScaling = ult(e, 2.20, 2.376)
  const ultCullHitsScaling = ult(e, 0.72, 0.7776)

  const blockCdBuff = ult(e, 1.00, 1.08)

  const talentCounterScaling = talent(e, 1.20, 1.32)

  const maxCullHits = (e >= 1) ? 9 : 6

  // Slash is the same, 1 hit
  const fuaHitCountMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1), // 0.06
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 1), // 0.12
    5: ASHBLAZING_ATK_STACK * (3 * 1 / 1), // 0.18
  }

  const cullHitCountMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.12 + 2 * 0.12 + 3 * 0.12 + 4 * 0.12 + 5 * 0.12 + 6 * 0.12 + 7 * 0.12 + 8 * 0.16), // 0.2784
    3: ASHBLAZING_ATK_STACK * (2 * 0.12 + 5 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.16), // 0.4152
    5: ASHBLAZING_ATK_STACK * (3 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.16), // 0.444
  }

  function getHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals as Conditionals<typeof content>
    return (r.blockActive && r.ultCull)
      ? cullHitCountMultiByTargets[context.enemyCount]
      : fuaHitCountMultiByTargets[context.enemyCount]
  }

  const defaults = {
    blockActive: true,
    ultCull: true,
    ultCullHits: maxCullHits,
    counterAtkBuff: true,
    e1UltBuff: true,
    e2DefShred: true,
    e4ResBuff: true,
    e6Buffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    blockActive: {
      id: 'blockActive',
      formItem: 'switch',
      text: t('Content.blockActive.text'),
      content: t('Content.blockActive.content'),
    },
    ultCull: {
      id: 'ultCull',
      formItem: 'switch',
      text: t('Content.ultCull.text'),
      content: t('Content.ultCull.content', {
        CullScaling: TsUtils.precisionRound(100 * ultCullScaling),
        CullAdjacentScaling: TsUtils.precisionRound(100 * 0.5 * ultCullScaling),
        CullAdditionalScaling: TsUtils.precisionRound(100 * ultCullHitsScaling),
      }),
    },
    ultCullHits: {
      id: 'ultCullHits',
      formItem: 'slider',
      text: t('Content.ultCullHits.text'),
      content: t('Content.ultCullHits.content', {
        CullScaling: TsUtils.precisionRound(100 * ultCullScaling),
        CullAdjacentScaling: TsUtils.precisionRound(100 * 0.5 * ultCullScaling),
        CullAdditionalScaling: TsUtils.precisionRound(100 * ultCullHitsScaling),
      }),
      min: 0,
      max: maxCullHits,
    },
    counterAtkBuff: {
      id: 'counterAtkBuff',
      formItem: 'switch',
      text: t('Content.counterAtkBuff.text'),
      content: t('Content.counterAtkBuff.content'),
    },
    e1UltBuff: {
      id: 'e1UltBuff',
      formItem: 'switch',
      text: t('Content.e1UltBuff.text'),
      content: t('Content.e1UltBuff.content'),
      disabled: e < 1,
    },
    e2DefShred: {
      id: 'e2DefShred',
      formItem: 'switch',
      text: t('Content.e2DefShred.text'),
      content: t('Content.e2DefShred.content'),
      disabled: e < 2,
    },
    e4ResBuff: {
      id: 'e4ResBuff',
      formItem: 'switch',
      text: t('Content.e4ResBuff.text'),
      content: t('Content.e4ResBuff.content'),
      disabled: e < 4,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: t('Content.e6Buffs.text'),
      content: t('Content.e6Buffs.content'),
      disabled: e < 6,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.FUA],
    content: () => Object.values(content),
    defaults: () => defaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      if (r.blockActive && r.ultCull) {
        x.FUA_DMG_TYPE.set(ULT_DMG_TYPE | FUA_DMG_TYPE, SOURCE_ULT)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      if (r.blockActive) {
        if (r.ultCull) {
          x.FUA_ATK_SCALING.buff(ultCullScaling + r.ultCullHits * ultCullHitsScaling, SOURCE_ULT)
        } else {
          x.FUA_ATK_SCALING.buff(ultSlashScaling, SOURCE_ULT)
        }
      } else {
        x.FUA_ATK_SCALING.buff(talentCounterScaling, SOURCE_TALENT)
      }

      buffAbilityCd(x, FUA_DMG_TYPE, (r.blockActive) ? blockCdBuff : 0, SOURCE_ULT)
      x.ATK_P.buff((r.counterAtkBuff) ? 0.30 : 0, SOURCE_TRACE)

      x.DMG_RED_MULTI.multiply((r.blockActive) ? 1 - 0.20 : 1, SOURCE_TRACE)

      buffAbilityDmg(x, FUA_DMG_TYPE, (e >= 1 && r.e1UltBuff && r.blockActive) ? 0.20 : 0, SOURCE_E1)
      buffAbilityDefPen(x, FUA_DMG_TYPE, (e >= 2 && r.e2DefShred) ? 0.20 : 0, SOURCE_E2)
      x.RES.buff((e >= 4 && r.e4ResBuff) ? 0.50 : 0, SOURCE_E4)
      buffAbilityCr(x, FUA_DMG_TYPE, (e >= 6 && r.e6Buffs && r.blockActive) ? 0.15 : 0, SOURCE_E6)
      buffAbilityResPen(x, FUA_DMG_TYPE, (e >= 6 && r.e6Buffs && r.blockActive) ? 0.20 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.FUA_TOUGHNESS_DMG.buff((r.blockActive) ? 20 : 10, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff((r.blockActive && r.ultCull) ? r.ultCullHits * 5 : 0, SOURCE_ULT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, getHitMulti(action, context))
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkP(getHitMulti(action, context))
    },
  }
}
