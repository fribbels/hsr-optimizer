import i18next from 'i18next'
import { AbilityEidolon, Conditionals, ContentDefinition, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, CURRENT_DATA_VERSION, Stats } from 'lib/constants'
import { buffDynamicStat, conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { ComputedStatsArray } from 'lib/optimizer/computedStatsArray'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sunday')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const skillDmgBoostValue = skill(e, 0.40, 0.44)
  const ultCdBoostValue = ult(e, 0.30, 0.336)
  const ultCdBoostBaseValue = ult(e, 0.12, 0.128)
  const talentCrBuffValue = talent(e, 0.20, 0.22)

  const basicScaling = basic(e, 1.00, 1.10)

  const content: ContentDefinition<typeof defaults> = [
    {
      formItem: 'switch',
      id: 'skillDmgBuff',
      text: 'Skill DMG buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    {
      id: 'talentCrBuffStacks',
      formItem: 'slider',
      text: 'Talent CR buff stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: e < 6 ? 1 : 3,
    },
    {
      formItem: 'switch',
      id: 'techniqueDmgBuff',
      text: 'Technique DMG buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    {
      formItem: 'switch',
      id: 'e1DefPen',
      text: 'E1 DEF PEN',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e2DmgBuff',
      text: 'E2 Beatified DMG buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 2,
    },
  ]

  const teammateContent: ContentDefinition<typeof teammateDefaults> = [
    findContentId(content, 'skillDmgBuff'),
    findContentId(content, 'talentCrBuffStacks'),
    {
      formItem: 'switch',
      id: 'beatified',
      text: 'Ult CD buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    {
      formItem: 'slider',
      id: 'teammateCDValue',
      text: 'Sunday Combat CD',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 3.00,
      percent: true,
    },
    findContentId(content, 'techniqueDmgBuff'),
    findContentId(content, 'e1DefPen'),
    findContentId(content, 'e2DmgBuff'),
    {
      formItem: 'switch',
      id: 'e6CrToCdConversion',
      text: 'E6 CR to CD conversion',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 6,
    },
  ]

  const defaults = {
    skillDmgBuff: false,
    talentCrBuffStacks: 0,
    techniqueDmgBuff: false,
    e1DefPen: false,
    e2DmgBuff: false,
  }

  const teammateDefaults = {
    skillDmgBuff: true,
    talentCrBuffStacks: e < 6 ? 1 : 3,
    beatified: true,
    teammateCDValue: 2.50,
    techniqueDmgBuff: false,
    e1DefPen: true,
    e2DmgBuff: true,
    e6CrToCdConversion: true,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => (teammateDefaults),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      // Stats

      x.BASIC_SCALING += basicScaling

      x.BASIC_TOUGHNESS_DMG = 30
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.characterConditionals

      x[Stats.CR] += m.talentCrBuffStacks * talentCrBuffValue
      x.ELEMENTAL_DMG += (m.skillDmgBuff) ? skillDmgBoostValue : 0
      x.ELEMENTAL_DMG += (m.skillDmgBuff && x.SUMMONS > 0) ? skillDmgBoostValue : 0
      x.ELEMENTAL_DMG += (m.techniqueDmgBuff) ? 0.50 : 0

      x.DEF_PEN += (e >= 1 && m.e1DefPen && m.skillDmgBuff) ? 0.20 : 0
      x.DEF_PEN += (e >= 1 && m.e1DefPen && m.skillDmgBuff && x.SUMMONS > 0) ? 0.20 : 0

      x.ELEMENTAL_DMG += (e >= 2 && m.e2DmgBuff) ? 0.30 : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t: Conditionals<typeof teammateContent> = action.characterConditionals

      x[Stats.CD] += (t.beatified) ? ultCdBoostValue * t.teammateCDValue : 0
      x[Stats.CD] += (t.beatified) ? ultCdBoostBaseValue : 0
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
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
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          return x[Stats.CR] > 1.00
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r: Conditionals<typeof content> = action.characterConditionals
          if (!(e >= 6 && r.e6CrToCdConversion)) {
            return
          }

          const stateValue = action.conditionalState[this.id] || 0
          const buffValue = Math.floor((x[Stats.CR] - 1.00) / 0.01) * 2.00 * 0.01

          action.conditionalState[this.id] = buffValue
          buffDynamicStat(x, Stats.CD, buffValue - stateValue, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r: Conditionals<typeof content> = action.characterConditionals

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
