import { Button, Cascader, Flex, Form, Select, Tag } from 'antd'
import { HeaderText } from 'components/HeaderText.jsx'
import { TooltipImage } from 'components/TooltipImage.jsx'
import { Hint } from 'lib/hint.jsx'
import { optimizerTabDefaultGap, panelWidth } from 'components/optimizerTab/optimizerTabConstants.ts'
import { Constants, RelicSetFilterOptions } from 'lib/constants.ts'
import GenerateSetsOptions from 'components/optimizerTab/optimizerForm/SetsOptions.tsx'
import GenerateOrnamentsOptions from 'components/optimizerTab/optimizerForm/OrnamentsOptions.tsx'
import { SettingOutlined } from '@ant-design/icons'
import { Assets } from 'lib/assets.js'
import PropTypes from 'prop-types'

import React from 'react'

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
            suffixIcon={<img style={{ width: 16 }} src="https://d28ecrnsw8u0fj.cloudfront.net/hsr/misc/partBody.webp" />}
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
            suffixIcon={<img style={{ width: 16 }} src="https://d28ecrnsw8u0fj.cloudfront.net/hsr/misc/partFeet.webp" />}
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
            suffixIcon={<img style={{ width: 16 }} src="https://d28ecrnsw8u0fj.cloudfront.net/hsr/misc/partPlanarSphere.webp" />}
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
            suffixIcon={<img style={{ width: 16 }} src="https://d28ecrnsw8u0fj.cloudfront.net/hsr/misc/partLinkRope.webp" />}
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
        <Flex justify="space-between" align="center">
          <HeaderText>Sets</HeaderText>
          <TooltipImage type={Hint.sets()} />
        </Flex>
        <Form.Item name="relicSets">
          <Cascader
            placeholder="Relics"
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
            listHeight={550}
            mode="multiple"
            allowClear
            style={{
              width: panelWidth,
            }}
            options={GenerateOrnamentsOptions()}
            tagRender={OrnamentSetTagRenderer}
            placeholder="Planar Ornaments"
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

function RelicSetTagRenderer(props) {
  const { value, closable, onClose } = props
  /*
   * The value comes in as:
   * "2 PieceBand of Sizzling Thunder__RC_CASCADER_SPLIT__Guard of Wuthering Snow"
   */
  /*
   *['4 Piece', 'Passerby of Wandering Cloud']
   *['2 + 2 Piece', 'Knight of Purity Palace', 'Hunter of Glacial Forest']
   *['2 + Any', 'Knight of Purity Palace']
   */

  const pieces = value.split('__RC_CASCADER_SPLIT__')
  let inner

  if (pieces[0] == RelicSetFilterOptions.relic4Piece) {
    inner
      = (
        <React.Fragment>
          <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} style={{ width: 26, height: 26 }}></img>
          <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} style={{ width: 26, height: 26 }}></img>
        </React.Fragment>
      )
  }

  if (pieces[0] == RelicSetFilterOptions.relic2Plus2Piece) {
    inner
      = (
        <React.Fragment>
          <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} style={{ width: 26, height: 26 }}></img>
          <img title={pieces[2]} src={Assets.getSetImage(pieces[2], Constants.Parts.Head)} style={{ width: 26, height: 26 }}></img>
        </React.Fragment>
      )
  }

  if (pieces[0] == RelicSetFilterOptions.relic2PlusAny) {
    inner
      = (
        <React.Fragment>
          <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} style={{ width: 26, height: 26 }}></img>
        </React.Fragment>
      )
  }

  const onPreventMouseDown = (event) => {
    event.preventDefault()
    event.stopPropagation()
  }
  return (
    <Tag
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{ display: 'flex', flexDirection: 'row', paddingInline: '1px', marginInlineEnd: '4px', height: 22, alignItems: 'center', overflow: 'hidden' }}
    >
      <Flex>
        {inner}
      </Flex>
    </Tag>
  )
}
RelicSetTagRenderer.propTypes = {
  value: PropTypes.string,
  closable: PropTypes.bool,
  onClose: PropTypes.func,
}

function OrnamentSetTagRenderer(props) {
  const { value, closable, onClose } = props
  const onPreventMouseDown = (event) => {
    event.preventDefault()
    event.stopPropagation()
  }
  return (
    <Tag
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{ display: 'flex', flexDirection: 'row', paddingInline: '1px', marginInlineEnd: '4px', height: 22, alignItems: 'center', overflow: 'hidden' }}
    >
      <Flex>
        <img title={value} src={Assets.getSetImage(value, Constants.Parts.PlanarSphere)} style={{ width: 26, height: 26 }}></img>
      </Flex>
    </Tag>
  )
}
OrnamentSetTagRenderer.propTypes = {
  value: PropTypes.string,
  closable: PropTypes.bool,
  onClose: PropTypes.func,
}
