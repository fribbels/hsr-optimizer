import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon, withoutContent: boolean): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const talentExtraDmgScaling = talent(e, 0.72, 0.792)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.40, 1.54)
  const ultScaling = ult(e, 1.80, 1.944)
  const dotScaling = skill(e, 1.04, 1.144)

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Characters.Serval.Content')
    return [
      {
        formItem: 'switch',
        id: 'targetShocked',
        name: 'targetShocked',
        text: t('targetShocked.text'),
        title: t('targetShocked.title'),
        content: t('targetShocked.content', { talentExtraDmgScaling: TsUtils.precisionRound(100 * talentExtraDmgScaling) }),
      },
      {
        formItem: 'switch',
        id: 'enemyDefeatedBuff',
        name: 'enemyDefeatedBuff',
        text: t('enemyDefeatedBuff.text'),
        title: t('enemyDefeatedBuff.title'),
        content: t('enemyDefeatedBuff.content'),
      },
    ]
  })()

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      targetShocked: true,
      enemyDefeatedBuff: true,
    }),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      // Stats
      x[Stats.ATK_P] += (r.enemyDefeatedBuff) ? 0.20 : 0

      // Scaling;
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += dotScaling

      x.BASIC_SCALING += (r.targetShocked) ? talentExtraDmgScaling : 0
      x.SKILL_SCALING += (r.targetShocked) ? talentExtraDmgScaling : 0
      x.ULT_SCALING += (r.targetShocked) ? talentExtraDmgScaling : 0

      // Boost
      x.ELEMENTAL_DMG += (e >= 6 && r.targetShocked) ? 0.30 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 60

      x.DOT_CHANCE = 0.65

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
