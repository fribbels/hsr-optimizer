import {
  Flex,
  Form,
  Select,
} from 'antd'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { Hint } from 'lib/interactions/hint'
import {
  AbilityKind,
  AbilityMeta,
  AbilityToSortOption,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import CharacterSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelect'
import LightConeSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/LightConeSelect'
import { RecommendedPresetsButton } from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'
import {
  optimizerTabDefaultGap,
  panelWidth,
} from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { Utils } from 'lib/utils/utils'
import {
  useEffect,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'

export default function CharacterSelectorDisplay() {
  const { t } = useTranslation(['optimizerTab', 'common'])
  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)
  const setOptimizerTabFocusCharacter = window.store((s) => s.setOptimizerTabFocusCharacter)
  const setOptimizerFormCharacterEidolon = window.store((s) => s.setOptimizerFormCharacterEidolon)

  const setOptimizerFormSelectedLightCone = window.store((s) => s.setOptimizerFormSelectedLightCone)
  const setOptimizerFormSelectedLightConeSuperimposition = window.store((s) => s.setOptimizerFormSelectedLightConeSuperimposition)

  const optimizerTabFocusCharacterSelectModalOpen = window.store((s) => s.optimizerTabFocusCharacterSelectModalOpen)
  const setOptimizerTabFocusCharacterSelectModalOpen = window.store((s) => s.setOptimizerTabFocusCharacterSelectModalOpen)

  const form = Form.useFormInstance()
  const characterEidolon = Form.useWatch('characterEidolon', form)

  useEffect(() => {
    OptimizerTabController.updateCharacter(optimizerTabFocusCharacter!)
  }, [optimizerTabFocusCharacter])

  const eidolonOptions = useMemo(() => {
    const options: { value: number, label: string }[] = []
    for (let i = 0; i <= 6; i++) {
      options.push({ value: i, label: t('common:EidolonNShort', { eidolon: i }) })
    }
    return options
  }, [t])

  const superimpositionOptions = useMemo(() => {
    const options: { value: number, label: string }[] = []
    for (let i = 1; i <= 5; i++) {
      options.push({ value: i, label: t('common:SuperimpositionNShort', { superimposition: i }) })
    }
    return options
  }, [t])

  const resultLimitOptions = useMemo(() => {
    const options: { value: number, label: string }[] = []
    for (let i = 64; i <= 65536; i = i * 2) {
      // `Find top ${limit} results`
      options.push({ value: i, label: t('ResultLimitN', { limit: i }) })
    }
    return options
  }, [t])

  const resultSortOptions = useMemo(() => { // `Sorted by ${key}`
    // Get available actions for the selected character
    let availableActions: string[] = []
    if (optimizerTabFocusCharacter && characterEidolon != null) {
      const characterConditionals = CharacterConditionalsResolver.get({
        characterId: optimizerTabFocusCharacter,
        characterEidolon: characterEidolon,
      })
      availableActions = characterConditionals.actionDeclaration?.() ?? []
    }

    // Build damage options: COMBO always first, then character-specific actions, then EHP
    const damageOptions: { value: string, label: string }[] = [
      { value: SortOption.COMBO.key, label: t('SortOptions.COMBO') },
    ]

    // Add character-specific damage options using AbilityToSortOption mapping
    for (const action of availableActions) {
      const sortKey = AbilityToSortOption[action as AbilityKind]
      if (sortKey) {
        const sortOption = SortOption[sortKey]
        damageOptions.push({ value: sortOption.key, label: t(`SortOptions.${sortOption.key}` as const) })
      }
    }

    // EHP always available
    damageOptions.push({ value: SortOption.EHP.key, label: t('SortOptions.EHP') })

    return [
      {
        label: t('SortOptions.DMGLabel'),
        options: damageOptions,
      },
      {
        label: t('SortOptions.StatLabel'),
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
        ],
      },
    ]
  }, [t, optimizerTabFocusCharacter, characterEidolon])

  return (
    <Flex vertical gap={optimizerTabDefaultGap}>
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('CharacterSelector.Character') /* Character */}</HeaderText>
        <TooltipImage type={Hint.character()} />
      </Flex>
      <Flex gap={optimizerTabDefaultGap}>
        <Form.Item name='characterId'>
          <CharacterSelect
            value={null}
            selectStyle={{ width: 151 }}
            onChange={setOptimizerTabFocusCharacter}
            externalOpen={optimizerTabFocusCharacterSelectModalOpen}
            setExternalOpen={setOptimizerTabFocusCharacterSelectModalOpen}
          />
        </Form.Item>
        <Form.Item name='characterEidolon'>
          <Select
            showSearch
            style={{ width: 55 }}
            options={eidolonOptions}
            onChange={setOptimizerFormCharacterEidolon}
            placeholder={t('CharacterSelector.EidolonPlaceholder')} // E
            popupMatchSelectWidth={55}
            suffixIcon={null}
          />
        </Form.Item>
      </Flex>
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('CharacterSelector.Lightcone') /* Light cone */}</HeaderText>
        <TooltipImage type={Hint.lightCone()} />
      </Flex>
      <Flex vertical gap={optimizerTabDefaultGap}>
        <Flex gap={optimizerTabDefaultGap}>
          <Form.Item name='lightCone'>
            <LightConeSelect
              value={null}
              selectStyle={{ width: 151 }}
              characterId={optimizerTabFocusCharacter}
              onChange={setOptimizerFormSelectedLightCone}
            />
          </Form.Item>
          <Form.Item name='lightConeSuperimposition'>
            <Select
              showSearch
              style={{ width: 55 }}
              onChange={setOptimizerFormSelectedLightConeSuperimposition}
              options={superimpositionOptions}
              placeholder={t('CharacterSelector.SuperimpositionPlaceholder')} // S
              popupMatchSelectWidth={55}
              suffixIcon={null}
            />
          </Form.Item>
        </Flex>
      </Flex>

      <Flex justify='space-between' align='center' style={{ marginTop: 30 }}>
        <HeaderText>{t('CharacterSelector.Presets') /* Presets */}</HeaderText>
      </Flex>

      <RecommendedPresetsButton />

      <Flex justify='space-between' align='center' style={{ marginTop: 30 }}>
        <HeaderText>{t('CharacterSelector.Target') /* Optimization target */}</HeaderText>
      </Flex>

      <Form.Item name='resultsLimit'>
        <Select
          showSearch
          style={{ width: panelWidth }}
          options={resultLimitOptions}
          placeholder={t('CharacterSelector.ResultsPlaceholder')} // 'Find top results'
          listHeight={800}
        />
      </Form.Item>

      <Form.Item name='resultSort'>
        <Select
          showSearch
          style={{ width: panelWidth }}
          options={resultSortOptions}
          listHeight={900}
          popupMatchSelectWidth={250}
          placeholder={t('CharacterSelector.TargetPlaceholder')} // 'Sorted by'
          filterOption={Utils.labelFilterOption}
        />
      </Form.Item>
    </Flex>
  )
}
