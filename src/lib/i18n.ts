import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import Backend from 'i18next-http-backend'
import { BASE_PATH } from 'lib/db'
import yaml from 'js-yaml'
import LanguageDetector from 'i18next-browser-languagedetector'

window.yaml = yaml

export const languages = {
  en: {
    locale: 'en',
    nativeName: 'English',
  },
  es: {
    locale: 'es',
    nativeName: 'Español',
  },
  it: {
    locale: 'it',
    nativeName: 'Italiano',
  },
  pt: {
    locale: 'pt',
    nativeName: 'Português (Brasil)',
  },
  zh: {
    locale: 'zh',
    nativeName: '中文',
  },
  /*
  de: {
    locale: 'de',
    nativeName: 'Deutsch',
  },
  fr: {
    locale: 'fr',
    nativeName: 'Français',
  },
  id: {
    locale: 'id',
    nativeName: 'Bahasa Indonesia',
  },
  ja: {
    locale: 'ja',
    nativeName: '日本語',
  },
  ko: {
    locale: 'ko',
    nativeName: '한국인',
  },
  ru: {
    locale: 'ru',
    nativeName: 'русский',
  },
  th: {
    locale: 'th',
    nativeName: ' ไทย',
  },
  vi: {
    locale: 'vi',
    nativeName: 'tiếng việt',
  }, */
} as const

export const supportedLanguages = Object.keys(languages)
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
    ],
    defaultNS: 'common',
    fallbackNS: ['common', 'gameData'],
    // @ts-ignore temporary to make sure the language detector doesn't load non-en translations
    lng: BASE_PATH != '/dreary-quibbles' ? 'en' : undefined, // remove once language selector enabled on main site
    debug: true,
    supportedLngs: supportedLanguages,
    load: 'languageOnly',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    backend: {
      loadPath: BASE_PATH + '/locales/{{lng}}/{{ns}}.yaml',
      parse: function (data) {
        return yaml.load(data)
      },
    },
  })
export default i18next
