import { App } from 'App'
import 'lib/i18n/i18n'
import { Constants } from 'lib/constants/constants'
import { verifyWebgpuSupport } from 'lib/gpu/webgpuDevice'
// Use .layer.css variants to wrap Mantine styles in @layer mantine { ... }.
// Without this, Vite dev and prod builds can order CSS chunks differently,
// causing CSS module overrides to win in dev but lose in prod (or vice versa).
// Layered styles always lose to unlayered styles regardless of source order.
import '@mantine/core/styles.layer.css'
import '@mantine/notifications/styles.layer.css'
import 'overlayscrollbars/overlayscrollbars.css'
import { exportShowcaseColors } from 'lib/dev/exportShowcaseColors'
import { populateAllCharacters } from 'lib/dev/populateAllCharacters'
import { resetShowcaseColors } from 'lib/dev/resetShowcaseColors'
import { CharacterConverter } from 'lib/importer/characterConverter'
import { Hint } from 'lib/interactions/hint'
import { Message } from 'lib/interactions/message'
import { BufferPacker } from 'lib/optimization/bufferPacker'
import { RelicAugmenter } from 'lib/relics/relicAugmenter'
import { RelicFilters } from 'lib/relics/relicFilters'
import { RelicRollFixer } from 'lib/relics/relicRollFixer'
import { RelicScorer } from 'lib/relics/scoring/relicScorer'
import { StatCalculator } from 'lib/relics/statCalculator'
import { Assets } from 'lib/rendering/assets'
import { Gradient } from 'lib/rendering/gradient'
import { Renderer } from 'lib/rendering/renderer'
import { Metadata } from 'lib/state/metadataInitializer'
import { SaveState } from 'lib/state/saveState'

import { workerPool } from 'lib/worker/workerPool'
import { OverlayScrollbars } from 'overlayscrollbars'
import ReactDOM from 'react-dom/client'
import {
  ErrorBoundary,
  type FallbackProps,
} from 'react-error-boundary'
import 'style/tokens.css'
import 'style/global.css'
import 'style/ag-grid-overrides.css'
import {
  CellStyleModule,
  ClientSideRowModelApiModule,
  ClientSideRowModelModule,
  ColumnApiModule,
  ExternalFilterModule,
  InfiniteRowModelModule,
  LocaleModule,
  ModuleRegistry,
  PaginationModule,
  PinnedRowModule,
  provideGlobalGridOptions,
  RenderApiModule,
  RowApiModule,
  RowSelectionModule,
  ScrollApiModule,
} from 'ag-grid-community'

ModuleRegistry.registerModules([
  CellStyleModule,
  ClientSideRowModelApiModule,
  ClientSideRowModelModule,
  ColumnApiModule,
  ExternalFilterModule,
  InfiniteRowModelModule,
  LocaleModule,
  PaginationModule,
  PinnedRowModule,
  RenderApiModule,
  RowApiModule,
  RowSelectionModule,
  ScrollApiModule,
])
provideGlobalGridOptions({ theme: 'legacy' })
import 'style/selecto.css'
import 'style/components.css'
import 'style/mantine-overrides.css'

window.__HSR_DEBUG = {
  workerPool,
  Constants,
  DataParser: Metadata,
  Assets,
  RelicAugmenter,
  StatCalculator,
  Gradient,
  SaveState,
  RelicFilters,
  Renderer,
  Message,
  Hint,
  CharacterConverter,
  RelicScorer,
  BufferPacker,
  RelicRollFixer,
  populateAllCharacters,
  resetShowcaseColors,
  exportShowcaseColors,
}

Metadata.initialize()
SaveState.load(false, false)

void verifyWebgpuSupport(false)

const defaultErrorRender = ({ error }: FallbackProps) => (
  <div>
    Something went wrong: {error instanceof Error ? error.message : String(error)}
  </div>
)

const root = ReactDOM.createRoot(document.getElementById('root')!)

OverlayScrollbars(document.body, {})

root.render(
  <ErrorBoundary fallbackRender={defaultErrorRender}>
    <App />
  </ErrorBoundary>,
)
