import { TsUtils } from 'lib/utils/TsUtils'

export enum SavedBuildSource {
  SHOWCASE = 'showcase',
  OPTIMIZER = 'optimizer',
}

export enum BasePath {
  MAIN = '/hsr-optimizer',
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

  WEBGPU_TEST = 'WEBGPU_TEST',
  METADATA_TEST = 'METADATA_TEST',
}

export type Route = `${typeof BASE_PATH}${RouteSuffix}`

type RouteSuffix = '' | '#main' | '#showcase' | '#changelog' | '#warp' | '#benchmarks' | '#webgpu' | '#metadata'

export const PageToRoute = {
  [AppPages.HOME]: BASE_PATH,

  [AppPages.OPTIMIZER]: `${BASE_PATH}#main`,
  [AppPages.CHARACTERS]: `${BASE_PATH}#main`,
  [AppPages.RELICS]: `${BASE_PATH}#main`,
  [AppPages.IMPORT]: `${BASE_PATH}#main`,

  [AppPages.SHOWCASE]: `${BASE_PATH}#showcase`,
  [AppPages.CHANGELOG]: `${BASE_PATH}#changelog`,
  [AppPages.WARP]: `${BASE_PATH}#warp`,
  [AppPages.BENCHMARKS]: `${BASE_PATH}#benchmarks`,

  [AppPages.WEBGPU_TEST]: `${BASE_PATH}#webgpu`,
  [AppPages.METADATA_TEST]: `${BASE_PATH}#metadata`,
} as const satisfies Record<AppPages, Route>

export const RouteToPage = {
  [PageToRoute[AppPages.OPTIMIZER]]: AppPages.OPTIMIZER,
  [PageToRoute[AppPages.SHOWCASE]]: AppPages.SHOWCASE,
  [PageToRoute[AppPages.WARP]]: AppPages.WARP,
  [PageToRoute[AppPages.CHANGELOG]]: AppPages.CHANGELOG,
  [PageToRoute[AppPages.BENCHMARKS]]: AppPages.BENCHMARKS,

  [PageToRoute[AppPages.WEBGPU_TEST]]: AppPages.WEBGPU_TEST,
  [PageToRoute[AppPages.METADATA_TEST]]: AppPages.METADATA_TEST,
  [PageToRoute[AppPages.HOME]]: AppPages.HOME,
} as const satisfies Record<Route, AppPages>

export function getDefaultActiveKey() {
  const pathname = TsUtils.stripTrailingSlashes(window.location.pathname)
  const page = RouteToPage[pathname + window.location.hash.split('?')[0] as Route]
  return page ?? AppPages.HOME
}
