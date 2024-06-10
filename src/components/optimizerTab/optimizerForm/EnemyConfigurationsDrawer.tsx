import { Drawer, Flex, Form, Select, Switch, Typography } from 'antd'
import { HeaderText } from 'components/HeaderText'
import { TooltipImage } from 'components/TooltipImage'
import { Hint } from 'lib/hint'
import { Utils } from 'lib/utils'
import { enemyCountOptions, enemyEffectResistanceOptions, enemyLevelOptions, enemyMaxToughnessOptions, enemyResistanceOptions } from 'lib/constants'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'

const { Text } = Typography

export const EnemyConfigurationsDrawer = () => {
  const enemyConfigurationsDrawerOpen = window.store((s) => s.enemyConfigurationsDrawerOpen)
  const setEnemyConfigurationsDrawerOpen = window.store((s) => s.setEnemyConfigurationsDrawerOpen)

  return (
    <Drawer
      title="Enemy configurations"
      placement="right"
      onClose={() => setEnemyConfigurationsDrawerOpen(false)}
      open={enemyConfigurationsDrawerOpen}
      width={300}
      forceRender
    >
      <Flex vertical gap={5}>
        <Flex justify="space-between" align="center" style={{ marginBottom: 5 }}>
          <HeaderText>Enemy stat options</HeaderText>
          <TooltipImage type={Hint.enemyOptions()} />
        </Flex>

        <Form.Item name={enemyFormItemName('enemyLevel')}>
          <Select
            showSearch
            filterOption={Utils.labelFilterOption}
            options={enemyLevelOptions}
          />
        </Form.Item>

        <Form.Item name={enemyFormItemName('enemyResistance')}>
          <Select
            showSearch
            filterOption={Utils.labelFilterOption}
            options={enemyResistanceOptions}
          />
        </Form.Item>

        <Form.Item name={enemyFormItemName('enemyEffectResistance')}>
          <Select
            showSearch
            filterOption={Utils.labelFilterOption}
            options={enemyEffectResistanceOptions}
          />
        </Form.Item>

        <Form.Item name={enemyFormItemName('enemyMaxToughness')}>
          <Select
            showSearch
            filterOption={Utils.labelFilterOption}
            options={enemyMaxToughnessOptions}
            optionLabelProp="number"
          />
        </Form.Item>

        <Form.Item name={enemyFormItemName('enemyCount')}>
          <Select
            showSearch
            filterOption={Utils.labelFilterOption}
            options={enemyCountOptions}
          />
        </Form.Item>

        <Flex align="center">
          <Form.Item name={enemyFormItemName('enemyElementalWeak')} valuePropName="checked">
            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              defaultChecked
              style={{ width: 45, marginRight: 5 }}
            />
          </Form.Item>
          <Text>Elemental weakness</Text>
        </Flex>

        <Flex align="center">
          <Form.Item name={enemyFormItemName('enemyWeaknessBroken')} valuePropName="checked">
            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              style={{ width: 45, marginRight: 5 }}
            />
          </Form.Item>
          <Text>Weakness broken</Text>
        </Flex>
      </Flex>
    </Drawer>
  )
}

function enemyFormItemName(name: string) {
  return name
}
