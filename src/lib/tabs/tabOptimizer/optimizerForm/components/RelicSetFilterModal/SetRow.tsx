import { memo, useCallback } from 'react'
import { Text, UnstyledButton } from '@mantine/core'
import { Assets } from 'lib/rendering/assets'
import { setToId } from 'lib/sets/setConfigRegistry'
import type { SetConfig } from 'types/setConfig'
import { useTranslation } from 'react-i18next'
import classes from './RelicSetFilterModal.module.css'

export const SetRow = memo(function SetRow({ config, checked, dimmed, onToggle }: {
  config: SetConfig
  checked: boolean
  dimmed: boolean
  onToggle: (name: string) => void
}) {
  const { t } = useTranslation(['gameData'])
  const name = config.id
  const ingameId = setToId[name]
  const handleClick = useCallback(() => onToggle(name), [onToggle, name])

  return (
    <UnstyledButton
      className={`${classes.setRow} ${checked ? classes.setRowChecked : ''} ${dimmed ? classes.setRowDimmed : ''}`}
      onClick={handleClick}
    >
      <img className={classes.setImg} src={Assets.getSetImage(name)} alt="" />
      <Text size="xs" truncate fw={checked ? 600 : undefined} c={checked ? undefined : 'dimmed'} style={{ flex: 1, minWidth: 0 }}>
        {t(`RelicSets.${ingameId}.Name`)}
      </Text>
    </UnstyledButton>
  )
})
