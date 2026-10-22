import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { HMRPlugin } from 'i18next-hmr/plugin'
import Backend, { type HttpBackendOptions } from 'i18next-http-backend'
import yaml from 'js-yaml'
import {
  BASE_PATH,
  BasePath,
} from 'lib/tabs/navigation/constants'
import type { Languages } from 'lib/utils/i18nUtils'
import { languages } from 'lib/utils/i18nUtils'
import { initReactI18next } from 'react-i18next'

window.yaml = yaml
export const completedLocales: Languages[] = ['en_US', 'es_ES', 'fr_FR', 'ja_JP', 'ko_KR', 'pt_BR', 'ru_RU', 'vi_VN', 'zh_CN'] as const

const namespaces = [
  'benchmarksTab',
  'calculatorsTab',
  'charactersTab',
  'common',
  'conditionals',
  'gameData',
  'getStartedTab',
  'hint',
  'hometab',
  'importSaveTab',
  'leaderboardTab',
  'modals',
  'notifications',
  'optimizerTab',
  'relicScorerTab',
  'relicsTab',
  'settings',
  'sidebar',
  'teamShowcaseTab',
  'warpCalculatorTab',
] as const
export type Namespaces = typeof namespaces[number]

export const isBeta = BASE_PATH === BasePath.BETA

export const defaultNS = 'common'
export const fallbackNS = ['common', 'gameData'] as const

const supportedLanguages = isBeta ? Object.keys(languages) : completedLocales
const i18n = i18next
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)

if (import.meta.env.DEV) {
  i18n.use(
    new HMRPlugin({
      silent: true,
      vite: { client: true },
    }),
  )
}

i18n.init<HttpBackendOptions>({
  ns: namespaces,
  defaultNS,
  fallbackNS,
  debug: false,
  supportedLngs: supportedLanguages,
  load: 'currentOnly',
  fallbackLng: 'en_US',
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
  backend: {
    loadPath: BASE_PATH + '/locales/{{lng}}/{{ns}}.yaml',
    parse: function(data: string) {
      return yaml.load(data) as Record<string, any>
    },
  },
})
