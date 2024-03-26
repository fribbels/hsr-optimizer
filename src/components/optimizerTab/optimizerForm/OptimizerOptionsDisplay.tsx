/* eslint-disable react/prop-types */
import { Flex, Form, Select, Switch, Typography } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'

import { Hint } from 'lib/hint.jsx'
import { HeaderText } from 'components/HeaderText.jsx'
import { TooltipImage } from 'components/TooltipImage.jsx'
import { useMemo } from 'react'
import DB from 'lib/db.js'
import { optimizerTabDefaultGap, panelWidth } from 'components/optimizerTab/optimizerTabConstants.ts'
import { Utils } from 'lib/utils.js'

const { Text } = Typography

const OptimizerOptionsDisplay = (): JSX.Element => {
  const characters = window.store((s) => s.characters)
  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)

  const characterExcludeOptions = useMemo(() => Utils.generateCurrentCharacterOptions(
    characters, [DB.getCharacterById(optimizerTabFocusCharacter)], false,
  ), [characters, optimizerTabFocusCharacter])

  const characterPriorityOptions = useMemo(() => {
    const characterMetadata = DB.getMetadata().characters
    return characters.map((x) => {
      return {
        value: x.rank,
        label: `# ${x.rank + 1} - ${characterMetadata[x.id].displayName}`,
        number: `# ${x.rank + 1}`,
      }
    })
  }, [characters])

  return (
    <Flex vertical>
      <Flex vertical gap={optimizerTabDefaultGap}>
        <Flex justify="space-between" align="center">
          <HeaderText>Optimizer options</HeaderText>
          <TooltipImage type={Hint.optimizerOptions()} />
        </Flex>

        <Flex align="center">
          <Form.Item name="predictMaxedMainStat" valuePropName="checked">
            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              defaultChecked
              style={{ width: 45, marginRight: 10 }}
            />
          </Form.Item>
          <Text>Maxed main stat</Text>
        </Flex>

        <Flex align="center">
          <Form.Item name="includeEquippedRelics" valuePropName="checked">
            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              defaultChecked
              style={{ width: 45, marginRight: 10 }}
            />
          </Form.Item>
          <Text>Include equipped relics</Text>
        </Flex>

        <Flex align="center">
          <Form.Item name="rankFilter" valuePropName="checked">
            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              defaultChecked
              style={{ width: 45, marginRight: 10 }}
            />
          </Form.Item>
          <Text>Character priority filter</Text>
        </Flex>

        <Flex align="center">
          <Form.Item name="keepCurrentRelics" valuePropName="checked">
            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              defaultChecked
              style={{ width: 45, marginRight: 10 }}
            />
          </Form.Item>
          <Text>Keep current relics</Text>
        </Flex>

        <Flex gap={optimizerTabDefaultGap} style={{ marginTop: 10 }}>
          <Flex vertical gap={2}>
            <HeaderText>
              Priority
            </HeaderText>
            <Form.Item name="rank">
              <Select
                style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
                options={characterPriorityOptions}
                popupMatchSelectWidth={160}
                listHeight={500}
                optionLabelProp="number"
                placeholder="Priority"
                showSearch
                filterOption={Utils.labelFilterOption}
              />
            </Form.Item>
          </Flex>
          <Flex vertical gap={2}>
            <HeaderText>
              Exclude
            </HeaderText>
            <Form.Item name="exclude">
              <Select
                style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
                mode="multiple"
                maxTagCount="responsive"
                popupMatchSelectWidth={160}
                listHeight={500}
                allowClear
                showSearch
                placeholder="Exclude"
                options={characterExcludeOptions}
                filterOption={Utils.labelFilterOption}
              />
            </Form.Item>
          </Flex>
        </Flex>

        <Flex justify="space-between" align="center" style={{ marginTop: 10 }}>
          <HeaderText>Relic enhance / rarity</HeaderText>
          {/* <TooltipImage type={Hint.optimizerOptions()} /> */}
        </Flex>

        <Flex justify="space-between">
          <Form.Item name="enhance">
            <Select
              style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
              options={[
                { value: 0, label: '+0' },
                { value: 3, label: '+3' },
                { value: 6, label: '+6' },
                { value: 9, label: '+9' },
                { value: 12, label: '+12' },
                { value: 15, label: '+15' },
              ]}
            />
          </Form.Item>

          <Form.Item name="grade">
            <Select
              style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
              options={[
                { value: 2, label: '2 ★ +' },
                { value: 3, label: '3 ★ +' },
                { value: 4, label: '4 ★ +' },
                { value: 5, label: '5 ★' },
              ]}
            />
          </Form.Item>
        </Flex>

        {/*
      <Button type="primary" onClick={showDrawer}>
        Advanced Options
      </Button>
      <Drawer
        placement="right"
        closable={false}
        onClose={onClose}
        open={open}
        getContainer={false}
        width={250}
      >
        <HeaderText>
          Damage Buffs
          Coming Soon
        </HeaderText>

        <Divider style={{marginTop: '8px', marginBottom: '12px'}}/>

      </Drawer>

      <Text>Actions</Text>
      <Button type="primary" onClick={saveCharacterClicked} style={{width: '100%'}}>
        Save Character
      </Button> */}
      </Flex>
    </Flex>

  )
}

export default OptimizerOptionsDisplay
