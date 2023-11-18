import { createSlice } from '@reduxjs/toolkit'

export const relicsSlice = createSlice({
  name: 'relics',
  initialState: {
    value: []
  },
  reducers: {
    setRelics: (state, action) => {
      console.log('setRelics')
      let relics = action.payload;
      // relics.push(...relics)
      // relics.push(...relics)
      for (let relic of relics) {
        RelicAugmenter.augment(relic);
      }
      state.value = action.payload
    }
  }
})

// Action creators are generated for each case reducer function
export const { setRelics } = relicsSlice.actions

export default relicsSlice.reducer