import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { type BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  type OptimizerAction,
  type OptimizerContext,
  type SetConditional,
} from 'types/optimizer'
import {
  type SetConditionals,
  type SetConfig,
  type SetDisplay,
  type SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 5,
  setType: SetType.RELIC,
  ingameId: '106',
  twoPieceStatTag: null,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
  },
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.multiplicativeComplement(StatKey.DMG_RED, 0.08, x.source(Source.GuardOfWutheringSnow))
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic2p(*p_sets, SET_GuardOfWutheringSnow) >= 1) {
      ${buff.actionMultiplicativeComplement(AKey.DMG_RED, 0.08).wgsl(action, 2)}
    }
  `,
}

export const GuardOfWutheringSnow = {
  id: Sets.GuardOfWutheringSnow,
  setKey: 'GuardOfWutheringSnow',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
