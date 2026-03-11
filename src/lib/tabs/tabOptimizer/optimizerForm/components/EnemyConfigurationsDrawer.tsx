import {
  IconCheck,
  IconX,
} from '@tabler/icons-react'
import { Drawer, Flex, Select, Switch, Text } from '@mantine/core'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { Hint } from 'lib/interactions/hint'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

export const EnemyConfigurationsDrawer = () => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'EnemyConfiguration' })

  const { close: closeEnemyDrawer, isOpen: isOpenEnemyDrawer } = useOpenClose(OpenCloseIDs.ENEMY_DRAWER)

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

  const enemyLevelOptions = useMemo(() => {
    const options: { value: number; label: string }[] = []
    for (let i = 100; i >= 1; i--) {
      options.push({
        value: i,
        label: t('LevelOptionLabel', { level: i, defense: 200 + 10 * i }), // `Lv. ${i} - ${200 + 10 * i} DEF`,
      })
    }

    return options
  }, [t])

  const enemyCountOptions = useMemo(() => {
    const options: { value: number; label: string }[] = []
    for (let i = 1; i <= 5; i += 2) {
      options.push({
        value: i,
        label: t('CountOptionLabel', { targetCount: i }), // `${i} target${i > 1 ? 's' : ''}`,
      })
    }

    return options
  }, [t])

  const enemyResistanceOptions = useMemo(() => {
    const options: { value: number; label: string }[] = []
    for (let i = 20; i <= 60; i += 20) {
      options.push({
        value: i / 100,
        label: t('DmgResOptionLabel', { resistance: i }), // `${i}% Damage RES`,
      })
    }

    return options
  }, [t])

  const enemyEffectResistanceOptions = useMemo(() => {
    const options: { value: number; label: string }[] = []
    for (let i = 0; i <= 40; i += 10) {
      options.push({
        value: i / 100,
        label: t('EffResOptionLabel', { resistance: i }), // `${i}% Effect RES`,
      })
    }

    return options
  }, [t])

  const enemyMaxToughnessOptions = useMemo(() => {
    const options: { value: number; label: string }[] = []
    for (let i = 720; i >= 1; i -= 30) {
      options.push({
        value: i,
        label: t('ToughnessOptionLabel', { toughness: i / 3 }), // `${i} max toughness`,
      })
    }

    return options
  }, [t])

  return (
    <Drawer
      title={t('Title')} // 'Enemy configurations'
      position='right'
      onClose={closeEnemyDrawer}
      opened={isOpenEnemyDrawer}
      size={300}
    >
      <Flex direction="column" gap={5}>
        <Flex justify='space-between' align='center' style={{ marginBottom: 5 }}>
          <HeaderText>{t('StatHeader') /* Enemy stat options */}</HeaderText>
          <TooltipImage type={Hint.enemyOptions()} />
        </Flex>

        <Select
          searchable
          data={enemyLevelOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
          value={enemyLevel != null ? String(enemyLevel) : null}
          onChange={(val) => { if (val != null) useOptimizerRequestStore.getState().setEnemyField('enemyLevel', Number(val)) }}
        />

        <Select
          searchable
          data={enemyResistanceOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
          value={enemyResistance != null ? String(enemyResistance) : null}
          onChange={(val) => { if (val != null) useOptimizerRequestStore.getState().setEnemyField('enemyResistance', Number(val)) }}
        />

        <Select
          searchable
          data={enemyEffectResistanceOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
          value={enemyEffectResistance != null ? String(enemyEffectResistance) : null}
          onChange={(val) => { if (val != null) useOptimizerRequestStore.getState().setEnemyField('enemyEffectResistance', Number(val)) }}
        />

        <Select
          searchable
          data={enemyMaxToughnessOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
          value={enemyMaxToughness != null ? String(enemyMaxToughness) : null}
          onChange={(val) => { if (val != null) useOptimizerRequestStore.getState().setEnemyField('enemyMaxToughness', Number(val)) }}
        />

        <Select
          searchable
          data={enemyCountOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
          value={enemyCount != null ? String(enemyCount) : null}
          onChange={(val) => { if (val != null) useOptimizerRequestStore.getState().setEnemyField('enemyCount', Number(val)) }}
        />

        <Flex align='center'>
          <Switch
            onLabel={<IconCheck />}
            offLabel={<IconX />}
            checked={enemyElementalWeak}
            onChange={(event) => useOptimizerRequestStore.getState().setEnemyField('enemyElementalWeak', event.currentTarget.checked)}
            style={{ width: 45, marginRight: 5 }}
          />
          <Text>{t('WeaknessLabel') /* Elemental weakness */}</Text>
        </Flex>

        <Flex align='center'>
          <Switch
            onLabel={<IconCheck />}
            offLabel={<IconX />}
            checked={enemyWeaknessBroken}
            onChange={(event) => useOptimizerRequestStore.getState().setEnemyField('enemyWeaknessBroken', event.currentTarget.checked)}
            style={{ width: 45, marginRight: 5 }}
          />
          <Text>{t('BrokenLabel') /* Weakness broken */}</Text>
        </Flex>
      </Flex>
    </Drawer>
  )
}
