import { Button } from '@mantine/core'
import {
  hasExEidolon,
  setExEidolon,
} from 'lib/conditionals/exEidolons'
import { getCharacterConfig } from 'lib/conditionals/resolver/characterConfigRegistry'
import { useTranslation } from 'react-i18next'
import {
  type CharacterId,
  ExEidolon,
  type ExFlags,
} from 'types/character'

export function ExEidolonPill({ characterId, mask, onChange }: {
  characterId: CharacterId | null | undefined,
  mask: ExFlags,
  onChange: (mask: ExFlags) => void,
}) {
  const { t } = useTranslation('common')
  if (!characterId || !hasExEidolon(getCharacterConfig(characterId)?.supportedExFlags, ExEidolon.EX1)) return null
  const selected = hasExEidolon(mask, ExEidolon.EX1)
  return (
    <Button
      type='button'
      size='compact-sm'
      miw={46}
      radius='xl'
      variant={selected ? 'filled' : 'default'}
      aria-label={t('ExEidolon1')}
      aria-pressed={selected}
      onClick={() => onChange(setExEidolon(mask, ExEidolon.EX1, !selected))}
    >
      EX1
    </Button>
  )
}
