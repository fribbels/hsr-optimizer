import { Drawer, Flex, Form, Select, Typography } from 'antd'
import React, { useEffect } from 'react'
import { SaveState } from "lib/saveState";
import { Utils } from "lib/utils";

const { Text } = Typography

const defaultGap = 5

export const SettingOptions = {
  RelicEquippingBehavior: {
    name: 'RelicEquippingBehavior',
    Swap: 'Swap',
    Replace: 'Replace',
  },
}

export const DefaultSettingOptions = {
  [SettingOptions.RelicEquippingBehavior.name]: SettingOptions.RelicEquippingBehavior.Replace
}

export const SettingsDrawer = () => {
  const [settingsForm] = Form.useForm()

  const settingsDrawerOpen = window.store((s) => s.settingsDrawerOpen)
  const setSettingsDrawerOpen = window.store((s) => s.setSettingsDrawerOpen)

  const settings = window.store((s) => s.settings)
  const setSettings = window.store((s) => s.setSettings)

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
          <Flex justify="space-between" align='center'>
            <Text>
              Equipping relics from another character
            </Text>
            <Form.Item name={SettingOptions.RelicEquippingBehavior.name}>
              <Select style={{width: 300}}>
                <Select.Option value={SettingOptions.RelicEquippingBehavior.Swap}>Swap relics with previous owner</Select.Option>
                <Select.Option value={SettingOptions.RelicEquippingBehavior.Replace}>Replace relics without swapping</Select.Option>
              </Select>
            </Form.Item>
          </Flex>
        </Flex>
      </Drawer>
    </Form>
  )
}
