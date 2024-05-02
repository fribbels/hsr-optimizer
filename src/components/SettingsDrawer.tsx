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
              Equipping relics from another owner
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

//
// function ConditionalSetOption(props) {
//   const content = (
//     <Flex vertical gap={10}>
//       <Flex vertical>
//         <HeaderText>
//           <p>Set description</p>
//         </HeaderText>
//         <p>{props.description}</p>
//       </Flex>
//
//       <Flex vertical>
//         <HeaderText>
//           <p>Enabled effect</p>
//         </HeaderText>
//         <p>{props.conditional}</p>
//       </Flex>
//     </Flex>
//   )
//
//   if (Constants.SetsRelicsNames.includes(props.set)) {
//     // Relics
//     let inputType = (<Switch disabled={props.p4Checked} />)
//     if (props.selectOptions) {
//       inputType = (
//         <Select
//           optionLabelProp="display"
//           listHeight={500}
//           size="small"
//           style={{ width: setConditionalsWidth }}
//           dropdownStyle={{ width: 'fit-content' }}
//           options={props.selectOptions}
//         />
//       )
//     }
//
//     return (
//       <Popover
//         content={content}
//         title={props.set}
//         mouseEnterDelay={0.5}
//         overlayStyle={{
//           width: 600,
//         }}
//       >
//         <Flex gap={defaultGap} align="center" justify="flex-start">
//           <Flex style={{ width: setConditionalsIconWidth }}>
//             <img src={Assets.getSetImage(props.set, Constants.Parts.PlanarSphere)} style={{ width: 36, height: 36 }}></img>
//           </Flex>
//           <Text style={{ width: setConditionalsNameWidth, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{props.set}</Text>
//           <Flex style={{ width: setConditionalsWidth }} justify="flex-end">
//             <Form.Item name={['setConditionals', props.set, 1]} valuePropName={props.selectOptions ? 'value' : 'checked'}>
//               {inputType}
//             </Form.Item>
//           </Flex>
//         </Flex>
//       </Popover>
//     )
//   } else {
//     // Ornaments
//     let inputType = (<Switch disabled={props.p2Checked} />)
//     if (props.selectOptions) {
//       inputType = (
//         <Select
//           optionLabelProp="display"
//           listHeight={500}
//           size="small"
//           style={{ width: setConditionalsWidth }}
//           dropdownStyle={{ width: 'fit-content' }}
//           options={props.selectOptions}
//         />
//       )
//     }
//     return (
//       <Popover
//         content={content}
//         title={props.set}
//         mouseEnterDelay={0.5}
//         overlayStyle={{
//           width: 600,
//         }}
//       >
//         <Flex gap={defaultGap} align="center" justify="flex-start">
//           <Flex style={{ width: setConditionalsIconWidth }}>
//             <img src={Assets.getSetImage(props.set, Constants.Parts.PlanarSphere)} style={{ width: 36, height: 36 }}></img>
//           </Flex>
//           <Text style={{ width: setConditionalsNameWidth, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{props.set}</Text>
//           <Flex style={{ width: setConditionalsWidth }} justify="flex-end">
//             <Form.Item name={['setConditionals', props.set, 1]} valuePropName={props.selectOptions ? 'value' : 'checked'}>
//               {inputType}
//             </Form.Item>
//           </Flex>
//         </Flex>
//       </Popover>
//     )
//   }