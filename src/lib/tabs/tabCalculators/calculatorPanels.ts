import {
  BASE_PATH,
  type PageHash,
} from 'lib/tabs/navigation/constants'
import { parseHash } from 'lib/tabs/navigation/parseHash'
import { flipStringMapping } from 'lib/utils/objectUtils'

export enum CalculatorPanel {
  AHA = 'AHA',
  EHR = 'EHR',
}

export const CALCULATOR_PANELS = [CalculatorPanel.AHA, CalculatorPanel.EHR] as const

export const CALCULATOR_PANEL_HASH = {
  [CalculatorPanel.AHA]: '#aha',
  [CalculatorPanel.EHR]: '#ehr',
} as const satisfies Record<CalculatorPanel, PageHash>

export const HashToPanel = flipStringMapping(CALCULATOR_PANEL_HASH) as Record<string, CalculatorPanel>

export function resolveCalculatorPanel(): CalculatorPanel {
  return HashToPanel[parseHash().hash] ?? CalculatorPanel.AHA
}

export function pushCalculatorHash(panel: CalculatorPanel) {
  if (HashToPanel[parseHash().hash] === panel) return
  const route = `${BASE_PATH}${CALCULATOR_PANEL_HASH[panel]}`
  window.history.pushState({}, '', route)
}

export function replaceCalculatorHash(panel: CalculatorPanel) {
  const route = `${BASE_PATH}${CALCULATOR_PANEL_HASH[panel]}`
  window.history.replaceState({}, '', route)
}
