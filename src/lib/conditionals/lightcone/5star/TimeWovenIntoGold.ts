import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, TargetTag } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TimeWovenIntoGold')
  const { SOURCE_LC } = Source.lightCone(TimeWovenIntoGold.id)

  const sValuesCd = [0.09, 0.105, 0.12, 0.135, 0.15]
  const sValuesBasicDmg = [0.09, 0.105, 0.12, 0.135, 0.15]

  const defaults = {
    brocadeStacks: 6,
    maxStacksBasicDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    brocadeStacks: {
      lc: true,
      id: 'brocadeStacks',
      formItem: 'slider',
      text: t('Content.brocadeStacks.text'),
      content: t('Content.brocadeStacks.content', {
        CdBuff: precisionRound(sValuesCd[s] * 100),
        DmgBuff: precisionRound(sValuesBasicDmg[s] * 100),
      }),
      min: 0,
      max: 6,
    },
    maxStacksBasicDmgBoost: {
      lc: true,
      id: 'maxStacksBasicDmgBoost',
      formItem: 'switch',
      text: t('Content.maxStacksBasicDmgBoost.text'),
      content: t('Content.maxStacksBasicDmgBoost.content', {
        CdBuff: precisionRound(sValuesCd[s] * 100),
        DmgBuff: precisionRound(sValuesBasicDmg[s] * 100),
      }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.CD, r.brocadeStacks * sValuesCd[s], x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_LC))
      x.buff(StatKey.DMG_BOOST, (r.brocadeStacks >= 6 && r.maxStacksBasicDmgBoost) ? r.brocadeStacks * sValuesBasicDmg[s] : 0, x.damageType(DamageTag.BASIC).targets(TargetTag.SelfAndMemosprite).source(SOURCE_LC))
    },
  }
}

export const TimeWovenIntoGold: LightConeConfig = {
  id: '23036',
  conditionals,
}
