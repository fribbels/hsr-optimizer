import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon, withoutContent: boolean): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const skillAtkBuffValue = skill(e, 0.80, 0.88)
  const ultCdBuffValue = skill(e, 0.65, 0.702)
  const ultCrBuffValue = skill(e, 0.28, 0.294)
  const talentAtkScaling = talent(e, 0.80, 0.88)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 3.80, 4.104)

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Characters.Yukong.Content')
    return [{
      formItem: 'switch',
      id: 'teamImaginaryDmgBoost',
      name: 'teamImaginaryDmgBoost',
      text: t('teamImaginaryDmgBoost.text'),
      title: t('teamImaginaryDmgBoost.title'),
      content: t('teamImaginaryDmgBoost.content'),
    }, {
      formItem: 'switch',
      id: 'roaringBowstringsActive',
      name: 'roaringBowstringsActive',
      text: t('roaringBowstringsActive.text'),
      title: t('roaringBowstringsActive.title'),
      content: t('roaringBowstringsActive.content', { skillAtkBuffValue: TsUtils.precisionRound(100 * skillAtkBuffValue) }),
    }, {
      formItem: 'switch',
      id: 'ultBuff',
      name: 'ultBuff',
      text: t('ultBuff.text'),
      title: t('ultBuff.title'),
      content: t('ultBuff.content', { ultCrBuffValue: TsUtils.precisionRound(100 * ultCrBuffValue), ultCdBuffValue: TsUtils.precisionRound(100 * ultCdBuffValue), ultScaling: TsUtils.precisionRound(100 * ultScaling) }),
    }, {
      formItem: 'switch',
      id: 'initialSpeedBuff',
      name: 'initialSpeedBuff',
      text: t('initialSpeedBuff.text'),
      title: t('initialSpeedBuff.title'),
      content: t('initialSpeedBuff.content'),
      disabled: e < 1,
    }]
  })()

  const teammateContent: ContentItem[] = (() => {
    if (withoutContent) return []
    return [
      findContentId(content, 'teamImaginaryDmgBoost'),
      findContentId(content, 'roaringBowstringsActive'),
      findContentId(content, 'ultBuff'),
      findContentId(content, 'initialSpeedBuff'),
    ]
  })()

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      teamImaginaryDmgBoost: true,
      roaringBowstringsActive: true,
      ultBuff: true,
      initialSpeedBuff: true,
    }),
    teammateDefaults: () => ({
      teamImaginaryDmgBoost: true,
      roaringBowstringsActive: true,
      ultBuff: true,
      initialSpeedBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.BASIC_SCALING += talentAtkScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.ELEMENTAL_DMG += (e >= 4 && r.roaringBowstringsActive) ? 0.30 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.ULT_TOUGHNESS_DMG += 90

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.ATK_P] += (m.roaringBowstringsActive) ? skillAtkBuffValue : 0
      x[Stats.CR] += (m.ultBuff && m.roaringBowstringsActive) ? ultCrBuffValue : 0
      x[Stats.CD] += (m.ultBuff && m.roaringBowstringsActive) ? ultCdBuffValue : 0
      x[Stats.SPD_P] += (e >= 1 && m.initialSpeedBuff) ? 0.10 : 0

      x[Stats.Imaginary_DMG] += (m.teamImaginaryDmgBoost) ? 0.12 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
