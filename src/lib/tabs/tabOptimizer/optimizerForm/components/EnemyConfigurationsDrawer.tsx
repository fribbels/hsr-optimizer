import {
  IconCheck,
  IconX,
} from '@tabler/icons-react'
import {
  Drawer,
  Flex,
  Select,
  Switch,
  Typography,
} from 'antd'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { Hint } from 'lib/interactions/hint'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { Utils } from 'lib/utils/utils'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

export const EnemyConfigurationsDrawer = () => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'EnemyConfiguration' })

  const { close: closeEnemyDrawer, isOpen: isOpenEnemyDrawer } = useOpenClose(OpenCloseIDs.ENEMY_DRAWER)

  const enemyLevel = useOptimizerFormStore((s) => s.enemyLevel)
  const enemyResistance = useOptimizerFormStore((s) => s.enemyResistance)
  const enemyEffectResistance = useOptimizerFormStore((s) => s.enemyEffectResistance)
  const enemyMaxToughness = useOptimizerFormStore((s) => s.enemyMaxToughness)
  const enemyCount = useOptimizerFormStore((s) => s.enemyCount)
  const enemyElementalWeak = useOptimizerFormStore((s) => s.enemyElementalWeak)
  const enemyWeaknessBroken = useOptimizerFormStore((s) => s.enemyWeaknessBroken)

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
      placement='right'
      onClose={closeEnemyDrawer}
      open={isOpenEnemyDrawer}
      width={300}
      forceRender
    >
      <Flex vertical gap={5}>
        <Flex justify='space-between' align='center' style={{ marginBottom: 5 }}>
          <HeaderText>{t('StatHeader') /* Enemy stat options */}</HeaderText>
          <TooltipImage type={Hint.enemyOptions()} />
        </Flex>

        <Select
          showSearch
          filterOption={Utils.labelFilterOption}
          options={enemyLevelOptions}
          value={enemyLevel}
          onChange={(val) => useOptimizerFormStore.getState().setEnemyField('enemyLevel', val)}
        />

        <Select
          showSearch
          filterOption={Utils.labelFilterOption}
          options={enemyResistanceOptions}
          value={enemyResistance}
          onChange={(val) => useOptimizerFormStore.getState().setEnemyField('enemyResistance', val)}
        />

        <Select
          showSearch
          filterOption={Utils.labelFilterOption}
          options={enemyEffectResistanceOptions}
          value={enemyEffectResistance}
          onChange={(val) => useOptimizerFormStore.getState().setEnemyField('enemyEffectResistance', val)}
        />

        <Select
          showSearch
          filterOption={Utils.labelFilterOption}
          options={enemyMaxToughnessOptions}
          value={enemyMaxToughness}
          onChange={(val) => useOptimizerFormStore.getState().setEnemyField('enemyMaxToughness', val)}
        />

        <Select
          showSearch
          filterOption={Utils.labelFilterOption}
          options={enemyCountOptions}
          value={enemyCount}
          onChange={(val) => useOptimizerFormStore.getState().setEnemyField('enemyCount', val)}
        />

        <Flex align='center'>
          <Switch
            checkedChildren={<IconCheck />}
            unCheckedChildren={<IconX />}
            checked={enemyElementalWeak}
            onChange={(val) => useOptimizerFormStore.getState().setEnemyField('enemyElementalWeak', val)}
            style={{ width: 45, marginRight: 5 }}
          />
          <Text>{t('WeaknessLabel') /* Elemental weakness */}</Text>
        </Flex>

        <Flex align='center'>
          <Switch
            checkedChildren={<IconCheck />}
            unCheckedChildren={<IconX />}
            checked={enemyWeaknessBroken}
            onChange={(val) => useOptimizerFormStore.getState().setEnemyField('enemyWeaknessBroken', val)}
            style={{ width: 45, marginRight: 5 }}
          />
          <Text>{t('BrokenLabel') /* Weakness broken */}</Text>
        </Flex>
      </Flex>
    </Drawer>
  )
}
