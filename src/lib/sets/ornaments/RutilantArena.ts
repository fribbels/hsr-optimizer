import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
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
  index: 8,
  setType: SetType.ORNAMENT,
  ingameId: '309',
  name: Sets.RutilantArena,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.CR.buff(0.08, Source.RutilantArena)
  },
  p2t: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (x.getActionValueByIndex(StatKey.CR, SELF_ENTITY_INDEX) >= 0.70) {
      x.buff(StatKey.DMG_BOOST, 0.20, x.damageType(DamageTag.BASIC | DamageTag.SKILL).source(Source.RutilantArena))
    }
  },
  gpuTerminal: (action: OptimizerAction, context: OptimizerContext) => `
  if (
    ornament2p(*p_sets, SET_RutilantArena) >= 1
    && ${containerActionVal(SELF_ENTITY_INDEX, AKey.CR, action.config)} >= 0.70
  ) {
    ${buff.hit(HKey.DMG_BOOST, 0.20).damageType(DamageTag.BASIC | DamageTag.SKILL).wgsl(action, 2)}
  }
`,
} as const satisfies SetConditionals

export const RutilantArena = {
  id: 'RutilantArena',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
