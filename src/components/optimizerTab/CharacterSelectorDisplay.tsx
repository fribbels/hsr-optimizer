import { Flex, Form, Select } from 'antd'
import { HeaderText } from 'components/HeaderText'
import { TooltipImage } from 'components/TooltipImage'
import { Hint } from 'lib/hint'
import { Utils } from 'lib/utils'
import { eidolonOptions, levelOptions, superimpositionOptions } from 'lib/constants'
import RecommendedPresetsButton from 'components/optimizerForm/RecommendedPresetsButton'
import { optimizerTabDefaultGap, panelWidth } from 'components/optimizerTab/optimizerTabConstants'

type CharacterSelectorDisplayProps = {
  characterOptions: object[]
  characterSelectorChange: () => void
  lightConeOptions: object[]
  lightConeSelectorChange: () => void
}
export default function CharacterSelectorDisplay(props: CharacterSelectorDisplayProps) {
  return (
    <Flex vertical gap={optimizerTabDefaultGap}>
      <Flex justify="space-between" align="center">
        <HeaderText>Character</HeaderText>
        <TooltipImage type={Hint.character()} />
      </Flex>
      <Flex vertical gap={optimizerTabDefaultGap}>
        <Form.Item name="characterId">
          <Select
            showSearch
            filterOption={Utils.labelFilterOption}
            style={{ width: panelWidth }}
            onChange={props.characterSelectorChange}
            options={props.characterOptions}
            optionLabelProp="label"
            placeholder="Character"
          />
        </Form.Item>
        <Flex gap={optimizerTabDefaultGap} justify="space-between">
          <Form.Item name="characterLevel">
            <Select
              showSearch
              style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
              options={levelOptions}
              placeholder="Level"
            />
          </Form.Item>
          <Form.Item name="characterEidolon">
            <Select
              showSearch
              style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
              options={eidolonOptions}
              placeholder="Eidolon"
            />
          </Form.Item>
        </Flex>
      </Flex>
      <Flex justify="space-between" align="center">
        <HeaderText>Light cone</HeaderText>
        <TooltipImage type={Hint.lightCone()} />
      </Flex>
      <Flex vertical gap={optimizerTabDefaultGap}>
        <Flex gap={optimizerTabDefaultGap}>
          <Form.Item name="lightCone">
            <Select
              showSearch
              filterOption={Utils.labelFilterOption}
              style={{ width: panelWidth }}
              onChange={props.lightConeSelectorChange}
              options={props.lightConeOptions}
              placeholder="Light Cone"
            />
          </Form.Item>
        </Flex>
        <Flex gap={optimizerTabDefaultGap} justify="space-between">
          <Form.Item name="lightConeLevel">
            <Select
              showSearch
              style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
              options={levelOptions}
              placeholder="Level"
            />
          </Form.Item>
          <Form.Item name="lightConeSuperimposition">
            <Select
              showSearch
              style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
              options={superimpositionOptions}
              placeholder="Superimposition"
            />
          </Form.Item>
        </Flex>
      </Flex>

      <Flex justify="space-between" align="center">
        <HeaderText>Presets</HeaderText>
      </Flex>

      <RecommendedPresetsButton />
    </Flex>
  )
}
