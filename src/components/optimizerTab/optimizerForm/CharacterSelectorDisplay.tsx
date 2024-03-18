import { Flex, Form, Select } from 'antd'
import { HeaderText } from 'components/HeaderText.jsx'
import { TooltipImage } from 'components/TooltipImage.jsx'
import { Hint } from 'lib/hint.jsx'
import { eidolonOptions, levelOptions, superimpositionOptions } from 'lib/constants.ts'
import RecommendedPresetsButton from 'components/optimizerTab/optimizerForm/RecommendedPresetsButton.tsx'
import { optimizerTabDefaultGap, panelWidth } from 'components/optimizerTab/optimizerTabConstants.ts'
import { useEffect } from 'react'
import { OptimizerTabController } from 'lib/optimizerTabController.js'
import CharacterSelect from 'components/optimizerTab/optimizerForm/CharacterSelect.tsx'
import LightConeSelect from 'components/optimizerTab/optimizerForm/LightConeSelect.tsx'

type CharacterSelectorDisplayProps = {
}
export default function CharacterSelectorDisplay(_props: CharacterSelectorDisplayProps) {
  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)
  const setOptimizerTabFocusCharacter = window.store((s) => s.setOptimizerTabFocusCharacter)
  const setOptimizerFormCharacterEidolon = window.store((s) => s.setOptimizerFormCharacterEidolon)

  const setOptimizerFormSelectedLightCone = window.store((s) => s.setOptimizerFormSelectedLightCone)
  const setOptimizerFormSelectedLightConeSuperimposition = window.store((s) => s.setOptimizerFormSelectedLightConeSuperimposition)

  useEffect(() => {
    OptimizerTabController.updateCharacter(optimizerTabFocusCharacter)
  }, [optimizerTabFocusCharacter])

  return (
    <Flex vertical gap={optimizerTabDefaultGap}>
      <Flex justify="space-between" align="center">
        <HeaderText>Character</HeaderText>
        <TooltipImage type={Hint.character()} />
      </Flex>
      <Flex vertical gap={optimizerTabDefaultGap}>
        <Form.Item name="characterId">
          <CharacterSelect
            value=""
            selectStyle={{ width: panelWidth }}
            onChange={setOptimizerTabFocusCharacter}
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
              onChange={setOptimizerFormCharacterEidolon}
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
            <LightConeSelect
              value=""
              selectStyle={{ width: panelWidth }}
              characterId={optimizerTabFocusCharacter}
              onChange={setOptimizerFormSelectedLightCone}
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
              onChange={setOptimizerFormSelectedLightConeSuperimposition}
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
