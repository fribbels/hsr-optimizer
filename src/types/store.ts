import { ThemeConfig } from 'antd'
import { ComputeEngine, ElementName, PathName } from 'lib/constants/constants'
import { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import { BUFF_TYPE } from 'lib/optimization/buffSource'
import { Buff } from 'lib/optimization/computedStatsArray'
import { ColorThemeOverrides } from 'lib/rendering/theme'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { Simulation, StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { AppPage } from 'lib/state/db'
import { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { ShowcaseTabSavedSession } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { WarpRequest } from 'lib/tabs/tabWarp/warpCalculatorController'
import { Build, Character, CharacterId, Eidolon } from 'types/character'
import { Form } from 'types/form'
import { LightCone, SuperImpositionLevel } from 'types/lightCone'
import { ScoringMetadata, ShowcasePreferences, ShowcaseTemporaryOptions } from 'types/metadata'
import { Relic } from 'types/relic'

type PermutationDetails = {
  Head: number
  Hands: number
  Body: number
  Feet: number
  PlanarSphere: number
  LinkRope: number
  HeadTotal: number
  HandsTotal: number
  BodyTotal: number
  FeetTotal: number
  PlanarSphereTotal: number
  LinkRopeTotal: number
}

export type RelicTabFilters = {
  set: (string | number)[]
  part: (string | number)[]
  enhance: (string | number)[]
  mainStats: (string | number)[]
  subStats: (string | number)[]
  grade: (string | number)[]
  verified: (string | number)[]
  equippedBy: (string | number)[]
  initialRolls: (string | number)[]
}
/* eslint-disable @stylistic/no-multi-spaces */
export type HsrOptimizerStore = {                                                                        // global store separation plan
  version: string                                                                                        // global
  colorTheme: ColorThemeOverrides                                                                        // global
  optimizerGrid: unknown                                                                                 // optimizerTab
  optimizerTabFocusCharacter?: CharacterId | null                                                        // optimizerTab
  characterTabFocusCharacter?: CharacterId | null                                                        // characterTab
  scoringAlgorithmFocusCharacter?: CharacterId | null                                                    // give own store?
  statTracesDrawerFocusCharacter?: CharacterId | null                                                    // give own store?
  relicsTabFocusCharacter?: CharacterId | null                                                           // relicsTab
  rowLimit: number                                                                                       // relicLocator (done)
  activeKey: AppPage                                                                                     // global
  characters: Character[]                                                                                // characterTab
  charactersById: Partial<Record<CharacterId, Character>>                                                // characterTab
  permutations: number                                                                                   // optimizerTab
  permutationsResults: number                                                                            // optimizerTab
  permutationsSearched: number                                                                           // optimizerTab
  scoringMetadataOverrides: Record<string, ScoringMetadata>                                              // relicsTab?
  showcasePreferences: Record<string, ShowcasePreferences>                                               // characterTab/showcaseTab
  showcaseTemporaryOptionsByCharacter: Record<string, ShowcaseTemporaryOptions>                          // characterTab/showcaseTab
  statSimulationDisplay: StatSimTypes                                                                    // optimizerTab
  statSimulations: Simulation[]                                                                          // optimizerTab
  selectedStatSimulations: Simulation['key'][]                                                           // optimizerTab
  optimizationInProgress: boolean                                                                        // optimizerTab
  optimizationId: string | null                                                                          // optimizerTab
  teammateCount: number                                                                                  // optimizerTab
  relicScorerSidebarOpen: boolean                                                                        // showcaseTab
  optimizerRunningEngine: ComputeEngine                                                                  // optimizerTab
  optimizerStartTime: number | null                                                                      // optimizerTab
  optimizerEndTime: number | null                                                                        // optimizerTab
  optimizerTabFocusCharacterSelectModalOpen: boolean                                                     // optimizerTab

  comboState: ComboState                                                                                 // optimizerTab
  formValues: Form | undefined                                                                           // optimizerTab
  inventoryWidth: number                                                                                 // relicLocator (done)
  setInventoryWidth: (width: number) => void                                                             // relicLocator (done)
  setRowLimit: (rowLimit: number) => void                                                                // relicLocator (done)
  relicsById: Record<string, Relic>                                                                      // global
  statDisplay: string                                                                                    // optimizerTab
  memoDisplay: string                                                                                    // optimizerTab
  settings: UserSettings                                                                                 // global
  optimizerBuild: Build | null                                                                           // optimizerTab
  optimizerSelectedRowData: OptimizerDisplayDataStatSim | null                                           // optimizerTab
  optimizerBuffGroups: Record<BUFF_TYPE, Record<string, Buff[]>> | undefined                             // unused??
  setSettings: (settings: UserSettings) => void                                                          // global
  setOptimizationId: (id: string) => void                                                                // optimizerTab
  setComboState: (state: ComboState) => void                                                             // optimizerTab
  setFormValues: (form: Form) => void                                                                    // optimizerTab
  setOptimizerTabFocusCharacter: (CharacterId: CharacterId | null | undefined) => void                   // optimizerTab
  setOptimizationInProgress: (open: boolean) => void                                                     // optimizerTab
  setOptimizerStartTime: (open: number) => void                                                          // optimizerTab
  setOptimizerEndTime: (open: number) => void                                                            // optimizerTab
  setRelicTabFilters: (filters: RelicTabFilters) => void                                                 // relicsTab
  setOptimizerRunningEngine: (s: ComputeEngine) => void                                                  // optimizerTab
  setExcludedRelicPotentialCharacters: (ids: CharacterId[]) => void                                      // relicsTab
  optimizerFormCharacterEidolon: number                                                                  // optimizerTab
  optimizerFormSelectedLightCone: LightCone['id'] | null | undefined                                     // optimizerTab
  optimizerFormSelectedLightConeSuperimposition: number                                                  // optimizerTab
  setPermutationsResults: (n: number) => void                                                            // optimizerTab
  setPermutationsSearched: (n: number) => void                                                           // optimizerTab
  setRelicsById: (relicsById: Record<number, Relic>) => void                                             // global
  setSavedSessionKey: <T extends keyof GlobalSavedSession>(key: T, value: GlobalSavedSession[T]) => void // global
  setActiveKey: (key: AppPage) => void                                                                   // global
  setScoringAlgorithmFocusCharacter: (id: CharacterId | null | undefined) => void                        // give own store?
  setStatTracesDrawerFocusCharacter: (id: CharacterId | null | undefined) => void                        // give own store?
  setOptimizerTabFocusCharacterSelectModalOpen: (open: boolean) => void                                  // optimizerTab
  setStatDisplay: (display: string) => void                                                              // optimizerTab
  setMemoDisplay: (display: string) => void                                                              // optimizerTab
  setCharacters: (characters: Character[]) => void                                                       // characterTab
  setCharactersById: (charactersById: Partial<Record<CharacterId, Character>>) => void                   // characterTab
  setOptimizerFormSelectedLightConeSuperimposition: (x: SuperImpositionLevel) => void                    // optimizerTab
  setColorTheme: (x: ColorThemeOverrides) => void                                                        // global
  setOptimizerBuild: (x: Build) => void                                                                  // optimizerTab
  setOptimizerSelectedRowData: (x: OptimizerDisplayDataStatSim | null) => void                           // optimizerTab
  setSavedSession: (x: GlobalSavedSession) => void                                                       // global
  setOptimizerFormSelectedLightCone: (x: LightCone['id'] | null) => void                                 // optimizerTab
  setOptimizerFormCharacterEidolon: (x: Eidolon) => void                                                 // optimizerTab
  setTeammateCount: (x: number) => void                                                                  // optimizerTab
  setSelectedStatSimulations: (x: Simulation['key'][]) => void                                           // optimizerTab
  setStatSimulations: (x: Simulation[]) => void                                                          // optimizerTab
  setStatSimulationDisplay: (x: StatSimTypes) => void                                                    // optimizerTab
  setScoringMetadataOverrides: (x: Record<string, ScoringMetadata>) => void                              // relicsTab
  setShowcasePreferences: (x: Record<string, ShowcasePreferences>) => void                               // characterTab/showcaseTab
  setShowcaseTemporaryOptionsByCharacter: (x: Record<string, ShowcaseTemporaryOptions>) => void          // characterTab/showcaseTab
  setCharacterTabFilters: (x: CharacterTabFilters) => void                                               // characterTab
  setPermutations: (x: number) => void                                                                   // optimizerTab
  setPermutationDetails: (x: PermutationDetails) => void                                                 // optimizerTab
  setRelicsTabFocusCharacter: (x: CharacterId | null | undefined) => void                                // relicsTab
  setCharacterTabFocusCharacter: (x: CharacterId | null | undefined) => void                             // characterTab
  setVersion: (x: string) => void                                                                        // global
  setOptimizerMenuState: (x: OptimizerMenuState) => void                                                 // optimizerTab
  setGlobalThemeConfig: (x: ThemeConfig) => void                                                         // global

  permutationDetails: PermutationDetails                                                                 // optimizerTab

  relicTabFilters: RelicTabFilters                                                                       // relicsTab
  characterTabFilters: CharacterTabFilters                                                               // characterTab
  excludedRelicPotentialCharacters: CharacterId[]                                                        // relicsTab

  optimizerMenuState: OptimizerMenuState                                                                 // optimizerTab

  savedSession: GlobalSavedSession                                                                       // global
  globalThemeConfig: ThemeConfig                                                                         // global
}

type OptimizerMenuState = Record<string, boolean>

// TODO relocate to CharacterTab.tsx once it gets rewritten in typescript
export type CharacterTabFilters = {
  name: string
  element: ElementName[]
  path: PathName[]
  rarity: number[]
}

export type GlobalSavedSession = {
  optimizerCharacterId: CharacterId | null
  scoringType: ScoringType
  computeEngine: ComputeEngine
  showcaseStandardMode: boolean
  showcaseDarkMode: boolean
  showcaseUID: boolean
  showcasePreciseSpd: boolean
}

export type UserSettings = {
  RelicEquippingBehavior: string
  PermutationsSidebarBehavior: string
  RelicPotentialLoadBehavior: string
  ExpandedInfoPanelPosition: string
}

// The JSON format we save to localstorage / save file
export type HsrOptimizerSaveFormat = {
  relics: Relic[]
  characters: Character[]
  scoringMetadataOverrides: Record<string, ScoringMetadata>
  showcasePreferences: Record<string, ShowcasePreferences>
  optimizerMenuState: OptimizerMenuState
  excludedRelicPotentialCharacters: CharacterId[]
  savedSession: {
    showcaseTab: ShowcaseTabSavedSession
    global: GlobalSavedSession
  }
  settings: UserSettings
  version: string
  warpRequest: WarpRequest
  relicLocator: {
    inventoryWidth: number
    rowLimit: number
  }
}
