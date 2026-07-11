import { Modal } from '@mantine/core'
import {
  IconTriangleInvertedFilled,
} from '@tabler/icons-react'
import modalClasses from 'lib/overlays/modals/relicModal/RelicModal.module.css'
import { RelicModalContent } from 'lib/overlays/modals/relicModal/RelicModalContent'
import { useRelicModalStore } from 'lib/overlays/modals/relicModal/relicModalStore'

export function RelicModal() {
  const open = useRelicModalStore((s) => s.open)
  const closeOverlay = useRelicModalStore((s) => s.closeOverlay)
  const prev = useRelicModalStore((s) => s.config?.prev)
  const next = useRelicModalStore((s) => s.config?.next)

  return (
    <div>
      <Modal
        size={560}
        centered
        opened={open}
        onClose={closeOverlay}
      >
        {open && <RelicModalContent />}
      </Modal>
      {open && prev && (
        <IconTriangleInvertedFilled
          size={24}
          onClick={prev}
          className={modalClasses.navArrowLeft}
        />
      )}
      {open && next && (
        <IconTriangleInvertedFilled
          size={24}
          onClick={next}
          className={modalClasses.navArrowRight}
        />
      )}
    </div>
  )
}
