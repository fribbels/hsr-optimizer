import {
  Button,
  Flex,
} from '@mantine/core'
import { IconSettings } from '@tabler/icons-react'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { HeaderText } from 'lib/ui/HeaderText'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export function AdvancedOptionsPanel() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'AdvancedOptions' })
  const setStatTracesDrawerFocusCharacter = useGlobalStore((s) => s.setStatTracesDrawerFocusCharacter)

  // Count the # of active buffs to display
  const formCombatBuffs = useOptimizerRequestStore((s) => s.combatBuffs)
  const buffsActive = useMemo(() => {
    if (!formCombatBuffs) return 0

    return Object.values(formCombatBuffs).filter((x) => x != null && x !== 0).length
  }, [formCombatBuffs])

  return (
    <Flex direction='column' gap={optimizerTabDefaultGap}>
      <HeaderText style={{ marginTop: 25 }}>{t('Header') /* Advanced options */}</HeaderText>

      <Button
        variant='default'
        onClick={() => {
          setOpen(OpenCloseIDs.TRACES_DRAWER)
          setStatTracesDrawerFocusCharacter(useOptimizerDisplayStore.getState().focusCharacterId!)
        }}
        leftSection={<IconSettings size={16} />}
      >
        {t('CustomTracesButtonText') /* Custom stat traces */}
      </Button>

      {/* TODO: TEMPORARILY DISABLED - Extra combat buffs */}
      <Button
        variant='default'
        disabled
        onClick={() => setOpen(OpenCloseIDs.COMBAT_BUFFS_DRAWER)}
        leftSection={<IconSettings size={16} />}
      >
        {
          buffsActive ? t('CombatBuffsButtonText', { activeCount: buffsActive }) : t('CombatBuffsButtonTextNone')
          // Extra combat buffs (activeCount) / Extra combat buffs
        }
      </Button>

      <Button
        variant='default'
        onClick={() => setOpen(OpenCloseIDs.ENEMY_DRAWER)}
        leftSection={<IconSettings size={16} />}
      >
        {t('EnemyConfigButtonText') /* Enemy configurations */}
      </Button>
    </Flex>
  )
}
