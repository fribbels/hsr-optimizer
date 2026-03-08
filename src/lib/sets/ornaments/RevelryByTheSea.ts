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
  index: 21,
  setType: SetType.ORNAMENT,
  ingameId: '322',
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.ATK_P.buff(0.12, Source.RevelryByTheSea)
  },
  p2t: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    const atk = x.getActionValueByIndex(StatKey.ATK, SELF_ENTITY_INDEX)
    if (atk >= 3600) {
      x.buff(StatKey.DMG_BOOST, 0.24, x.damageType(DamageTag.DOT).source(Source.RevelryByTheSea))
    } else if (atk >= 2400) {
      x.buff(StatKey.DMG_BOOST, 0.12, x.damageType(DamageTag.DOT).source(Source.RevelryByTheSea))
    }
  },
  gpuBasic: () => [
    basicP2(WgslStatName.ATK_P, 0.12, RevelryByTheSea),
  ],
  gpuTerminal: (action: OptimizerAction, context: OptimizerContext) => `
  if (ornament2p(*p_sets, SET_RevelryByTheSea) >= 1) {
    if (${containerActionVal(SELF_ENTITY_INDEX, AKey.ATK, action.config)} >= 3600.0) {
      ${buff.hit(HKey.DMG_BOOST, 0.24).damageType(DamageTag.DOT).wgsl(action, 3)}
    } else if (${containerActionVal(SELF_ENTITY_INDEX, AKey.ATK, action.config)} >= 2400.0) {
      ${buff.hit(HKey.DMG_BOOST, 0.12).damageType(DamageTag.DOT).wgsl(action, 3)}
    }
  }
`,
}

export const RevelryByTheSea = {
  id: Sets.RevelryByTheSea,
  setKey: 'RevelryByTheSea',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
