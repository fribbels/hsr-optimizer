import { Button, Flex, Modal } from '@mantine/core'
import { useTranslation } from 'react-i18next'

export function ManyPermsModal({ manyPermsModalOpen, setManyPermsModalOpen, startSearch }: {
  manyPermsModalOpen: boolean
  setManyPermsModalOpen: (open: boolean) => void
  startSearch: () => void
}) {
  const { t } = useTranslation('modals', { keyPrefix: 'ManyPerms' })
  return (
    <Modal
      title={t('Title') /* Very large search requested */}
      opened={manyPermsModalOpen}
      size={900}
      centered
      onClose={() => setManyPermsModalOpen(false)}
    >
      {manyPermsModalOpen && (
        <Flex justify='space-between' align='center' style={{ height: 45, marginTop: 30, marginBottom: 15 }} gap={16}>
          <div>
            {
              t('Text')
              // This optimization search will take a substantial amount of time to finish.
              // You may want to enable the GPU acceleration setting or limit the search to only certain sets and main stats,
              // or use the Substat weight filter to reduce the number of permutations.
            }
          </div>
          <Button
            onClick={() => setManyPermsModalOpen(false)}
            style={{ width: 250 }}
          >
            {t('Cancel') /* Cancel search */}
          </Button>
          <Button
            onClick={() => {
              setManyPermsModalOpen(false)
              startSearch()
            }}
            style={{ width: 250 }}
          >
            {t('Proceed') /* Proceed with search */}
          </Button>
        </Flex>
      )}
    </Modal>
  )
}
