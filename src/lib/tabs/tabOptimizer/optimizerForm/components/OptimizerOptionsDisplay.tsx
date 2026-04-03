import { CheckIcon, Combobox, Flex, Group, Input, InputBase, SegmentedControl, Select, Switch, useCombobox } from '@mantine/core'

import { Hint } from 'lib/interactions/hint'
import { Assets } from 'lib/rendering/assets'
import iconClasses from 'style/icons.module.css'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { generateCharacterList } from 'lib/rendering/displayUtils'
import { getCharacterById, useCharacterStore } from 'lib/stores/character/characterStore'
import type { RelicFilterFields } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import {
  optimizerTabDefaultGap,
  panelWidth,
} from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { HeaderText } from 'lib/ui/HeaderText'
import { MultiSelectPills } from 'lib/ui/MultiSelectPills'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { memo, type ReactElement, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './OptimizerOptionsDisplay.module.css'

function PriorityCombobox(props: {
  options: { value: string; label: string; characterId: string }[]
  rank: number | undefined
  placeholder: string
}) {
  const { options, rank, placeholder } = props
  const [search, setSearch] = useState('')

  const combobox = useCombobox({
    onDropdownOpen: () => combobox.focusSearchInput(),
    onDropdownClose: () => {
      combobox.resetSelectedOption()
      setSearch('')
    },
  })

  const rankStr = rank != null ? String(rank) : null

  const selectedLabel = rank != null ? `# ${rank + 1}` : null

  const filteredOptions = useMemo(() => {
    const lowerSearch = search.toLowerCase().trim()
    if (!lowerSearch) return options
    return options.filter((opt) => opt.label.toLowerCase().includes(lowerSearch))
  }, [options, search])

  return (
    <Combobox
      store={combobox}
      width={300}
      onOptionSubmit={(val) => {
        const numVal = Number(val)
        useOptimizerRequestStore.getState().setRelicFilterField('rank', numVal)
        const characterId = useOptimizerRequestStore.getState().characterId
        if (characterId && getCharacterById(characterId)) {
          useCharacterStore.getState().insertCharacter(characterId, numVal)
        }
        combobox.closeDropdown()
      }}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          size="xs"
          pointer
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}
          style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
        >
          {selectedLabel || <Input.Placeholder>{placeholder}</Input.Placeholder>}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Search
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder={placeholder}
        />
        <Combobox.Options mah={500} style={{ overflowY: 'auto' }}>
          {combobox.dropdownOpened && filteredOptions.map((opt) => (
            <Combobox.Option key={opt.value} value={opt.value} active={opt.value === rankStr} style={{ whiteSpace: 'nowrap' }}>
              <Group gap={6} justify='space-between' wrap='nowrap'>
                <Flex align='center' gap={10}>
                  <img src={Assets.getCharacterAvatarById(opt.characterId)} className={iconClasses.icon22} />
                  {opt.label}
                </Flex>
                {opt.value === rankStr && <CheckIcon size={12} />}
              </Group>
            </Combobox.Option>
          ))}
          {combobox.dropdownOpened && filteredOptions.length === 0 && <Combobox.Empty>No results</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}

function setFilterAndRecalculate<K extends keyof RelicFilterFields>(field: K, value: RelicFilterFields[K]) {
  useOptimizerRequestStore.getState().setRelicFilterField(field, value)
}

export const OptimizerOptionsDisplay = memo(function OptimizerOptionsDisplay(): ReactElement {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'OptimizerOptions' })
  const { t: tCharacters } = useTranslation('gameData', { keyPrefix: 'Characters' })
  const characters = useCharacterStore((s) => s.characters)
  const optimizerTabFocusCharacter = useOptimizerDisplayStore((s) => s.focusCharacterId)

  const includeEquippedRelics = useOptimizerRequestStore((s) => s.includeEquippedRelics)
  const rankFilter = useOptimizerRequestStore((s) => s.rankFilter)
  const keepCurrentRelics = useOptimizerRequestStore((s) => s.keepCurrentRelics)
  const rank = useOptimizerRequestStore((s) => s.rank)
  const exclude = useOptimizerRequestStore((s) => s.exclude)
  const enhance = useOptimizerRequestStore((s) => s.enhance)
  const grade = useOptimizerRequestStore((s) => s.grade)
  const mainStatUpscaleLevel = useOptimizerRequestStore((s) => s.mainStatUpscaleLevel)
  const deprioritizeBuffs = useOptimizerRequestStore((s) => s.deprioritizeBuffs)

  const characterExcludeOptions = useMemo(() =>
    generateCharacterList(
      {
        currentCharacters: characters,
        excludeCharacters: [getCharacterById(optimizerTabFocusCharacter!)!],
        withNobodyOption: false,
        longNameLabel: true,
      },
      tCharacters,
    ), [characters, optimizerTabFocusCharacter, tCharacters])

  const characterPriorityOptions = useMemo(() => {
    return characters.map((x, i) => {
      return {
        value: String(i),
        label: t('Priority.Label', { rank: i + 1, id: x.id }),
        characterId: x.id,
      }
    })
  }, [characters, t])

  return (
    <Flex direction="column">
      <Flex direction="column" gap={optimizerTabDefaultGap}>
        <Flex justify='space-between' align='center'>
          <HeaderText>{t('Header') /* Optimizer options */}</HeaderText>
          <TooltipImage type={Hint.optimizerOptions()} />
        </Flex>

        <Flex align='center'>
          <Switch
            checked={includeEquippedRelics}
            onChange={(event) => setFilterAndRecalculate('includeEquippedRelics', event.currentTarget.checked)}
            className={classes.switchRow}
          />
          <div>{t('AllowEquipped') /* Allow equipped relics */}</div>
        </Flex>

        <Flex align='center'>
          <Switch
            checked={rankFilter}
            onChange={(event) => setFilterAndRecalculate('rankFilter', event.currentTarget.checked)}
            className={classes.switchRow}
          />
          <div>{t('PriorityFilter') /* Character priority filter */}</div>
        </Flex>

        <Flex align='center'>
          <Switch
            checked={keepCurrentRelics}
            onChange={(event) => setFilterAndRecalculate('keepCurrentRelics', event.currentTarget.checked)}
            className={classes.switchRow}
          />
          <div>{t('KeepCurrent') /* Keep current relics */}</div>
        </Flex>

        <Flex gap={optimizerTabDefaultGap} className={classes.sectionSpacerTop}>
          <Flex direction="column" gap={2}>
            <HeaderText>
              {t('Priority.Header') /* Priority */}
            </HeaderText>
            <PriorityCombobox
              options={characterPriorityOptions}
              rank={rank}
              placeholder={t('Priority.Header') /* Priority */}
            />
          </Flex>
          <Flex direction="column" gap={2}>
            <HeaderText>
              {t('Exclude') /* Exclude */}
            </HeaderText>
            <MultiSelectPills
              height={30}
              style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
              dropdownWidth={250}
              maxDropdownHeight={500}
              maxDisplayedValues={0}
              clearable
              searchable
              placeholder={t('Exclude') /* Exclude */}
              renderOption={(option) => (
                <Flex align='center' gap={10}>
                  <img src={Assets.getCharacterAvatarById(option.value)} className={iconClasses.icon22} />
                  {option.label}
                </Flex>
              )}
              data={characterExcludeOptions.map((opt) => ({ value: opt.value, label: opt.title }))}
              value={exclude}
              onChange={(val) => setFilterAndRecalculate('exclude', val as typeof exclude)}
            />
          </Flex>
        </Flex>

        <Flex justify='space-between'>
          <Flex direction="column" gap={2}>
            <HeaderText>
              {t('MinEnhance.Header') /* Min enhance */}
            </HeaderText>
            <Select
              style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
              value={enhance != null ? String(enhance) : null}
              onChange={(val) => {
                if (val == null) return
                setFilterAndRecalculate('enhance', Number(val))
              }}
              data={[
                { value: '0', label: t('MinEnhance.Label0') }, // '+0'
                { value: '3', label: t('MinEnhance.Label3') }, // '+3'
                { value: '6', label: t('MinEnhance.Label6') }, // '+6'
                { value: '9', label: t('MinEnhance.Label9') }, // '+9'
                { value: '12', label: t('MinEnhance.Label12') }, // '+12'
                { value: '15', label: t('MinEnhance.Label15') }, // '+15'
              ]}
            />
          </Flex>

          <Flex direction="column" gap={2}>
            <HeaderText>
              {t('MinRarity.Header') /* Min rarity */}
            </HeaderText>
            <Select
              style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
              value={grade != null ? String(grade) : null}
              onChange={(val) => {
                if (val == null) return
                setFilterAndRecalculate('grade', Number(val))
              }}
              data={[
                { value: '2', label: t('MinRarity.Label2') }, // '2 ★ +'
                { value: '3', label: t('MinRarity.Label3') }, // '3 ★ +'
                { value: '4', label: t('MinRarity.Label4') }, // '4 ★ +'
                { value: '5', label: t('MinRarity.Label5') }, // '5 ★'
              ]}
            />
          </Flex>
        </Flex>

        <Flex justify='space-between' align='center'>
          <Flex direction="column" gap={2}>
            <HeaderText>
              {t('BoostMain.Header') /* Boost main stat */}
            </HeaderText>
            <Select
              style={{ width: (panelWidth - optimizerTabDefaultGap) / 2 }}
              value={mainStatUpscaleLevel != null ? String(mainStatUpscaleLevel) : null}
              onChange={(val) => {
                if (val == null) return
                setFilterAndRecalculate('mainStatUpscaleLevel', Number(val))
              }}
              data={[
                { value: '0', label: t('BoostMain.Label0') }, // '+0'
                { value: '3', label: t('BoostMain.Label3') }, // '+3'
                { value: '6', label: t('BoostMain.Label6') }, // '+6'
                { value: '9', label: t('BoostMain.Label9') }, // '+9'
                { value: '12', label: t('BoostMain.Label12') }, // '+12'
                { value: '15', label: t('BoostMain.Label15') }, // '+15'
              ]}
            />
          </Flex>
        </Flex>

        <Flex align='center' className={classes.dpsModeSection}>
          <Flex direction="column" gap={2} className={classes.dpsModeColumn}>
            <HeaderText>
              {t('DPSMode.Header') /* DPS Mode */}
            </HeaderText>
            <SegmentedControl
              fullWidth
              value={String(deprioritizeBuffs)}
              onChange={(value) => useOptimizerRequestStore.getState().setDeprioritizeBuffs(value === 'true')}
              data={[
                { label: t('DPSMode.Main') /* Main */, value: 'false' },
                { label: t('DPSMode.Sub') /* Sub */, value: 'true' },
              ]}
            />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
})
