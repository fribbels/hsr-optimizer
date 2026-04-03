import { Flex, SegmentedControl, Select } from '@mantine/core'
import { Stats } from 'lib/constants/constants'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { Hint } from 'lib/interactions/hint'
import {
  type AbilityKind,
  AbilityToSortOption,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { Assets } from 'lib/rendering/assets'
import { SaveState } from 'lib/state/saveState'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { CharacterSelect } from 'lib/ui/selectors/CharacterSelect'
import { LightConeSelect } from 'lib/ui/selectors/LightConeSelect'
import { RecommendedPresetsButton } from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'
import {
  optimizerTabDefaultGap,
  panelWidth,
} from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { updateCharacter } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import iconClasses from 'style/icons.module.css'
import { useShallow } from 'zustand/react/shallow'

const sortKeyToStat: Record<string, string> = {
  HP: Stats.HP,
  ATK: Stats.ATK,
  DEF: Stats.DEF,
  SPD: Stats.SPD,
  CR: Stats.CR,
  CD: Stats.CD,
  EHR: Stats.EHR,
  RES: Stats.RES,
  BE: Stats.BE,
  OHB: Stats.OHB,
  ERR: Stats.ERR,
}

export function CharacterSelectorDisplay() {
  const { t } = useTranslation(['optimizerTab', 'common'])
  const optimizerTabFocusCharacter = useOptimizerDisplayStore((s) => s.focusCharacterId)

  const optimizerTabFocusCharacterSelectModalOpen = useOptimizerDisplayStore((s) => s.characterSelectModalOpen)
  const setOptimizerTabFocusCharacterSelectModalOpen = useOptimizerDisplayStore((s) => s.setCharacterSelectModalOpen)

  const {
    characterId,
    characterEidolon,
    lightCone,
    lightConeSuperimposition,
    resultsLimit,
    resultSort,
  } = useOptimizerRequestStore(
    useShallow((s) => ({
      characterId: s.characterId,
      characterEidolon: s.characterEidolon,
      lightCone: s.lightCone,
      lightConeSuperimposition: s.lightConeSuperimposition,
      resultsLimit: s.resultsLimit,
      resultSort: s.resultSort,
    })),
  )

  const eidolonOptions = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => ({ value: i, label: t('common:EidolonNShort', { eidolon: i }) })),
  [t])

  const superimpositionOptions = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({ value: i + 1, label: t('common:SuperimpositionNShort', { superimposition: i + 1 }) })),
  [t])

  const resultLimitOptions = useMemo(() =>
    Array.from({ length: 11 }, (_, i) => 64 * Math.pow(2, i))
      .filter((v) => v <= 65536)
      .map((v) => ({ value: v, label: t('ResultLimitN', { limit: v }) })),
  [t])

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
      <Flex direction="column" gap={optimizerTabDefaultGap}>
        <CharacterSelect
          value={characterId ?? null}
          onChange={(id) => {
            if (id) {
              useOptimizerDisplayStore.getState().setFocusCharacterId(id)
              updateCharacter(id)
              SaveState.delayedSave()
            }
          }}
          selectStyle={{ width: panelWidth }}
          opened={optimizerTabFocusCharacterSelectModalOpen}
          onOpenChange={setOptimizerTabFocusCharacterSelectModalOpen}
          showIcon={false}
          clearable={false}
        />
        <SegmentedControl
          fullWidth
          size='xs'
          value={String(characterEidolon ?? 0)}
          data={eidolonOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
          onChange={(val) => useOptimizerRequestStore.getState().setEidolon(Number(val))}
        />
      </Flex>
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('CharacterSelector.Lightcone') /* Light cone */}</HeaderText>
        <TooltipImage type={Hint.lightCone()} />
      </Flex>
      <Flex direction="column" gap={optimizerTabDefaultGap}>
        <LightConeSelect
          value={lightCone ?? null}
          onChange={(id) => useOptimizerRequestStore.getState().setLightCone(id ?? undefined)}
          selectStyle={{ width: panelWidth }}
          characterId={optimizerTabFocusCharacter}
        />
        <SegmentedControl
          fullWidth
          size='xs'
          value={String(lightConeSuperimposition ?? 1)}
          data={superimpositionOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
          onChange={(val) => useOptimizerRequestStore.getState().setLightConeSuperimposition(Number(val))}
        />
      </Flex>

      <Flex justify='space-between' align='center' style={{ marginTop: 20 }}>
        <HeaderText>{t('CharacterSelector.Presets') /* Presets */}</HeaderText>
      </Flex>

      <RecommendedPresetsButton />

      <Flex justify='space-between' align='center' style={{ marginTop: 20 }}>
        <HeaderText>{t('CharacterSelector.Target') /* Optimization target */}</HeaderText>
      </Flex>

      <Select
        style={{ width: panelWidth }}
        data={resultLimitOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
        value={resultsLimit != null ? String(resultsLimit) : null}
        onChange={(val) => { if (val != null) useOptimizerRequestStore.getState().setResultsLimit(Number(val)) }}
        placeholder={t('CharacterSelector.ResultsPlaceholder')} // 'Find top results'
        maxDropdownHeight={800}
      />

      <Select
        style={{ width: panelWidth }}
        data={resultSortOptions.map((group) => ({
          group: group.label,
          items: group.options.map((opt) => ({ value: opt.value, label: opt.label })),
        }))}
        renderOption={({ option }) => {
          const stat = sortKeyToStat[option.value]
          return (
            <Flex align="center" gap={6}>
              {stat && <img src={Assets.getStatIcon(stat)} className={iconClasses.icon20} />}
              <span>{option.label}</span>
            </Flex>
          )
        }}
        value={resultSort}
        onChange={(val) => useOptimizerRequestStore.getState().setResultSort((val ?? undefined) as keyof typeof SortOption | undefined)}
        maxDropdownHeight={900}
        comboboxProps={{ keepMounted: false, styles: { groupLabel: { textAlign: 'center' } } }}
        placeholder={t('CharacterSelector.TargetPlaceholder')} // 'Sorted by'
      />
    </Flex>
  )
}
