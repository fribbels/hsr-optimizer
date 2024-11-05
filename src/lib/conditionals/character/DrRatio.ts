import { ASHBLAZING_ATK_STACK, FUA_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { NumberToNumberMap } from 'types/Common'
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
    const r: Conditionals<typeof content> = action.characterConditionals
    return e >= 2
      ? fuaMultiByDebuffs[Math.min(4, r.enemyDebuffStacks)]
      : baseHitMulti
  }

  const defaults = {
    enemyDebuffStacks: debuffStacksMax,
    summationStacks: summationStacksMax,
  }

  const content: ContentDefinition<typeof defaults> = {
    summationStacks: {
      formItem: 'slider',
      id: 'summationStacks',
      text: t('Content.summationStacks.text'),
      content: t('Content.summationStacks.content', { summationStacksMax }),
      min: 0,
      max: summationStacksMax,
    },
    enemyDebuffStacks: {
      formItem: 'slider',
      id: 'enemyDebuffStacks',
      text: t('Content.enemyDebuffStacks.text'),
      content: t('Content.enemyDebuffStacks.content', { FuaScaling: TsUtils.precisionRound(100 * fuaScaling) }),
      min: 0,
      max: debuffStacksMax,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

      // Stats
      x.CR.buff(r.summationStacks * 0.025, Source.NONE)
      x.CD.buff(r.summationStacks * 0.05, Source.NONE)

      // Scaling
      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling, Source.NONE)
      x.FUA_SCALING.buff(fuaScaling, Source.NONE)

      // Boost
      x.ELEMENTAL_DMG.buff((r.enemyDebuffStacks >= 3) ? Math.min(0.50, r.enemyDebuffStacks * 0.10) : 0, Source.NONE)
      buffAbilityDmg(x, FUA_TYPE, (e >= 6) ? 0.50 : 0, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff(60, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(90, Source.NONE)
      x.FUA_TOUGHNESS_DMG.buff(30, Source.NONE)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardFuaAtkFinalizer(x, action, context, getHitMulti(action, context))
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardFuaAtkFinalizer(getHitMulti(action, context))
    },
  }
}
