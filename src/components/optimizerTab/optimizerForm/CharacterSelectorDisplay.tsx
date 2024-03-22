import { Flex, Form, Select } from 'antd'
import { HeaderText } from 'components/HeaderText.jsx'
import { TooltipImage } from 'components/TooltipImage.jsx'
import { Hint } from 'lib/hint.jsx'
import { eidolonOptions, Stats, StatsToReadable, superimpositionOptions } from 'lib/constants.ts'
import RecommendedPresetsButton from 'components/optimizerTab/optimizerForm/RecommendedPresetsButton.tsx'
import { optimizerTabDefaultGap, panelWidth } from 'components/optimizerTab/optimizerTabConstants.ts'
import { useEffect } from 'react'
import { OptimizerTabController } from 'lib/optimizerTabController.js'
import CharacterSelect from 'components/optimizerTab/optimizerForm/CharacterSelect.tsx'
import LightConeSelect from 'components/optimizerTab/optimizerForm/LightConeSelect.tsx'

type CharacterSelectorDisplayProps = {
}

const resultsLimitString = (limit: number) => `Find top ${limit.toLocaleString()} results`
const resultsLimitOptions = (() => {
  return [
    { value: 100, label: resultsLimitString(100) },
    { value: 1000, label: resultsLimitString(1000) },
    { value: 10000, label: resultsLimitString(10000) },
    { value: 100000, label: resultsLimitString(100000) },
    { value: 1000000, label: resultsLimitString(1000000) },
  ]
})()

const resultsSortString = (key: string) => `Sorted by ${key}`
const resultsSortOptions = (() => {
  return [
    { value: Stats.HP, label: resultsSortString(StatsToReadable[Stats.HP]) },
    { value: Stats.ATK, label: resultsSortString(StatsToReadable[Stats.ATK]) },
    { value: Stats.DEF, label: resultsSortString(StatsToReadable[Stats.DEF]) },
    { value: Stats.SPD, label: resultsSortString(StatsToReadable[Stats.SPD]) },
    { value: Stats.CR, label: resultsSortString(StatsToReadable[Stats.CR]) },
    { value: Stats.CD, label: resultsSortString(StatsToReadable[Stats.CD]) },
    { value: Stats.EHR, label: resultsSortString(StatsToReadable[Stats.EHR]) },
    { value: Stats.RES, label: resultsSortString(StatsToReadable[Stats.RES]) },
    { value: Stats.BE, label: resultsSortString(StatsToReadable[Stats.BE]) },
    { value: Stats.OHB, label: resultsSortString(StatsToReadable[Stats.OHB]) },
    { value: Stats.ERR, label: resultsSortString(StatsToReadable[Stats.ERR]) },
    { value: 'ELEMENTAL_DMG', label: resultsSortString('Elemental DMG') },
    { value: 'WEIGHT', label: resultsSortString('Weight') },
    { value: 'EHP', label: resultsSortString('Effective HP') },
    { value: 'BASIC', label: resultsSortString('Basic DMG') },
    { value: 'SKILL', label: resultsSortString('Skill DMG') },
    { value: 'ULT', label: resultsSortString('Ult DMG') },
    { value: 'FUA', label: resultsSortString('Followup DMG') },
    { value: 'DOT', label: resultsSortString('DoT DMG') },
  ]
})()

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
      <Flex gap={optimizerTabDefaultGap}>
        <Form.Item name="characterId">
          <CharacterSelect
            value=""
            selectStyle={{ width: 155 }}
            onChange={setOptimizerTabFocusCharacter}
          />
        </Form.Item>
        <Form.Item name="characterEidolon">
          <Select
            showSearch
            style={{ width: 45 }}
            options={eidolonOptions}
            onChange={setOptimizerFormCharacterEidolon}
            placeholder="E"
            popupMatchSelectWidth={55}
            suffixIcon={null}
          />
        </Form.Item>
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
              selectStyle={{ width: 155 }}
              characterId={optimizerTabFocusCharacter}
              onChange={setOptimizerFormSelectedLightCone}
            />
          </Form.Item>
          <Form.Item name="lightConeSuperimposition">
            <Select
              showSearch
              style={{ width: 45 }}
              onChange={setOptimizerFormSelectedLightConeSuperimposition}
              options={superimpositionOptions}
              placeholder="S"
              popupMatchSelectWidth={55}
              suffixIcon={null}
            />
          </Form.Item>
        </Flex>
      </Flex>

      <Flex justify="space-between" align="center" style={{ marginTop: 10 }}>
        <HeaderText>Presets</HeaderText>
      </Flex>

      <RecommendedPresetsButton />

      <Flex justify="space-between" align="center" style={{ marginTop: 10 }}>
        <HeaderText>Results</HeaderText>
      </Flex>

      <Form.Item name="resultsLimit">
        <Select
          showSearch
          style={{ width: panelWidth }}
          onChange={setOptimizerFormSelectedLightConeSuperimposition}
          options={resultsLimitOptions}
          placeholder="Find top results"
        />
      </Form.Item>

      <Form.Item name="resultsSort">
        <Select
          showSearch
          style={{ width: panelWidth }}
          onChange={setOptimizerFormSelectedLightConeSuperimposition}
          options={resultsSortOptions}
          listHeight={700}
          popupMatchSelectWidth={300}
          placeholder="Sorted by"
        />
      </Form.Item>
    </Flex>
  )
}
