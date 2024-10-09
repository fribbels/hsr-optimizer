import { ASHBLAZING_ATK_STACK, BREAK_TYPE, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { buffAbilityVulnerability } from 'lib/optimizer/calculateBuffs'
import { NumberToNumberMap } from 'types/Common'
import { LingshaConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon, withoutContent: boolean): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.80, 0.88)
  const ultScaling = ult(e, 1.50, 1.65)
  const ultBreakVulnerability = ult(e, 0.25, 0.27)
  const fuaScaling = talent(e, 0.75, 0.825)

  const hitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 2 + 2 * 1 / 2),
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 2 + 3 * 1 / 2),
    5: ASHBLAZING_ATK_STACK * (3 * 1 / 2 + 4 * 1 / 2),
  }

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Characters.Lingsha.Content')
    return [
      {
        formItem: 'switch',
        id: 'beConversion',
        name: 'beConversion',
        text: t('beConversion.text'),
        title: t('beConversion.title'),
        content: t('beConversion.content'),
      },
      {
        formItem: 'switch',
        id: 'befogState',
        name: 'befogState',
        text: t('befogState.text'),
        title: t('befogState.title'),
        content: t('befogState.content', { BefogVulnerability: TsUtils.precisionRound(100 * ultBreakVulnerability) }),
      },
      {
        formItem: 'switch',
        id: 'e1DefShred',
        name: 'e1DefShred',
        text: t('e1DefShred.text'),
        title: t('e1DefShred.title'),
        content: t('e1DefShred.content'),
        disabled: e < 1,
      },
      {
        formItem: 'switch',
        id: 'e2BeBuff',
        name: 'e2BeBuff',
        text: t('e2BeBuff.text'),
        title: t('e2BeBuff.title'),
        content: t('e2BeBuff.content'),
        disabled: e < 2,
      },
      {
        formItem: 'switch',
        id: 'e6ResShred',
        name: 'e6ResShred',
        text: t('e6ResShred.text'),
        title: t('e6ResShred.title'),
        content: t('e6ResShred.content'),
        disabled: e < 6,
      },
    ]
  })()

  const teammateContent: ContentItem[] = (() => {
    if (withoutContent) return []
    return [
      findContentId(content, 'befogState'),
      findContentId(content, 'e1DefShred'),
      findContentId(content, 'e2BeBuff'),
      findContentId(content, 'e6ResShred'),
    ]
  })()

  const defaults = {
    beConversion: true,
    befogState: true,
    e1DefShred: true,
    e2BeBuff: true,
    e6ResShred: true,
  }

  const teammateDefaults = {
    befogState: true,
    e1DefShred: true,
    e2BeBuff: true,
    e6ResShred: true,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.FUA_SCALING += fuaScaling * 2
      x.ULT_SCALING += ultScaling

      x.BREAK_EFFICIENCY_BOOST += (e >= 1) ? 0.50 : 0
      x.FUA_SCALING += (e >= 6 && r.e6ResShred) ? 0.50 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 30
      x.ULT_TOUGHNESS_DMG += 60
      x.FUA_TOUGHNESS_DMG += 30 * 2
      x.FUA_TOUGHNESS_DMG += (e >= 6) ? 15 : 0

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      if (x.ENEMY_WEAKNESS_BROKEN) {
        x.DEF_PEN += (e >= 1 && m.e1DefShred) ? 0.20 : 0
      }

      buffAbilityVulnerability(x, BREAK_TYPE, ultBreakVulnerability, (m.befogState))

      x[Stats.BE] += (e >= 2 && m.e2BeBuff) ? 0.40 : 0
      x.RES_PEN += (e >= 6 && m.e6ResShred) ? 0.20 : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      standardFuaAtkFinalizer(x, request, hitMultiByTargets[request.enemyCount])
    },
    gpuFinalizeCalculations: (request: Form) => {
      return gpuStandardFuaAtkFinalizer(hitMultiByTargets[request.enemyCount])
    },
    dynamicConditionals: [LingshaConversionConditional],
  }
}
