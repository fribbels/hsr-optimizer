import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { BasicStatsArray, WgslStatName } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  OptimizerAction,
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'
import {
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 15,
  setType: SetType.ORNAMENT,
  ingameId: '316',
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Kalpagni',
  modifiable: true,
  defaultValue: false,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.SPD_P.buff(0.06, Source.ForgeOfTheKalpagniLantern)
  },
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledForgeOfTheKalpagniLantern) {
      x.buff(StatKey.BE, 0.40, x.source(Source.ForgeOfTheKalpagniLantern))
    }
  },
  gpuBasic: () => [
    basicP2(WgslStatName.SPD_P, 0.06, ForgeOfTheKalpagniLantern),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (
      ornament2p(*p_sets, SET_ForgeOfTheKalpagniLantern) >= 1
      && setConditionals.enabledForgeOfTheKalpagniLantern == true
    ) {
      ${buff.action(AKey.BE, 0.40).wgsl(action, 2)}
    }
  `,
}

export const ForgeOfTheKalpagniLantern = {
  id: Sets.ForgeOfTheKalpagniLantern,
  setKey: 'ForgeOfTheKalpagniLantern',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
