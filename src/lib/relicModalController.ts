import DB from './db.js'
import { SaveState } from './saveState.js'
import { Message } from './message.js'
import { OptimizerTabController } from 'lib/optimizerTabController.js'

export const RelicModalController = {
  onEditOk: (selectedRelic, relic) => {
    relic.id = selectedRelic.id

    const updatedRelic = { ...selectedRelic, ...relic }

    DB.setRelic(updatedRelic)
    window.setRelicRows(DB.getRelics())
    SaveState.save()
    window.forceCharacterTabUpdate()

    Message.success('Successfully edited relic')
    console.log('onEditOk', updatedRelic)

    OptimizerTabController.updateFilters()

    return updatedRelic
  },
}
