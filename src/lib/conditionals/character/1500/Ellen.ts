import i18next from 'i18next'
import { ASHBLAZING_ATK_STACK } from 'lib/conditionals/conditionalConstants'
import {
  boostAshblazingAtkContainer,
  gpuBoostAshblazingAtkContainer,
} from 'lib/conditionals/conditionalFinalizers'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { OnTheFallOfAnAeon } from 'lib/conditionals/lightcone/5star/OnTheFallOfAnAeon'
import {
  CURRENT_DATA_VERSION,
  Parts,
  Stats,
} from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { type Eidolon } from 'types/character'
import { type CharacterConfig } from 'types/characterConfig'
import { type CharacterConditionalsController } from 'types/conditionals'
import {
  type ScoringMetadata,
  type SimulationMetadata,
} from 'types/metadata'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

export const EllenEntities = createEnum('Ellen', 'Sharkboo')
export const EllenAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.UNIQUE,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.FUA,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
  const { SOURCE_SKILL, SOURCE_ULT, SOURCE_TRACE, SOURCE_E1, SOURCE_E2, SOURCE_E4, SOURCE_E6 } = Source.character('1514')

  const basicScaling = basic(e, 1.00, 1.10)
  const enhancedBasicScaling = basic(e, 4.00, 4.40)
  const enhancedBasicRandomScaling = basic(e, 3.20, 3.52)
  const skillScaling = skill(e, 4.00, 4.40)
  const skillVulnerability = skill(e, 0.50, 0.55)
  const ultScaling = ult(e, 4.00, 4.40)
  const ultMarkedScaling = ult(e, 3.20, 3.52)
  const ultEnhancedBasicBoost = ult(e, 4.00, 4.40)
  const fuaScaling = talent(e, 6.00, 6.60)

  // Source: Nanoka 4.7.51 and supplied Lv.6/7 descriptions; UNIQUE is the charge-free dive.
  // Both dive actions use the described scaling; the unnamed alternate table is not assigned.
  // Not modeled: Technique setup; Energy, resource generation/Heat and action advances need a timeline.
  // Joint sequencing, Astra-owned attacks and extra turns exceed primary-only action evaluation.
  // Passive trace totals belong in game metadata, which is not supplied for this staged character.
  const defaults = {
    sharkBiteCharges: 6,
    randomHitsOnTarget: (e >= 6) ? 6 : 3,
    biteMark: true,
    ultEnhancedBasicBuff: true,
    roamingModeBuffProviders: 2,
    e1DefPen: true,
    e2CritDmg: true,
    e4ResPen: true,
    e6Buffs: true,
  }
  const teammateDefaults = { biteMark: true }

  const content: ContentDefinition<typeof defaults> = {
    sharkBiteCharges: {
      id: 'sharkBiteCharges',
      formItem: 'slider',
      text: 'Shark\'s Gotta Bite charges',
      content: betaContent,
      min: 0,
      max: 6,
    },
    randomHitsOnTarget: {
      id: 'randomHitsOnTarget',
      formItem: 'slider',
      text: 'Random hits on target',
      content: betaContent,
      min: 0,
      max: (e >= 6) ? 6 : 3,
    },
    biteMark: {
      id: 'biteMark',
      formItem: 'switch',
      text: 'Bite Mark on target',
      content: betaContent,
    },
    ultEnhancedBasicBuff: {
      id: 'ultEnhancedBasicBuff',
      formItem: 'switch',
      text: 'Ultimate enhanced Basic boost',
      content: betaContent,
    },
    roamingModeBuffProviders: {
      id: 'roamingModeBuffProviders',
      formItem: 'slider',
      text: 'Roaming Mode buff providers',
      content: betaContent,
      min: 0,
      max: 2,
    },
    e1DefPen: {
      id: 'e1DefPen',
      formItem: 'switch',
      text: 'E1 enhanced Basic DEF ignore',
      content: betaContent,
      disabled: e < 1,
    },
    e2CritDmg: {
      id: 'e2CritDmg',
      formItem: 'switch',
      text: 'E2 enhanced Basic CRIT DMG',
      content: betaContent,
      disabled: e < 2,
    },
    e4ResPen: {
      id: 'e4ResPen',
      formItem: 'switch',
      text: 'E4 enhanced Basic Ice RES PEN',
      content: betaContent,
      disabled: e < 4,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: 'E6 enhanced Basic bonuses',
      content: betaContent,
      disabled: e < 6,
    },
  }
  const teammateContent: ContentDefinition<typeof teammateDefaults> = { biteMark: content.biteMark }

  function getBasicState(action: OptimizerAction, freeDive = action.actionType === AbilityKind.UNIQUE) {
    const r = action.characterConditionals as Conditionals<typeof content>
    const charges = Math.min(6, Math.max(0, Math.floor(r.sharkBiteCharges)))
    const enhanced = freeDive || charges >= 3
    const consumed = enhanced && !freeDive ? charges : 0
    const e6Active = e >= 6 && r.e6Buffs
    const maxRandomHits = enhanced ? Math.max(0, consumed - 3) + (e6Active ? 3 : 0) : 0
    const randomHits = Math.min(maxRandomHits, Math.max(0, Math.floor(r.randomHitsOnTarget)))
    return { enhanced, consumed, randomHits }
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    teammateContent: () => Object.values(teammateContent),
    teammateDefaults: () => teammateDefaults,
    entityDeclaration: () => Object.values(EllenEntities),
    entityDefinition: () => ({
      [EllenEntities.Ellen]: { primary: true, summon: false, memosprite: false, pet: false },
      [EllenEntities.Sharkboo]: { primary: false, summon: true, memosprite: false, pet: true },
    }),
    actionDeclaration: () => [...EllenAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const { enhanced, randomHits } = getBasicState(action, false)
      const { randomHits: freeDiveRandomHits } = getBasicState(action, true)
      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Ice)
              .atkScaling(enhanced ? enhancedBasicScaling : basicScaling)
              .toughnessDmg(enhanced ? 20 : 10)
              .build(),
            // Random-instance toughness is not provided by the source.
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Ice)
              .atkScaling(enhancedBasicRandomScaling * randomHits)
              .toughnessDmg(0)
              .build(),
          ],
        },
        [AbilityKind.UNIQUE]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Ice)
              .atkScaling(enhancedBasicScaling)
              .toughnessDmg(20)
              .build(),
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Ice)
              .atkScaling(enhancedBasicRandomScaling * freeDiveRandomHits)
              .toughnessDmg(0)
              .build(),
          ],
        },
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Ice)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Ice)
              .atkScaling(ultScaling + (r.biteMark ? ultMarkedScaling : 0))
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .sourceEntity(EllenEntities.Sharkboo)
              .damageElement(ElementTag.Ice)
              .atkScaling(fuaScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.BREAK]: {
          hits: [HitDefinitionBuilder.standardBreak(ElementTag.Ice).build()],
        },
      }
    },
    actionModifiers: () => [],
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const { enhanced, consumed } = getBasicState(action)
      const buffProviders = Math.min(2, Math.max(0, Math.floor(r.roamingModeBuffProviders)))

      // Roaming Mode: inherited owner CRIT DMG and DMG boost.
      x.buff(StatKey.CD, buffProviders * 0.64, x.source(SOURCE_TRACE))
      x.buff(StatKey.BOOST, buffProviders === 2 ? 0.48 : 0, x.source(SOURCE_TRACE))
      x.buff(
        StatKey.BOOST,
        enhanced && r.ultEnhancedBasicBuff ? ultEnhancedBasicBoost : 0,
        x.target(EllenEntities.Ellen).damageType(DamageTag.BASIC).source(SOURCE_ULT),
      )
      x.buff(
        StatKey.DEF_PEN,
        e >= 1 && enhanced && consumed === 6 && r.e1DefPen ? 0.30 : 0,
        x.target(EllenEntities.Ellen).damageType(DamageTag.BASIC).source(SOURCE_E1),
      )
      x.buff(StatKey.CD, e >= 2 && enhanced && r.e2CritDmg ? 0.50 : 0, x.target(EllenEntities.Ellen).damageType(DamageTag.BASIC).source(SOURCE_E2))
      x.buff(
        StatKey.RES_PEN,
        e >= 4 && enhanced && r.e4ResPen ? consumed * 0.02 : 0,
        x.target(EllenEntities.Ellen).damageType(DamageTag.BASIC).elements(ElementTag.Ice).source(SOURCE_E4),
      )
      x.buff(
        StatKey.RES_PEN,
        e >= 6 && enhanced && r.e6Buffs ? 0.20 : 0,
        x.target(EllenEntities.Ellen).damageType(DamageTag.BASIC).elements(ElementTag.Ice).source(SOURCE_E6),
      )
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>
      x.buff(StatKey.VULNERABILITY, m.biteMark ? skillVulnerability : 0, x.targets(TargetTag.FullTeam).damageType(DamageTag.BASIC).source(SOURCE_SKILL))
    },
    precomputeTeammateEffectsContainer: () => {},
    // Ashblazing: one-hit placeholder until Sharkboo's hit weights are available.
    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkContainer(x, action, ASHBLAZING_ATK_STACK)
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkContainer(ASHBLAZING_ATK_STACK, action)
    },
    dynamicConditionals: [],
  }
}

const simulation = (): SimulationMetadata | undefined => {
  // TODO: Define a validated rotation and benchmark when game metadata is available.
  return undefined
}

const scoring = (): ScoringMetadata => ({
  // TODO: Set scoring weights and main stats; zero weights intentionally disable this placeholder.
  stats: {
    [Stats.ATK]: 0,
    [Stats.ATK_P]: 0,
    [Stats.DEF]: 0,
    [Stats.DEF_P]: 0,
    [Stats.HP]: 0,
    [Stats.HP_P]: 0,
    [Stats.SPD]: 0,
    [Stats.CR]: 0,
    [Stats.CD]: 0,
    [Stats.EHR]: 0,
    [Stats.RES]: 0,
    [Stats.BE]: 0,
  },
  parts: { [Parts.Body]: [], [Parts.Feet]: [], [Parts.PlanarSphere]: [], [Parts.LinkRope]: [] },
  presets: [],
  sortOption: SortOption.BASIC,
  hiddenColumns: [],
  simulation: simulation(),
})

// TODO: Set portrait framing and showcase color after assets are supplied.
const display = {}

export const Ellen: CharacterConfig = {
  id: '1514',
  defaultLightCone: OnTheFallOfAnAeon.id,
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}
