import { BASE_PATH } from 'lib/constants/appPages'

export enum UtilityPanel {
  AHA = 'AHA',
  EHR = 'EHR',
}

export const UTILITY_PANELS = [UtilityPanel.AHA, UtilityPanel.EHR] as const

export const UtilityPanelHash: Record<UtilityPanel, string> = {
  [UtilityPanel.AHA]: '#aha',
  [UtilityPanel.EHR]: '#ehr',
}

const hashToPanel: Record<string, UtilityPanel> = {
  '#aha': UtilityPanel.AHA,
  '#ehr': UtilityPanel.EHR,
}

export function resolveUtilityPanel(): UtilityPanel {
  const hash = window.location.hash.split('?')[0]
  return hashToPanel[hash] ?? UtilityPanel.AHA
}

export function pushUtilityHash(panel: UtilityPanel) {
  const route = `${BASE_PATH}${UtilityPanelHash[panel]}`
  window.history.pushState({}, document.title, route)
}

export function replaceUtilityHash(panel: UtilityPanel) {
  const route = `${BASE_PATH}${UtilityPanelHash[panel]}`
  window.history.replaceState({}, document.title, route)
}
