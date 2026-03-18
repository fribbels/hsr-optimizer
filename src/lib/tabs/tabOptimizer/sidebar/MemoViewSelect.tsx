import { SegmentedControl } from '@mantine/core'
import { PathNames } from 'lib/constants/constants'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import React from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'
import type { MemoDisplay } from 'types/store'

export function isRemembrance(characterId: CharacterId | null | undefined) {
  if (!characterId) return false
  return getGameMetadata().characters[characterId].path === PathNames.Remembrance
}

export const MemoViewSelect = React.memo(function MemoViewSelect({ isFullSize }: { isFullSize: boolean }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Sidebar.StatViewGroup' })

  const memoDisplay = useOptimizerRequestStore((s) => s.memoDisplay)
  const setMemoDisplay = useOptimizerRequestStore((s) => s.setMemoDisplay)
  const optimizerTabFocusCharacter = useOptimizerDisplayStore((s) => s.focusCharacterId)

  const hasMemo = isRemembrance(optimizerTabFocusCharacter)

  return (
    <SegmentedControl
      onChange={(value) => setMemoDisplay(value as MemoDisplay)}
      disabled={!hasMemo}
      value={hasMemo ? memoDisplay : 'summoner'}
      fullWidth
      style={{ display: hasMemo || !isFullSize ? 'flex' : 'none' }}
      data={[
        { label: t('SummonerStats') /* Summoner */, value: 'summoner' },
        { label: t('MemospriteStats') /* Memosprite */, value: 'memo' },
      ]}
    />
  )
})
