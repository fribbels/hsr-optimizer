import {
  ConditionalDataType,
  Stats,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { SelectOptionContent } from 'lib/optimization/rotation/setConditionalContent'
import { TFunction } from 'i18next'
import {
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'
import {
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetType,
} from 'types/setConfig'

type SetConditionalTFunction = TFunction<'optimizerTab', 'SetConditionals.SelectOptions'>

function selectionOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 6 }).map((_val, i) => ({
    display: t('Streetwise.Display', { stackCount: i }),
    value: i,
    label: t('Streetwise.Label', { stackCount: i, buffValue: 5 * i }),
  }))
}

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    if (context.elementalDamageType == Stats.Physical_DMG) {
      c.PHYSICAL_DMG_BOOST.buff(0.10, Source.ChampionOfStreetwiseBoxing)
    }
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.ATK_P, 0.05 * setConditionals.valueChampionOfStreetwiseBoxing, x.source(Source.ChampionOfStreetwiseBoxing))
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.SELECT,
  modifiable: true,
  selectionOptions: selectionOptions,
  defaultValue: 5,
}

export const ChampionOfStreetwiseBoxing: SetConfig = {
  id: 'ChampionOfStreetwiseBoxing',
  info: {
    index: 4,
    setType: SetType.RELIC,
  },
  conditionals,
  display,
}
