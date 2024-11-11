import { Button, Flex, Select } from 'antd'
import { languages } from 'lib/i18n/i18n'
import { Assets } from 'lib/rendering/assets'
import React from 'react'
import { useTranslation } from 'react-i18next'

type Languages = keyof typeof languages

const completedLocales: Languages[] = ['en', 'zh', 'pt'] as const

export function LanguageSelector() {
  const { i18n } = useTranslation()
  const selectOptions = Object.values(languages)
    .map(({ locale, nativeName, shortName }) => ({
      value: locale,
      display: (
        <Flex align='center' gap={10}>
          <img style={{ width: 22 }} src={Assets.getGlobe()}/>
          {shortName}
        </Flex>
      ),
      label: (
        <Flex gap={8}>
          {nativeName}
          {completedLocales.includes(locale) ? '' : ' (WIP)'}
        </Flex>
      ),
    }))

  return (
    <Select
      options={selectOptions}
      optionRender={(option) => option.data.label}
      onChange={(e: string) => {
        void i18n.changeLanguage(e)
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
