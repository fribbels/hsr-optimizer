import { Flex, Modal } from 'antd'
import RelicModal from 'lib/overlays/modals/RelicModal'
import { RelicModalController } from 'lib/overlays/modals/relicModalController'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import { RelicPreview } from 'lib/tabs/tabRelics/RelicPreview'
import { HeaderText } from 'lib/ui/HeaderText'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterId } from 'types/character'
import { Relic } from 'types/relic'

interface RelicRestrictionModalProps {
  characterId: CharacterId
  open: boolean
  setOpen: (open: boolean) => void
  relics: Relic[]
}

export function RelicRestrictionModal(props: RelicRestrictionModalProps) {
  const { t } = useTranslation('gameData', { keyPrefix: 'Characters' })
  const excludedRelics: Relic[] = []
  const reservedRelics: Relic[] = []
  const [selectedRelic, setSelectedRelic] = useState<Relic>()
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false)

  function onEditOk(relic: Relic) {
    const updatedRelic = RelicModalController.onEditOk(selectedRelic!, relic)
    setSelectedRelic(updatedRelic)
  }
  for (const relic of props.relics) {
    switch (relic.filterMode) {
      case 'none':
        break
      case 'reserve':
        relic.reserved === props.characterId ? reservedRelics.push(relic) : excludedRelics.push(relic)
        break
      case 'exclude':
        if (relic.excluded.includes(props.characterId)) excludedRelics.push(relic)
    }
  }
  return (
    <Modal
      width={1000}
      height={700}
      open={props.open}
      onCancel={() => props.setOpen(false)}
      onOk={() => props.setOpen(false)}
    >
      <Flex vertical style={{ height: '100%', width: '100%' }}>
        <HeaderText>Excluded relics ({excludedRelics.length}):</HeaderText>
        <Flex gap={16} style={{ overflowX: 'clip', overflow: 'scroll', height: 300 }}>
          {...(excludedRelics.map((x) => {
            return (
              <Flex key={x.id} style={{ height: 280 }} vertical>
                <RelicPreview
                  relic={x}
                  characterId={props.characterId}
                  withHoverButtons
                  score={RelicScorer.scoreCurrentRelic(x, props.characterId)}
                  setEditModalOpen={setEditModalOpen}
                  setSelectedRelic={setSelectedRelic}
                />
                <Flex align='center' justify='center'>
                  {
                    x.reserved
                      // @ts-ignore
                      ? `reserved for ${t(`${x.reserved}.Name`)}`
                      : ''
                  }
                </Flex>
              </Flex>
            )
          }))}
        </Flex>
        <HeaderText>Reserved relics ({reservedRelics.length}):</HeaderText>
        <Flex gap={16} style={{ overflowX: 'clip', overflow: 'scroll', height: 300 }}>
          {...(reservedRelics.map((x) => {
            return (
              <Flex key={x.id} style={{ height: 280 }}>
                <RelicPreview
                  relic={x}
                  characterId={props.characterId}
                  withHoverButtons
                  score={RelicScorer.scoreCurrentRelic(x, props.characterId)}
                  setEditModalOpen={setEditModalOpen}
                  setSelectedRelic={setSelectedRelic}
                />
              </Flex>
            )
          }))}
        </Flex>
        <RelicModal selectedRelic={selectedRelic} type='edit' onOk={onEditOk} setOpen={setEditModalOpen} open={editModalOpen}/>
      </Flex>
    </Modal>
  )
}
