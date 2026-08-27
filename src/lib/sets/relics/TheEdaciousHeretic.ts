import {
  ConditionalDataType,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
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
import { DamageTag } from 'lib/optimization/engine/config/tag'
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
  index: 33,
  setType: SetType.RELIC,
  ingameId: '134',
  twoPieceStatTag: Stats.ATK_P,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  modifiable: true,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.ATK_P.buff(0.12, Source.TheEdaciousHeretic)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.BOOST, 0.36, x.damageType(DamageTag.BASIC).source(Source.TheEdaciousHeretic))
    if (setConditionals.enabledTheEdaciousHeretic) {
      x.buff(StatKey.ATK_P, 0.20, x.source(Source.TheEdaciousHeretic))
    }
  },
  gpuBasic: () => [
    basicP2(WgslStatName.ATK_P, 0.12, TheEdaciousHeretic),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_TheEdaciousHeretic)) {
      ${buff.hit(HKey.BOOST, 0.36).damageType(DamageTag.BASIC).wgsl(action, 2)}
      if (setConditionals.enabledTheEdaciousHeretic == true) {
        ${buff.action(AKey.ATK_P, 0.20).wgsl(action, 3)}
      }
    }
  `,
}

export const TheEdaciousHeretic = {
  id: Sets.TheEdaciousHeretic,
  setKey: 'TheEdaciousHeretic',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
