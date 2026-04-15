import {
  Drawer,
  Flex,
  Switch,
} from '@mantine/core'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { Hint } from 'lib/interactions/hint'
import type { EnemyConfigFields } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { HeaderText } from 'lib/ui/HeaderText'
import { SearchableCombobox } from 'lib/ui/SearchableCombobox'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { useMemo } from 'react'
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
    })), [t])

  const enemyCountOptions = useMemo(() =>
    [1, 3, 5].map((count) => ({
      value: count,
      label: t('CountOptionLabel', { targetCount: count }),
    })), [t])

  const enemyResistanceOptions = useMemo(() =>
    [20, 40, 60].map((res) => ({
      value: res / 100,
      label: t('DmgResOptionLabel', { resistance: res }),
    })), [t])

  const enemyEffectResistanceOptions = useMemo(() =>
    [0, 10, 20, 30, 40].map((res) => ({
      value: res / 100,
      label: t('EffResOptionLabel', { resistance: res }),
    })), [t])

  const enemyMaxToughnessOptions = useMemo(() =>
    Array.from({ length: Math.ceil(720 / 30) }, (_, i) => 720 - i * 30)
      .filter((v) => v >= 1)
      .map((toughness) => ({
        value: toughness,
        label: t('ToughnessOptionLabel', { toughness: toughness / 3 }),
      })), [t])

  return (
    <Flex direction='column' gap={10}>
      <Flex justify='space-between' align='center' style={{ marginBottom: 5 }}>
        <HeaderText>{t('StatHeader') /* Enemy stat options */}</HeaderText>
        <TooltipImage type={Hint.enemyOptions()} />
      </Flex>

      <SearchableCombobox
        options={enemyLevelOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
        value={enemyLevel != null ? String(enemyLevel) : null}
        onChange={(val) => {
          if (val != null) setEnemyAndRecalculate('enemyLevel', Number(val))
        }}
      />

      <SearchableCombobox
        options={enemyMaxToughnessOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
        value={enemyMaxToughness != null ? String(enemyMaxToughness) : null}
        onChange={(val) => {
          if (val != null) setEnemyAndRecalculate('enemyMaxToughness', Number(val))
        }}
      />

      <SearchableCombobox
        searchable={false}
        options={enemyResistanceOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
        value={enemyResistance != null ? String(enemyResistance) : null}
        onChange={(val) => {
          if (val != null) setEnemyAndRecalculate('enemyResistance', Number(val))
        }}
      />

      <SearchableCombobox
        searchable={false}
        options={enemyEffectResistanceOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
        value={enemyEffectResistance != null ? String(enemyEffectResistance) : null}
        onChange={(val) => {
          if (val != null) setEnemyAndRecalculate('enemyEffectResistance', Number(val))
        }}
      />

      <SearchableCombobox
        searchable={false}
        options={enemyCountOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
        value={enemyCount != null ? String(enemyCount) : null}
        onChange={(val) => {
          if (val != null) setEnemyAndRecalculate('enemyCount', Number(val))
        }}
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
