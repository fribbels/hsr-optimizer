import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import { type OptimizerAction, type OptimizerContext } from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.EchoesOfTheCoffin')
  const { SOURCE_LC } = Source.lightCone(EchoesOfTheCoffin.id)

  const sValues = [12, 14, 16, 18, 20]
  const sValuesEnergy = [3, 3.5, 4, 4.5, 5]

  const defaults = {
    postUltSpdBuff: false,
  }

  const teammateDefaults = {
    postUltSpdBuff: false,
  }

  const content: ContentDefinition<typeof defaults> = {
    postUltSpdBuff: {
      lc: true,
      id: 'postUltSpdBuff',
      formItem: 'switch',
      text: t('Content.postUltSpdBuff.text'),
      content: t('Content.postUltSpdBuff.content', {
        EnergyRecovered: precisionRound(sValuesEnergy[s]),
        SpdBuff: precisionRound(sValues[s]),
      }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    postUltSpdBuff: content.postUltSpdBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.SPD, (m.postUltSpdBuff) ? sValues[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const EchoesOfTheCoffin: LightConeConfig = {
  id: '23008',
  conditionals,
}
