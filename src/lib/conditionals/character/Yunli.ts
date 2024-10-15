import { ASHBLAZING_ATK_STACK, ComputedStatsObject, FUA_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { buffAbilityCd, buffAbilityCr, buffAbilityDefPen, buffAbilityDmg, buffAbilityResPen } from 'lib/optimizer/calculateBuffs'
import { NumberToNumberMap } from 'types/Common'
import { TsUtils } from 'lib/TsUtils'
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
    const r = action.characterConditionals
    return (r.blockActive && r.ultCull)
      ? cullHitCountMultiByTargets[context.enemyCount]
      : fuaHitCountMultiByTargets[context.enemyCount]
  }

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'blockActive',
      name: 'blockActive',
      text: t('Content.blockActive.text'),
      title: t('Content.blockActive.title'),
      content: t('Content.blockActive.content'),
    },
    {
      formItem: 'switch',
      id: 'ultCull',
      name: 'ultCull',
      text: t('Content.ultCull.text'),
      title: t('Content.ultCull.title'),
      content: t('Content.ultCull.content', { CullScaling: TsUtils.precisionRound(100 * ultCullScaling), CullAdjacentScaling: TsUtils.precisionRound(100 * 0.5 * ultCullScaling), CullAdditionalScaling: TsUtils.precisionRound(100 * ultCullHitsScaling) }),
    },
    {
      formItem: 'slider',
      id: 'ultCullHits',
      name: 'ultCullHits',
      text: t('Content.ultCullHits.text'),
      title: t('Content.ultCullHits.title'),
      content: t('Content.ultCullHits.content', { CullScaling: TsUtils.precisionRound(100 * ultCullScaling), CullAdjacentScaling: TsUtils.precisionRound(100 * 0.5 * ultCullScaling), CullAdditionalScaling: TsUtils.precisionRound(100 * ultCullHitsScaling) }),
      min: 0,
      max: maxCullHits,
    },
    {
      formItem: 'switch',
      id: 'counterAtkBuff',
      name: 'counterAtkBuff',
      text: t('Content.counterAtkBuff.text'),
      title: t('Content.counterAtkBuff.title'),
      content: t('Content.counterAtkBuff.content'),
    },
    {
      formItem: 'switch',
      id: 'e1UltBuff',
      name: 'e1UltBuff',
      text: t('Content.e1UltBuff.text'),
      title: t('Content.e1UltBuff.title'),
      content: t('Content.e1UltBuff.content'),
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e2DefShred',
      name: 'e2DefShred',
      text: t('Content.e2DefShred.text'),
      title: t('Content.e2DefShred.title'),
      content: t('Content.e2DefShred.content'),
      disabled: e < 2,
    },
    {
      formItem: 'switch',
      id: 'e4ResBuff',
      name: 'e4ResBuff',
      text: t('Content.e4ResBuff.text'),
      title: t('Content.e4ResBuff.title'),
      content: t('Content.e4ResBuff.content'),
      disabled: e < 4,
    },
    {
      formItem: 'switch',
      id: 'e6Buffs',
      name: 'e6Buffs',
      text: t('Content.e6Buffs.text'),
      title: t('Content.e6Buffs.title'),
      content: t('Content.e6Buffs.content'),
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = []

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

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => ({}),
    initializeConfigurations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals
      if (r.blockActive && r.ultCull) {
        x.FUA_DMG_TYPE = ULT_TYPE | FUA_TYPE
      }
    },
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      if (r.blockActive) {
        if (r.ultCull) {
          x.FUA_SCALING += ultCullScaling + r.ultCullHits * ultCullHitsScaling
        } else {
          x.FUA_SCALING += ultSlashScaling
        }
      } else {
        x.FUA_SCALING += talentCounterScaling
      }

      buffAbilityCd(x, FUA_TYPE, blockCdBuff, (r.blockActive))
      x[Stats.ATK_P] += (r.counterAtkBuff) ? 0.30 : 0

      x.DMG_RED_MULTI *= (r.blockActive) ? 1 - 0.20 : 1

      buffAbilityDmg(x, FUA_TYPE, 0.20, (e >= 1 && r.e1UltBuff && r.blockActive))
      buffAbilityDefPen(x, FUA_TYPE, 0.20, (e >= 2 && r.e2DefShred))
      x[Stats.RES] += (e >= 4 && r.e4ResBuff) ? 0.50 : 0
      buffAbilityCr(x, FUA_TYPE, 0.15, (e >= 6 && r.e6Buffs && r.blockActive))
      buffAbilityResPen(x, FUA_TYPE, 0.20, (e >= 6 && r.e6Buffs && r.blockActive))

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.FUA_TOUGHNESS_DMG += (r.blockActive) ? 60 : 30
      x.FUA_TOUGHNESS_DMG += (r.blockActive && r.ultCull) ? r.ultCullHits * 15 : 0

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      standardFuaAtkFinalizer(x, action, context, getHitMulti(action, context))
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardFuaAtkFinalizer(getHitMulti(action, context))
    },
  }
}
