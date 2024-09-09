import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import { BASE_PATH } from './db'

export const supportedLanguages = ['zh', 'de', 'en', 'es', 'fr', 'id', 'jp', 'kr', 'pt', 'ru']
void i18next
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    ns: ['changelogTab', 'charactersTab', 'common', 'gameData', 'getStartedTab', 'importSaveTab', 'relicScorerTab', 'relicsTab', 'sidebar', 'modals', 'hint'],
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
      loadPath: BASE_PATH + '/locales/{{lng}}/{{ns}}.json',
    },
  })

i18next.services.formatter?.add('capitalize', (value: string | undefined, lng, options: { interpolationkey?: string; length: number }) => {
  const string = value ?? options.interpolationkey ?? ''
  let length = options.length
  if (length < 0) {
    length = string.length
  }
  let out: string = ''
  for (let i = 0; i < length; i++) {
    out = out + string.charAt(i).toUpperCase()
  }
  console.log(value, options, 'testing')
  return out + string.slice(length)
})

export default i18next
