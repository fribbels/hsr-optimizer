import { SettingOutlined } from '@ant-design/icons'
import { Button, Flex, Form } from 'antd'
import { RelicRestrictionModal } from 'lib/overlays/modals/RelicRestrictionModal'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { HeaderText } from 'lib/ui/HeaderText'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { OptimizerForm } from 'types/form'

export function AdvancedOptionsPanel() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'AdvancedOptions' })
  const setCombatBuffsDrawerOpen = window.store((s) => s.setCombatBuffsDrawerOpen)
  const setEnemyConfigurationsDrawerOpen = window.store((s) => s.setEnemyConfigurationsDrawerOpen)

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
        onClick={() => setCombatBuffsDrawerOpen(true)}
        icon={<SettingOutlined/>}
      >
        {
          buffsActive ? t('CombatBuffsButtonText', { activeCount: buffsActive }) : t('CombatBuffsButtonTextNone')
          // Extra combat buffs (activeCount) / Extra combat buffs
        }
      </Button>
      <Button
        onClick={() => setEnemyConfigurationsDrawerOpen(true)}
        icon={<SettingOutlined/>}
      >
        {t('EnemyConfigButtonText')/* Enemy configurations */}
      </Button>
      <RestrictionButton/>
    </Flex>
  )
}

function RestrictionButton() {
  const state = window.store() // window.store((s) => s.relicsById) doesn't update properly
  const relics = Object.values(state.relicsById)
  const characterId = state.optimizerTabFocusCharacter
  const [restrictionModalOpen, setRestrictionModalOpen] = useState(false)
  window.setRestrictionModalOpen = setRestrictionModalOpen
  return (
    <div>
      <Button
        onClick={() => {
          if (characterId) setRestrictionModalOpen(true)
        }}
        style={{ width: '100%' }}
      >
        Reserved / Excluded relics (
        {
          !characterId
            ? 0
            : relics
              .filter((x) => x.excludedCount)
              .length
        }
        )
      </Button>
      {characterId && (
        <RelicRestrictionModal
          characterId={characterId}
          relics={relics}
          open={restrictionModalOpen}
          setOpen={setRestrictionModalOpen}
        />
      )}
    </div>
  )
}
