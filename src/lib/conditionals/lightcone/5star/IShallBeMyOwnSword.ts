import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.IShallBeMyOwnSword')
  const { SOURCE_LC } = Source.lightCone(IShallBeMyOwnSword.id)

  const sValuesStackDmg = [0.14, 0.165, 0.19, 0.215, 0.24]
  const sValuesDefPen = [0.12, 0.14, 0.16, 0.18, 0.20]

  const defaults = {
    eclipseStacks: 3,
    maxStackDefPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    eclipseStacks: {
      lc: true,
      id: 'eclipseStacks',
      formItem: 'slider',
      text: t('Content.eclipseStacks.text'),
      content: t('Content.eclipseStacks.content', { DmgBuff: precisionRound(100 * sValuesStackDmg[s]) }),
      min: 0,
      max: 3,
    },
    maxStackDefPen: {
      lc: true,
      id: 'maxStackDefPen',
      formItem: 'switch',
      text: t('Content.maxStackDefPen.text'),
      content: t('Content.maxStackDefPen.content', { DefIgnore: precisionRound(100 * sValuesDefPen[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, r.eclipseStacks * sValuesStackDmg[s], x.source(SOURCE_LC))
      x.buff(StatKey.DEF_PEN, (r.maxStackDefPen && r.eclipseStacks == 3) ? sValuesDefPen[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const IShallBeMyOwnSword: LightConeConfig = {
  id: '23014',
  conditionals,
}
