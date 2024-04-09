import DB from './db'

export const SaveState = {
  save: () => {
    const state = {
      relics: DB.getRelics(),
      characters: DB.getCharacters(),
      scorerId: window.store.getState().scorerId,
      scoringMetadataOverrides: window.store.getState().scoringMetadataOverrides,
      optimizerMenuState: window.store.getState().optimizerMenuState,
      excludedRelicPotentialCharacters: window.store.getState().excludedRelicPotentialCharacters,
    }

    console.log('Saved state', state)
    const stateString = JSON.stringify(state)
    localStorage.state = stateString
    return stateString
  },

  load: () => {
    try {
      const state = localStorage.state
      if (state) {
        const parsed = JSON.parse(state)
        console.log('Loaded SaveState', parsed)

        DB.setStore(parsed)
        return true
      }

      console.log('No SaveState found')
      return false
    } catch (e) {
      console.error('Error loading state', e)
      // localStorage.clear()
      return false
    }
  },
}
