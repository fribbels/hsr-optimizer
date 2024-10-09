import { Stats } from 'lib/constants'

import { ASHBLAZING_ATK_STACK, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon, withoutContent: boolean): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const ultCdBuffValue = ult(e, 0.50, 0.54)
  const talentCdBuffValue = ult(e, 0.30, 0.33)
  const talentCrBuffValue = ult(e, 0.20, 0.21)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.20, 2.42)
  const ultScaling = ult(e, 3.50, 3.78)
  const fuaScaling = talent(e, 0.50, 0.55)

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Characters.Yanqing.Content')
    return [{
      formItem: 'switch',
      id: 'ultBuffActive',
      name: 'ultBuffActive',
      text: t('ultBuffActive.text'),
      title: t('ultBuffActive.title'),
      content: t('ultBuffActive.content', { ultCdBuffValue: TsUtils.precisionRound(100 * ultCdBuffValue) }),
    }, {
      formItem: 'switch',
      id: 'soulsteelBuffActive',
      name: 'soulsteelBuffActive',
      text: t('soulsteelBuffActive.text'),
      title: t('soulsteelBuffActive.title'),
      content: t('soulsteelBuffActive.content', { talentCdBuffValue: TsUtils.precisionRound(100 * talentCdBuffValue), talentCrBuffValue: TsUtils.precisionRound(100 * talentCrBuffValue), ultCdBuffValue: TsUtils.precisionRound(100 * ultCdBuffValue) }),
    }, {
      formItem: 'switch',
      id: 'critSpdBuff',
      name: 'critSpdBuff',
      text: t('critSpdBuff.text'),
      title: t('critSpdBuff.title'),
      content: t('critSpdBuff.content'),
    }, {
      formItem: 'switch',
      id: 'e1TargetFrozen',
      name: 'e1TargetFrozen',
      text: t('e1TargetFrozen.text'),
      title: t('e1TargetFrozen.title'),
      content: t('e1TargetFrozen.content'),
      disabled: (e < 1),
    }, {
      formItem: 'switch',
      id: 'e4CurrentHp80',
      name: 'e4CurrentHp80',
      text: t('e4CurrentHp80.text'),
      title: t('e4CurrentHp80.title'),
      content: t('e4CurrentHp80.content'),
      disabled: (e < 4),
    }]
  })()

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      ultBuffActive: true,
      soulsteelBuffActive: true,
      critSpdBuff: true,
      e1TargetFrozen: true,
      e4CurrentHp80: true,
    }),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      // Stats
      x[Stats.CR] += (r.ultBuffActive) ? 0.60 : 0
      x[Stats.CD] += (r.ultBuffActive && r.soulsteelBuffActive) ? ultCdBuffValue : 0
      x[Stats.CR] += (r.soulsteelBuffActive) ? talentCrBuffValue : 0
      x[Stats.CD] += (r.soulsteelBuffActive) ? talentCdBuffValue : 0
      x[Stats.RES] += (r.soulsteelBuffActive) ? 0.20 : 0
      x[Stats.SPD_P] += (r.critSpdBuff) ? 0.10 : 0
      x[Stats.ERR] += (e >= 2 && r.soulsteelBuffActive) ? 0.10 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling

      x.BASIC_SCALING += (request.enemyElementalWeak) ? 0.30 : 0
      x.SKILL_SCALING += (request.enemyElementalWeak) ? 0.30 : 0
      x.ULT_SCALING += (request.enemyElementalWeak) ? 0.30 : 0
      x.FUA_SCALING += (request.enemyElementalWeak) ? 0.30 : 0

      x.BASIC_SCALING += (e >= 1 && r.e1TargetFrozen) ? 0.60 : 0
      x.SKILL_SCALING += (e >= 1 && r.e1TargetFrozen) ? 0.60 : 0
      x.ULT_SCALING += (e >= 1 && r.e1TargetFrozen) ? 0.60 : 0
      x.FUA_SCALING += (e >= 1 && r.e1TargetFrozen) ? 0.60 : 0

      // Boost
      x.ICE_RES_PEN += (e >= 4 && r.e4CurrentHp80) ? 0.12 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 90
      x.FUA_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      standardFuaAtkFinalizer(x, request, hitMulti)
    },
    gpuFinalizeCalculations: (request: Form) => {
      return gpuStandardFuaAtkFinalizer(hitMulti)
    },
  }
}
