import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { BasicStatsArray, WgslStatName } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import { AKey, HKey, StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
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
  index: 18,
  setType: SetType.RELIC,
  ingameId: '119',
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.BE.buff(0.16, Source.IronCavalryAgainstTheScourge)
  },
  p4t: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (x.getActionValueByIndex(StatKey.BE, SELF_ENTITY_INDEX) >= 1.50) {
      x.buff(StatKey.DEF_PEN, 0.10, x.damageType(DamageTag.BREAK).source(Source.IronCavalryAgainstTheScourge))
      if (x.getActionValueByIndex(StatKey.BE, SELF_ENTITY_INDEX) >= 2.50) {
        x.buff(StatKey.DEF_PEN, 0.15, x.damageType(DamageTag.SUPER_BREAK).source(Source.IronCavalryAgainstTheScourge))
      }
    }
  },
  gpuBasic: () => [
    basicP2(WgslStatName.BE, 0.16, IronCavalryAgainstTheScourge),
  ],
  gpuTerminal: (action: OptimizerAction, context: OptimizerContext) => `
  if (
    relic4p(*p_sets, SET_IronCavalryAgainstTheScourge) >= 1
    && ${containerActionVal(SELF_ENTITY_INDEX, AKey.BE, action.config)} >= 1.50
  ) {
    ${buff.hit(HKey.DEF_PEN, 0.10).damageType(DamageTag.BREAK).wgsl(action, 2)}
    ${buff.hit(HKey.DEF_PEN, `select(0.0, 0.15, ${containerActionVal(SELF_ENTITY_INDEX, AKey.BE, action.config)} >= 2.50)`).damageType(DamageTag.SUPER_BREAK).wgsl(action, 2)}
  }
`,
}

export const IronCavalryAgainstTheScourge = {
  id: Sets.IronCavalryAgainstTheScourge,
  setKey: 'IronCavalryAgainstTheScourge',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
