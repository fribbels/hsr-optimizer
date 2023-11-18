import { createSlice } from '@reduxjs/toolkit'

export const optimizerRowsSlice = createSlice({
  name: 'optimizerRows',
  initialState: {
    value: []
  },
  reducers: {
    setOptimizerRows: (state, action) => {
      console.log('setOptimizerRows', state, action)
      state.value = action.payload
    }
  }
})

// Action creators are generated for each case reducer function
export const { setOptimizerRows } = optimizerRowsSlice.actions

export default optimizerRowsSlice.reducer