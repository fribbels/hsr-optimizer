import { Stats } from 'lib/constants'
import { AbilityEidolon, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { ASHBLAZING_ATK_STACK, ComputedStatsObject, FUA_TYPE } from 'lib/conditionals/conditionalConstants'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { NumberToNumberMap } from 'types/Common'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.DrRatio')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const debuffStacksMax = 5
  const summationStacksMax = (e >= 1) ? 10 : 6

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.50, 1.65)
  const ultScaling = ult(e, 2.40, 2.592)
  const fuaScaling = talent(e, 2.70, 2.97)

  function e2FuaRatio(procs: number, fua = true) {
    return fua
      ? fuaScaling / (fuaScaling + 0.20 * procs) // for fua dmg
      : 0.20 / (fuaScaling + 0.20 * procs) // for each e2 proc
  }

  const baseHitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)
  const fuaMultiByDebuffs: NumberToNumberMap = {
    0: ASHBLAZING_ATK_STACK * (1 * 1 / 1), // 0
    1: ASHBLAZING_ATK_STACK * (1 * e2FuaRatio(1, true) + 2 * e2FuaRatio(1, false)), // 2
    2: ASHBLAZING_ATK_STACK * (1 * e2FuaRatio(2, true) + 5 * e2FuaRatio(2, false)), // 2 + 3
    3: ASHBLAZING_ATK_STACK * (1 * e2FuaRatio(3, true) + 9 * e2FuaRatio(3, false)), // 2 + 3 + 4
    4: ASHBLAZING_ATK_STACK * (1 * e2FuaRatio(4, true) + 14 * e2FuaRatio(4, false)), // 2 + 3 + 4 + 5
  }

  function getHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals
    return e >= 2
      ? fuaMultiByDebuffs[Math.min(4, r.enemyDebuffStacks)]
      : baseHitMulti
  }

  const content: ContentItem[] = [{
    id: 'summationStacks',
    name: 'summationStacks',
    formItem: 'slider',
    text: t('Content.summationStacks.text'),
    title: t('Content.summationStacks.title'),
    content: t('Content.summationStacks.content', { summationStacksMax }),
    min: 0,
    max: summationStacksMax,
  }, {
    id: 'enemyDebuffStacks',
    name: 'enemyDebuffStacks',
    formItem: 'slider',
    text: t('Content.enemyDebuffStacks.text'),
    title: t('Content.enemyDebuffStacks.title'),
    content: t('Content.enemyDebuffStacks.content', { FuaScaling: TsUtils.precisionRound(100 * fuaScaling) }),
    min: 0,
    max: debuffStacksMax,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      enemyDebuffStacks: debuffStacksMax,
      summationStacks: summationStacksMax,
    }),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // Stats
      x[Stats.CR] += r.summationStacks * 0.025
      x[Stats.CD] += r.summationStacks * 0.05

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling

      // Boost
      x.ELEMENTAL_DMG += (r.enemyDebuffStacks >= 3) ? Math.min(0.50, r.enemyDebuffStacks * 0.10) : 0
      buffAbilityDmg(x, FUA_TYPE, 0.50, (e >= 6))

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 90
      x.FUA_TOUGHNESS_DMG += 30

      return x
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      standardFuaAtkFinalizer(x, action, context, getHitMulti(action, context))
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardFuaAtkFinalizer(getHitMulti(action, context))
    },
  }
}