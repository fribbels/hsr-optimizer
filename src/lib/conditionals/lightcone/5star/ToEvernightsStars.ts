import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
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
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, r.dmgBoost ? sValuesDmgBoost[s] : 0, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_LC))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.DEF_PEN, (m.defPen) ? sValuesDefPen[s] : 0, x.targets(TargetTag.MemospritesOnly).source(SOURCE_LC))
    },
  }
}
