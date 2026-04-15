import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.CarveTheMoonWeaveTheClouds')
  const { SOURCE_LC } = Source.lightCone(CarveTheMoonWeaveTheClouds.id)

  const sValuesAtk = [0.10, 0.125, 0.15, 0.175, 0.20]
  const sValuesCd = [0.12, 0.15, 0.18, 0.21, 0.24]
  const sValuesErr = [0.06, 0.075, 0.09, 0.105, 0.12]

  const defaults = {
    atkBuffActive: true,
    cdBuffActive: false,
    errBuffActive: false,
  }

  const teammateDefaults = {
    atkBuffActive: true,
    cdBuffActive: false,
    errBuffActive: false,
  }

  const content: ContentDefinition<typeof defaults> = {
    atkBuffActive: {
      lc: true,
      id: 'atkBuffActive',
      formItem: 'switch',
      text: t('Content.atkBuffActive.text'),
      content: t('Content.atkBuffActive.content', {
        AtkBuff: precisionRound(100 * sValuesAtk[s]),
        CritBuff: precisionRound(100 * sValuesCd[s]),
        RegenBuff: precisionRound(100 * sValuesErr[s]),
      }),
    },
    cdBuffActive: {
      lc: true,
      id: 'cdBuffActive',
      formItem: 'switch',
      text: t('Content.cdBuffActive.text'),
      content: t('Content.cdBuffActive.content', {
        AtkBuff: precisionRound(100 * sValuesAtk[s]),
        CritBuff: precisionRound(100 * sValuesCd[s]),
        RegenBuff: precisionRound(100 * sValuesErr[s]),
      }),
    },
    errBuffActive: {
      lc: true,
      id: 'errBuffActive',
      formItem: 'switch',
      text: t('Content.errBuffActive.text'),
      content: t('Content.errBuffActive.content', {
        AtkBuff: precisionRound(100 * sValuesAtk[s]),
        CritBuff: precisionRound(100 * sValuesCd[s]),
        RegenBuff: precisionRound(100 * sValuesErr[s]),
      }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    atkBuffActive: content.atkBuffActive,
    cdBuffActive: content.cdBuffActive,
    errBuffActive: content.errBuffActive,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.ATK_P, (m.atkBuffActive) ? sValuesAtk[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
      x.buff(StatKey.CD, (m.cdBuffActive) ? sValuesCd[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
      x.buff(StatKey.ERR, (m.errBuffActive) ? sValuesErr[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const CarveTheMoonWeaveTheClouds: LightConeConfig = {
  id: '21032',
  conditionals,
}
