import { ConditionalDataType } from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
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
  return Array.from({ length: 11 }).map((_val, i) => ({
    display: t('MagicalGirl.Display', { stackCount: i }),
    value: i,
    label: t('MagicalGirl.Label', { stackCount: i }),
  }))
}

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.CD.buff(0.16, Source.EverGloriousMagicalGirl)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DEF_PEN, 0.10 + 0.01 * setConditionals.valueEverGloriousMagicalGirl,
      x.damageType(DamageTag.ELATION).targets(TargetTag.SelfAndMemosprite).source(Source.EverGloriousMagicalGirl))
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.SELECT,
  conditionalI18nKey: 'Conditionals.MagicalGirl',
  selectionOptions: selectionOptions,
  modifiable: true,
  defaultValue: 10,
}

export const EverGloriousMagicalGirl: SetConfig = {
  id: 'EverGloriousMagicalGirl',
  info: {
    index: 28,
    setType: SetType.RELIC,
    ingameId: '129',
  },
  conditionals,
  display,
}
