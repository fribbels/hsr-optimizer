import {
  ConditionalDataType,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import {
  type BasicStatsArray,
  WgslStatName,
} from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import {
  AKey,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
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
  index: 26,
  setType: SetType.RELIC,
  ingameId: '127',
  twoPieceStatTag: Stats.CR,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Deliverer',
  modifiable: true,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.CR.buff(0.08, Source.WorldRemakingDeliverer)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledWorldRemakingDeliverer) {
      x.buff(StatKey.HP_P, 0.24, x.targets(TargetTag.SelfAndMemosprite).source(Source.WorldRemakingDeliverer))
      if (!x.config.teammateSetEffects[Sets.WorldRemakingDeliverer]) {
        x.buff(StatKey.DMG_BOOST, 0.15, x.targets(TargetTag.FullTeam).source(Source.WorldRemakingDeliverer))
      }
    }
  },
  gpuBasic: () => [
    basicP2(WgslStatName.CR, 0.08, WorldRemakingDeliverer),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (
      relic4p(*p_sets, SET_WorldRemakingDeliverer) >= 1
      && setConditionals.enabledWorldRemakingDeliverer == true
    ) {
      ${buff.action(AKey.HP_P, 0.24).targets(TargetTag.SelfAndMemosprite).wgsl(action, 2)}
      if (${wgslFalse(action.config.teammateSetEffects[Sets.WorldRemakingDeliverer])}) {
        ${buff.action(AKey.DMG_BOOST, 0.15).targets(TargetTag.FullTeam).wgsl(action, 2)}
      }
    }
  `,
  teammate: [{
    value: Sets.WorldRemakingDeliverer,
    label: (t) => t('TeammateSets.WorldRemaking.Text'),
    desc: (t) => t('TeammateSets.WorldRemaking.Desc'),
    nonstackable: false,
    effect: ({ x }) => {
      x.buff(StatKey.DMG_BOOST, 0.15, x.targets(TargetTag.FullTeam).source(Source.WorldRemakingDeliverer))
    },
  }],
}

export const WorldRemakingDeliverer = {
  id: Sets.WorldRemakingDeliverer,
  setKey: 'WorldRemakingDeliverer',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
