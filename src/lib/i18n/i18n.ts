import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import yaml from 'js-yaml'
import { BASE_PATH } from 'lib/state/db'
import { initReactI18next } from 'react-i18next'

window.yaml = yaml

export const languages = {
  en: {
    locale: 'en',
    localeCode: 'en_US',
    nativeName: 'English',
    shortName: 'English',
  },
  es: {
    locale: 'es',
    localeCode: 'es_ES',
    nativeName: 'Español',
    shortName: 'Español',
  },
  fr: {
    locale: 'fr',
    localeCode: 'fr_FR',
    nativeName: 'Français',
    shortName: 'Français',
  },
  it: {
    locale: 'it',
    localeCode: 'it_IT',
    nativeName: 'Italiano',
    shortName: 'Italiano',
  },
  ja: {
    locale: 'ja',
    localeCode: 'ja_JP',
    nativeName: '日本語',
    shortName: '日本語',
  },
  ko: {
    locale: 'ko',
    localeCode: 'ko_KR',
    nativeName: '한국어',
    shortName: '한국어',
  },
  pt: {
    locale: 'pt',
    localeCode: 'pt_BR',
    nativeName: 'Português',
    shortName: 'Português',
  },
  ru: {
    locale: 'ru',
    localeCode: 'ru_RU',
    nativeName: 'русский',
    shortName: 'русский',
  },
  vi: {
    locale: 'vi',
    localeCode: 'vi_VN',
    nativeName: 'tiếng việt',
    shortName: 'tiếng việt',
  },
  zh: {
    locale: 'zh',
    localeCode: 'zh_CN',
    nativeName: '中文',
    shortName: '中文',
  },
  /*
      de: {
        locale: 'de',
        nativeName: 'Deutsch',
      },
      id: {
        locale: 'id',
        nativeName: 'Bahasa Indonesia',
      },
      th: {
        locale: 'th',
        nativeName: ' ไทย',
      },
  */
} as const
export type Languages = keyof typeof languages
export const completedLocales: Languages[] = ['en', 'fr', 'ja', 'pt', 'zh'] as const

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
    load: 'languageOnly',
    fallbackLng: 'en',
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
