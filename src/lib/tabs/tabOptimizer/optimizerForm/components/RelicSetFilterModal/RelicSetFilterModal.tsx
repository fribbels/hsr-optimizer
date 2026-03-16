import { Modal } from '@mantine/core'
import { OpenCloseIDs, useOpenClose } from 'lib/hooks/useOpenClose'
import { RelicSetFilterModalContent } from './RelicSetFilterModalContent'

export function RelicSetFilterModal() {
  const { isOpen, close } = useOpenClose(OpenCloseIDs.RELIC_SET_FILTER_MODAL)

  return (
    <Modal
      opened={isOpen}
      onClose={close}
      title="Relic & Ornament Set Filter"
      size={900}
      centered
    >
      {isOpen && <RelicSetFilterModalContent close={close} />}
    </Modal>
  )
}
