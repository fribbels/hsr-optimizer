import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from "react-error-boundary";
import './index.css';
import App from './App';

import { WorkerPool } from './lib/workerPool';
import { Constants } from './lib/constants'
import { OcrParser } from './lib/ocrParser'
import { DataParser } from './lib/dataParser'
import { OptimizerTabController } from './lib/optimizerTabController'
import { DB } from './lib/db'
import { CharacterStats } from './lib/characterStats'
import { GPUOptimizer } from './lib/gpuOptimizer'
import { Utils } from './lib/utils'
import { Assets } from './lib/assets'
import { RelicAugmenter } from './lib/relicAugmenter'
import { StatCalculator } from './lib/statCalculator'
import { Gradient } from "./lib/gradient";
import { SaveState } from "./lib/saveState";
import { RelicFilters } from "./lib/relicFilters";
import { Renderer } from "./lib/renderer";
import { Message } from "./lib/message";
import { Hint } from "./lib/hint";
import { CharacterConverter } from "./lib/characterConverter";
import { RelicScorer } from './lib/relicScorer';
import { Typography } from 'antd';
window.WorkerPool = WorkerPool;
window.Constants = Constants;
window.OcrParser = OcrParser;
window.DataParser = DataParser;
window.OptimizerTabController = OptimizerTabController;
window.DB = DB;
window.CharacterStats = CharacterStats;
window.GPUOptimizer = GPUOptimizer;
window.Utils = Utils;
window.Assets = Assets;
window.RelicAugmenter = RelicAugmenter;
window.StatCalculator = StatCalculator;
window.Gradient = Gradient;
window.SaveState = SaveState;
window.RelicFilters = RelicFilters;
window.Renderer = Renderer;
window.Message = Message;
window.Hint = Hint;
window.CharacterConverter = CharacterConverter
window.RelicScorer = RelicScorer

console.log('Data parser', DataParser.parse());
SaveState.load()

document.addEventListener("DOMContentLoaded", function(event) { 
  const root = ReactDOM.createRoot(document.getElementById('root'));

  root.render(
    // <React.StrictMode>
      <ErrorBoundary fallback={<Typography>Something went wrong</Typography>}>
        <App />
      </ErrorBoundary>
    // </React.StrictMode>
  );
});
