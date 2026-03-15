import { Combobox, Drawer, Flex, Input, InputBase, Switch, useCombobox } from '@mantine/core'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { Hint } from 'lib/interactions/hint'
import { EnemyConfigFields } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

function setEnemyAndRecalculate<K extends keyof EnemyConfigFields>(field: K, value: EnemyConfigFields[K]) {
  useOptimizerRequestStore.getState().setEnemyField(field, value)
}

export function EnemyConfigurationsDrawer() {
  const { close: closeEnemyDrawer, isOpen: isOpenEnemyDrawer } = useOpenClose(OpenCloseIDs.ENEMY_DRAWER)
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'EnemyConfiguration' })

  return (
    <Drawer
      title={t('Title')} // 'Enemy configurations'
      position='right'
      onClose={closeEnemyDrawer}
      opened={isOpenEnemyDrawer}
      size={300}
    >
      {isOpenEnemyDrawer && <EnemyConfigurationsDrawerContent />}
    </Drawer>
  )
}

function EnemyConfigurationsDrawerContent() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'EnemyConfiguration' })

  const {
    enemyLevel,
    enemyResistance,
    enemyEffectResistance,
    enemyMaxToughness,
    enemyCount,
    enemyElementalWeak,
    enemyWeaknessBroken,
  } = useOptimizerRequestStore(
    useShallow((s) => ({
      enemyLevel: s.enemyLevel,
      enemyResistance: s.enemyResistance,
      enemyEffectResistance: s.enemyEffectResistance,
      enemyMaxToughness: s.enemyMaxToughness,
      enemyCount: s.enemyCount,
      enemyElementalWeak: s.enemyElementalWeak,
      enemyWeaknessBroken: s.enemyWeaknessBroken,
    })),
  )

  const enemyLevelOptions = useMemo(() =>
    Array.from({ length: 100 }, (_, i) => 100 - i).map((level) => ({
      value: level,
      label: t('LevelOptionLabel', { level, defense: 200 + 10 * level }),
    })),
  [t])

  const enemyCountOptions = useMemo(() =>
    [1, 3, 5].map((count) => ({
      value: count,
      label: t('CountOptionLabel', { targetCount: count }),
    })),
  [t])

  const enemyResistanceOptions = useMemo(() =>
    [20, 40, 60].map((res) => ({
      value: res / 100,
      label: t('DmgResOptionLabel', { resistance: res }),
    })),
  [t])

  const enemyEffectResistanceOptions = useMemo(() =>
    [0, 10, 20, 30, 40].map((res) => ({
      value: res / 100,
      label: t('EffResOptionLabel', { resistance: res }),
    })),
  [t])

  const enemyMaxToughnessOptions = useMemo(() =>
    Array.from({ length: Math.ceil(720 / 30) }, (_, i) => 720 - i * 30)
      .filter((v) => v >= 1)
      .map((toughness) => ({
        value: toughness,
        label: t('ToughnessOptionLabel', { toughness: toughness / 3 }),
      })),
  [t])

  return (
    <Flex direction="column" gap={10}>
      <Flex justify='space-between' align='center' style={{ marginBottom: 5 }}>
        <HeaderText>{t('StatHeader') /* Enemy stat options */}</HeaderText>
        <TooltipImage type={Hint.enemyOptions()} />
      </Flex>

      <SearchableCombobox
        data={enemyLevelOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
        value={enemyLevel != null ? String(enemyLevel) : null}
        onChange={(val) => { if (val != null) setEnemyAndRecalculate('enemyLevel', Number(val)) }}
      />

      <SearchableCombobox
        data={enemyResistanceOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
        value={enemyResistance != null ? String(enemyResistance) : null}
        onChange={(val) => { if (val != null) setEnemyAndRecalculate('enemyResistance', Number(val)) }}
      />

      <SearchableCombobox
        data={enemyEffectResistanceOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
        value={enemyEffectResistance != null ? String(enemyEffectResistance) : null}
        onChange={(val) => { if (val != null) setEnemyAndRecalculate('enemyEffectResistance', Number(val)) }}
      />

      <SearchableCombobox
        data={enemyMaxToughnessOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
        value={enemyMaxToughness != null ? String(enemyMaxToughness) : null}
        onChange={(val) => { if (val != null) setEnemyAndRecalculate('enemyMaxToughness', Number(val)) }}
      />

      <SearchableCombobox
        data={enemyCountOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
        value={enemyCount != null ? String(enemyCount) : null}
        onChange={(val) => { if (val != null) setEnemyAndRecalculate('enemyCount', Number(val)) }}
      />

      <Flex align='center'>
        <Switch
          checked={enemyElementalWeak}
          onChange={(event) => setEnemyAndRecalculate('enemyElementalWeak', event.currentTarget.checked)}
          style={{ marginRight: 5 }}
        />
        <div>{t('WeaknessLabel') /* Elemental weakness */}</div>
      </Flex>

      <Flex align='center'>
        <Switch
          checked={enemyWeaknessBroken}
          onChange={(event) => setEnemyAndRecalculate('enemyWeaknessBroken', event.currentTarget.checked)}
          style={{ marginRight: 5 }}
        />
        <div>{t('BrokenLabel') /* Weakness broken */}</div>
      </Flex>
    </Flex>
  )
}

function SearchableCombobox({ data, value, onChange }: {
  data: { value: string; label: string }[]
  value: string | null
  onChange: (val: string | null) => void
}) {
  const [search, setSearch] = useState('')
  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption()
      combobox.focusTarget()
      setSearch('')
    },
    onDropdownOpen: () => {
      combobox.focusSearchInput()
    },
  })

  const selectedLabel = data.find((d) => d.value === value)?.label ?? null

  const filteredOptions = data.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase().trim()),
  )

  return (
    <Combobox
      store={combobox}
      width="target"
      onOptionSubmit={(val) => {
        onChange(val)
        combobox.closeDropdown()
      }}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          pointer
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}
        >
          {selectedLabel || <Input.Placeholder>Select...</Input.Placeholder>}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Search
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder="Search..."
        />
        <Combobox.Options>
          {filteredOptions.length > 0
            ? filteredOptions.map((item) => (
              <Combobox.Option value={item.value} key={item.value} selected={item.value === value}>
                {item.label}
              </Combobox.Option>
            ))
            : <Combobox.Empty>No results</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
