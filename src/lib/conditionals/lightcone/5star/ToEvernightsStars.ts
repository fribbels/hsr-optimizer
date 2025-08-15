import i18next from 'i18next'
import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
} from 'lib/optimization/computedStatsArray'
import { TO_EVERNIGHTS_STARS } from 'lib/simulations/tests/testMetadataConstants'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ToEvernightsStars.Content')
  const { SOURCE_LC } = Source.lightCone(TO_EVERNIGHTS_STARS)

  const sValuesDefPen = [0.20, 0.225, 0.25, 0.275, 0.30]
  const sValuesDmgBoost = [0.12, 0.14, 0.16, 0.18, 0.20]

  const defaults = {
    defPen: true,
    dmgBoostStacks: 4,
  }

  const teammateDefaults = {
    defPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    defPen: {
      lc: true,
      id: 'defPen',
      formItem: 'switch',
      text: 'Memo DEF PEN',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    dmgBoostStacks: {
      lc: true,
      id: 'dmgBoostStacks',
      formItem: 'slider',
      text: 'DMG boost stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 4,
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

      x.ELEMENTAL_DMG.buffBaseDual(r.dmgBoostStacks * sValuesDmgBoost[s], SOURCE_LC)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.m.DEF_PEN.buffTeam((m.defPen) ? sValuesDefPen[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: (x, action, context) => {},
    gpuFinalizeCalculations: (action, context) => '',
  }
}
