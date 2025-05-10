import { SettingOutlined } from '@ant-design/icons'
import { Button, Flex, Form } from 'antd'
import { OpenCloseIDs, useOpenClose } from 'lib/hooks/useOpenClose'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { HeaderText } from 'lib/ui/HeaderText'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { OptimizerForm } from 'types/form'

export const AdvancedOptionsPanel = () => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'AdvancedOptions' })
  const { open: openEnemyDrawer, close: closeEnemyDrawer, isOpen: isOpenEnemyDrawer } = useOpenClose(OpenCloseIDs.ENEMY_DRAWER)
  const { open: openBuffsDrawer, close: closeBuffsDrawer, isOpen: isOpenBuffsDrawer } = useOpenClose(OpenCloseIDs.COMBAT_BUFFS_DRAWER)
  const { open: openTracesDrawer, close: closeTracesDrawer, isOpen: isOpenTracesDrawer } = useOpenClose(OpenCloseIDs.TRACES_DRAWER)

  const setStatTracesDrawerFocusCharacter = window.store((s) => s.setStatTracesDrawerFocusCharacter)

  // Count the # of active buffs to display
  const formCombatBuffs = Form.useWatch((values: OptimizerForm) => values.combatBuffs, window.optimizerForm)
  const buffsActive = useMemo(() => {
    if (!formCombatBuffs) return 0

    return Object.values(formCombatBuffs).filter((x) => x != null).length
  }, [formCombatBuffs])

  return (
    <Flex vertical gap={optimizerTabDefaultGap}>
      <HeaderText style={{ marginTop: 25 }}>{t('Header')/* Advanced options */}</HeaderText>

      <Button
        onClick={() => {
          openTracesDrawer()
          setStatTracesDrawerFocusCharacter(window.store.getState().optimizerTabFocusCharacter!)
        }}
        icon={<SettingOutlined/>}
      >
        {t('CustomTracesButtonText')/* Custom stat traces */}
      </Button>

      <Button
        onClick={openBuffsDrawer}
        icon={<SettingOutlined/>}
      >
        {
          buffsActive ? t('CombatBuffsButtonText', { activeCount: buffsActive }) : t('CombatBuffsButtonTextNone')
          // Extra combat buffs (activeCount) / Extra combat buffs
        }
      </Button>

      <Button
        onClick={openEnemyDrawer}
        icon={<SettingOutlined/>}
      >
        {t('EnemyConfigButtonText')/* Enemy configurations */}
      </Button>
    </Flex>
  )
}
