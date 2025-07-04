import { AgGridReact } from 'ag-grid-react'
import { FormInstance } from 'antd/es/form/hooks/useForm'
import { MessageInstance } from 'antd/es/message/interface'
import { NotificationInstance } from 'antd/es/notification/interface'
import { HookAPI } from 'antd/lib/modal/useModal'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { Constants } from 'lib/constants/constants'
import { CharacterConverter } from 'lib/importer/characterConverter'
import { Hint } from 'lib/interactions/hint'
import { Message } from 'lib/interactions/message'
import {
  BufferPacker,
  OptimizerDisplayData,
} from 'lib/optimization/bufferPacker'
import { RelicAugmenter } from 'lib/relics/relicAugmenter'
import { RelicFilters } from 'lib/relics/relicFilters'
import { RelicRollFixer } from 'lib/relics/relicRollFixer'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import { StatCalculator } from 'lib/relics/statCalculator'
import { Assets } from 'lib/rendering/assets'
import { Gradient } from 'lib/rendering/gradient'
import { Renderer } from 'lib/rendering/renderer'
import { ColorThemeOverrides } from 'lib/rendering/theme'
import { DB } from 'lib/state/db'
import { Metadata } from 'lib/state/metadata'
import { SaveState } from 'lib/state/saveState'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { ShowcaseTabForm } from 'lib/tabs/tabShowcase/showcaseTabController'
import { Utils } from 'lib/utils/utils'
import { WorkerPool } from 'lib/worker/workerPool'
import {
  DispatchWithoutAction,
  RefObject,
} from 'react'
import {
  Build,
  Character,
} from 'types/character'
import { Form } from 'types/form'
import { Relic } from 'types/relic'
import { HsrOptimizerStore } from 'types/store'
import {
  StoreApi,
  UseBoundStore,
} from 'zustand'

type Jipt = {
  start(): void,
  stop(): void,
}

type SaveFilePickerOptions = {
  excludeAcceptAllOption?: boolean,
  id?: string,
  // A FileSystemHandle or a well known directory ("desktop", "documents", "downloads", "music", "pictures", or "videos") to open the dialog in.
  startIn?: FileSystemHandle | string,
  suggestedName?: string,
  types?: {
    description?: string,
    // An Object with the keys set to the MIME type and the values an Array of file extensions
    accept?: Record<string, string[]>,
  }[],
}

declare global {
  interface Window {
    // only exists on dreary-quibbles\
    // added by github CI
    jipt?: Jipt
    notificationApi: NotificationInstance
    messageApi: MessageInstance
    modalApi: HookAPI
    store: UseBoundStore<StoreApi<HsrOptimizerStore>>
    colorTheme: ColorThemeOverrides

    characterGrid: RefObject<AgGridReact<Character>>
    relicsGrid: RefObject<AgGridReact<Relic>>
    optimizerGrid: RefObject<AgGridReact<OptimizerDisplayData>>

    setCharacterRows: (characters: Character[]) => void
    setRelicRows: (characters: Relic[]) => void
    setOptimizerBuild: (build?: Build) => void
    setSelectedRelic: (relic: Partial<Relic>) => void
    setEditModalOpen: (open: boolean) => void

    showcaseTabForm: FormInstance<ShowcaseTabForm>

    // TODO see OptimizerForm
    onOptimizerFormValuesChange: (changedValues: Form, allValues: Form, bypass?: boolean) => unknown
    optimizerStartClicked: () => void
    optimizerForm: FormInstance<Form>

    forceOptimizerBuildPreviewUpdate: DispatchWithoutAction
    forceCharacterTabUpdate: DispatchWithoutAction
    refreshRelicsScore: DispatchWithoutAction

    rescoreSingleRelic: (relic: Relic) => void
    showSaveFilePicker: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>

    yaml: unknown
    WorkerPool: typeof WorkerPool
    Constants: typeof Constants
    DataParser: typeof Metadata
    OptimizerTabController: typeof OptimizerTabController
    DB: typeof DB
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
    CharacterConditionals: typeof CharacterConditionalsResolver
    LightConeConditionals: typeof LightConeConditionalsResolver
    BufferPacker: typeof BufferPacker
    RelicRollFixer: typeof RelicRollFixer

    title: string
    WEBGPU_DEBUG: boolean
  }

  // eslint-disable-next-line no-var
  var WEBGPU_DEBUG: boolean
  // eslint-disable-next-line no-var
  var SEQUENTIAL_BENCHMARKS: boolean
}
