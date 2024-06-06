import { Drawer, Flex, Form, Select, Typography } from 'antd'
import React, { useEffect } from 'react'
import { SaveState } from 'lib/saveState'
import { Utils } from 'lib/utils'
import styled from 'styled-components'

const { Text } = Typography

const defaultGap = 5

const SelectOptionWordWrap = styled.span`
  white-space: wrap !important;
  word-break: break-word !important;`

export const SettingOptions = {
  RelicEquippingBehavior: {
    name: 'RelicEquippingBehavior',
    Swap: 'Swap',
    Replace: 'Replace',
  },
  PermutationsSidebarBehavior: {
    name: 'PermutationsSidebarBehavior',
    NoShow: 'Do Not Show',
    ShowXL: 'Show XL',
    ShowXXL: 'Show XXL',
  },
}

export const DefaultSettingOptions = {
  [SettingOptions.RelicEquippingBehavior.name]: SettingOptions.RelicEquippingBehavior.Replace,
  [SettingOptions.PermutationsSidebarBehavior.name]: SettingOptions.PermutationsSidebarBehavior.ShowXL,
}

export const SettingsDrawer = () => {
  const [settingsForm] = Form.useForm()

  const settingsDrawerOpen = window.store((s) => s.settingsDrawerOpen)
  const setSettingsDrawerOpen = window.store((s) => s.setSettingsDrawerOpen)

  const settings = window.store((s) => s.settings)
  const setSettings = window.store((s) => s.setSettings)

  const optionsRelicEquippingBehavior = [
    {
      value: SettingOptions.RelicEquippingBehavior.Swap,
      label: <span>Swap relics with previous owner</span>,
    },
    {
      value: SettingOptions.RelicEquippingBehavior.Replace,
      label: <span>Replace relics without swapping</span>,
    },
  ]

  const optionsPermutationsSidebarBehavior = [
    {
      value: SettingOptions.PermutationsSidebarBehavior.NoShow,
      label: <span>No, always keep the sidebar on the right</span>,
    },
    {
      value: SettingOptions.PermutationsSidebarBehavior.ShowXL,
      label: <span>Show on bottom only at the smallest possible screen size</span>,
    },
    {
      value: SettingOptions.PermutationsSidebarBehavior.ShowXXL,
      label: <span>Show on bottom for best-looking layout</span>,
    },
  ]

  useEffect(() => {
    const initialSettings = Utils.clone(DefaultSettingOptions)
    const newSettings = Utils.mergeDefinedValues(initialSettings, settings)
    setSettings(newSettings)

    settingsForm.setFieldsValue(newSettings)
  }, [])

  const onValuesChange = (_changedValues, allValues) => {
    setSettings(allValues)
    SaveState.save()
  }

  return (
    <Form
      form={settingsForm}
      onValuesChange={onValuesChange}
    >
      <Drawer
        title="Settings"
        placement="right"
        onClose={() => setSettingsDrawerOpen(false)}
        open={settingsDrawerOpen}
        width={650}
        forceRender
      >
        <Flex vertical gap={defaultGap}>
          <Flex justify="space-between" align="center">
            <Text>
              Equipping relics from another character
            </Text>
            <Form.Item name={SettingOptions.RelicEquippingBehavior.name}>
              <Select style={{ width: 300 }} options={optionsRelicEquippingBehavior} />
            </Form.Item>
          </Flex>
          <Flex justify="space-between" align="center">
            <Text>Move Optimizer sidebar to the bottom on smaller screens</Text>
            <Form.Item name={SettingOptions.PermutationsSidebarBehavior.name}>
              <Select
                style={{ width: 300 }}
                options={optionsPermutationsSidebarBehavior}
                optionRender={(option) => <SelectOptionWordWrap>{option.label}</SelectOptionWordWrap>}
              />
            </Form.Item>
          </Flex>
        </Flex>
      </Drawer>
    </Form>
  )
}
