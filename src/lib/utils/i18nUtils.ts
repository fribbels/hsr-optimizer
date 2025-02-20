import i18next from 'i18next'

// to use in place of toFixed()
export function numberToLocaleString(number: number, decimals: number = 0) {
  return number.toLocaleString(currentLocale(), { maximumFractionDigits: decimals, minimumFractionDigits: decimals })
}

// can be used for toLocaleString() when a variable number of decimals is desired
export function currentLocale() {
  return i18next.resolvedLanguage!.replace('_', '-')
}
