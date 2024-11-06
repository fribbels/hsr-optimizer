import { ASHBLAZING_ATK_STACK, FUA_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { buffAbilityCd, buffAbilityCr, buffAbilityDefPen, buffAbilityDmg, buffAbilityResPen } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { NumberToNumberMap } from 'types/Common'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Yunli')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

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
    const r: Conditionals<typeof content> = action.characterConditionals
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
      formItem: 'switch',
      id: 'blockActive',
      text: t('Content.blockActive.text'),
      content: t('Content.blockActive.content'),
    },
    ultCull: {
      formItem: 'switch',
      id: 'ultCull',
      text: t('Content.ultCull.text'),
      content: t('Content.ultCull.content', {
        CullScaling: TsUtils.precisionRound(100 * ultCullScaling),
        CullAdjacentScaling: TsUtils.precisionRound(100 * 0.5 * ultCullScaling),
        CullAdditionalScaling: TsUtils.precisionRound(100 * ultCullHitsScaling),
      }),
    },
    ultCullHits: {
      formItem: 'slider',
      id: 'ultCullHits',
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
      formItem: 'switch',
      id: 'counterAtkBuff',
      text: t('Content.counterAtkBuff.text'),
      content: t('Content.counterAtkBuff.content'),
    },
    e1UltBuff: {
      formItem: 'switch',
      id: 'e1UltBuff',
      text: t('Content.e1UltBuff.text'),
      content: t('Content.e1UltBuff.content'),
      disabled: e < 1,
    },
    e2DefShred: {
      formItem: 'switch',
      id: 'e2DefShred',
      text: t('Content.e2DefShred.text'),
      content: t('Content.e2DefShred.content'),
      disabled: e < 2,
    },
    e4ResBuff: {
      formItem: 'switch',
      id: 'e4ResBuff',
      text: t('Content.e4ResBuff.text'),
      content: t('Content.e4ResBuff.content'),
      disabled: e < 4,
    },
    e6Buffs: {
      formItem: 'switch',
      id: 'e6Buffs',
      text: t('Content.e6Buffs.text'),
      content: t('Content.e6Buffs.content'),
      disabled: e < 6,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals
      if (r.blockActive && r.ultCull) {
        x.FUA_DMG_TYPE.set(ULT_TYPE | FUA_TYPE, Source.NONE)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

      if (r.blockActive) {
        if (r.ultCull) {
          x.FUA_SCALING.buff(ultCullScaling + r.ultCullHits * ultCullHitsScaling, Source.NONE)
        } else {
          x.FUA_SCALING.buff(ultSlashScaling, Source.NONE)
        }
      } else {
        x.FUA_SCALING.buff(talentCounterScaling, Source.NONE)
      }

      buffAbilityCd(x, FUA_TYPE, (r.blockActive) ? blockCdBuff : 0, Source.NONE)
      x.ATK_P.buff((r.counterAtkBuff) ? 0.30 : 0, Source.NONE)

      x.DMG_RED_MULTI.multiply((r.blockActive) ? 1 - 0.20 : 1, Source.NONE)

      buffAbilityDmg(x, FUA_TYPE, (e >= 1 && r.e1UltBuff && r.blockActive) ? 0.20 : 0, Source.NONE)
      buffAbilityDefPen(x, FUA_TYPE, (e >= 2 && r.e2DefShred) ? 0.20 : 0, Source.NONE)
      x.RES.buff((e >= 4 && r.e4ResBuff) ? 0.50 : 0, Source.NONE)
      buffAbilityCr(x, FUA_TYPE, (e >= 6 && r.e6Buffs && r.blockActive) ? 0.15 : 0, Source.NONE)
      buffAbilityResPen(x, FUA_TYPE, (e >= 6 && r.e6Buffs && r.blockActive) ? 0.20 : 0, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff(60, Source.NONE)
      x.FUA_TOUGHNESS_DMG.buff((r.blockActive) ? 60 : 30, Source.NONE)
      x.FUA_TOUGHNESS_DMG.buff((r.blockActive && r.ultCull) ? r.ultCullHits * 15 : 0, Source.NONE)

      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardFuaAtkFinalizer(x, action, context, getHitMulti(action, context))
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardFuaAtkFinalizer(getHitMulti(action, context))
    },
  }
}
