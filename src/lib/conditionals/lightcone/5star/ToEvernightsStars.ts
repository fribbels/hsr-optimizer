import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
} from 'lib/optimization/computedStatsArray'
import { TO_EVERNIGHTS_STARS } from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ToEvernightsStars.Content')
  const { SOURCE_LC } = Source.lightCone(TO_EVERNIGHTS_STARS)

  const sValuesDefPen = [0.20, 0.225, 0.25, 0.275, 0.30]
  const sValuesDmgBoost = [0.30, 0.375, 0.45, 0.525, 0.60]

  const defaults = {
    defPen: true,
    dmgBoost: true,
  }

  const teammateDefaults = {
    defPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    defPen: {
      lc: true,
      id: 'defPen',
      formItem: 'switch',
      text: t('defPen.text'),
      content: t('defPen.content', { MemoDefPen: TsUtils.precisionRound(100 * sValuesDefPen[s]) }),
    },
    dmgBoost: {
      lc: true,
      id: 'dmgBoost',
      formItem: 'switch',
      text: t('dmgBoost.text'),
      content: t('dmgBoost.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmgBoost[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    defPen: content.defPen,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.ELEMENTAL_DMG.buffBaseDual(r.dmgBoost ? sValuesDmgBoost[s] : 0, SOURCE_LC)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.m.DEF_PEN.buffTeam((m.defPen) ? sValuesDefPen[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: (x, action, context) => {},
    gpuFinalizeCalculations: (action, context) => '',
  }
}
