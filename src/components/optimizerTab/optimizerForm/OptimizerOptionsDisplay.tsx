/* eslint-disable react/prop-types */
import { Flex, Form, Select, Switch, Typography } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'

import { Hint } from 'lib/hint.jsx'
import { HeaderText } from 'components/HeaderText.jsx'
import { TooltipImage } from 'components/TooltipImage.jsx'
import { useMemo } from 'react'
import DB from 'lib/db.js'
import { optimizerTabDefaultGap, panelWidth } from 'components/optimizerTab/optimizerTabConstants'
import { Utils } from 'lib/utils.js'
import { Assets } from 'lib/assets'
import { generateCharacterList } from 'lib/displayUtils'
import { CharacterId, MetadataCharacter } from '../../../types/Character'

const { Text } = Typography

const OptimizerOptionsDisplay = (): JSX.Element => {
  const characters = window.store((s) => s.characters)
  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)

  const characterExcludeOptions = useMemo(() => generateCharacterList({
    currentCharacters: characters,
    excludeCharacters: [DB.getCharacterById(optimizerTabFocusCharacter)],
    withNobodyOption: false,
  }), [characters, optimizerTabFocusCharacter])

  const characterPriorityOptions = useMemo(() => {
    const characterMetadata = DB.getMetadata().characters as Record<CharacterId, MetadataCharacter>
    return characters.map((x) => {
      return {
        value: x.rank,
        label: (
          <Flex gap={5}>
            <img
              src={Assets.getCharacterAvatarById(x.id)}
              style={{ height: 22, marginRight: 6 }}
            />

            {`#${x.rank + 1} - ${characterMetadata[x.id].displayName}`}
          </Flex>
        ),
        name: `# ${x.rank + 1}`,
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
          <Form.Item name="includeEquippedRelics" valuePropName="checked">
            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              defaultChecked
              style={{ width: 45, marginRight: 5 }}
            />
          </Form.Item>
          <Text>Allow equipped relics</Text>
        </Flex>

        <Flex align="center">
          <Form.Item name="rankFilter" valuePropName="checked">
            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              defaultChecked
              style={{ width: 45, marginRight: 5 }}
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
              style={{ width: 45, marginRight: 5 }}
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
                popupMatchSelectWidth={225}
                listHeight={500}
                optionLabelProp="name"
                placeholder="Priority"
                showSearch
                filterOption={Utils.nameFilterOption}
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
                popupMatchSelectWidth={225}
                listHeight={500}
                allowClear
                showSearch
                optionLabelProp="title"
                placeholder="Exclude"
                options={characterExcludeOptions}
                filterOption={Utils.titleFilterOption}
              />
            </Form.Item>
          </Flex>
        </Flex>

        <Flex justify="space-between">
          <Flex vertical gap={2}>
            <HeaderText>
              Min enhance
            </HeaderText>
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
          </Flex>

          <Flex vertical gap={2}>
            <HeaderText>
              Min rarity
            </HeaderText>
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
        </Flex>

        <Flex justify="space-between" align="center">
          <Flex vertical gap={2}>
            <HeaderText>
              Boost main stat
            </HeaderText>
            <Form.Item name="mainStatUpscaleLevel">
              <Select
                style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
                options={[
                  { value: 3, label: '+3' },
                  { value: 6, label: '+6' },
                  { value: 9, label: '+9' },
                  { value: 12, label: '+12' },
                  { value: 15, label: '+15' },
                ]}
              />
            </Form.Item>
          </Flex>
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
