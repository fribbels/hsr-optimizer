import DB from './db.js'
import { SaveState } from './saveState.js'
import { Message } from './message.js'

export const RelicModalController = {
  onEditOk: (selectedRelic, relic) => {
    relic.id = selectedRelic.id

    const updatedRelic = { ...selectedRelic, ...relic }

    if (updatedRelic.equippedBy) {
      DB.equipRelic(updatedRelic, updatedRelic.equippedBy)
    } else {
      DB.unequipRelicById(updatedRelic.id)
    }

    DB.setRelic(updatedRelic)
    window.setRelicRows(DB.getRelics())
    SaveState.save()
    window.forceCharacterTabUpdate()

    Message.success('Successfully edited relic')
    console.log('onEditOk', updatedRelic)

    return updatedRelic
  },
}
