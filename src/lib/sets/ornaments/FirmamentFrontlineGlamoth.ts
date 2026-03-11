import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { BasicStatsArray, WgslStatName } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
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
  index: 10,
  setType: SetType.ORNAMENT,
  ingameId: '311',
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.ATK_P.buff(0.12, Source.FirmamentFrontlineGlamoth)
  },
  p2t: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    const spd = x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX)
    if (spd >= 135) {
      x.buff(StatKey.DMG_BOOST, spd >= 160 ? 0.18 : 0.12, x.source(Source.FirmamentFrontlineGlamoth))
    }
  },
  gpuBasic: () => [
    basicP2(WgslStatName.ATK_P, 0.12, FirmamentFrontlineGlamoth),
  ],
  gpuTerminal: (action: OptimizerAction, context: OptimizerContext) => `
  if (
    ornament2p(*p_sets, SET_FirmamentFrontlineGlamoth) >= 1
    && ${containerActionVal(SELF_ENTITY_INDEX, AKey.SPD, action.config)} >= 135.0
  ) {
    ${buff.action(AKey.DMG_BOOST, `select(0.12, 0.18, ${containerActionVal(SELF_ENTITY_INDEX, AKey.SPD, action.config)} >= 160.0)`).wgsl(action, 2)}
  }
`,
}

export const FirmamentFrontlineGlamoth = {
  id: Sets.FirmamentFrontlineGlamoth,
  setKey: 'FirmamentFrontlineGlamoth',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
