import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgsl, wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { HKey, StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import { type OptimizerAction, type OptimizerContext } from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.FlameOfBloodBlazeMyPath.Content')
  const { SOURCE_LC } = Source.lightCone(FlameOfBloodBlazeMyPath.id)

  const sValuesSkillUltDmg = [0.30, 0.35, 0.40, 0.45, 0.50]
  const sValuesHpDrain = [0.06, 0.065, 0.07, 0.075, 0.08]

  const defaults = {
    skillUltDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillUltDmgBoost: {
      lc: true,
      id: 'skillUltDmgBoost',
      formItem: 'switch',
      text: t('skillUltDmgBoost.text'),
      content: t('skillUltDmgBoost.content', { DmgBoost: precisionRound(sValuesSkillUltDmg[s] * 100) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, (r.skillUltDmgBoost) ? sValuesSkillUltDmg[s] : 0,
        x.damageType(DamageTag.SKILL | DamageTag.ULT).source(SOURCE_LC))
    },
    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>
      const hp = x.getActionValueByIndex(StatKey.HP, SELF_ENTITY_INDEX)

      if (hp * sValuesHpDrain[s] > 500) {
        x.buff(StatKey.DMG_BOOST, (r.skillUltDmgBoost) ? sValuesSkillUltDmg[s] : 0,
          x.damageType(DamageTag.SKILL | DamageTag.ULT).source(SOURCE_LC))
      }
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      return wgsl`
if (${wgslTrue(r.skillUltDmgBoost)} && ${containerActionVal(SELF_ENTITY_INDEX, StatKey.HP, action.config)} * ${sValuesHpDrain[s]} > 500) {
  ${buff.hit(HKey.DMG_BOOST, sValuesSkillUltDmg[s]).damageType(DamageTag.SKILL | DamageTag.ULT).wgsl(action)}
}
      `
    },
  }
}

export const FlameOfBloodBlazeMyPath: LightConeConfig = {
  id: '23039',
  conditionals,
}
