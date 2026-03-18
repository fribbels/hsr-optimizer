import { type GetLocaleTextParams, type PaginationNumberFormatterParams } from 'ag-grid-community'
import { localeNumber } from 'lib/utils/i18nUtils'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export function useGridLocale(translationNs: string, keyPrefix?: string) {
  const { t, i18n } = useTranslation(translationNs as any, keyPrefix ? { keyPrefix: keyPrefix as any } : undefined)

  const tStr = t as unknown as (key: string) => string
  const getLocaleText = useCallback((param: GetLocaleTextParams) => {
    const localeLookup: Partial<Record<string, string>> = {
      to: tStr('To'),
      of: tStr('Of'),
      page: tStr('Page'),
      pageSizeSelectorLabel: tStr('PageSelectorLabel'),
      loadingOoo: '...',
      noRowsToShow: '',
    }
    return localeLookup[param.key] ?? param.defaultValue
  }, [t])

  const paginationNumberFormatter = useCallback((param: PaginationNumberFormatterParams) => {
    return localeNumber(param.value)
  }, [i18n.resolvedLanguage])

  return { getLocaleText, paginationNumberFormatter, i18n }
}

export function useGridLocaleRebuild() {
  const { i18n } = useTranslation()
  const [gridDestroyed, setGridDestroyed] = useState(false)
  const gridLanguage = useRef(i18n.resolvedLanguage)

  useEffect(() => {
    let rebuildTimeout: ReturnType<typeof setTimeout>
    if (i18n.resolvedLanguage !== gridLanguage.current) {
      setGridDestroyed(true)
      gridLanguage.current = i18n.resolvedLanguage
      rebuildTimeout = setTimeout(() => setGridDestroyed(false), 100)
    }
    return () => clearTimeout(rebuildTimeout)
  }, [i18n.resolvedLanguage])

  return { gridDestroyed }
}
