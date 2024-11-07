import { Flex, Form, Select } from 'antd'
import { HeaderText } from 'components/HeaderText'
import CharacterSelect from 'components/optimizerTab/optimizerForm/CharacterSelect'
import LightConeSelect from 'components/optimizerTab/optimizerForm/LightConeSelect'
import RecommendedPresetsButton from 'components/optimizerTab/optimizerForm/RecommendedPresetsButton'
import { optimizerTabDefaultGap, panelWidth } from 'components/optimizerTab/optimizerTabConstants'
import { TooltipImage } from 'components/TooltipImage'
import { Hint } from 'lib/hint'
import { SortOption } from 'lib/optimizer/sortOptions'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { Utils } from 'lib/utils'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

type CharacterSelectorDisplayProps = {}

export default function CharacterSelectorDisplay(_props: CharacterSelectorDisplayProps) {
  const { t } = useTranslation(['optimizerTab', 'common'])
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

  const eidolonOptions = useMemo(() => {
    const options: { value: number; label: string }[] = []
    for (let i = 0; i <= 6; i++) {
      options.push({ value: i, label: t('common:EidolonNShort', { eidolon: i }) })
    }
    return options
  }, [t])

  const superimpositionOptions = useMemo(() => {
    const options: { value: number; label: string }[] = []
    for (let i = 1; i <= 5; i++) {
      options.push({ value: i, label: t('common:SuperimpositionNShort', { superimposition: i }) })
    }
    return options
  }, [t])

  const resultLimitOptions = useMemo(() => {
    const options: { value: number; label: string }[] = []
    for (let i = 64; i <= 65536; i = i * 2) {
      options.push({ value: i, label: t('ResultLimitN', { limit: i }) })
    }// `Find top ${limit} results`
    return options
  }, [t])

  const resultSortOptions = useMemo(() => { // `Sorted by ${key}`
    return [
      {
        label: 'Damage calculations',
        options: [
          { value: SortOption.COMBO.key, label: t('SortOptions.COMBO') },
          { value: SortOption.BASIC.key, label: t('SortOptions.BASIC') },
          { value: SortOption.SKILL.key, label: t('SortOptions.SKILL') },
          { value: SortOption.ULT.key, label: t('SortOptions.ULT') },
          { value: SortOption.FUA.key, label: t('SortOptions.FUA') },
          { value: SortOption.DOT.key, label: t('SortOptions.DOT') },
          { value: SortOption.BREAK.key, label: t('SortOptions.BREAK') },
          { value: SortOption.HEAL.key, label: t('SortOptions.HEAL') },
          { value: SortOption.SHIELD.key, label: t('SortOptions.SHIELD') },
        ],
      },
      {
        label: 'Stats',
        options: [
          { value: SortOption.HP.key, label: t('SortOptions.HP') },
          { value: SortOption.ATK.key, label: t('SortOptions.ATK') },
          { value: SortOption.DEF.key, label: t('SortOptions.DEF') },
          { value: SortOption.SPD.key, label: t('SortOptions.SPD') },
          { value: SortOption.CR.key, label: t('SortOptions.CR') },
          { value: SortOption.CD.key, label: t('SortOptions.CD') },
          { value: SortOption.EHR.key, label: t('SortOptions.EHR') },
          { value: SortOption.RES.key, label: t('SortOptions.RES') },
          { value: SortOption.BE.key, label: t('SortOptions.BE') },
          { value: SortOption.OHB.key, label: t('SortOptions.OHB') },
          { value: SortOption.ERR.key, label: t('SortOptions.ERR') },
          { value: SortOption.ELEMENTAL_DMG.key, label: t('SortOptions.DMG') },
          { value: SortOption.EHP.key, label: t('SortOptions.EHP') },
        ],
      },
    ]
  }, [t])

  return (
    <Flex vertical gap={optimizerTabDefaultGap}>
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('CharacterSelector.Character')/* Character */}</HeaderText>
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
            placeholder={t('CharacterSelector.EidolonPlaceholder')} // E
            popupMatchSelectWidth={55}
            suffixIcon={null}
          />
        </Form.Item>
      </Flex>
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('CharacterSelector.Lightcone')/* Light cone */}</HeaderText>
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
              placeholder={t('CharacterSelector.SuperimpositionPlaceholder')} // S
              popupMatchSelectWidth={55}
              suffixIcon={null}
            />
          </Form.Item>
        </Flex>
      </Flex>

      <Flex justify='space-between' align='center' style={{ marginTop: 16 }}>
        <HeaderText>{t('CharacterSelector.Presets')/* Presets */}</HeaderText>
      </Flex>

      <RecommendedPresetsButton/>

      <Flex justify='space-between' align='center' style={{ marginTop: 16 }}>
        <HeaderText>{t('CharacterSelector.Target')/* Optimization target */}</HeaderText>
      </Flex>

      <Form.Item name='resultsLimit'>
        <Select
          showSearch
          style={{ width: panelWidth }}
          options={resultLimitOptions}
          placeholder={t('CharacterSelector.ResultsPlaceholder')}// 'Find top results'
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
          placeholder={t('CharacterSelector.TargetPlaceholder')}// 'Sorted by'
          filterOption={Utils.labelFilterOption}
        />
      </Form.Item>
    </Flex>
  )
}
