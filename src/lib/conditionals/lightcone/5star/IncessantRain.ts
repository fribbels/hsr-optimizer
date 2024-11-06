import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.IncessantRain')

  const sValuesCr = [0.12, 0.14, 0.16, 0.18, 0.20]
  const sValuesDmg = [0.12, 0.14, 0.16, 0.18, 0.20]

  const defaults = {
    enemy3DebuffsCrBoost: true,
    targetCodeDebuff: true,
  }

  const teammateDefaults = {
    targetCodeDebuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemy3DebuffsCrBoost: {
      lc: true,
      id: 'enemy3DebuffsCrBoost',
      formItem: 'switch',
      text: t('Content.enemy3DebuffsCrBoost.text'),
      content: t('Content.enemy3DebuffsCrBoost.content', { CritBuff: TsUtils.precisionRound(100 * sValuesCr[s]) }),
    },
    targetCodeDebuff: {
      lc: true,
      id: 'targetCodeDebuff',
      formItem: 'switch',
      text: t('Content.targetCodeDebuff.text'),
      content: t('Content.targetCodeDebuff.content', { DmgIncrease: TsUtils.precisionRound(100 * sValuesDmg[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    targetCodeDebuff: content.targetCodeDebuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.CR.buff((r.enemy3DebuffsCrBoost) ? sValuesCr[s] : 0, Source.NONE)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.lightConeConditionals

      x.VULNERABILITY.buff((m.targetCodeDebuff) ? sValuesDmg[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
