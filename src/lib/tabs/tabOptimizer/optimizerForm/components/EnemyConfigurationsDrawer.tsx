import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { Drawer, Flex, Form, Select, Switch, Typography } from 'antd'
import { Hint } from 'lib/interactions/hint'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { Utils } from 'lib/utils/utils'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

export const EnemyConfigurationsDrawer = () => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'EnemyConfiguration' })
  const enemyConfigurationsDrawerOpen = window.store((s) => s.enemyConfigurationsDrawerOpen)
  const setEnemyConfigurationsDrawerOpen = window.store((s) => s.setEnemyConfigurationsDrawerOpen)

  const enemyLevelOptions = useMemo(() => {
    const options: { value: number; label: string }[] = []
    for (let i = 95; i >= 1; i--) {
      options.push({
        value: i,
        label: t('LevelOptionLabel', { level: i, defense: 200 + 10 * i }), // `Lv. ${i} - ${200 + 10 * i} DEF`,
      })
    }

    return options
  }, [t])

  const enemyCountOptions = useMemo(() => {
    const options: { value: number; label: string }[] = []
    for (let i = 1; i <= 5; i += 2) {
      options.push({
        value: i,
        label: t('CountOptionLabel', { targetCount: i }), // `${i} target${i > 1 ? 's' : ''}`,
      })
    }

    return options
  }, [t])

  const enemyResistanceOptions = useMemo(() => {
    const options: { value: number; label: string }[] = []
    for (let i = 20; i <= 60; i += 20) {
      options.push({
        value: i / 100,
        label: t('DmgResOptionLabel', { resistance: i }), // `${i}% Damage RES`,
      })
    }

    return options
  }, [t])

  const enemyEffectResistanceOptions = useMemo(() => {
    const options: { value: number; label: string }[] = []
    for (let i = 0; i <= 40; i += 10) {
      options.push({
        value: i / 100,
        label: t('EffResOptionLabel', { resistance: i }), // `${i}% Effect RES`,
      })
    }

    return options
  }, [t])

  const enemyMaxToughnessOptions = useMemo(() => {
    const options: { value: number; label: string }[] = []
    for (let i = 720; i >= 1; i -= 30) {
      options.push({
        value: i,
        label: t('ToughnessOptionLabel', { toughness: i }), // `${i} max toughness`,
      })
    }

    return options
  }, [t])

  return (
    <Drawer
      title={t('Title')}// 'Enemy configurations'
      placement='right'
      onClose={() => setEnemyConfigurationsDrawerOpen(false)}
      open={enemyConfigurationsDrawerOpen}
      width={300}
      forceRender
    >
      <Flex vertical gap={5}>
        <Flex justify='space-between' align='center' style={{ marginBottom: 5 }}>
          <HeaderText>{t('StatHeader')/* Enemy stat options */}</HeaderText>
          <TooltipImage type={Hint.enemyOptions()}/>
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
          />
        </Form.Item>

        <Form.Item name={enemyFormItemName('enemyCount')}>
          <Select
            showSearch
            filterOption={Utils.labelFilterOption}
            options={enemyCountOptions}
          />
        </Form.Item>

        <Flex align='center'>
          <Form.Item name={enemyFormItemName('enemyElementalWeak')} valuePropName='checked'>
            <Switch
              checkedChildren={<CheckOutlined/>}
              unCheckedChildren={<CloseOutlined/>}
              defaultChecked
              style={{ width: 45, marginRight: 5 }}
            />
          </Form.Item>
          <Text>{t('WeaknessLabel')/* Elemental weakness */}</Text>
        </Flex>

        <Flex align='center'>
          <Form.Item name={enemyFormItemName('enemyWeaknessBroken')} valuePropName='checked'>
            <Switch
              checkedChildren={<CheckOutlined/>}
              unCheckedChildren={<CloseOutlined/>}
              style={{ width: 45, marginRight: 5 }}
            />
          </Form.Item>
          <Text>{t('BrokenLabel')/* Weakness broken */}</Text>
        </Flex>
      </Flex>
    </Drawer>
  )
}

function enemyFormItemName(name: string) {
  return name
}
