import {
  AbilityType,
  ASHBLAZING_ATK_STACK,
} from 'lib/conditionals/conditionalConstants'
import {
  boostAshblazingAtkP,
  gpuBoostAshblazingAtkP,
} from 'lib/conditionals/conditionalFinalizers'
import {
  AbilityEidolon,
  addSuperBreakHits,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { ModifierContext } from 'lib/optimization/context/calculateActions'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'

import i18next from 'i18next'
import {
  ANAXA,
  BOOTHILL,
  FIREFLY,
  PHAINON,
  SILVER_WOLF,
  THE_DAHLIA,
} from 'lib/simulations/tests/testMetadataConstants'
import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import { Hit } from 'types/hitConditionalTypes'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const TheDahliaEntities = createEnum('TheDahlia')
export const TheDahliaAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'FUA', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TheDahlia')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TALENT,
    SOURCE_TECHNIQUE,
    SOURCE_TRACE,
    SOURCE_MEMO,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character(THE_DAHLIA)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.60, 1.76)
  const ultScaling = ult(e, 3.00, 3.24)

  const fuaScaling = talent(e, 0.30, 0.33)
  const fuaSuperBreakScaling = talent(e, 2.00, 2.20)

  const ultDefPenValue = ult(e, 0.18, 0.20)

  const superBreakScaling = talent(e, 0.60, 0.66)

  const defaults = {
    zoneActive: true,
    ultDefPen: true,
    dancePartner: true,
    superBreakDmg: true,
    spdBuff: true,
    e1Buffs: true,
    e2ResPen: true,
    e4Vuln: true,
    e6BeBuff: true,
  }

  const teammateDefaults = {
    zoneActive: true,
    ultDefPen: true,
    dancePartner: true,
    superBreakDmg: true,
    beConversion: true,
    teammateBeValue: 3.00,
    spdBuff: true,
    e1Buffs: true,
    e2ResPen: true,
    e4Vuln: true,
    e6BeBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    zoneActive: {
      id: 'zoneActive',
      formItem: 'switch',
      text: 'Zone active',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    ultDefPen: {
      id: 'ultDefPen',
      formItem: 'switch',
      text: 'Ult DEF PEN',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    dancePartner: {
      id: 'dancePartner',
      formItem: 'switch',
      text: 'Dance Partner',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    superBreakDmg: {
      id: 'superBreakDmg',
      formItem: 'switch',
      text: 'Super Break DMG (force weakness break)',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    spdBuff: {
      id: 'spdBuff',
      formItem: 'switch',
      text: 'SPD buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    e1Buffs: {
      id: 'e1Buffs',
      formItem: 'switch',
      text: 'E1 buffs',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 1,
    },
    e2ResPen: {
      id: 'e2ResPen',
      formItem: 'switch',
      text: 'E2 RES PEN',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 2,
    },
    e4Vuln: {
      id: 'e4Vuln',
      formItem: 'switch',
      text: 'E4 Vulnerability',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 4,
    },
    e6BeBuff: {
      id: 'e6BeBuff',
      formItem: 'switch',
      text: 'E6 BE buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    zoneActive: content.zoneActive,
    ultDefPen: content.ultDefPen,
    dancePartner: content.dancePartner,
    superBreakDmg: content.superBreakDmg,
    beConversion: {
      id: 'beConversion',
      formItem: 'switch',
      text: 'Break Effect conversion',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    teammateBeValue: {
      id: 'teammateBeValue',
      formItem: 'slider',
      text: `The Dahlia's Combat BE`,
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 7.50,
      percent: true,
    },
    spdBuff: content.spdBuff,
    e1Buffs: content.e1Buffs,
    e2ResPen: content.e2ResPen,
    e4Vuln: content.e4Vuln,
    e6BeBuff: content.e6BeBuff,
  }

  const fuaHits = (e >= 4) ? 10 : 5

  const hitMultiByTargets: NumberToNumberMap = (e >= 4)
    ? {
      1: ASHBLAZING_ATK_STACK * (1 * 0.10 + 2 * 0.10 + 3 * 0.10 + 4 * 0.10 + 5 * 0.10 + 6 * 0.10 + 7 * 0.10 + 8 * 0.10 + 9 * 0.10 + 10 * 0.10),
      3: ASHBLAZING_ATK_STACK * (2 * (1 / 3) + 5 * (1 / 3) + 8 * (1 / 3)),
      5: ASHBLAZING_ATK_STACK * (3 * 0.50 + 8 * 0.50),
    }
    : {
      1: ASHBLAZING_ATK_STACK * (1 * 0.20 + 2 * 0.20 + 3 * 0.20 + 4 * 0.20 + 5 * 0.20),
      3: ASHBLAZING_ATK_STACK * (2 * 0.50 + 5 * 0.50),
      5: ASHBLAZING_ATK_STACK * (3 * 1.00),
    }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(TheDahliaEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [TheDahliaEntities.TheDahlia]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(TheDahliaAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const fuaHit = HitDefinitionBuilder.standardFua()
        .damageElement(ElementTag.Fire)
        .atkScaling(fuaScaling * fuaHits / context.enemyCount)
        .toughnessDmg(3 * fuaHits / context.enemyCount)
        .build()

      return {
        [TheDahliaAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Fire)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [TheDahliaAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Fire)
              .atkScaling(skillScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [TheDahliaAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Fire)
              .atkScaling(ultScaling)
              .toughnessDmg(30)
              .fixedToughnessDmg(20)
              .build(),
          ],
        },
        [TheDahliaAbilities.FUA]: {
          hits: [
            fuaHit,
            // FUA-specific super break hit
            ...(
              (r.superBreakDmg)
                ? [
                  HitDefinitionBuilder.standardSuperBreak(ElementTag.Fire)
                    .extraSuperBreakModifier(fuaSuperBreakScaling)
                    .referenceHit(fuaHit as Hit)
                    .build(),
                ]
                : []
            ),
          ],
        },
        [TheDahliaAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Fire).build(),
          ],
        },
      }
    },
    actionModifiers() {
      return [
        {
          modify: (action: OptimizerAction, context: OptimizerContext, self: ModifierContext) => {
            const m = self.ownConditionals as Conditionals<typeof teammateContent>

            if (m.superBreakDmg) {
              addSuperBreakHits(action.hits!)
            }
          },
        },
        {
          modify: (action: OptimizerAction, context: OptimizerContext, self: ModifierContext) => {
            const m = self.ownConditionals as Conditionals<typeof teammateContent>

            const hits = action.hits!
            const len = hits.length
            if (self.eidolon >= 1 && m.e1Buffs && m.dancePartner) {
              for (let i = 0; i < len; i++) {
                const hit = hits[i]

                if (hit.toughnessDmg) {
                  const e1ToughnessDmg = Math.max(10, Math.min(300, context.enemyMaxToughness / 30 * 0.25))
                  hit.fixedToughnessDmg = (hit.fixedToughnessDmg ?? 0) + e1ToughnessDmg
                }
              }
            }
          },
        },
      ]
    },

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.superBreakDmg) {
        x.set(StatKey.ENEMY_WEAKNESS_BROKEN, 1, x.source(SOURCE_TALENT))
      }
    },
    initializeTeammateConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.superBreakDmg) {
        x.set(StatKey.ENEMY_WEAKNESS_BROKEN, 1, x.source(SOURCE_TALENT))
      }
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.SPD_P, (r.spdBuff) ? 0.30 : 0, x.source(SOURCE_TRACE))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.BREAK_EFFICIENCY_BOOST, (m.zoneActive) ? 0.50 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
      x.buff(StatKey.DEF_PEN, (m.ultDefPen) ? ultDefPenValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))

      if (m.superBreakDmg) {
        if (e >= 1 && m.e1Buffs && m.dancePartner) {
          x.buff(StatKey.SUPER_BREAK_MODIFIER, superBreakScaling, x.targets(TargetTag.FullTeam).source(SOURCE_TALENT))
          x.buff(StatKey.SUPER_BREAK_MODIFIER, 0.40, x.source(SOURCE_E1))
        } else {
          x.buff(StatKey.SUPER_BREAK_MODIFIER, (m.dancePartner) ? superBreakScaling : 0, x.source(SOURCE_TALENT))
        }
      }

      x.buff(StatKey.RES_PEN, (e >= 2 && m.e2ResPen) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))
      x.buff(StatKey.VULNERABILITY, (e >= 4 && m.e4Vuln) ? 0.12 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E4))

      x.buff(StatKey.BE, (e >= 6 && m.e6BeBuff) ? 1.50 : 0, x.source(SOURCE_E6))

      // E1: Fixed toughness damage buff for dance partner
      if (e >= 1 && m.e1Buffs && m.dancePartner) {
        const e1ToughnessDmg = Math.max(10, Math.min(300, context.enemyMaxToughness / 30 * 0.25))
        // x.buff(StatKey.BASIC_FIXED_TOUGHNESS_DMG, e1ToughnessDmg, x.targets(TargetTag.FullTeam).source(SOURCE_E1))
        // x.buff(StatKey.SKILL_FIXED_TOUGHNESS_DMG, e1ToughnessDmg, x.targets(TargetTag.FullTeam).source(SOURCE_E1))
        // x.buff(StatKey.ULT_FIXED_TOUGHNESS_DMG, e1ToughnessDmg, x.targets(TargetTag.FullTeam).source(SOURCE_E1))
        // x.buff(StatKey.FUA_FIXED_TOUGHNESS_DMG, e1ToughnessDmg, x.targets(TargetTag.FullTeam).source(SOURCE_E1))
        // x.buff(StatKey.MEMO_SKILL_FIXED_TOUGHNESS_DMG, e1ToughnessDmg, x.targets(TargetTag.FullTeam).source(SOURCE_E1))
        // x.buff(StatKey.MEMO_TALENT_FIXED_TOUGHNESS_DMG, e1ToughnessDmg, x.targets(TargetTag.FullTeam).source(SOURCE_E1))
      }
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const IMPLANT_CHARACTERS = [
        FIREFLY,
        BOOTHILL,
        PHAINON,
        ANAXA,
        SILVER_WOLF,
      ]
      if (IMPLANT_CHARACTERS.includes(context.characterId)) {
        x.buff(StatKey.SPD_P, (t.spdBuff) ? 0.30 : 0, x.source(SOURCE_TRACE))
      }

      const beBuff = (t.beConversion) ? t.teammateBeValue * 0.24 + 0.50 : 0
      x.buff(StatKey.BE, beBuff, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
      x.buff(StatKey.UNCONVERTIBLE_BE_BUFF, beBuff, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
    },

    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      // boostAshblazingAtkP(x, action, context, hitMultiByTargets[context.enemyCount])
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return ``
      // return gpuBoostAshblazingAtkP(hitMultiByTargets[context.enemyCount])
    },
  }
}
