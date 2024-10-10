import { AbilityEidolon, findContentId } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Eidolon } from 'types/Character'
import { ContentItem } from 'types/Conditionals'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { Stats } from 'lib/constants'
import { AventurineConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon, withoutContent: boolean): CharacterConditional => {
  const { basic, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.70, 2.916)
  const ultCdBoost = ult(e, 0.15, 0.162)

  const talentDmgScaling = talent(e, 0.25, 0.275)
  const talentResScaling = talent(e, 0.50, 0.55)

  const fuaHits = (e >= 4) ? 10 : 7

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Characters.Aventurine.Content')
    return [
      {
        formItem: 'switch',
        id: 'defToCrBoost',
        name: 'defToCrBoost',
        text: t('defToCrBoost.text'),
        title: t('defToCrBoost.title'),
        content: t('defToCrBoost.content'),
      },
      {
        formItem: 'switch',
        id: 'fortifiedWagerBuff',
        name: 'fortifiedWagerBuff',
        text: t('fortifiedWagerBuff.text'),
        title: t('fortifiedWagerBuff.title'),
        content: t('fortifiedWagerBuff.content', { talentResScaling: TsUtils.precisionRound(100 * talentResScaling) }),
      },
      {
        formItem: 'switch',
        id: 'enemyUnnervedDebuff',
        name: 'enemyUnnervedDebuff',
        text: t('enemyUnnervedDebuff.text'),
        title: t('enemyUnnervedDebuff.title'),
        content: t('enemyUnnervedDebuff.content', { ultCdBoost: TsUtils.precisionRound(100 * ultCdBoost) }),
      },
      {
        formItem: 'slider',
        id: 'fuaHitsOnTarget',
        name: 'fuaHitsOnTarget',
        text: t('fuaHitsOnTarget.text'),
        title: t('fuaHitsOnTarget.title'),
        content: t('fuaHitsOnTarget.content', { talentDmgScaling: TsUtils.precisionRound(100 * talentDmgScaling) }),
        min: 0,
        max: fuaHits,
      },
      {
        formItem: 'switch',
        id: 'e2ResShred',
        name: 'e2ResShred',
        text: t('e2ResShred.text'),
        title: t('e2ResShred.title'),
        content: t('e2ResShred.content'),
        disabled: e < 2,
      },
      {
        formItem: 'switch',
        id: 'e4DefBuff',
        name: 'e4DefBuff',
        text: t('e4DefBuff.text'),
        title: t('e4DefBuff.title'),
        content: t('e4DefBuff.content'),
        disabled: e < 4,
      },
      {
        formItem: 'slider',
        id: 'e6ShieldStacks',
        name: 'e6ShieldStacks',
        text: t('e6ShieldStacks.text'),
        title: t('e6ShieldStacks.title'),
        content: t('e6ShieldStacks.content'),
        min: 0,
        max: 3,
        disabled: e < 6,
      },
    ]
  })()

  const teammateContent: ContentItem[] = (() => {
    if (withoutContent) return []
    return [
      findContentId(content, 'fortifiedWagerBuff'),
      findContentId(content, 'enemyUnnervedDebuff'),
      findContentId(content, 'e2ResShred'),
    ]
  })()

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      defToCrBoost: true,
      fuaHitsOnTarget: fuaHits,
      fortifiedWagerBuff: true,
      enemyUnnervedDebuff: true,
      e2ResShred: true,
      e4DefBuff: true,
      e6ShieldStacks: 3,
    }),
    teammateDefaults: () => ({
      fortifiedWagerBuff: true,
      enemyUnnervedDebuff: true,
      e2ResShred: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      x[Stats.DEF_P] += (e >= 4 && r.e4DefBuff) ? 0.40 : 0
      x.ELEMENTAL_DMG += (e >= 6) ? Math.min(1.50, 0.50 * r.e6ShieldStacks) : 0

      x.BASIC_SCALING += basicScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += talentDmgScaling * r.fuaHitsOnTarget

      x.BASIC_TOUGHNESS_DMG += 30
      x.ULT_TOUGHNESS_DMG += 90
      x.FUA_TOUGHNESS_DMG += 10 * r.fuaHitsOnTarget

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.RES] += (m.fortifiedWagerBuff) ? talentResScaling : 0
      x[Stats.CD] += (m.enemyUnnervedDebuff) ? ultCdBoost : 0
      x[Stats.CD] += (e >= 1 && m.fortifiedWagerBuff) ? 0.20 : 0
      x.RES_PEN += (e >= 2 && m.e2ResShred) ? 0.12 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.DEF]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.DEF]
      x.FUA_DMG += x.FUA_SCALING * x[Stats.DEF]
    },
    gpuFinalizeCalculations: () => {
      return `
x.BASIC_DMG += x.BASIC_SCALING * x.DEF;
x.ULT_DMG += x.ULT_SCALING * x.DEF;
x.FUA_DMG += x.FUA_SCALING * x.DEF;
      `
    },
    dynamicConditionals: [AventurineConversionConditional],
  }
}
