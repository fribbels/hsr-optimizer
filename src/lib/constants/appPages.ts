import { stripTrailingSlashes } from 'lib/utils/miscUtils'

export enum BasePath {
  // MAIN = '/hsr-optimizer',
  MAIN = '',
  BETA = '/dreary-quibbles',
}

// This string is replaced by BasePath.BETA by github actions, don't change
export const BASE_PATH: BasePath = BasePath.MAIN

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

  WEBGPU_TEST = 'WEBGPU_TEST',
  METADATA_TEST = 'METADATA_TEST',

  AV_VISUALIZER = 'AV_VISUALIZER',
  DONATE = 'DONATE',
}

type Route = `${typeof BASE_PATH}${RouteSuffix}`

type RouteSuffix = '' | '#main' | '#home' | '#showcase' | '#changelog' | '#warp' | '#benchmarks' | '#aha' | '#ehr' | '#webgpu' | '#metadata' | '#av' | '#donate'

export const PageToRoute = {
  [AppPages.HOME]: BASE_PATH,

  [AppPages.OPTIMIZER]: `${BASE_PATH}#main`,
  [AppPages.CHARACTERS]: `${BASE_PATH}#main`,
  [AppPages.RELICS]: `${BASE_PATH}#main`,
  [AppPages.IMPORT]: `${BASE_PATH}#main`,

  [AppPages.SHOWCASE]: `${BASE_PATH}#home`,
  [AppPages.CHANGELOG]: `${BASE_PATH}#changelog`,
  [AppPages.WARP]: `${BASE_PATH}#warp`,
  [AppPages.BENCHMARKS]: `${BASE_PATH}#benchmarks`,
  [AppPages.CALCULATORS]: `${BASE_PATH}#aha`,

  [AppPages.WEBGPU_TEST]: `${BASE_PATH}#webgpu`,
  [AppPages.METADATA_TEST]: `${BASE_PATH}#metadata`,

  [AppPages.AV_VISUALIZER]: `${BASE_PATH}#av`,
  [AppPages.DONATE]: `${BASE_PATH}#donate`,
} as const satisfies Record<AppPages, Route>

const RouteToPage: Record<string, AppPages> = {
  ...(Object.fromEntries(Object.entries(PageToRoute).map(([page, route]) => [route, page])) as Record<string, AppPages>),
  [`${BASE_PATH}#main`]: AppPages.OPTIMIZER, // #main is shared by 4 tabs; OPTIMIZER is the default
  [`${BASE_PATH}#aha`]: AppPages.CALCULATORS,
  [`${BASE_PATH}#ehr`]: AppPages.CALCULATORS,
}

export function getDefaultActiveKey() {
  const pathname = stripTrailingSlashes(window.location.pathname)
  const page = RouteToPage[pathname + window.location.hash.split('?')[0] as Route]

  if (!page || page === AppPages.HOME) return AppPages.SHOWCASE
  return page
}
