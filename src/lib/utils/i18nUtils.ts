import i18next from 'i18next'

export function numberToLocaleString(number: number, decimals: number = 0) {
  return number.toLocaleString(currentLocale(), { maximumFractionDigits: decimals, minimumFractionDigits: decimals })
}

export function currentLocale() {
  return i18next.resolvedLanguage!.replace('_', '-')
}
