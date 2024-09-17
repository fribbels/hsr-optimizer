import { Flex, Form, Select, Typography } from 'antd'
import { HeaderText } from 'components/HeaderText.jsx'
import { TooltipImage } from 'components/TooltipImage.jsx'
import { Hint } from 'lib/hint.jsx'
import { eidolonOptions, Stats, StatsToReadable, superimpositionOptions } from 'lib/constants.ts'
import RecommendedPresetsButton from 'components/optimizerTab/optimizerForm/RecommendedPresetsButton.tsx'
import { optimizerTabDefaultGap, panelWidth } from 'components/optimizerTab/optimizerTabConstants.ts'
import React, { useEffect } from 'react'
import { OptimizerTabController } from 'lib/optimizerTabController.js'
import CharacterSelect from 'components/optimizerTab/optimizerForm/CharacterSelect.tsx'
import LightConeSelect from 'components/optimizerTab/optimizerForm/LightConeSelect.tsx'
import { SortOption } from 'lib/optimizer/sortOptions.ts'
import { Utils } from 'lib/utils.js'
import styled from 'styled-components'

type CharacterSelectorDisplayProps = {}

const Text = styled(Typography)`
    white-space: pre-line;
`

const resultLimitString = (limit: number) => `Find top ${limit.toLocaleString()} results`
const resultLimitOptions = (() => {
  return [
    // { value: 1, label: resultLimitString(1) },
    // { value: 2, label: resultLimitString(2) },
    // { value: 4, label: resultLimitString(4) },
    // { value: 8, label: resultLimitString(8) },
    // { value: 16, label: resultLimitString(16) },
    // { value: 32, label: resultLimitString(32) },
    { value: 64, label: resultLimitString(64) },
    { value: 128, label: resultLimitString(128) },
    { value: 256, label: resultLimitString(256) },
    { value: 512, label: resultLimitString(512) },
    { value: 1024, label: resultLimitString(1024) },
    { value: 2048, label: resultLimitString(2048) },
    { value: 4096, label: resultLimitString(4096) },
    { value: 8192, label: resultLimitString(8192) },
    { value: 16384, label: resultLimitString(16384) },
    { value: 32768, label: resultLimitString(32768) },
    { value: 65536, label: resultLimitString(65536) },
    // { value: 131072, label: resultLimitString(131072) },
  ]
})()

const resultSortString = (key: string) => `Sorted by ${key}`
const resultSortOptions = (() => {
  return [
    {
      label: 'Damage calculations',
      options: [
        { value: SortOption.COMBO.key, label: resultSortString('Combo DMG') },
        { value: SortOption.BASIC.key, label: resultSortString('Basic DMG') },
        { value: SortOption.SKILL.key, label: resultSortString('Skill DMG') },
        { value: SortOption.ULT.key, label: resultSortString('Ult DMG') },
        { value: SortOption.FUA.key, label: resultSortString('Follow-up DMG') },
        { value: SortOption.DOT.key, label: resultSortString('DoT DMG') },
        { value: SortOption.BREAK.key, label: resultSortString('Break DMG') },
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

  const optimizerTabFocusCharacterSelectModalOpen = window.store((s) => s.optimizerTabFocusCharacterSelectModalOpen)
  const setOptimizerTabFocusCharacterSelectModalOpen = window.store((s) => s.setOptimizerTabFocusCharacterSelectModalOpen)

  useEffect(() => {
    OptimizerTabController.updateCharacter(optimizerTabFocusCharacter)
  }, [optimizerTabFocusCharacter])

  return (
    <Flex vertical gap={optimizerTabDefaultGap}>
      <Flex justify='space-between' align='center'>
        <HeaderText>Character</HeaderText>
        <TooltipImage type={Hint.character()}/>
      </Flex>
      <Flex gap={optimizerTabDefaultGap}>
        <Form.Item name='characterId'>
          <CharacterSelect
            value=''
            selectStyle={{ width: 156 }}
            onChange={setOptimizerTabFocusCharacter}
            externalOpen={optimizerTabFocusCharacterSelectModalOpen}
            setExternalOpen={setOptimizerTabFocusCharacterSelectModalOpen}
          />
        </Form.Item>
        <Form.Item name='characterEidolon'>
          <Select
            showSearch
            style={{ width: 50 }}
            options={eidolonOptions}
            onChange={setOptimizerFormCharacterEidolon}
            placeholder='E'
            popupMatchSelectWidth={55}
            suffixIcon={null}
          />
        </Form.Item>
      </Flex>
      <Flex justify='space-between' align='center'>
        <HeaderText>Light cone</HeaderText>
        <TooltipImage type={Hint.lightCone()}/>
      </Flex>
      <Flex vertical gap={optimizerTabDefaultGap}>
        <Flex gap={optimizerTabDefaultGap}>
          <Form.Item name='lightCone'>
            <LightConeSelect
              value=''
              selectStyle={{ width: 156 }}
              characterId={optimizerTabFocusCharacter}
              onChange={setOptimizerFormSelectedLightCone}
            />
          </Form.Item>
          <Form.Item name='lightConeSuperimposition'>
            <Select
              showSearch
              style={{ width: 50 }}
              onChange={setOptimizerFormSelectedLightConeSuperimposition}
              options={superimpositionOptions}
              placeholder='S'
              popupMatchSelectWidth={55}
              suffixIcon={null}
            />
          </Form.Item>
        </Flex>
      </Flex>

      <Flex justify='space-between' align='center' style={{ marginTop: 16 }}>
        <HeaderText>Presets</HeaderText>
      </Flex>

      <RecommendedPresetsButton/>

      <Flex justify='space-between' align='center' style={{ marginTop: 16 }}>
        <HeaderText>Optimization target</HeaderText>
      </Flex>

      <Form.Item name='resultsLimit'>
        <Select
          showSearch
          style={{ width: panelWidth }}
          options={resultLimitOptions}
          placeholder='Find top results'
          listHeight={800}
        />
      </Form.Item>

      <Form.Item name='resultSort'>
        <Select
          showSearch
          style={{ width: panelWidth }}
          options={resultSortOptions}
          listHeight={800}
          popupMatchSelectWidth={250}
          placeholder='Sorted by'
          filterOption={Utils.labelFilterOption}
        />
      </Form.Item>
    </Flex>
  )
}
