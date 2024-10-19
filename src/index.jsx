import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import 'style/style.css'
import 'style/hsro.css'
import WrappedApp from './App'
import 'lib/i18n'

import { WorkerPool } from 'lib/workerPool'
import { Constants } from 'lib/constants'
import { DataParser } from 'lib/dataParser'
import { DB } from 'lib/db'
import { CharacterStats } from 'lib/characterStats'
import { Assets } from 'lib/assets'
import { RelicAugmenter } from 'lib/relicAugmenter'
import { StatCalculator } from 'lib/statCalculator'
import { Gradient } from 'lib/gradient'
import { SaveState } from 'lib/saveState'
import { RelicFilters } from 'lib/relicFilters'
import { Renderer } from 'lib/renderer'
import { Message } from 'lib/message'
import { Hint } from 'lib/hint'
import { CharacterConverter } from 'lib/characterConverter'
import { RelicScorer } from 'lib/relicScorerPotential'
import { BufferPacker } from 'lib/bufferPacker'
import { Typography } from 'antd'
import { RelicRollFixer } from 'lib/relicRollFixer'
import { Themes } from 'lib/theme'
import { verifyWebgpuSupport } from 'lib/gpu/webgpuDevice'
import 'overlayscrollbars/overlayscrollbars.css';
import { OverlayScrollbars } from 'overlayscrollbars';

window.WorkerPool = WorkerPool
window.Constants = Constants
window.DataParser = DataParser
window.DB = DB
window.CharacterStats = CharacterStats
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

DataParser.parse()
SaveState.load(false)
void verifyWebgpuSupport(false)

const defaultErrorRender = ({ error }) => <Typography>Something went wrong: {error.message}</Typography>

document.addEventListener('DOMContentLoaded', function () {
  const root = ReactDOM.createRoot(document.getElementById('root'))

  OverlayScrollbars(document.body, {});

  root.render(
    <ErrorBoundary fallbackRender={defaultErrorRender}>
      <WrappedApp/>
    </ErrorBoundary>,
  )
})
