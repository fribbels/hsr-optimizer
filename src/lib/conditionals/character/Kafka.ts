import { ASHBLAZING_ATK_STACK, ComputedStatsObject, DOT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { buffAbilityDmg, buffAbilityVulnerability } from 'lib/optimizer/calculateBuffs'
import i18next from 'i18next'

export default (e: Eidolon, withoutContent: boolean): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.60, 1.76)
  const ultScaling = ult(e, 0.80, 0.864)
  const fuaScaling = talent(e, 1.40, 1.596)
  const dotScaling = ult(e, 2.90, 3.183)

  const hitMulti = ASHBLAZING_ATK_STACK
    * (1 * 0.15 + 2 * 0.15 + 3 * 0.15 + 4 * 0.15 + 5 * 0.15 + 6 * 0.25)

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Characters.Kafka.Content')
    return [
      {
        formItem: 'switch',
        id: 'e1DotDmgReceivedDebuff',
        name: 'e1DotDmgReceivedDebuff',
        text: t('e1DotDmgReceivedDebuff.text'),
        title: t('e1DotDmgReceivedDebuff.title'),
        content: t('e1DotDmgReceivedDebuff.content'),
        disabled: e < 1,
      },
      {
        formItem: 'switch',
        id: 'e2TeamDotBoost',
        name: 'e2TeamDotBoost',
        text: t('e2TeamDotBoost.text'),
        title: t('e2TeamDotBoost.title'),
        content: t('e2TeamDotBoost.content'),
        disabled: e < 2,
      },
    ]
  })()

  const teammateContent: ContentItem[] = (() => {
    if (withoutContent) return []
    return [
      findContentId(content, 'e1DotDmgReceivedDebuff'),
      findContentId(content, 'e2TeamDotBoost'),
    ]
  })()

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      e1DotDmgReceivedDebuff: true,
      e2TeamDotBoost: true,
    }),
    teammateDefaults: () => ({
      e1DotDmgReceivedDebuff: true,
      e2TeamDotBoost: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling
      x.DOT_SCALING += dotScaling

      // Boost
      x.DOT_SCALING += (e >= 6) ? 1.56 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 60
      x.FUA_TOUGHNESS_DMG += 30

      x.DOT_CHANCE = 1.30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      buffAbilityVulnerability(x, DOT_TYPE, 0.30, (e >= 1 && m.e1DotDmgReceivedDebuff))
      buffAbilityDmg(x, DOT_TYPE, 0.25, (e >= 2 && m.e2TeamDotBoost))
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      standardFuaAtkFinalizer(x, request, hitMulti)
    },
    gpuFinalizeCalculations: (request: Form) => {
      return gpuStandardFuaAtkFinalizer(hitMulti)
    },
  }
}
