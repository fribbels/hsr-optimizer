import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgsl, wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { HKey, StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.FlameOfBloodBlazeMyPath.Content')
  const { SOURCE_LC } = Source.lightCone('23039')

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
      content: t('skillUltDmgBoost.content', { DmgBoost: TsUtils.precisionRound(sValuesSkillUltDmg[s] * 100) }),
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
