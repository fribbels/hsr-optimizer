import i18next from 'i18next'
import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })
  const { SOURCE_LC } = Source.lightCone(ALittleGetaway.id)

  const sValuesDefPen = [0.08, 0.10, 0.12, 0.14, 0.16]

  const defaults = {
    elationSkillDefPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    elationSkillDefPen: {
      lc: true,
      id: 'elationSkillDefPen',
      formItem: 'switch',
      text: 'Elation Skill DEF PEN',
      content: betaContent,
    },
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => [],
    defaults: () => defaults,
    teammateDefaults: () => ({}),
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DEF_PEN, r.elationSkillDefPen ? sValuesDefPen[s] : 0, x.actionKind(AbilityKind.ELATION_SKILL).source(SOURCE_LC))
    },
  }
}

export const ALittleGetaway: LightConeConfig = {
  id: '21066',
  conditionals,
}
