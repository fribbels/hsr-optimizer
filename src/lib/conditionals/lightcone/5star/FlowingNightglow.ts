import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.FlowingNightglow')
  const { SOURCE_LC } = Source.lightCone('23026')

  const sValuesErr = [0.03, 0.035, 0.04, 0.045, 0.05]
  const sValuesAtkBuff = [0.48, 0.60, 0.72, 0.84, 0.96]
  const sValuesDmgBuff = [0.24, 0.28, 0.32, 0.36, 0.40]

  const defaults = {
    cantillationStacks: 5,
    cadenzaActive: true,
  }

  const teammateDefaults = {
    cadenzaActive: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    cadenzaActive: {
      lc: true,
      id: 'cadenzaActive',
      formItem: 'switch',
      text: t('Content.cadenzaActive.text'),
      content: t('Content.cadenzaActive.content', {
        RegenBuff: TsUtils.precisionRound(100 * sValuesErr[s]),
        AtkBuff: TsUtils.precisionRound(100 * sValuesAtkBuff[s]),
        DmgBuff: TsUtils.precisionRound(100 * sValuesDmgBuff[s]),
      }),
    },
    cantillationStacks: {
      lc: true,
      id: 'cantillationStacks',
      formItem: 'slider',
      text: t('Content.cantillationStacks.text'),
      content: t('Content.cantillationStacks.content', {
        RegenBuff: TsUtils.precisionRound(100 * sValuesErr[s]),
        AtkBuff: TsUtils.precisionRound(100 * sValuesAtkBuff[s]),
        DmgBuff: TsUtils.precisionRound(100 * sValuesDmgBuff[s]),
      }),
      min: 0,
      max: 5,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    cadenzaActive: content.cadenzaActive,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.ELEMENTAL_DMG.buffTeam((t.cadenzaActive) ? sValuesDmgBuff[s] : 0, SOURCE_LC)
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.ERR.buff(r.cantillationStacks * sValuesErr[s], SOURCE_LC)
      x.ATK_P.buff((r.cadenzaActive) ? sValuesAtkBuff[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
