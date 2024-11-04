import { Button, Flex, Select } from 'antd'
import { useTranslation } from 'react-i18next'
import { languages } from 'lib/i18n'
import React, { ReactElement } from 'react'
import { Assets } from 'lib/assets'

type placementOptions = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'

type Languages = keyof typeof languages

const completedLocales: Languages[] = ['en', 'zh', 'pt'] as const

export function LanguageSelector(props: { style: React.CSSProperties; dropdownStyle: React.CSSProperties; flagOnly: boolean; placement: placementOptions }) {
  const { i18n } = useTranslation()
  const selectOptions = ((locales: { [key in Languages]: { locale: string; nativeName: string } }) => {
    const ret: { value: string; label: ReactElement }[] = []
    for (const key in locales) {
      ret.push({
        value: locales[key as Languages].locale,
        label: (
          <Flex gap={8}>
            <img style={{ height: 15, marginTop: 4 }} src={Assets.getFlag(locales[key as Languages].locale)}/>
            {locales[key as Languages].nativeName}
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access */}
            {completedLocales.includes(locales[key].locale) ? '' : ' (WIP)'}
          </Flex>
        ),
      })
    }
    return ret
  })(languages)
  return (
    <Select
      options={selectOptions}
      optionRender={(option) => option.data.label}
      labelRender={({ label, value }) => {
        if (!props.flagOnly) {
          return (
            <Flex gap={8}>
              <img style={{ height: 15, marginTop: 8 }} src={Assets.getFlag(value as Languages)}/>{languages[value as Languages].nativeName}
            </Flex>
          )
        }
        return <img style={{ height: 15, marginTop: 8 }} src={Assets.getFlag(value as Languages)}/>
      }}
      onChange={(e: string) => {
        i18n.changeLanguage(e)
      }}
      style={props.style}
      dropdownStyle={props.dropdownStyle}
      defaultValue={i18n.resolvedLanguage}
      placement={props.placement}
      dropdownRender={(menu) => (
        <Flex gap={4} vertical>
          {menu}
          <Button
            type='primary'
            style={{ borderRadius: 5, height: 40 }}
            onClick={() => window.open('https://discord.gg/rDmB4Un7qg')}
          >
            Help translate the website!
          </Button>
        </Flex>
      )}
    />
  )
}
