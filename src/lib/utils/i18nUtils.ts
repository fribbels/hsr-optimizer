// to use in place of toFixed()
export function numberToLocaleString(number: number, decimals: number = 0, useGrouping = false) {
  return number.toLocaleString(currentLocale(), { maximumFractionDigits: decimals, minimumFractionDigits: decimals, useGrouping })
}

// can be used for toLocaleString() when a variable number of decimals is desired
export function currentLocale() {
  return window.store.getState().currentLocale!
}
