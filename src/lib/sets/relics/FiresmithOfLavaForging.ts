import {
  ConditionalDataType,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { AKey, HKey, StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
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
  index: 6,
  setType: SetType.RELIC,
  ingameId: '107',
  name: Sets.FiresmithOfLavaForging,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Firesmith',
  modifiable: true,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    if (context.elementalDamageType == Stats.Fire_DMG) {
      c.FIRE_DMG_BOOST.buff(0.10, Source.FiresmithOfLavaForging)
    }
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DMG_BOOST, 0.12, x.damageType(DamageTag.SKILL).source(Source.FiresmithOfLavaForging))
    if (setConditionals.enabledFiresmithOfLavaForging) {
      x.buff(StatKey.FIRE_DMG_BOOST, 0.12, x.source(Source.FiresmithOfLavaForging))
    }
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_FiresmithOfLavaForging) >= 1) {
      ${buff.hit(HKey.DMG_BOOST, 0.12).damageType(DamageTag.SKILL).wgsl(action, 2)}
      if (setConditionals.enabledFiresmithOfLavaForging == true) {
        ${buff.action(AKey.FIRE_DMG_BOOST, 0.12).wgsl(action, 3)}
      }
    }
  `,
} as const satisfies SetConditionals

export const FiresmithOfLavaForging = {
  id: 'FiresmithOfLavaForging',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
