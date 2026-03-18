import { Select } from '@mantine/core'
import {
  completedLocales,
  isBeta,
} from 'lib/i18n/i18n'
import { Assets } from 'lib/rendering/assets'
import {
  BASE_PATH,
  BasePath,
} from 'lib/constants/appPages'
import type { Languages } from 'lib/utils/i18nUtils'
import { languages } from 'lib/utils/i18nUtils'
import { useTranslation } from 'react-i18next'

export function LanguageSelector() {
  const { i18n } = useTranslation()

  const filteredLanguages = Object.values(languages as Record<Languages, { locale: Languages, nativeName: string, shortName: string }>)
    .filter((x) => {
      if (x.locale !== 'aa_ER') return isBeta || completedLocales.includes(x.locale)
      return BASE_PATH === BasePath.BETA
      // !!do not replace this check with isBeta!!
    })

  const selectData = filteredLanguages.map(({ locale, nativeName }) => ({
    value: locale,
    label: `${nativeName}${isBeta ? ` (${locale})` : ''}${completedLocales.includes(locale) ? '' : ' - (WIP)'}`,
  }))

  return (
    <Select
      data={selectData}
      renderOption={({ option }) => (
        <span title={option.value}>{option.label}</span>
      )}
      onChange={(value) => {
        if (!value) return
        if (i18n.resolvedLanguage === 'aa_ER') window.jipt?.stop()
        i18n.changeLanguage(value)
          .then(() => {
            if (value === 'aa_ER') {
              window.jipt?.start()
              return console.log('beginning inContext translation')
            }
            console.log('setting language to:', i18n.resolvedLanguage)
          })
      }}
      size="sm"
      style={{ width: 135, marginRight: 6 }}
      styles={{ input: { height: 36, minHeight: 36 } }}
      maxDropdownHeight={400}
      comboboxProps={{ keepMounted: false, width: 210 }}
      defaultValue={i18n.resolvedLanguage}
      leftSection={<img style={{ width: 22 }} src={Assets.getGlobe()} />}
    />
  )
}
