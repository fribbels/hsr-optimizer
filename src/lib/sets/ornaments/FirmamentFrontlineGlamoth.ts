import { ConditionalDataType } from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'
import {
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetType,
} from 'types/setConfig'

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
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
}

export const FirmamentFrontlineGlamoth: SetConfig = {
  id: 'FirmamentFrontlineGlamoth',
  info: {
    index: 10,
    setType: SetType.ORNAMENT,
    ingameId: '311',
  },
  conditionals,
  display,
}
