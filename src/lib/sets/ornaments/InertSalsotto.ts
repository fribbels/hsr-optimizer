import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import {
  type BasicStatsArray,
  WgslStatName,
} from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import {
  AKey,
  HKey,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  SELF_ENTITY_INDEX,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
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
  setType: SetType.ORNAMENT,
  ingameId: '306',
  twoPieceStatTag: null,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.CR.buff(0.08, Source.InertSalsotto)
  },
  p2t: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (x.getActionValueByIndex(StatKey.CR, SELF_ENTITY_INDEX) >= 0.50) {
      x.buff(StatKey.DMG_BOOST, 0.15, x.damageType(DamageTag.ULT | DamageTag.FUA).source(Source.InertSalsotto))
    }
  },
  gpuBasic: () => [
    basicP2(WgslStatName.CR, 0.08, InertSalsotto),
  ],
  gpuTerminal: (action: OptimizerAction, context: OptimizerContext) => `
  if (
    ornament2p(*p_sets, SET_InertSalsotto) >= 1
    && ${containerActionVal(SELF_ENTITY_INDEX, AKey.CR, action.config)} >= 0.50
  ) {
    ${buff.hit(HKey.DMG_BOOST, 0.15).damageType(DamageTag.ULT | DamageTag.FUA).wgsl(action, 2)}
  }
`,
}

export const InertSalsotto = {
  id: Sets.InertSalsotto,
  setKey: 'InertSalsotto',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
