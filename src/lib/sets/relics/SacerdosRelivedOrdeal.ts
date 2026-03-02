import {
  ConditionalDataType,
  SACERDOS_RELIVED_ORDEAL_1_STACK,
  SACERDOS_RELIVED_ORDEAL_2_STACK,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TFunction } from 'i18next'
import {
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'
import {
  SelectOptionContent,
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetType,
  TeammateOption,
} from 'types/setConfig'

type SetConditionalTFunction = TFunction<'optimizerTab', 'SetConditionals.SelectOptions'>

function selectionOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 3 }).map((_val, i) => ({
    display: t('Sacerdos.Display', { stackCount: i }),
    value: i,
    label: t('Sacerdos.Label', { stackCount: i, buffValue: 18 * i }),
  }))
}

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.SPD_P.buff(0.06, Source.SacerdosRelivedOrdeal)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.CD, 0.18 * setConditionals.valueSacerdosRelivedOrdeal, x.source(Source.SacerdosRelivedOrdeal))
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.SELECT,
  conditionalI18nKey: 'Conditionals.Sacerdos',
  modifiable: true,
  selectionOptions: selectionOptions,
  defaultValue: 0,
}

export const SacerdosRelivedOrdeal: SetConfig = {
  id: 'SacerdosRelivedOrdeal',
  info: {
    index: 20,
    setType: SetType.RELIC,
    ingameId: '121',
  },
  conditionals,
  display,
  teammate: [
    {
      value: SACERDOS_RELIVED_ORDEAL_1_STACK,
      i18nKey: 'Sacerdos1Stack',
      nonstackable: false,
      effect: ({ x, teammateActorId }) => {
        const SUNDAY_ID = '1313'
        if (teammateActorId == SUNDAY_ID) {
          x.buff(StatKey.CD, 0.18, x.targets(TargetTag.SelfAndMemosprite).deferrable().source(Source.SacerdosRelivedOrdeal))
        } else {
          x.buff(StatKey.CD, 0.18, x.targets(TargetTag.SingleTarget).deferrable().source(Source.SacerdosRelivedOrdeal))
        }
      },
    },
    {
      value: SACERDOS_RELIVED_ORDEAL_2_STACK,
      i18nKey: 'Sacerdos2Stack',
      nonstackable: false,
      effect: ({ x, teammateActorId }) => {
        const SUNDAY_ID = '1313'
        if (teammateActorId == SUNDAY_ID) {
          x.buff(StatKey.CD, 0.36, x.targets(TargetTag.SelfAndMemosprite).deferrable().source(Source.SacerdosRelivedOrdeal))
        } else {
          x.buff(StatKey.CD, 0.36, x.targets(TargetTag.SingleTarget).deferrable().source(Source.SacerdosRelivedOrdeal))
        }
      },
    },
  ],
}
