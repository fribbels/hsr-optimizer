import { CheckIcon, Select } from '@mantine/core'
import type { CSSProperties } from 'react'
import {
  BASE_PATH,
  BasePath,
} from 'lib/constants/appPages'
import {
  completedLocales,
  isBeta,
} from 'lib/i18n/i18n'
import { Assets } from 'lib/rendering/assets'
import type { Languages } from 'lib/utils/i18nUtils'
import { languages } from 'lib/utils/i18nUtils'
import { useTranslation } from 'react-i18next'

const optionStyle: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }

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
      renderOption={({ option, checked }) => (
        <span title={option.value} style={optionStyle}>
          {option.label}
          {checked && <CheckIcon size={12} />}
        </span>
      )}
      onChange={(value) => {
        if (!value) return
        if (i18n.resolvedLanguage === 'aa_ER') window.jipt?.stop()
        i18n.changeLanguage(value)
          .then(() => {
            if (value === 'aa_ER') {
              window.jipt?.start()
              console.log('beginning inContext translation')
              return
            }
            console.log('setting language to:', i18n.resolvedLanguage)
          })
      }}
      size='xs'
      style={{ width: isBeta ? 200 : 150, marginRight: 10 }}
      styles={{ input: { height: 32, minHeight: 32, paddingLeft: 32, backgroundColor: 'var(--layer-1)', borderColor: 'rgba(255, 255, 255, 0.06)' } }}
      maxDropdownHeight={400}
      comboboxProps={{ keepMounted: false, width: 210 }}
      allowDeselect={false}
      defaultValue={i18n.resolvedLanguage}
      leftSection={<img style={{ width: 18 }} src={Assets.getGlobe()} />}
    />
  )
}
