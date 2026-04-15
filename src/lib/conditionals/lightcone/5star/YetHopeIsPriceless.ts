import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import {
  wgsl,
  wgslTrue,
} from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  AKey,
  HKey,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  SELF_ENTITY_INDEX,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import {
  floorSafe,
  precisionRound,
} from 'lib/utils/mathUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.YetHopeIsPriceless')
  const { SOURCE_LC } = Source.lightCone(YetHopeIsPriceless.id)

  const sValuesFuaDmg = [0.12, 0.14, 0.16, 0.18, 0.20]
  const sValuesUltFuaDefShred = [0.20, 0.24, 0.28, 0.32, 0.36]

  const defaults = {
    fuaDmgBoost: true,
    ultFuaDefShred: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    fuaDmgBoost: {
      lc: true,
      id: 'fuaDmgBoost',
      formItem: 'switch',
      text: t('Content.fuaDmgBoost.text'),
      content: t('Content.fuaDmgBoost.content', { DmgBuff: precisionRound(sValuesFuaDmg[s] * 100) }),
    },
    ultFuaDefShred: {
      lc: true,
      id: 'ultFuaDefShred',
      formItem: 'switch',
      text: t('Content.ultFuaDefShred.text'),
      content: t('Content.ultFuaDefShred.content', { DefShred: precisionRound(sValuesFuaDmg[s] * 100) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DEF_PEN, (r.ultFuaDefShred) ? sValuesUltFuaDefShred[s] : 0, x.damageType(DamageTag.ULT | DamageTag.FUA).source(SOURCE_LC))
    },
    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      const cdValue = x.getActionValueByIndex(StatKey.CD, SELF_ENTITY_INDEX)
      x.buff(
        StatKey.DMG_BOOST,
        (r.fuaDmgBoost) ? sValuesFuaDmg[s] * Math.min(4, floorSafe((cdValue - 1.20) / 0.20)) : 0,
        x.damageType(DamageTag.FUA).source(SOURCE_LC),
      )
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      return wgsl`
if (${wgslTrue(r.fuaDmgBoost)}) {
  let cdValue = ${containerActionVal(SELF_ENTITY_INDEX, StatKey.CD, action.config)};
  let fuaDmgBuff = ${sValuesFuaDmg[s]} * min(4.0, floorSafe((cdValue - 1.20) / 0.20));
  ${buff.hit(HKey.DMG_BOOST, 'fuaDmgBuff').damageType(DamageTag.FUA).wgsl(action)}
}
    `
    },
  }
}

export const YetHopeIsPriceless: LightConeConfig = {
  id: '23028',
  conditionals,
}
