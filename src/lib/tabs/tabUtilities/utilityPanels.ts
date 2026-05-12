import { BASE_PATH } from 'lib/constants/appPages'

export enum CalculatorPanel {
  AHA = 'AHA',
  EHR = 'EHR',
}

export const CALCULATOR_PANELS = [CalculatorPanel.AHA, CalculatorPanel.EHR] as const

export const CALCULATOR_PANEL_HASH: Record<CalculatorPanel, string> = {
  [CalculatorPanel.AHA]: '#aha',
  [CalculatorPanel.EHR]: '#ehr',
}

const hashToPanel = Object.fromEntries(
  Object.entries(CALCULATOR_PANEL_HASH).map(([panel, hash]) => [hash, panel as CalculatorPanel]),
) as Record<string, CalculatorPanel>

export function resolveCalculatorPanel(): CalculatorPanel {
  const hash = window.location.hash.split('?')[0]
  return hashToPanel[hash] ?? CalculatorPanel.AHA
}

export function pushCalculatorHash(panel: CalculatorPanel) {
  const route = `${BASE_PATH}${CALCULATOR_PANEL_HASH[panel]}`
  window.history.pushState({}, document.title, route)
}

export function replaceCalculatorHash(panel: CalculatorPanel) {
  const route = `${BASE_PATH}${CALCULATOR_PANEL_HASH[panel]}`
  window.history.replaceState({}, document.title, route)
}
