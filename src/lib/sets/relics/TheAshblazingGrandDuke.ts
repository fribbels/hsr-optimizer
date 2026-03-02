import { ConditionalDataType } from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
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
} from 'types/setConfig'

type SetConditionalTFunction = TFunction<'optimizerTab', 'SetConditionals.SelectOptions'>

function selectionOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 9 }).map((_val, i) => ({
    display: t('Ashblazing.Display', { stackCount: i }),
    value: i,
    label: t('Ashblazing.Label', { stackCount: i, buffValue: 6 * i }),
  }))
}

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
  },
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DMG_BOOST, 0.20, x.damageType(DamageTag.FUA).source(Source.TheAshblazingGrandDuke))
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.ATK_P, 0.06 * setConditionals.valueTheAshblazingGrandDuke, x.source(Source.TheAshblazingGrandDuke))
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.SELECT,
  conditionalI18nKey: 'Conditionals.Ashblazing',
  selectionOptions: selectionOptions,
  modifiable: true,
  defaultValue: 0,
}

export const TheAshblazingGrandDuke: SetConfig = {
  id: 'TheAshblazingGrandDuke',
  info: {
    index: 14,
    setType: SetType.RELIC,
    ingameId: '115',
  },
  conditionals,
  display,
}
