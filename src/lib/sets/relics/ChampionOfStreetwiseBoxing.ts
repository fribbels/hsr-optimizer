import {
  ConditionalDataType,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  OptimizerAction,
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'
import {
  SelectOptionContent,
  SetConditionalTFunction,
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 4,
  setType: SetType.RELIC,
  ingameId: '105',
  name: Sets.ChampionOfStreetwiseBoxing,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.SELECT,
  conditionalI18nKey: 'Conditionals.Streetwise',
  modifiable: true,
  selectionOptions: selectionOptions,
  defaultValue: 5,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    if (context.elementalDamageType == Stats.Physical_DMG) {
      c.PHYSICAL_DMG_BOOST.buff(0.10, Source.ChampionOfStreetwiseBoxing)
    }
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.ATK_P, 0.05 * setConditionals.valueChampionOfStreetwiseBoxing, x.source(Source.ChampionOfStreetwiseBoxing))
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_ChampionOfStreetwiseBoxing) >= 1) {
      ${buff.action(AKey.ATK_P, `0.05 * f32(setConditionals.valueChampionOfStreetwiseBoxing)`).wgsl(action, 2)}
    }
  `,
} as const satisfies SetConditionals

function selectionOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 6 }).map((_val, i) => ({
    display: t('Streetwise.Display', { stackCount: i }),
    value: i,
    label: t('Streetwise.Label', { stackCount: i, buffValue: 5 * i }),
  }))
}

export const ChampionOfStreetwiseBoxing = {
  id: 'ChampionOfStreetwiseBoxing',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
