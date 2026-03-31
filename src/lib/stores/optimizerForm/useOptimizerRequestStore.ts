import type { ComboType } from 'lib/optimization/rotation/comboType'
import { type TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'
import { type SortOption } from 'lib/optimization/sortOptions'
import type { SimulationRequest } from 'lib/simulations/statSimulationTypes'
import {
  type EnemyConfigFields,
  type MainStatPart,
  type OptimizerRequestState,
  type RatingFilterState,
  type RelicFilterFields,
  type StatFilterState,
  type StatSimType,
  type TeammateState,
} from 'lib/stores/optimizerForm/optimizerFormTypes'
import {
  computeApplySuggestionFixes,
  computeLoadForm,
  computeResetFilters,
  computeSetMainCharacterConditional,
  computeSetSetConditional,
  computeSetTeammateConditional,
  type SuggestionFixes,
} from 'lib/stores/optimizerForm/optimizerFormStoreActions'
import { createDefaultFormState, createDefaultTeammate } from 'lib/stores/optimizerForm/optimizerFormDefaults'
import type { SetConditionals } from 'lib/optimization/combo/comboTypes'
import { type CharacterId, type Eidolon } from 'types/character'
import { type ConditionalValueMap } from 'types/conditionals'
import { type SetFilters } from 'lib/stores/optimizerForm/setFilterTypes'
import { type Form } from 'types/form'
import { type LightConeId, type SuperImpositionLevel } from 'types/lightCone'
import { type MemoDisplay, type StatDisplay } from 'types/store'
import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'

export type MainConditionalType = 'characterConditionals' | 'lightConeConditionals'
export type TeammateConditionalType = 'characterConditionals' | 'lightConeConditionals'

type OptimizerRequestActions = {
  // Simple setters (Task 8)
  setStatFilter: (key: keyof StatFilterState, value: number | undefined) => void
  setRatingFilter: (key: keyof RatingFilterState, value: number | undefined) => void
  setCombatBuff: (key: string, value: number) => void
  setEnemyField: <K extends keyof EnemyConfigFields>(key: K, value: EnemyConfigFields[K]) => void
  setStatDisplay: (display: StatDisplay) => void
  setMemoDisplay: (display: MemoDisplay) => void
  setComboStateJson: (json: string) => void
  setComboType: (type: ComboType) => void
  setComboTurnAbilities: (abilities: TurnAbilityName[]) => void
  setComboPreprocessor: (enabled: boolean) => void
  setDeprioritizeBuffs: (enabled: boolean) => void
  setResultSort: (sort: keyof typeof SortOption | undefined) => void
  setResultsLimit: (limit: number) => void
  setStatSim: (sim: OptimizerRequestState['statSim']) => void
  updateStatSimField: (simType: StatSimType, field: string, value: unknown) => void
  setTeammateField: <K extends keyof TeammateState>(index: 0 | 1 | 2, key: K, value: TeammateState[K]) => void
  setTeammate: (index: 0 | 1 | 2, fields: Partial<TeammateState>) => void

  // Complex actions (Task 10)
  setRelicFilterField: <K extends keyof RelicFilterFields>(key: K, value: RelicFilterFields[K]) => void
  setMainStats: (part: MainStatPart, stats: string[]) => void
  setSetFilters: (display: SetFilters) => void
  setWeight: (stat: keyof OptimizerRequestState['weights'], value: number) => void
  setEidolon: (eidolon: Eidolon) => void
  setLightCone: (lcId: LightConeId | undefined) => void
  setLightConeSuperimposition: (si: SuperImpositionLevel) => void
  setCharacterConditionals: (conds: ConditionalValueMap) => void
  setLightConeConditionals: (conds: ConditionalValueMap) => void
  setSetConditionals: (conds: SetConditionals) => void
  clearTeammate: (index: 0 | 1 | 2) => void
  clearTeammateLightCone: (index: 0 | 1 | 2) => void
  resetFilters: () => void
  applySuggestionFixes: (fixes: SuggestionFixes) => void
  setCharacterId: (id: CharacterId | undefined) => void
  setMainCharacterConditional: (condType: MainConditionalType, key: string, value: boolean | number) => void
  setTeammateConditional: (teammateIndex: 0 | 1 | 2, condType: TeammateConditionalType, key: string, value: boolean | number) => void
  setSetConditional: (key: string, value: boolean | number) => void
  loadForm: (form: Form) => void
}

type OptimizerRequestStore = OptimizerRequestState & OptimizerRequestActions

export const useOptimizerRequestStore = createTabAwareStore<OptimizerRequestStore>((set) => ({
  ...createDefaultFormState(),

  // ---- Simple setters (Task 8) ----

  setStatFilter: (key, value) => set((state) => ({
    statFilters: { ...state.statFilters, [key]: value },
  })),

  setRatingFilter: (key, value) => set((state) => ({
    ratingFilters: { ...state.ratingFilters, [key]: value },
  })),

  setCombatBuff: (key, value) => set((state) => ({
    combatBuffs: { ...state.combatBuffs, [key]: value },
  })),

  setEnemyField: (key, value) => set({ [key]: value }),

  setStatDisplay: (display) => set({ statDisplay: display }),

  setMemoDisplay: (display) => set({ memoDisplay: display }),

  setComboStateJson: (json) => set({ comboStateJson: json }),

  setComboType: (type) => set({ comboType: type }),

  setComboTurnAbilities: (abilities) => set({ comboTurnAbilities: abilities }),

  setComboPreprocessor: (enabled) => set({ comboPreprocessor: enabled }),

  setDeprioritizeBuffs: (enabled) => set({ deprioritizeBuffs: enabled }),

  setResultSort: (sort) => set({ resultSort: sort }),

  setResultsLimit: (limit) => set({ resultsLimit: limit }),

  setStatSim: (sim) => set({ statSim: sim }),

  updateStatSimField: (simType, field, value) => set((state) => {
    const current = state.statSim ?? { key: '', benchmarks: {} as SimulationRequest, substatRolls: {} as SimulationRequest }
    const simSection = current[simType] ?? {}
    return {
      statSim: {
        ...current,
        [simType]: {
          ...simSection,
          [field]: value,
        },
      },
    }
  }),

  setTeammateField: (index, key, value) => set((state) => {
    const teammates: [TeammateState, TeammateState, TeammateState] = [...state.teammates]
    teammates[index] = { ...teammates[index], [key]: value }
    return { teammates }
  }),

  setTeammate: (index, fields) => set((state) => {
    const teammates: [TeammateState, TeammateState, TeammateState] = [...state.teammates]
    teammates[index] = { ...teammates[index], ...fields }
    return { teammates }
  }),

  // ---- Complex actions (Task 10) ----

  setRelicFilterField: (key, value) => set({ [key]: value }),

  setMainStats: (part, stats) => set({ [part]: stats }),

  setSetFilters: (display) => set({ setFilters: display }),

  setWeight: (stat, value) => set((state) => ({
    weights: { ...state.weights, [stat]: value },
  })),

  setEidolon: (eidolon) => set({ characterEidolon: eidolon }),

  setLightCone: (lcId) => set({ lightCone: lcId }),

  setLightConeSuperimposition: (si) => set({ lightConeSuperimposition: si }),

  setCharacterConditionals: (conds) => set({ characterConditionals: conds }),

  setLightConeConditionals: (conds) => set({ lightConeConditionals: conds }),

  setSetConditionals: (conds) => set({ setConditionals: conds }),

  clearTeammate: (index) => set((state) => {
    const teammates: [TeammateState, TeammateState, TeammateState] = [...state.teammates]
    teammates[index] = createDefaultTeammate()
    return { teammates }
  }),

  clearTeammateLightCone: (index) => set((state) => {
    const teammates: [TeammateState, TeammateState, TeammateState] = [...state.teammates]
    teammates[index] = {
      ...teammates[index],
      lightCone: undefined,
      lightConeSuperimposition: 1,
      lightConeConditionals: {},
    }
    return { teammates }
  }),

  resetFilters: () => set((state) => computeResetFilters(state)),

  applySuggestionFixes: (fixes) => set((state) => computeApplySuggestionFixes(state, fixes)),

  setCharacterId: (id) => set({ characterId: id }),

  loadForm: (form) => set(() => computeLoadForm(form)),

  setMainCharacterConditional: (condType, key, value) => set((state) =>
    computeSetMainCharacterConditional(state, condType, key, value),
  ),

  setTeammateConditional: (teammateIndex, condType, key, value) => set((state) =>
    computeSetTeammateConditional(state, teammateIndex, condType, key, value),
  ),

  setSetConditional: (key, value) => set((state) =>
    computeSetSetConditional(state, key, value),
  ),
}))
