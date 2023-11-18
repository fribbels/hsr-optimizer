import { configureStore } from '@reduxjs/toolkit'

import relicsReducer from './relicsSlice'
import optimizerRowsReducer from './optimizerRowsSlice'

export default configureStore({
  reducer: {
    relics: relicsReducer,
    optimizerRows: optimizerRowsReducer
  }
})

