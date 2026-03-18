import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import { type OptimizerAction, type OptimizerContext } from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ReforgedRemembrance')
  const { SOURCE_LC } = Source.lightCone(ReforgedRemembrance.id)

  const sValuesAtk = [0.05, 0.06, 0.07, 0.08, 0.09]
  const sValuesDotPen = [0.072, 0.079, 0.086, 0.093, 0.10]

  const defaults = {
    prophetStacks: 4,
  }

  const content: ContentDefinition<typeof defaults> = {
    prophetStacks: {
      lc: true,
      id: 'prophetStacks',
      formItem: 'slider',
      text: t('Content.prophetStacks.text'),
      content: t('Content.prophetStacks.content', {
        AtkBuff: precisionRound(100 * sValuesAtk[s]),
        DefIgnore: precisionRound(100 * sValuesDotPen[s]),
      }),
      min: 0,
      max: 4,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, r.prophetStacks * sValuesAtk[s], x.source(SOURCE_LC))
      x.buff(StatKey.DEF_PEN, r.prophetStacks * sValuesDotPen[s], x.damageType(DamageTag.DOT).source(SOURCE_LC))
    },
  }
}

export const ReforgedRemembrance: LightConeConfig = {
  id: '23022',
  conditionals,
}
