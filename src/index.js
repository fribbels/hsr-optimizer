import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// import reportWebVitals from './reportWebVitals';

import { Provider } from 'react-redux'


import { Constants } from './lib/constants'
import { Test } from './lib/test'
import { OcrParser } from './lib/ocrParser'
import { DataParser } from './lib/dataParser'
import { OptimizerTabController } from './lib/optimizerTabController'
import { DB } from './lib/db'
import { CharacterStats } from './lib/characterStats'
import { GPUOptimizer } from './lib/gpuOptimizer'
import { Utils } from './lib/utils'
import { Assets } from './lib/assets'
import { RelicAugmenter } from './lib/relicAugmenter'
import { StateEditor } from './lib/stateEditor'
import { StatCalculator } from './lib/statCalculator'
import { ThreadWorker } from "./lib/threadWorker";
import { Gradient } from "./lib/gradient";
import { SaveState } from "./lib/saveState";
import { RelicFilters } from "./lib/relicFilters";
import { Renderer } from "./lib/renderer";
import { Message } from "./lib/message";
window.Constants = Constants;
window.Test = Test;
window.OcrParser = OcrParser;
window.DataParser = DataParser;
window.OptimizerTabController = OptimizerTabController;
window.DB = DB;
window.CharacterStats = CharacterStats;
window.GPUOptimizer = GPUOptimizer;
window.Utils = Utils;
window.Assets = Assets;
window.RelicAugmenter = RelicAugmenter;
window.StateEditor = StateEditor;
window.StatCalculator = StatCalculator;
window.ThreadWorker = ThreadWorker;
window.Gradient = Gradient;
window.SaveState = SaveState;
window.RelicFilters = RelicFilters;
window.Renderer = Renderer;
window.Message = Message;

const workerpool = require('workerpool');
window.CPUs = workerpool.cpus
window.ThreadPool = workerpool.pool();

console.log('Data parser', DataParser.parse());
SaveState.load()

document.addEventListener("DOMContentLoaded", function(event) { 
  const root = ReactDOM.createRoot(document.getElementById('root'));

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
