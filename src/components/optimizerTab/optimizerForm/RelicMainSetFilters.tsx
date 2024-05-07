import { Button, Cascader, Flex, Form, Select } from 'antd'
import { HeaderText } from 'components/HeaderText.jsx'
import { TooltipImage } from 'components/TooltipImage.jsx'
import { Hint } from 'lib/hint.jsx'
import { optimizerTabDefaultGap, panelWidth } from 'components/optimizerTab/optimizerTabConstants.ts'
import { Constants, Parts } from 'lib/constants.ts'
import GenerateSetsOptions from 'components/optimizerTab/optimizerForm/SetsOptions.tsx'
import GenerateOrnamentsOptions from 'components/optimizerTab/optimizerForm/OrnamentsOptions.tsx'
import { SettingOutlined } from '@ant-design/icons'
import { Assets } from 'lib/assets.js'

import React from 'react'
import { RelicSetTagRenderer } from "components/optimizerTab/optimizerForm/RelicSetTagRenderer";
import { OrnamentSetTagRenderer } from "components/optimizerTab/optimizerForm/OrnamentSetTagRenderer";

const { SHOW_CHILD } = Cascader

type RelicMainSetFiltersProps = {
}
export default function RelicMainSetFilters(_props: RelicMainSetFiltersProps) {
  const setConditionalSetEffectsDrawerOpen = window.store((s) => s.setConditionalSetEffectsDrawerOpen)

  return (
    <Flex vertical gap={optimizerTabDefaultGap}>
      <Flex vertical gap={optimizerTabDefaultGap}>
        <Flex justify="space-between" align="center">
          <HeaderText>Main stats</HeaderText>
          <TooltipImage type={Hint.mainStats()} />
        </Flex>
        <Form.Item name="mainBody">
          <Select
            mode="multiple"
            allowClear
            style={{
              width: panelWidth,
            }}
            placeholder="Body"
            optionLabelProp="label"
            maxTagCount="responsive"
            suffixIcon={<img style={{ width: 16 }} src={Assets.getPart(Parts.Body)} />}
          >
            <Select.Option value={Constants.Stats.HP_P} label="HP%">HP%</Select.Option>
            <Select.Option value={Constants.Stats.ATK_P} label="ATK%">ATK%</Select.Option>
            <Select.Option value={Constants.Stats.DEF_P} label="DEF%">DEF%</Select.Option>
            <Select.Option value={Constants.Stats.CR} label="CR">CRIT Rate</Select.Option>
            <Select.Option value={Constants.Stats.CD} label="CD">CRIT DMG</Select.Option>
            <Select.Option value={Constants.Stats.EHR} label="EHR">Effect HIT Rate</Select.Option>
            <Select.Option value={Constants.Stats.OHB} label="HEAL">Outgoing Healing</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="mainFeet">
          <Select
            mode="multiple"
            allowClear
            style={{
              width: panelWidth,
            }}
            placeholder="Feet"
            optionLabelProp="label"
            maxTagCount="responsive"
            suffixIcon={<img style={{ width: 16 }} src={Assets.getPart(Parts.Feet)} />}
          >
            <Select.Option value={Constants.Stats.HP_P} label="HP%">HP%</Select.Option>
            <Select.Option value={Constants.Stats.ATK_P} label="ATK%">ATK%</Select.Option>
            <Select.Option value={Constants.Stats.DEF_P} label="DEF%">DEF%</Select.Option>
            <Select.Option value={Constants.Stats.SPD} label="SPD">Speed</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="mainPlanarSphere">
          <Select
            mode="multiple"
            allowClear
            style={{
              width: panelWidth,
            }}
            placeholder="Planar Sphere"
            optionLabelProp="label"
            listHeight={400}
            maxTagCount="responsive"
            suffixIcon={<img style={{ width: 16 }} src={Assets.getPart(Parts.PlanarSphere)} />}
          >
            <Select.Option value={Constants.Stats.HP_P} label="HP%">HP%</Select.Option>
            <Select.Option value={Constants.Stats.ATK_P} label="ATK%">ATK%</Select.Option>
            <Select.Option value={Constants.Stats.DEF_P} label="DEF%">DEF%</Select.Option>
            <Select.Option value={Constants.Stats.Physical_DMG} label="Physical">Physical DMG</Select.Option>
            <Select.Option value={Constants.Stats.Fire_DMG} label="Fire">Fire DMG</Select.Option>
            <Select.Option value={Constants.Stats.Ice_DMG} label="Ice">Ice DMG</Select.Option>
            <Select.Option value={Constants.Stats.Lightning_DMG} label="Lightning">Lightning DMG</Select.Option>
            <Select.Option value={Constants.Stats.Wind_DMG} label="Wind">Wind DMG</Select.Option>
            <Select.Option value={Constants.Stats.Quantum_DMG} label="Quantum">Quantum DMG</Select.Option>
            <Select.Option value={Constants.Stats.Imaginary_DMG} label="Imaginary">Imaginary DMG</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="mainLinkRope">
          <Select
            mode="multiple"
            allowClear
            style={{
              width: panelWidth,
            }}
            placeholder="Link Rope"
            optionLabelProp="label"
            maxTagCount="responsive"
            suffixIcon={<img style={{ width: 16 }} src={Assets.getPart(Parts.LinkRope)} />}
          >
            <Select.Option value={Constants.Stats.HP_P} label="HP%">HP%</Select.Option>
            <Select.Option value={Constants.Stats.ATK_P} label="ATK%">ATK%</Select.Option>
            <Select.Option value={Constants.Stats.DEF_P} label="DEF%">DEF%</Select.Option>
            <Select.Option value={Constants.Stats.BE} label="BE">Break Effect</Select.Option>
            <Select.Option value={Constants.Stats.ERR} label="Energy">Energy Regeneration Rate</Select.Option>
          </Select>
        </Form.Item>
      </Flex>

      <Flex vertical gap={optimizerTabDefaultGap}>
        <Flex justify="space-between" align="center" style={{marginTop: 12}}>
          <HeaderText>Sets</HeaderText>
          <TooltipImage type={Hint.sets()} />
        </Flex>
        <Form.Item name="relicSets">
          <Cascader
            placeholder="Relic set"
            options={GenerateSetsOptions()}
            showCheckedStrategy={SHOW_CHILD}
            tagRender={RelicSetTagRenderer}
            placement="bottomLeft"
            maxTagCount="responsive"
            multiple={true}
            expandTrigger="hover"
          />
        </Form.Item>

        <Form.Item name="ornamentSets">
          <Select
            dropdownStyle={{
              width: 250,
            }}
            listHeight={650}
            mode="multiple"
            allowClear
            style={{
              width: panelWidth,
            }}
            options={GenerateOrnamentsOptions()}
            tagRender={OrnamentSetTagRenderer}
            placeholder="Ornament set"
            maxTagCount="responsive"
          >
          </Select>
        </Form.Item>
      </Flex>

      <Button
        onClick={() => setConditionalSetEffectsDrawerOpen(true)}
        icon={<SettingOutlined />}
      >
        Conditional set effects
      </Button>
    </Flex>
  )
}