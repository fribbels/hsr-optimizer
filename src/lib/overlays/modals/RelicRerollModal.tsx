import {
  Flex,
  Modal,
  Text,
} from '@mantine/core'
import { IconChevronsRight } from '@tabler/icons-react'
import { ReliquaryArchiverParser } from 'lib/importer/importConfig'
import { type V4ParserRelic } from 'lib/importer/kelzFormatParser'
import { RelicScorer } from 'lib/relics/scoring/relicScorer'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { useScannerState } from 'lib/tabs/tabImport/ScannerWebsocketClient'
import { RelicPreview } from 'lib/tabs/tabRelics/RelicPreview'
import { useTranslation } from 'react-i18next'

interface RelicRerollModalProps {
  open: boolean
  onClose: () => void
  relic: V4ParserRelic | null
}

export function RelicRerollModal({ open, onClose, relic }: RelicRerollModalProps) {
  const { t } = useTranslation('modals', { keyPrefix: 'RelicReroll' })
  return (
    <Modal
      title={t('Title') /* Relic Reroll Detected */}
      opened={open}
      onClose={onClose}
      centered
      size={540}
    >
      {open && relic && <RelicRerollModalContent relic={relic} />}
    </Modal>
  )
}

function RelicRerollModalContent({ relic }: { relic: V4ParserRelic }) {
  const { t } = useTranslation('modals', { keyPrefix: 'RelicReroll' })
  const activatedBuffs = useScannerState((s) => s.activatedBuffs)

  if (!relic.reroll_substats) {
    return null
  }

  const originalRelic = ReliquaryArchiverParser.parseRelic(relic, activatedBuffs, relic.substats)
  const rerolledRelic = ReliquaryArchiverParser.parseRelic(relic, activatedBuffs, relic.reroll_substats)

  if (!originalRelic || !rerolledRelic) {
    return null
  }

  return (
    <Flex direction='column' gap={16}>
      <Flex gap={16} justify='space-between'>
        <Flex direction='column' align='center' gap={4}>
          <RelicPreview
            relic={originalRelic}
            score={originalRelic.equippedBy ? RelicScorer.scoreCurrentRelic(originalRelic, originalRelic.equippedBy) : undefined}
            scoringType={originalRelic.equippedBy ? ScoringType.SUBSTAT_SCORE : ScoringType.NONE}
            unhoverable
          />
          <Text fw={700}>{t('OriginalSubstats') /* Original Substats */}</Text>
        </Flex>

        <IconChevronsRight size={24} />

        <Flex direction='column' align='center' gap={4}>
          <RelicPreview
            relic={rerolledRelic}
            score={rerolledRelic.equippedBy ? RelicScorer.scoreCurrentRelic(rerolledRelic, rerolledRelic.equippedBy) : undefined}
            scoringType={rerolledRelic.equippedBy ? ScoringType.SUBSTAT_SCORE : ScoringType.NONE}
            unhoverable
          />
          <Text fw={700}>{t('RerolledSubstats') /* Rerolled Substats */}</Text>
        </Flex>
      </Flex>
    </Flex>
  )
}
