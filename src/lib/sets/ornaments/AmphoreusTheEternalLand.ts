import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { BasicStatsArray, WgslStatName } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
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
  index: 22,
  setType: SetType.ORNAMENT,
  ingameId: '323',
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Amphoreus',
  modifiable: true,
  defaultValue: false,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.CR.buff(0.08, Source.AmphoreusTheEternalLand)
  },
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (x.config.hasMemosprite && setConditionals.enabledAmphoreusTheEternalLand && !x.config.teammateSetEffects[Sets.AmphoreusTheEternalLand]) {
      x.buff(StatKey.SPD_P, 0.08, x.targets(TargetTag.FullTeam).source(Source.AmphoreusTheEternalLand))
    }
  },
  gpuBasic: () => [
    basicP2(WgslStatName.CR, 0.08, AmphoreusTheEternalLand),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (
      ornament2p(*p_sets, SET_AmphoreusTheEternalLand) >= 1
      && setConditionals.enabledAmphoreusTheEternalLand == true
      && ${action.config.hasMemosprite}
      && ${wgslFalse(action.config.teammateSetEffects[Sets.AmphoreusTheEternalLand])}
    ) {
      ${buff.action(AKey.SPD_P, 0.08).targets(TargetTag.FullTeam).wgsl(action, 2)}
    }
  `,
  teammate: [{
    value: Sets.AmphoreusTheEternalLand,
    label: (t) => t('TeammateSets.Amphoreus.Text'),
    desc: (t) => t('TeammateSets.Amphoreus.Desc'),
    nonstackable: true,
    effect: ({ x }) => {
      x.buff(StatKey.SPD_P, 0.08, x.targets(TargetTag.FullTeam).source(Source.AmphoreusTheEternalLand))
    },
  }],
}

export const AmphoreusTheEternalLand = {
  id: Sets.AmphoreusTheEternalLand,
  setKey: 'AmphoreusTheEternalLand',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
