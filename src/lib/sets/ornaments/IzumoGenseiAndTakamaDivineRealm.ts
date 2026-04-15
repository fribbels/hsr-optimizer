import { countTeamPath } from 'lib/conditionals/conditionalUtils'
import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import {
  type BasicStatsArray,
  WgslStatName,
} from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import {
  AKey,
  StatKey,
} from 'lib/optimization/engine/config/keys'
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
  index: 13,
  setType: SetType.ORNAMENT,
  ingameId: '314',
  twoPieceStatTag: null,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Izumo',
  modifiable: true,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.ATK_P.buff(0.12, Source.IzumoGenseiAndTakamaDivineRealm)
  },
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledIzumoGenseiAndTakamaDivineRealm) {
      x.buff(StatKey.CR, 0.12, x.source(Source.IzumoGenseiAndTakamaDivineRealm))
    }
  },
  overrideConditional: (value, context) => {
    return (value as boolean) && countTeamPath(context, context.path) >= 2
  },
  gpuBasic: () => [
    basicP2(WgslStatName.ATK_P, 0.12, IzumoGenseiAndTakamaDivineRealm),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (
      ornament2p(*p_sets, SET_IzumoGenseiAndTakamaDivineRealm) >= 1
      && setConditionals.enabledIzumoGenseiAndTakamaDivineRealm == true
    ) {
      ${buff.action(AKey.CR, 0.12).wgsl(action, 2)}
    }
  `,
}

export const IzumoGenseiAndTakamaDivineRealm = {
  id: Sets.IzumoGenseiAndTakamaDivineRealm,
  setKey: 'IzumoGenseiAndTakamaDivineRealm',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
