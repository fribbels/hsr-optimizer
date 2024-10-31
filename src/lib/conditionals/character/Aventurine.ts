import { ComputedStatsObject, NONE_TYPE, SKILL_TYPE } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  findContentId,
  gpuStandardDefFinalizer,
  gpuStandardDefShieldFinalizer,
  standardDefFinalizer,
  standardDefShieldFinalizer,
} from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { AventurineConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { TsUtils } from 'lib/TsUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Aventurine')
  const tShield = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.ShieldAbility')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.70, 2.916)
  const ultCdBoost = ult(e, 0.15, 0.162)

  const talentDmgScaling = talent(e, 0.25, 0.275)
  const talentResScaling = talent(e, 0.50, 0.55)

  const fuaHits = (e >= 4) ? 10 : 7

  const skillShieldScaling = skill(e, 0.24, 0.256)
  const skillShieldFlat = skill(e, 320, 356)

  const traceShieldScaling = 0.07
  const traceShieldFlat = 96

  const content: ContentItem[] = [
    {
      formItem: 'select',
      id: 'shieldAbility',
      text: tShield('Text'),
      content: tShield('Content'),
      options: [
        { display: tShield('Skill'), value: SKILL_TYPE, label: tShield('Skill') },
        { display: tShield('Trace'), value: NONE_TYPE, label: tShield('Trace') },
      ],
      fullWidth: true,
    },
    {
      formItem: 'switch',
      id: 'defToCrBoost',
      text: t('Content.defToCrBoost.text'),
      content: t('Content.defToCrBoost.content'),
    },
    {
      formItem: 'switch',
      id: 'fortifiedWagerBuff',
      text: t('Content.fortifiedWagerBuff.text'),
      content: t('Content.fortifiedWagerBuff.content', { talentResScaling: TsUtils.precisionRound(100 * talentResScaling) }),
    },
    {
      formItem: 'switch',
      id: 'enemyUnnervedDebuff',
      text: t('Content.enemyUnnervedDebuff.text'),
      content: t('Content.enemyUnnervedDebuff.content', { ultCdBoost: TsUtils.precisionRound(100 * ultCdBoost) }),
    },
    {
      formItem: 'slider',
      id: 'fuaHitsOnTarget',
      text: t('Content.fuaHitsOnTarget.text'),
      content: t('Content.fuaHitsOnTarget.content', { talentDmgScaling: TsUtils.precisionRound(100 * talentDmgScaling) }),
      min: 0,
      max: fuaHits,
    },
    {
      formItem: 'switch',
      id: 'e2ResShred',
      text: t('Content.e2ResShred.text'),
      content: t('Content.e2ResShred.content'),
      disabled: e < 2,
    },
    {
      formItem: 'switch',
      id: 'e4DefBuff',
      text: t('Content.e4DefBuff.text'),
      content: t('Content.e4DefBuff.content'),
      disabled: e < 4,
    },
    {
      formItem: 'slider',
      id: 'e6ShieldStacks',
      text: t('Content.e6ShieldStacks.text'),
      content: t('Content.e6ShieldStacks.content'),
      min: 0,
      max: 3,
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'fortifiedWagerBuff'),
    findContentId(content, 'enemyUnnervedDebuff'),
    findContentId(content, 'e2ResShred'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      shieldAbility: SKILL_TYPE,
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
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      x[Stats.DEF_P] += (e >= 4 && r.e4DefBuff) ? 0.40 : 0
      x.ELEMENTAL_DMG += (e >= 6) ? Math.min(1.50, 0.50 * r.e6ShieldStacks) : 0

      x.BASIC_SCALING += basicScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += talentDmgScaling * r.fuaHitsOnTarget

      x.BASIC_TOUGHNESS_DMG += 30
      x.ULT_TOUGHNESS_DMG += 90
      x.FUA_TOUGHNESS_DMG += 10 * r.fuaHitsOnTarget

      if (r.shieldAbility == SKILL_TYPE) {
        x.SHIELD_SCALING += skillShieldScaling
        x.SHIELD_FLAT += skillShieldFlat
      }
      if (r.shieldAbility == 0) {
        x.SHIELD_SCALING += traceShieldScaling
        x.SHIELD_FLAT += traceShieldFlat
      }

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      x[Stats.RES] += (m.fortifiedWagerBuff) ? talentResScaling : 0
      x[Stats.CD] += (m.enemyUnnervedDebuff) ? ultCdBoost : 0
      x[Stats.CD] += (e >= 1 && m.fortifiedWagerBuff) ? 0.20 : 0
      x.RES_PEN += (e >= 2 && m.e2ResShred) ? 0.12 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      standardDefFinalizer(x)
      standardDefShieldFinalizer(x)
    },
    gpuFinalizeCalculations: () => {
      return gpuStandardDefFinalizer() + gpuStandardDefShieldFinalizer()
    },
    dynamicConditionals: [AventurineConversionConditional],
  }
}
