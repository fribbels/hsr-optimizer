import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import yaml from 'js-yaml'
import { BASE_PATH, BasePath } from 'lib/state/db'
import { initReactI18next } from 'react-i18next'

window.yaml = yaml

export const languages = {
  de_DE: {
    locale: 'de_DE',
    nativeName: 'Deutsch',
    shortName: 'Deutsch',
  },
  en_US: {
    locale: 'en_US',
    nativeName: 'English',
    shortName: 'English',
  },
  es_ES: {
    locale: 'es_ES',
    nativeName: 'Español',
    shortName: 'Español',
  },
  fr_FR: {
    locale: 'fr_FR',
    nativeName: 'Français',
    shortName: 'Français',
  },
  it_IT: {
    locale: 'it_IT',
    nativeName: 'Italiano',
    shortName: 'Italiano',
  },
  ja_JP: {
    locale: 'ja_JP',
    nativeName: '日本語',
    shortName: '日本語',
  },
  ko_KR: {
    locale: 'ko_KR',
    nativeName: '한국어',
    shortName: '한국어',
  },
  pt_BR: {
    locale: 'pt_BR',
    nativeName: 'Português',
    shortName: 'Português',
  },
  ru_RU: {
    locale: 'ru_RU',
    nativeName: 'русский',
    shortName: 'русский',
  },
  vi_VN: {
    locale: 'vi_VN',
    nativeName: 'tiếng việt',
    shortName: 'tiếng việt',
  },
  zh_CN: {
    locale: 'zh_CN',
    nativeName: '中文',
    shortName: '中文',
  },
  zh_TW: {
    locale: 'zh_TW',
    nativeName: '中文',
    shortName: '中文',
  },
  aa_ER: {
    locale: 'aa_ER',
    nativeName: 'inContext',
    shortName: 'inContext',
  },
  /*
  id_ID: {
    locale: 'id_ID',
    nativeName: 'Bahasa Indonesia',
    shortName: 'Bahasa Indonesia',
  },
  th_TH: {
    locale: 'th_TH',
    nativeName: ' ไทย',
    shortName: ' ไทย',
  },
  */
} as const
export type Languages = keyof typeof languages
export const completedLocales: Languages[] = ['en_US', 'fr_FR', 'ja_JP', 'ko_KR', 'pt_BR', 'vi_VN', 'zh_CN'] as const

export const isBeta = BASE_PATH === BasePath.BETA

export const supportedLanguages = isBeta ? Object.keys(languages) : completedLocales
void i18next
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    ns: [
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
    ],
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
