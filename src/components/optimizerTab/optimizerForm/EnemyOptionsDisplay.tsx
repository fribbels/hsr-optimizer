import { Flex, Form, Select, Switch, Typography } from 'antd'
import { HeaderText } from 'components/HeaderText.jsx'
import { TooltipImage } from 'components/TooltipImage.jsx'
import { Hint } from 'lib/hint.jsx'
import { Utils } from 'lib/utils.js'
import { enemyCountOptions, enemyLevelOptions, enemyMaxToughnessOptions, enemyResistanceOptions } from 'lib/constants.ts'
import { optimizerTabDefaultGap, panelWidth } from 'components/optimizerTab/optimizerTabConstants.ts'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'

const { Text } = Typography

type EnemyOptionsDisplayProps = {
}
export default function EnemyOptionsDisplay(_props: EnemyOptionsDisplayProps) {
  return (
    <Flex vertical gap={5} style={{ marginBottom: 5 }}>
      <Flex justify="space-between" align="center">
        <HeaderText style={{}}>Enemy options</HeaderText>
        <TooltipImage type={Hint.enemyOptions()} />
      </Flex>

      <Flex gap={optimizerTabDefaultGap} justify="space-between">
        <Form.Item name="enemyLevel">
          <Select
            showSearch
            filterOption={Utils.labelFilterOption}
            style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
            options={enemyLevelOptions}
            optionLabelProp="number"
            popupMatchSelectWidth={160}
            suffixIcon={null}
          />
        </Form.Item>
        <Form.Item name="enemyCount">
          <Select
            showSearch
            filterOption={Utils.labelFilterOption}
            style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
            options={enemyCountOptions}
            suffixIcon={null}
          />
        </Form.Item>
      </Flex>

      <Flex gap={optimizerTabDefaultGap} justify="space-between">
        <Form.Item name="enemyResistance">
          <Select
            showSearch
            filterOption={Utils.labelFilterOption}
            style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
            options={enemyResistanceOptions}
            suffixIcon={null}
          />
        </Form.Item>
        <Form.Item name="enemyMaxToughness">
          <Select
            showSearch
            filterOption={Utils.labelFilterOption}
            style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
            options={enemyMaxToughnessOptions}
            optionLabelProp="number"
            popupMatchSelectWidth={160}
            suffixIcon={null}
          />
        </Form.Item>
      </Flex>

      <Flex align="center">
        <Form.Item name="enemyElementalWeak" valuePropName="checked">
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            defaultChecked
            style={{ width: 45, marginRight: 10 }}
          />
        </Form.Item>
        <Text>Elemental weakness</Text>
      </Flex>

      <Flex align="center">
        <Form.Item name="enemyWeaknessBroken" valuePropName="checked">
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            style={{ width: 45, marginRight: 10 }}
          />
        </Form.Item>
        <Text>Weakness broken</Text>
      </Flex>
    </Flex>
  )
}
