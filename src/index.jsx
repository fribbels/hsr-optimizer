import React from 'react'
import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import './style/style.css'
import './style/hsro.css'
import App from './App'

import { WorkerPool } from './lib/workerPool'
import { Constants } from './lib/constants.ts'
import { OcrParserFribbels1 } from './lib/ocrParserFribbels1'
import { OcrParserKelz3 } from 'lib/ocrParserKelz3'
import { DataParser } from './lib/dataParser'
import { DB } from './lib/db'
import { CharacterStats } from './lib/characterStats'
import { Assets } from './lib/assets'
import { RelicAugmenter } from './lib/relicAugmenter'
import { StatCalculator } from './lib/statCalculator'
import { Gradient } from './lib/gradient'
import { SaveState } from './lib/saveState'
import { RelicFilters } from './lib/relicFilters'
import { Renderer } from './lib/renderer'
import { Message } from './lib/message'
import { Hint } from './lib/hint'
import { CharacterConverter } from './lib/characterConverter'
import { RelicScorer } from './lib/relicScorer.ts'
import { BufferPacker } from './lib/bufferPacker'
import { Typography } from 'antd'
import { RelicRollFixer } from './lib/relicRollFixer'

window.WorkerPool = WorkerPool
window.Constants = Constants
window.OcrParserFribbels1 = OcrParserFribbels1
window.OcrParserKelz3 = OcrParserKelz3
window.DataParser = DataParser
// window.OptimizerTabController = OptimizerTabController
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
// window.CharacterConditionals = CharacterConditionals
// window.LightConeConditionals = LightConeConditionals
window.BufferPacker = BufferPacker
window.RelicRollFixer = RelicRollFixer

console.log('Data parser', DataParser.parse())
SaveState.load()

document.addEventListener('DOMContentLoaded', function() {
  const root = ReactDOM.createRoot(document.getElementById('root'))

  root.render(
    <ErrorBoundary fallback={<Typography>Something went wrong</Typography>}>
      <App />
    </ErrorBoundary>,
  )
})
