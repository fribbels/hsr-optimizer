import i18next from 'i18next'

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
  tr_TR: {
    locale: 'tr_TR',
    nativeName: 'Türkçe',
    shortName: 'Türkçe',
  },
  vi_VN: {
    locale: 'vi_VN',
    nativeName: 'Tiếng Việt',
    shortName: 'Tiếng Việt',
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

const languageToLocale = (() => Object.values(languages)
  .reduce((acc, cur) => {
    acc[cur.locale] = cur.locale.replace('_', '-')
    return acc
  }, {} as Record<Languages, Intl.LocalesArgument>)
)()

// to use in place of toFixed() - Use the localeNumber helpers below, when possible
export function numberToLocaleString(number: number, decimals: number = 0, useGrouping = false) {
  return number.toLocaleString(currentLocale(), { maximumFractionDigits: decimals, minimumFractionDigits: decimals, useGrouping })
}

const GROUPED = { maximumFractionDigits: 0, minimumFractionDigits: 0, useGrouping: true }
const GROUPED_0 = { maximumFractionDigits: 1, minimumFractionDigits: 1, useGrouping: true }
const GROUPED_00 = { maximumFractionDigits: 2, minimumFractionDigits: 2, useGrouping: true }
const GROUPED_000 = { maximumFractionDigits: 3, minimumFractionDigits: 3, useGrouping: true }

const UNGROUPED = { maximumFractionDigits: 0, minimumFractionDigits: 0, useGrouping: false }
const UNGROUPED_0 = { maximumFractionDigits: 1, minimumFractionDigits: 1, useGrouping: false }
const UNGROUPED_00 = { maximumFractionDigits: 2, minimumFractionDigits: 2, useGrouping: false }
const UNGROUPED_000 = { maximumFractionDigits: 3, minimumFractionDigits: 3, useGrouping: false }

// Shorthand helpers

export const localeNumberComma = (n: number) => n.toLocaleString(currentLocale(), GROUPED)
export const localeNumberComma_0 = (n: number) => n.toLocaleString(currentLocale(), GROUPED_0)
export const localeNumberComma_00 = (n: number) => n.toLocaleString(currentLocale(), GROUPED_00)
export const localeNumberComma_000 = (n: number) => n.toLocaleString(currentLocale(), GROUPED_000)

export const localeNumber = (n: number) => n.toLocaleString(currentLocale(), UNGROUPED)
export const localeNumber_0 = (n: number) => n.toLocaleString(currentLocale(), UNGROUPED_0)
export const localeNumber_00 = (n: number) => n.toLocaleString(currentLocale(), UNGROUPED_00)
export const localeNumber_000 = (n: number) => n.toLocaleString(currentLocale(), UNGROUPED_000)

// can be used for toLocaleString() when a variable number of decimals is desired
export function currentLocale() {
  return languageToLocale[i18next.resolvedLanguage as Languages]
}
