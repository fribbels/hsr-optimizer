import { Flex, Select } from '@mantine/core'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { Hint } from 'lib/interactions/hint'
import {
  AbilityKind,
  AbilityToSortOption,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { SaveState } from 'lib/state/saveState'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { useOptimizerUIStore } from 'lib/stores/optimizerUI/useOptimizerUIStore'
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
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

export default function CharacterSelectorDisplay() {
  const { t } = useTranslation(['optimizerTab', 'common'])
  const optimizerTabFocusCharacter = useOptimizerUIStore((s) => s.focusCharacterId)

  const optimizerTabFocusCharacterSelectModalOpen = useOptimizerUIStore((s) => s.characterSelectModalOpen)
  const setOptimizerTabFocusCharacterSelectModalOpen = useOptimizerUIStore((s) => s.setCharacterSelectModalOpen)

  const {
    characterId,
    characterEidolon,
    lightCone,
    lightConeSuperimposition,
    resultsLimit,
    resultSort,
  } = useOptimizerFormStore(
    useShallow((s) => ({
      characterId: s.characterId,
      characterEidolon: s.characterEidolon,
      lightCone: s.lightCone,
      lightConeSuperimposition: s.lightConeSuperimposition,
      resultsLimit: s.resultsLimit,
      resultSort: s.resultSort,
    })),
  )

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
    const damageOptions: { value: string; label: string }[] = [
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
    <Flex direction="column" gap={optimizerTabDefaultGap}>
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('CharacterSelector.Character') /* Character */}</HeaderText>
        <TooltipImage type={Hint.character()} />
      </Flex>
      <Flex gap={optimizerTabDefaultGap}>
        <CharacterSelect
          value={characterId}
          onChange={(id) => {
            if (id) {
              useOptimizerUIStore.getState().setFocusCharacterId(id)
              OptimizerTabController.updateCharacter(id)
              SaveState.delayedSave()
            }
          }}
          selectStyle={{ width: 151 }}
          externalOpen={optimizerTabFocusCharacterSelectModalOpen}
          setExternalOpen={setOptimizerTabFocusCharacterSelectModalOpen}
        />
        <Select
          searchable
          style={{ width: 55 }}
          data={eidolonOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
          value={characterEidolon != null ? String(characterEidolon) : null}
          onChange={(val) => { if (val != null) useOptimizerFormStore.getState().setEidolon(Number(val)) }}
          placeholder={t('CharacterSelector.EidolonPlaceholder')} // E
          comboboxProps={{ width: 55 }}
          rightSection={null}
        />
      </Flex>
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('CharacterSelector.Lightcone') /* Light cone */}</HeaderText>
        <TooltipImage type={Hint.lightCone()} />
      </Flex>
      <Flex direction="column" gap={optimizerTabDefaultGap}>
        <Flex gap={optimizerTabDefaultGap}>
          <LightConeSelect
            value={lightCone ?? null}
            onChange={(id) => useOptimizerFormStore.getState().setLightCone(id ?? undefined)}
            selectStyle={{ width: 151 }}
            characterId={optimizerTabFocusCharacter}
          />
          <Select
            searchable
            style={{ width: 55 }}
            data={superimpositionOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
            value={lightConeSuperimposition != null ? String(lightConeSuperimposition) : null}
            onChange={(val) => { if (val != null) useOptimizerFormStore.getState().setLightConeSuperimposition(Number(val)) }}
            placeholder={t('CharacterSelector.SuperimpositionPlaceholder')} // S
            comboboxProps={{ width: 55 }}
            rightSection={null}
          />
        </Flex>
      </Flex>

      <Flex justify='space-between' align='center' style={{ marginTop: 30 }}>
        <HeaderText>{t('CharacterSelector.Presets') /* Presets */}</HeaderText>
      </Flex>

      <RecommendedPresetsButton />

      <Flex justify='space-between' align='center' style={{ marginTop: 30 }}>
        <HeaderText>{t('CharacterSelector.Target') /* Optimization target */}</HeaderText>
      </Flex>

      <Select
        searchable
        style={{ width: panelWidth }}
        data={resultLimitOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
        value={resultsLimit != null ? String(resultsLimit) : null}
        onChange={(val) => { if (val != null) useOptimizerFormStore.getState().setResultsLimit(Number(val)) }}
        placeholder={t('CharacterSelector.ResultsPlaceholder')} // 'Find top results'
        maxDropdownHeight={800}
      />

      <Select
        searchable
        style={{ width: panelWidth }}
        data={resultSortOptions.map((group) => ({
          group: group.label,
          items: group.options.map((opt) => ({ value: opt.value, label: opt.label })),
        }))}
        value={resultSort}
        onChange={(val) => useOptimizerFormStore.getState().setResultSort((val ?? undefined) as keyof typeof SortOption | undefined)}
        maxDropdownHeight={900}
        comboboxProps={{ width: 250 }}
        placeholder={t('CharacterSelector.TargetPlaceholder')} // 'Sorted by'
      />
    </Flex>
  )
}
