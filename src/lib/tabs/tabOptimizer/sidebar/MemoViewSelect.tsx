import { SegmentedControl } from '@mantine/core'
import { PathNames } from 'lib/constants/constants'
import DB from 'lib/state/db'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { useOptimizerUIStore } from 'lib/stores/optimizerUI/useOptimizerUIStore'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { CharacterId } from 'types/character'
import { MemoDisplay } from 'types/store'

export function isRemembrance(characterId: CharacterId | null | undefined) {
  if (!characterId) return false
  return DB.getMetadata().characters[characterId].path === PathNames.Remembrance
}

export const MemoViewSelect = React.memo(function MemoViewSelect(props: { isFullSize: boolean }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Sidebar.StatViewGroup' })

  const { memoDisplay } = useOptimizerFormStore(
    useShallow((s) => ({
      memoDisplay: s.memoDisplay,
    })),
  )
  const setMemoDisplay = useOptimizerFormStore((s) => s.setMemoDisplay)
  const optimizerTabFocusCharacter = useOptimizerUIStore((s) => s.focusCharacterId)

  const hasMemo = isRemembrance(optimizerTabFocusCharacter)

  return (
    <SegmentedControl
      onChange={(value) => setMemoDisplay(value as MemoDisplay)}
      disabled={!hasMemo}
      value={hasMemo ? memoDisplay : 'summoner'}
      fullWidth
      style={{ display: hasMemo || !props.isFullSize ? 'flex' : 'none' }}
      data={[
        { label: t('SummonerStats') /* Summoner */, value: 'summoner' },
        { label: t('MemospriteStats') /* Memosprite */, value: 'memo' },
      ]}
    />
  )
})
