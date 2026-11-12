import { Group, Modal, Stack } from "@mantine/core"
import { IconReplace } from "@tabler/icons-react"
import { type Parts } from "lib/constants/constants"
import { ReliquaryArchiverParser } from "lib/importer/importConfig"
import type { V4ParserRelic } from "lib/importer/kelzFormatParser"
import { ScoringType } from "lib/scoring/scoringTypes"
import { useRelicStore } from "lib/stores/relic/relicStore"
import type { BoxRelic } from "lib/tabs/tabImport/scannerStore"
import { RelicPreview } from "lib/tabs/tabRelics/RelicPreview"
import { HeaderText } from "lib/ui/HeaderText"
import { useTranslation } from "react-i18next"
import { useShallow } from "zustand/react/shallow"

type RelicReconModalProps = {
  relic: BoxRelic | null
  open: boolean
  onClose: () => void
}

export function RelicReconModal({ relic, open, onClose }: RelicReconModalProps) {
  const { reconRelicIdByPart, relicsById } = useRelicStore(useShallow((s) => ({
    relicsById: s.relicsById,
    reconRelicIdByPart: s.reconRelicIdByPart
  })))
  const { t } = useTranslation('modals', { keyPrefix: 'RelicRecon' })

  if (!relic) {
    return null
  }

  const part = relic.slot.replace(/\s+/g, '') as Parts
  const slot = reconRelicIdByPart[part]
  if (!slot) return null

  const currentRelic = relicsById[slot]
  if (!currentRelic) {
    return null
  }

  const incomingProtoRelic: V4ParserRelic = {
    ...relic,
    location: '',
    lock: false,
    discard: false,
    _uid: 'foo'
  }

  const incomingRelic = ReliquaryArchiverParser.parseRelic(incomingProtoRelic, {})

  return (
    <Modal
      title={t('Title')}
      opened={open}
      onClose={onClose}
      centered
      size='auto'
    >
      <Group>
        <Stack style={{ alignItems: 'center' }}>
          <HeaderText>{t('OriginalRelic')}</HeaderText>
          <RelicPreview relic={currentRelic} unhoverable scoringType={ScoringType.NONE} />
        </Stack>
        <IconReplace />
        <Stack style={{ alignItems: 'center' }}>
          <HeaderText>{t('BoxRelic')}</HeaderText>
          <RelicPreview relic={incomingRelic} unhoverable scoringType={ScoringType.NONE} />
        </Stack>
      </Group>
    </Modal>
  )
}