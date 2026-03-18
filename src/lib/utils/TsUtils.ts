// TsUtils re-export facade — call sites being migrated to direct imports.
// precisionRound is the canonical home. All other methods re-export during transition.

import { clone, objectHash, flipStringMapping } from 'lib/utils/objectUtils'
import { nullUndefinedToZero } from 'lib/utils/mathUtils'
import { uuid, validateUuid, stripTrailingSlashes, consoleWarnWrapper, isVersionOutdated } from 'lib/utils/miscUtils'
import { smoothScrollNearest, isFirefox as _isFirefox, sleep } from 'lib/utils/frontendUtils'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { calculateRelicMainStatValue } from 'lib/utils/relicUtils'

export const TsUtils = {
  precisionRound: (number: number, precision: number = 5): number => {
    const factor = Math.pow(10, precision)
    return Math.round(number * factor) / factor
  },

  // Re-exports — will be removed as call sites are migrated
  clone,
  objectHash,
  isVersionOutdated,
  calculateRelicMainStatValue,
  wrappedFixedT,
  flipStringMapping,
  nullUndefinedToZero,
  uuid,
  stripTrailingSlashes,
  sleep,
  consoleWarnWrapper,
  validateUuid,
  smoothScrollNearest,
}

export { _isFirefox as isFirefox }
