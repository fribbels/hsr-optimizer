import { ConditionalActivation, ConditionalType, CURRENT_DATA_VERSION, Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { buffStat, conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'
import i18next from 'i18next'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sunday')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5 // TODO

  const skillDmgBoostValue = skill(e, 0.50, 0.50)
  const ultCdBoostValue = ult(e, 0.325, 0.325)
  const ultCdBoostBaseValue = ult(e, 0.088, 0.088)
  const talentCrBuffValue = talent(e, 0.25, 0.25)

  const basicScaling = basic(e, 1.0, 1.1)

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'skillDmgBuff',
      name: 'skillDmgBuff',
      text: 'Skill DMG buff',
      title: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    {
      name: 'talentCrBuffStacks',
      id: 'talentCrBuffStacks',
      formItem: 'slider',
      text: 'Talent CR buff stacks',
      title: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: e < 6 ? 1 : 3,
    },
    {
      formItem: 'switch',
      id: 'e1ResPen',
      name: 'e1ResPen',
      text: 'E1 RES PEN',
      title: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e2SpdBuff',
      name: 'e2SpdBuff',
      text: 'E2 SPD buff',
      title: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 2,
    },
    {
      formItem: 'switch',
      id: 'e6CrToCdConversion',
      name: 'e6CrToCdConversion',
      text: 'E6 CR to CD conversion',
      title: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = [
    // TODO
    findContentId(content, 'skillDmgBuff'),
    findContentId(content, 'talentCrBuffStacks'),
    {
      formItem: 'switch',
      id: 'beatified',
      name: 'beatified',
      text: 'Ult CD buff',
      title: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    {
      formItem: 'slider',
      id: 'teammateCDValue',
      name: 'teammateCDValue',
      text: 'Sunday Combat CD',
      title: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 3.00,
      percent: true,
    },
    findContentId(content, 'e1ResPen'),
    findContentId(content, 'e2SpdBuff'),
    findContentId(content, 'e6CrToCdConversion'),
  ]

  const defaults = {
    skillDmgBuff: false,
    talentCrBuffStacks: 0,
    e1ResPen: false,
    e2SpdBuff: true,
    e6CrToCdConversion: false,
  }

  const teammateDefaults = {
    skillDmgBuff: true,
    talentCrBuffStacks: e < 6 ? 1 : 3,
    teammateCDValue: 2.50,
    e1ResPen: true,
    e2SpdBuff: true,
    e6CrToCdConversion: true,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => (teammateDefaults),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      // Stats

      x.BASIC_SCALING += basicScaling

      // TODO: toughness
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      x[Stats.CR] += m.talentCrBuffStacks * talentCrBuffValue
      x.ELEMENTAL_DMG += (m.skillDmgBuff) ? skillDmgBoostValue : 0
      // TODO: auto calculate summon
      x.ELEMENTAL_DMG += (m.skillDmgBuff && m.skillDmgBuffSummon) ? skillDmgBoostValue : 0

      x.RES_PEN += (e >= 1 && m.e1ResPen && m.skillDmgBuff) ? 0.20 : 0

      x[Stats.SPD] += (e >= 2 && m.e2SpdBuff) ? 20 : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals

      x[Stats.CD] += (t.beatified) ? ultCdBoostValue * t.teammateCDValue : 0
      x[Stats.CD] += (t.beatified) ? ultCdBoostBaseValue : 0
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      standardAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardAtkFinalizer()
    },
    teammateDynamicConditionals: [
      {
        id: 'SundayCrConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CR],
        ratioConversion: true,
        condition: function (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) {
          return x[Stats.CR] > 1.00
        },
        effect: function (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals
          if (!(e >= 6 && r.e6CrToCdConversion)) {
            return
          }

          const stateValue = action.conditionalState[this.id] || 0
          const buffValue = Math.floor((x[Stats.CR] - 1.00) / 0.01) * 2.00 * 0.01

          action.conditionalState[this.id] = buffValue
          buffStat(x, Stats.CD, buffValue - stateValue, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals

          return conditionalWgslWrapper(this, `
if (${wgslFalse(e >= 6 && r.e6CrToCdConversion)}) {
  return;
}

let cr = (*p_x).CR;
let stateValue: f32 = (*p_state).SundayCrConditional;

if (cr > 1.00) {
  let buffValue: f32 = floor((cr - 1.00) / 0.01) * 2.00 * 0.01;

  (*p_state).SundayCrConditional = buffValue;
  buffDynamicCD(buffValue - stateValue, p_x, p_state);
}
    `)
        },
      },
    ],
  }
}
