import { Typography } from 'antd'
import WrappedApp from 'App'
import 'lib/i18n/i18n'
import { Constants } from 'lib/constants/constants'
import { verifyWebgpuSupport } from 'lib/gpu/webgpuDevice'
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
import { Themes } from 'lib/rendering/theme'
import { DB } from 'lib/state/db'
import { Metadata } from 'lib/state/metadata'
import { SaveState } from 'lib/state/saveState'

import { WorkerPool } from 'lib/worker/workerPool'
import { OverlayScrollbars } from 'overlayscrollbars'
import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import 'style/style.css'
import 'style/hsro.css'

window.WorkerPool = WorkerPool
window.Constants = Constants
window.DataParser = Metadata
window.DB = DB
window.Assets = Assets
window.RelicAugmenter = RelicAugmenter
window.StatCalculator = StatCalculator
window.Gradient = Gradient
window.SaveState = SaveState
window.RelicFilters = RelicFilters
window.Renderer = Renderer
window.Message = Message
window.Hint = Hint
window.CharacterConverter = CharacterConverter
window.RelicScorer = RelicScorer
window.BufferPacker = BufferPacker
window.RelicRollFixer = RelicRollFixer

window.colorTheme = Themes.BLUE

Metadata.initialize()
SaveState.load(false)
void verifyWebgpuSupport(false)

const defaultErrorRender = ({ error }: { error: { message: string } }) => (
  <Typography>Something went wrong: {error.message}</Typography>
)

document.addEventListener('DOMContentLoaded', function () {
  const root = ReactDOM.createRoot(document.getElementById('root')!)

  OverlayScrollbars(document.body, {})

  root.render(
    <ErrorBoundary fallbackRender={defaultErrorRender}>
      <WrappedApp/>
    </ErrorBoundary>,
  )
})
