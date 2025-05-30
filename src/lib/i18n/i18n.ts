import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import yaml from 'js-yaml'
import { BASE_PATH, BasePath } from 'lib/state/db'
import { languages, Languages } from 'lib/utils/i18nUtils'
import { initReactI18next } from 'react-i18next'

window.yaml = yaml
export const completedLocales: Languages[] = ['en_US', 'fr_FR', 'ja_JP', 'ko_KR', 'pt_BR', 'vi_VN', 'zh_CN'] as const

const namespaces = [
  'charactersTab',
  'common',
  'conditionals',
  'gameData',
  'getStartedTab',
  'hint',
  'hometab',
  'importSaveTab',
  'modals',
  'notifications',
  'optimizerTab',
  'relicScorerTab',
  'relicsTab',
  'settings',
  'sidebar',
  'warpCalculatorTab',
  'benchmarksTab',
] as const
export type Namespaces = typeof namespaces[number]

export const isBeta = BASE_PATH === BasePath.BETA

export const supportedLanguages = isBeta ? Object.keys(languages) : completedLocales
void i18next
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    ns: namespaces,
    defaultNS: 'common',
    fallbackNS: ['common', 'gameData'],
    debug: false,
    supportedLngs: supportedLanguages,
    load: 'currentOnly',
    fallbackLng: 'en_US',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    backend: {
      loadPath: BASE_PATH + '/locales/{{lng}}/{{ns}}.yaml',
      parse: function (data: string) {
        return yaml.load(data)
      },
    },
  })
export default i18next
