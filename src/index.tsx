import App from 'App'
import 'lib/i18n/i18n'
import { Constants } from 'lib/constants/constants'
import { verifyWebgpuSupport } from 'lib/gpu/webgpuDevice'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import 'overlayscrollbars/overlayscrollbars.css'
import { CharacterConverter } from 'lib/importer/characterConverter'
import { Hint } from 'lib/interactions/hint'
import { Message } from 'lib/interactions/message'
import { BufferPacker } from 'lib/optimization/bufferPacker'
import { RelicAugmenter } from 'lib/relics/relicAugmenter'
import { RelicFilters } from 'lib/relics/relicFilters'
import { RelicRollFixer } from 'lib/relics/relicRollFixer'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import { StatCalculator } from 'lib/relics/statCalculator'
import { Assets } from 'lib/rendering/assets'
import { Gradient } from 'lib/rendering/gradient'
import { Renderer } from 'lib/rendering/renderer'
import { Metadata } from 'lib/state/metadataInitializer'
import { SaveState } from 'lib/state/saveState'

import { WorkerPool } from 'lib/worker/workerPool'
import { OverlayScrollbars } from 'overlayscrollbars'
import ReactDOM from 'react-dom/client'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import 'style/tokens.css'
import 'style/global.css'
import 'style/ag-grid-overrides.css'
import { AllCommunityModule, ModuleRegistry, provideGlobalGridOptions } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])
provideGlobalGridOptions({ theme: 'legacy' })
import 'style/selecto.css'
import 'style/components.css'
import 'style/mantine-overrides.css'

window.__HSR_DEBUG = {
  WorkerPool,
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
}

Metadata.initialize()
SaveState.load(false, false)

void verifyWebgpuSupport(false)

const defaultErrorRender = ({ error }: FallbackProps) =>
  <div>
    Something went wrong: {error instanceof Error ? error.message : String(error)}</div>

const root = ReactDOM.createRoot(document.getElementById('root')!)

OverlayScrollbars(document.body, {})

root.render(
  <ErrorBoundary fallbackRender={defaultErrorRender}>
    <App />
  </ErrorBoundary>,
)
