import {
  ConditionalDataType,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { type BasicStatsArray, WgslStatName } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  type OptimizerAction,
  type OptimizerContext,
  type SetConditional,
} from 'types/optimizer'
import {
  type SelectOptionContent,
  type SetConditionalTFunction,
  type SetConditionals,
  type SetConfig,
  type SetDisplay,
  type SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 4,
  setType: SetType.RELIC,
  ingameId: '105',
  twoPieceStatTag: null,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.SELECT,
  conditionalI18nKey: 'Conditionals.Streetwise',
  modifiable: true,
  selectionOptions: selectionOptions,
  defaultValue: 5,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    if (context.elementalDamageType == Stats.Physical_DMG) {
      c.PHYSICAL_DMG_BOOST.buff(0.10, Source.ChampionOfStreetwiseBoxing)
    }
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.ATK_P, 0.05 * setConditionals.valueChampionOfStreetwiseBoxing, x.source(Source.ChampionOfStreetwiseBoxing))
  },
  gpuBasic: () => [
    basicP2(WgslStatName.PHYSICAL_DMG_BOOST, 0.10, ChampionOfStreetwiseBoxing),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_ChampionOfStreetwiseBoxing) >= 1) {
      ${buff.action(AKey.ATK_P, `0.05 * f32(setConditionals.valueChampionOfStreetwiseBoxing)`).wgsl(action, 2)}
    }
  `,
}

function selectionOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 6 }).map((_val, i) => ({
    display: t('Streetwise.Display', { stackCount: i }),
    value: i,
    label: t('Streetwise.Label', { stackCount: i, buffValue: 5 * i }),
  }))
}

export const ChampionOfStreetwiseBoxing = {
  id: Sets.ChampionOfStreetwiseBoxing,
  setKey: 'ChampionOfStreetwiseBoxing',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
