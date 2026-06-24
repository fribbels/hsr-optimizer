import {
  CALCULATOR_PANEL_HASH,
  CalculatorPanel,
} from 'lib/tabs/tabCalculators/calculatorPanels'
import { flipStringMapping } from 'lib/utils/objectUtils'

export enum BasePath {
  MAIN = '/hsr-optimizer',
  BETA = '/dreary-quibbles',
}

// This string is replaced by BasePath.BETA by github actions, don't change
export const BASE_PATH: BasePath = BasePath.MAIN

export type PageHash =
  | ''
  | '#main'
  | '#showcase'
  | '#changelog'
  | '#warp'
  | '#benchmarks'
  | '#aha'
  | '#ehr'
  | '#leaderboard'
  | '#webgpu'
  | '#metadata'
  | '#characters'
  | '#relics'
  | '#import'

export enum AppPages {
  HOME = 'HOME',

  OPTIMIZER = 'OPTIMIZER',
  CHARACTERS = 'CHARACTERS',
  RELICS = 'RELICS',
  IMPORT = 'IMPORT',

  CHANGELOG = 'CHANGELOG',
  SHOWCASE = 'SHOWCASE',
  WARP = 'WARP',
  BENCHMARKS = 'BENCHMARKS',
  CALCULATORS = 'CALCULATORS',
  LEADERBOARD = 'LEADERBOARD',

  WEBGPU_TEST = 'WEBGPU_TEST',
  METADATA_TEST = 'METADATA_TEST',
}

export const PageToHash = {
  [AppPages.SHOWCASE]: '#showcase',
  [AppPages.LEADERBOARD]: '#leaderboard',
  [AppPages.BENCHMARKS]: '#benchmarks',
  [AppPages.CALCULATORS]: CALCULATOR_PANEL_HASH[CalculatorPanel.AHA],
  [AppPages.WARP]: '#warp',

  [AppPages.OPTIMIZER]: '#main',
  [AppPages.CHARACTERS]: '#characters',
  [AppPages.RELICS]: '#relics',
  [AppPages.IMPORT]: '#import',

  [AppPages.HOME]: '',
  [AppPages.CHANGELOG]: '#changelog',

  [AppPages.WEBGPU_TEST]: '#webgpu',
  [AppPages.METADATA_TEST]: '#metadata',
} as const satisfies Record<AppPages, PageHash>

export const HashToPage = {
  ...flipStringMapping(PageToHash),
  [CALCULATOR_PANEL_HASH[CalculatorPanel.EHR]]: AppPages.CALCULATORS,
} as const satisfies Record<PageHash, AppPages>

export function getDefaultActiveKey() {
  const page = HashToPage[window.location.hash.split('?')[0] as PageHash]

  // Redirect #main to HOME for first-time users (no prior save data)
  if (
    (
      page === AppPages.OPTIMIZER
      || page === AppPages.CHARACTERS
      || page === AppPages.RELICS
    )
    && localStorage.getItem('state') === null
  ) {
    return AppPages.HOME
  }

  return page ?? AppPages.HOME
}
