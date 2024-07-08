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
import { SortOption } from 'lib/optimizer/sortOptions.ts'
import { Utils } from 'lib/utils.js'

type CharacterSelectorDisplayProps = {}

const resultLimitString = (limit: number) => `Find top ${limit.toLocaleString()} results`
const resultLimitOptions = (() => {
  return [
    { value: 100, label: resultLimitString(100) },
    { value: 1000, label: resultLimitString(1000) },
    { value: 10000, label: resultLimitString(10000) },
    { value: 100000, label: resultLimitString(100000) },
    { value: 1000000, label: resultLimitString(1000000) },
  ]
})()

const resultSortString = (key: string) => `Sorted by ${key}`
const resultSortOptions = (() => {
  return [
    {
      label: 'Damage calculations',
      options: [
        { value: SortOption.BASIC.key, label: resultSortString('Basic DMG') },
        { value: SortOption.SKILL.key, label: resultSortString('Skill DMG') },
        { value: SortOption.ULT.key, label: resultSortString('Ult DMG') },
        { value: SortOption.FUA.key, label: resultSortString('Follow-up DMG') },
        { value: SortOption.DOT.key, label: resultSortString('DoT DMG') },
        { value: SortOption.BREAK.key, label: resultSortString('Break DMG') },
        { value: SortOption.COMBO.key, label: resultSortString('Combo DMG') },
      ],
    },
    {
      label: 'Stats',
      options: [
        { value: SortOption.HP.key, label: resultSortString(StatsToReadable[Stats.HP]) },
        { value: SortOption.ATK.key, label: resultSortString(StatsToReadable[Stats.ATK]) },
        { value: SortOption.DEF.key, label: resultSortString(StatsToReadable[Stats.DEF]) },
        { value: SortOption.SPD.key, label: resultSortString(StatsToReadable[Stats.SPD]) },
        { value: SortOption.CR.key, label: resultSortString(StatsToReadable[Stats.CR]) },
        { value: SortOption.CD.key, label: resultSortString(StatsToReadable[Stats.CD]) },
        { value: SortOption.EHR.key, label: resultSortString(StatsToReadable[Stats.EHR]) },
        { value: SortOption.RES.key, label: resultSortString(StatsToReadable[Stats.RES]) },
        { value: SortOption.BE.key, label: resultSortString(StatsToReadable[Stats.BE]) },
        { value: SortOption.OHB.key, label: resultSortString(StatsToReadable[Stats.OHB]) },
        { value: SortOption.ERR.key, label: resultSortString(StatsToReadable[Stats.ERR]) },
        { value: SortOption.ELEMENTAL_DMG.key, label: resultSortString('Elemental DMG') },
        { value: SortOption.EHP.key, label: resultSortString('Effective HP') },
        { value: SortOption.WEIGHT.key, label: resultSortString('Weight') },
      ],
    },
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
            selectStyle={{ width: 156 }}
            onChange={setOptimizerTabFocusCharacter}
          />
        </Form.Item>
        <Form.Item name="characterEidolon">
          <Select
            showSearch
            style={{ width: 50 }}
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
              selectStyle={{ width: 156 }}
              characterId={optimizerTabFocusCharacter}
              onChange={setOptimizerFormSelectedLightCone}
            />
          </Form.Item>
          <Form.Item name="lightConeSuperimposition">
            <Select
              showSearch
              style={{ width: 50 }}
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

      <Flex justify="space-between" align="center" style={{ marginTop: 15 }}>
        <HeaderText>Optimization target</HeaderText>
      </Flex>

      <Form.Item name="resultLimit">
        <Select
          showSearch
          style={{ width: panelWidth }}
          options={resultLimitOptions}
          placeholder="Find top results"
        />
      </Form.Item>

      <Form.Item name="resultSort">
        <Select
          showSearch
          style={{ width: panelWidth }}
          options={resultSortOptions}
          listHeight={800}
          popupMatchSelectWidth={250}
          placeholder="Sorted by"
          filterOption={Utils.labelFilterOption}
        />
      </Form.Item>
    </Flex>
  )
}
