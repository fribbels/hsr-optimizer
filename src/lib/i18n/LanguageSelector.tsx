import { Button, Flex, Select } from 'antd'
import { languages } from 'lib/i18n/i18n'
import { Assets } from 'lib/rendering/assets'
import React from 'react'
import { useTranslation } from 'react-i18next'

// FIXME LOW

type placementOptions = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'

type Languages = keyof typeof languages

const completedLocales: Languages[] = ['en', 'zh', 'pt'] as const

export function LanguageSelector(props: { style: React.CSSProperties; dropdownStyle: React.CSSProperties; flagOnly: boolean; placement: placementOptions }) {
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
          {/* <img style={{ height: 15, marginTop: 4 }} src={Assets.getFlag(locale)} /> */}
          {nativeName}
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access */}
          {completedLocales.includes(locale) ? '' : ' (WIP)'}
        </Flex>
      ),
    }))

  return (
    <Select
      options={selectOptions}
      optionRender={(option) => option.data.label}
      onChange={(e: string) => {
        i18n.changeLanguage(e)
      }}
      optionLabelProp='display'
      style={props.style}
      dropdownStyle={props.dropdownStyle}
      defaultValue={i18n.resolvedLanguage}
      placement={props.placement}
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
