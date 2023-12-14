export const SaveState = {
  save: () => {
    let state = {
      relics: DB.getRelics(),
      characters: DB.getCharacters(),
      scorerId: DB.getScorerId(),
    }

    console.log('Saved state', state)
    let stateString = JSON.stringify(state)
    localStorage.state = stateString
    return stateString
  },

  load: () => {
    try {
      let state = localStorage.state
      if (state) {
        let parsed = JSON.parse(state)
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
  }
}