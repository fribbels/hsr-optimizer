import { AgGridReact } from 'ag-grid-react'
import { FormInstance } from 'antd/es/form/hooks/useForm'
import { MessageInstance } from 'antd/es/message/interface'
import { NotificationInstance } from 'antd/es/notification/interface'
import { HookAPI } from 'antd/lib/modal/useModal'
import { Assets } from 'lib/assets'
import { BufferPacker } from 'lib/bufferPacker'
import { CharacterConditionals } from 'lib/characterConditionals'
import { CharacterConverter } from 'lib/characterConverter'
import { CharacterStats } from 'lib/characterStats'
import { Constants } from 'lib/constants'
import { DataParser } from 'lib/dataParser'
import { DB } from 'lib/db'
import { Gradient } from 'lib/gradient'
import { Hint } from 'lib/hint'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import { Message } from 'lib/message'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { RelicAugmenter } from 'lib/relicAugmenter'
import { RelicFilters } from 'lib/relicFilters'
import { RelicRollFixer } from 'lib/relicRollFixer'
import { RelicScorer } from 'lib/relicScorerPotential'
import { Renderer } from 'lib/renderer'
import { SaveState } from 'lib/saveState'
import { StatCalculator } from 'lib/statCalculator'
import { ColorThemeOverrides } from 'lib/theme'
import { Utils } from 'lib/utils'
import { WorkerPool } from 'lib/workerPool'
import { DispatchWithoutAction, RefObject } from 'react'
import { Build, Character } from 'types/Character'
import { Form } from 'types/Form'
import { Relic } from 'types/Relic'
import { HsrOptimizerStore } from 'types/store'
import { StoreApi, UseBoundStore } from 'zustand'
import { Hero } from './types/calc'

declare global {
  interface Window {
    notificationApi: NotificationInstance
    messageApi: MessageInstance
    modalApi: HookAPI
    store: UseBoundStore<StoreApi<HsrOptimizerStore>>
    colorTheme: ColorThemeOverrides

    characterGrid: RefObject<AgGridReact<Character>>
    relicsGrid: RefObject<AgGridReact<Relic>>
    optimizerGrid: RefObject<AgGridReact<Hero>>

    setCharacterRows: (characters: Character[]) => void
    setRelicRows: (characters: Relic[]) => void
    setOptimizerBuild: (build?: Build) => void
    setSelectedRelic: (relic: Partial<Relic>) => void
    setEditModalOpen: (open: boolean) => void

    // TODO see OptimizerForm
    onOptimizerFormValuesChange: (changedValues: Form, allValues: Form, bypass?: boolean) => unknown
    optimizerStartClicked: () => void
    optimizerForm: FormInstance
    statSimulationForm: FormInstance

    forceOptimizerBuildPreviewUpdate: DispatchWithoutAction
    forceCharacterTabUpdate: DispatchWithoutAction
    refreshRelicsScore: DispatchWithoutAction

    rescoreSingleRelic: (relic: Relic) => void
    showSaveFilePicker: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>

    yaml: unknown
    WorkerPool: typeof WorkerPool
    Constants: typeof Constants
    DataParser: typeof DataParser
    OptimizerTabController: typeof OptimizerTabController
    DB: typeof DB
    CharacterStats: typeof CharacterStats
    Utils: typeof Utils
    Assets: typeof Assets
    RelicAugmenter: typeof RelicAugmenter
    StatCalculator: typeof StatCalculator
    Gradient: typeof Gradient
    SaveState: typeof SaveState
    RelicFilters: typeof RelicFilters
    Renderer: typeof Renderer
    Message: typeof Message
    Hint: typeof Hint
    CharacterConverter: typeof CharacterConverter
    RelicScorer: typeof RelicScorer
    CharacterConditionals: typeof CharacterConditionals
    LightConeConditionals: typeof LightConeConditionals
    BufferPacker: typeof BufferPacker
    RelicRollFixer: typeof RelicRollFixer

    title: string

    WEBGPU_DEBUG: boolean
  }
}
