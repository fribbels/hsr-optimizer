import { DoubleRightOutlined } from '@ant-design/icons'
import {
  Flex,
  Modal,
  Typography,
} from 'antd'
import { ReliquaryArchiverParser } from 'lib/importer/importConfig'
import { V4ParserRelic } from 'lib/importer/kelzFormatParser'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { useScannerState } from 'lib/tabs/tabImport/ScannerWebsocketClient'
import { RelicPreview } from 'lib/tabs/tabRelics/RelicPreview'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

interface RelicRerollModalProps {
  open: boolean
  onClose: () => void
  relic: V4ParserRelic | null
}

export default function RelicRerollModal({ open, onClose, relic }: RelicRerollModalProps) {
  const { t } = useTranslation('modals', { keyPrefix: 'RelicReroll' })
  const activatedBuffs = useScannerState((s) => s.activatedBuffs)

  if (!relic || !relic.reroll_substats) {
    return null
  }

  const originalRelic = ReliquaryArchiverParser.parseRelic(relic, activatedBuffs, relic.substats)
  const rerolledRelic = ReliquaryArchiverParser.parseRelic(relic, activatedBuffs, relic.reroll_substats)

  if (!originalRelic || !rerolledRelic) {
    return null
  }

  return (
    <Modal
      title={t('Title') /* Relic Reroll Detected */}
      open={open}
      onOk={onClose}
      cancelButtonProps={{ style: { display: 'none' } }}
      centered
      width={540}
    >
      <Flex vertical gap={16}>
        <Flex gap={16} justify='space-between'>
          <Flex vertical align='center' gap={4}>
            <RelicPreview
              relic={originalRelic}
              score={originalRelic.equippedBy ? RelicScorer.scoreCurrentRelic(originalRelic, originalRelic.equippedBy) : undefined}
              scoringType={originalRelic.equippedBy ? ScoringType.SUBSTAT_SCORE : ScoringType.NONE}
              unhoverable
            />
            <Text strong>{t('OriginalSubstats') /* Original Substats */}</Text>
          </Flex>

          <DoubleRightOutlined style={{ fontSize: '24px' }} />

          <Flex vertical align='center' gap={4}>
            <RelicPreview
              relic={rerolledRelic}
              score={rerolledRelic.equippedBy ? RelicScorer.scoreCurrentRelic(rerolledRelic, rerolledRelic.equippedBy) : undefined}
              scoringType={rerolledRelic.equippedBy ? ScoringType.SUBSTAT_SCORE : ScoringType.NONE}
              unhoverable
            />
            <Text strong>{t('RerolledSubstats') /* Rerolled Substats */}</Text>
          </Flex>
        </Flex>
      </Flex>
    </Modal>
  )
}
