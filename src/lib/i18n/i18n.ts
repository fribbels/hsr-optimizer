import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import yaml from 'js-yaml'
import { BASE_PATH } from 'lib/state/db'
import { initReactI18next } from 'react-i18next'

window.yaml = yaml

export const languages = {
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
  /*
      de_DE: {
        locale: 'de_DE',
        nativeName: 'Deutsch',
        shortName: 'Deutsch',
      },
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
export const completedLocales: Languages[] = ['en_US', 'fr_FR', 'ja_JP', 'pt_BR', 'zh_CN'] as const

// @ts-ignore
export const supportedLanguages = BASE_PATH == '/dreary-quibbles' ? Object.keys(languages) : completedLocales
void i18next
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    ns: [
      'charactersTab',
      'common',
      'gameData',
      'getStartedTab',
      'importSaveTab',
      'relicScorerTab',
      'relicsTab',
      'sidebar',
      'modals',
      'hint',
      'settings',
      'optimizerTab',
      'notifications',
      'conditionals',
      'hometab',
    ],
    defaultNS: 'common',
    fallbackNS: ['common', 'gameData'],
    debug: true,
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
