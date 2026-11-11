import { Group, Modal, Paper, Stack } from "@mantine/core"
import { IconReplace } from "@tabler/icons-react"
import { ReliquaryArchiverParser } from "lib/importer/importConfig"
import { type V4ParserRelic } from "lib/importer/kelzFormatParser"
import { ScoringType } from "lib/scoring/scoringTypes"
import { useRelicStore } from "lib/stores/relic/relicStore"
import { type BoxRelic } from "lib/tabs/tabImport/scannerStore"
import { RelicPreview } from "lib/tabs/tabRelics/RelicPreview"
import { HeaderText } from "lib/ui/HeaderText"
import { useShallow } from "zustand/react/shallow"

type RelicReconModalProps = {
  relic: BoxRelic | null
  open: boolean
  onClose: () => void
}

export function RelicReconModal({ relic, open, onClose }: RelicReconModalProps) {
  console.info(relic)
  const { reconRelicIdByPart, relicsById } = useRelicStore(useShallow((s) => ({
    relicsById: s.relicsById,
    reconRelicIdByPart: s.reconRelicIdByPart
  })))
  if (!relic) {
    return null
  }
  const slot = reconRelicIdByPart[relic.slot]
  if (!slot) return null
  const currentRelic = relicsById[slot]
  console.info(currentRelic, reconRelicIdByPart)
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
      title='Relic Recon box detected'
      opened={open}
      onClose={onClose}
      centered
      size={540}
    >
      <Group>
        <Stack>
          <HeaderText>Current relic</HeaderText>
          <RelicPreview relic={currentRelic} unhoverable scoringType={ScoringType.NONE} />
        </Stack>
        <IconReplace />
        <Stack>
          <HeaderText>New relic</HeaderText>
          <RelicPreview relic={incomingRelic} unhoverable scoringType={ScoringType.NONE} />
        </Stack>
      </Group>
    </Modal>
  )
}