import {
  Button,
  Group,
  Text,
} from '@mantine/core'
import { STAT_TAG_TO_SETS } from 'lib/sets/setConfigRegistry'
import { useTranslation } from 'react-i18next'
import type { TwoPieceSlot } from 'lib/stores/optimizerForm/setFilterTypes'
import { TwoPieceSlotType, TwoPieceStatTags } from 'lib/stores/optimizerForm/setFilterTypes'

const chipStyles = { label: { fontSize: 12, fontWeight: 'normal' } } as const

export function StatChips({ slotA, onPick }: {
  slotA: TwoPieceSlot | null,
  onPick: (slot: TwoPieceSlot) => void,
}) {
  const { t } = useTranslation('common')

  return (
    <Group wrap='wrap' gap={10}>
      {TwoPieceStatTags.map((tag) => {
        const count = STAT_TAG_TO_SETS[tag]?.length ?? 0
        return (
          <Button
            key={tag}
            variant='outline'
            size='compact-xs'
            radius='xl'
            styles={chipStyles}
            onClick={() => onPick({ type: TwoPieceSlotType.Stat, value: tag })}
          >
            {t(`ShortStats.${tag}`)}
            <Text span size='xs' c='dimmed' ml={4}>×{count}</Text>
          </Button>
        )
      })}
      {slotA && (
        <Button
          variant='default'
          size='compact-xs'
          radius='xl'
          styles={chipStyles}
          onClick={() => onPick({ type: TwoPieceSlotType.Any })}
        >
          Any
        </Button>
      )}
    </Group>
  )
}
