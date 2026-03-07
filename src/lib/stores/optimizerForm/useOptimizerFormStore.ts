import { ComboType } from 'lib/optimization/rotation/comboStateTransform'
import { TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  EnemyConfigFields,
  MainStatPart,
  OptimizerFormState,
  RatingFilterState,
  RelicFilterFields,
  StatFilterState,
  TeammateState,
} from 'lib/stores/optimizerForm/optimizerFormTypes'
import { createDefaultFormState, createDefaultTeammate } from 'lib/stores/optimizerForm/optimizerFormDefaults'
import type { SetConditionals } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { Eidolon } from 'types/character'
import { ConditionalValueMap } from 'types/conditionals'
import { OrnamentSetFilters, RelicSetFilters } from 'types/form'
import { LightConeId, SuperImpositionLevel } from 'types/lightCone'
import { MemoDisplay, StatDisplay } from 'types/store'
import { create } from 'zustand'

type SuggestionFixes = {
  relicSets?: RelicSetFilters
  ornamentSets?: OrnamentSetFilters
  mainBody?: string[]
  mainFeet?: string[]
  mainPlanarSphere?: string[]
  mainLinkRope?: string[]
}

type OptimizerFormActions = {
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
  setComboDot: (dot: number) => void
  setComboPreprocessor: (enabled: boolean) => void
  setDeprioritizeBuffs: (enabled: boolean) => void
  setResultSort: (sort: keyof typeof SortOption | undefined) => void
  setResultsLimit: (limit: number) => void
  setStatSim: (sim: OptimizerFormState['statSim']) => void
  setTeammateField: <K extends keyof TeammateState>(index: 0 | 1 | 2, key: K, value: TeammateState[K]) => void

  // Complex actions (Task 10)
  setRelicFilterField: <K extends keyof RelicFilterFields>(key: K, value: RelicFilterFields[K]) => void
  setMainStats: (part: MainStatPart, stats: string[]) => void
  setRelicSets: (sets: RelicSetFilters) => void
  setOrnamentSets: (sets: OrnamentSetFilters) => void
  setWeight: (stat: keyof OptimizerFormState['weights'], value: number) => void
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
  setConditionalValue: (itemName: (string | number)[], value: unknown) => void
}

type OptimizerFormStore = OptimizerFormState & OptimizerFormActions

const initialState = createDefaultFormState()

export const useOptimizerFormStore = create<OptimizerFormStore>()((set, get) => ({
  ...initialState,

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

  setComboDot: (dot) => set({ comboDot: dot }),

  setComboPreprocessor: (enabled) => set({ comboPreprocessor: enabled }),

  setDeprioritizeBuffs: (enabled) => set({ deprioritizeBuffs: enabled }),

  setResultSort: (sort) => set({ resultSort: sort }),

  setResultsLimit: (limit) => set({ resultsLimit: limit }),

  setStatSim: (sim) => set({ statSim: sim }),

  setTeammateField: (index, key, value) => set((state) => {
    const teammates: [TeammateState, TeammateState, TeammateState] = [...state.teammates]
    teammates[index] = { ...teammates[index], [key]: value }
    return { teammates }
  }),

  // ---- Complex actions (Task 10) ----

  setRelicFilterField: (key, value) => set({ [key]: value }),

  setMainStats: (part, stats) => set({ [part]: stats }),

  setRelicSets: (sets) => set({ relicSets: sets }),

  setOrnamentSets: (sets) => set({ ornamentSets: sets }),

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

  resetFilters: () => {
    const defaults = createDefaultFormState()
    const state = get()
    set({
      // Reset relic filter fields to defaults
      enhance: defaults.enhance,
      grade: defaults.grade,
      rank: defaults.rank,
      exclude: defaults.exclude,
      includeEquippedRelics: defaults.includeEquippedRelics,
      keepCurrentRelics: defaults.keepCurrentRelics,
      mainStatUpscaleLevel: defaults.mainStatUpscaleLevel,
      rankFilter: defaults.rankFilter,
      mainHead: defaults.mainHead,
      mainHands: defaults.mainHands,
      mainBody: defaults.mainBody,
      mainFeet: defaults.mainFeet,
      mainPlanarSphere: defaults.mainPlanarSphere,
      mainLinkRope: defaults.mainLinkRope,
      relicSets: defaults.relicSets,
      ornamentSets: defaults.ornamentSets,
      // Preserve character/LC
      characterId: state.characterId,
      characterEidolon: state.characterEidolon,
      lightCone: state.lightCone,
      lightConeSuperimposition: state.lightConeSuperimposition,
    })
  },

  applySuggestionFixes: (fixes) => {
    const patch: Partial<OptimizerFormState> = {}
    if (fixes.relicSets !== undefined) patch.relicSets = fixes.relicSets
    if (fixes.ornamentSets !== undefined) patch.ornamentSets = fixes.ornamentSets
    if (fixes.mainBody !== undefined) patch.mainBody = fixes.mainBody
    if (fixes.mainFeet !== undefined) patch.mainFeet = fixes.mainFeet
    if (fixes.mainPlanarSphere !== undefined) patch.mainPlanarSphere = fixes.mainPlanarSphere
    if (fixes.mainLinkRope !== undefined) patch.mainLinkRope = fixes.mainLinkRope
    set(patch)
  },

  setConditionalValue: (itemName, value) => set((state) => {
    const teammateKeyToIndex: Record<string, 0 | 1 | 2> = { teammate0: 0, teammate1: 1, teammate2: 2 }
    const [first, ...rest] = itemName
    const tmIndex = teammateKeyToIndex[first as string]

    if (tmIndex != null) {
      // Teammate path: ['teammate0', 'characterConditionals', 'key']
      const [condType, key] = rest as [string, string]
      const teammates = [...state.teammates] as [TeammateState, TeammateState, TeammateState]
      const tm = { ...teammates[tmIndex] }
      tm[condType as 'characterConditionals' | 'lightConeConditionals'] = {
        ...tm[condType as 'characterConditionals' | 'lightConeConditionals'],
        [key]: value as boolean | number,
      }
      teammates[tmIndex] = tm
      return { teammates }
    }

    if (first === 'setConditionals') {
      // Set conditional: ['setConditionals', 'SetName', 1]
      const [setName, idx] = rest as [string, number]
      const setConditionals = { ...state.setConditionals } as Record<string, [undefined, boolean | number]>
      const tuple = [...setConditionals[setName]] as [undefined, boolean | number]
      tuple[idx] = value as boolean | number
      setConditionals[setName] = tuple
      return { setConditionals }
    }

    // Main character: ['characterConditionals', 'key'] or ['lightConeConditionals', 'key']
    const [condType, key] = itemName as [string, string]
    return {
      [condType]: {
        ...(state[condType as 'characterConditionals' | 'lightConeConditionals'] as Record<string, unknown>),
        [key]: value,
      },
    }
  }),
}))
