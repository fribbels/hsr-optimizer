import { Button, Flex, Select } from 'antd'
import { completedLocales, isBeta } from 'lib/i18n/i18n'
import { Assets } from 'lib/rendering/assets'
import { BASE_PATH, BasePath } from 'lib/state/db'
import { languages, Languages } from 'lib/utils/i18nUtils'
import { useTranslation } from 'react-i18next'

export function LanguageSelector() {
  const { i18n } = useTranslation()
  const selectOptions = Object.values(languages as Record<Languages, { locale: Languages; nativeName: string; shortName: string }>)
    .filter((x) => {
      if (x.locale !== 'aa_ER') return isBeta || completedLocales.includes(x.locale)
      return BASE_PATH === BasePath.BETA
      // !!do not replace this check with isBeta!!
    })
    .map(({ locale, nativeName, shortName }) => ({
      value: locale,
      display: (
        <Flex align='center' gap={10}>
          <img style={{ width: 22 }} src={Assets.getGlobe()}/>
          {shortName}
        </Flex>
      ),
      label: (
        <Flex gap={8} title={locale}>
          {nativeName}
          {isBeta ? ` (${locale})` : ''}
          {completedLocales.includes(locale) ? '' : ' - (WIP)'}
        </Flex>
      ),
    }))

  return (
    <Select
      options={selectOptions}
      optionRender={(option) => option.data.label}
      onChange={(e: string) => {
        i18n.changeLanguage(e)
          .then(() => {
            // !!do not replace this check with isBeta!!
            if (BASE_PATH === BasePath.BETA) {
              e === 'aa_ER' ? window.jipt.start() : window.jipt.stop()
            }
            console.log('setting language to:', i18n.resolvedLanguage)
          })
      }}
      style={{ width: 135, marginRight: 6, height: 36 }}
      placement='bottomLeft'
      optionLabelProp='display'
      dropdownStyle={{ width: 210 }}
      defaultValue={i18n.resolvedLanguage}
      dropdownRender={(menu) => (
        <Flex gap={4} vertical>
          {menu}
          <Button
            type='primary'
            style={{ borderRadius: 5, height: 32 }}
            onClick={() => window.open('https://discord.gg/rDmB4Un7qg')}
          >
            Help translate the website!
          </Button>
        </Flex>
      )}
    />
  )
}
