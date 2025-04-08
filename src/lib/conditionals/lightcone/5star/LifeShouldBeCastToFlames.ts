import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.LifeShouldBeCastToFlames.Content')
  const { SOURCE_LC } = Source.lightCone('23041')

  const sValueDmg = [0.60, 0.70, 0.80, 0.90, 1.00]
  const sValuesDefPen = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    defPen: true,
    dmgBoost: true,
  }

  const teammateDefaults = {
    defPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    dmgBoost: {
      lc: true,
      id: 'dmgBoost',
      formItem: 'switch',
      text: t('dmgBoost.text'),
      content: t('dmgBoost.content', { DmgBuff: TsUtils.precisionRound(100 * sValueDmg[s]) }),
    },
    defPen: {
      lc: true,
      id: 'defPen',
      formItem: 'switch',
      text: t('defPen.text'),
      content: t('defPen.content', { DefShred: TsUtils.precisionRound(100 * sValuesDefPen[s]) }),
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

      x.ELEMENTAL_DMG.buff((r.dmgBoost) ? sValueDmg[s] : 0, SOURCE_LC)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.DEF_PEN.buffTeam((m.defPen) ? sValuesDefPen[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
