import fs from 'fs'
import path from 'path'
import sampleSave from '../src/data/sample-save.json' with { type: 'json' }
import { STORAGE_STATE } from './playwright.config'

// Write sample data directly to localStorage storage state.
// The raw sample-save.json (relics + characters) is a valid subset of HsrOptimizerSaveFormat.
// On app boot, SaveState.load() passes it through loadSaveData() which handles all
// transformations: character validation, form migration, relic augmentation, etc.
export default function globalSetup() {
  const storageState = {
    cookies: [],
    origins: [{
      origin: 'http://127.0.0.1:3000',
      localStorage: [{
        name: 'state',
        value: JSON.stringify(sampleSave),
      }],
    }],
  }

  fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true })
  fs.writeFileSync(STORAGE_STATE, JSON.stringify(storageState))
}
