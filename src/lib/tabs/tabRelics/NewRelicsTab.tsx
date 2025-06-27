import { Flex } from 'antd'
import RelicModal from 'lib/overlays/modals/RelicModal'
import { ControlsBar } from 'lib/tabs/tabRelics/ControlsBar'
import RelicFilterBar from 'lib/tabs/tabRelics/RelicFilterBar'
import { RelicInsightsPanel } from 'lib/tabs/tabRelics/RelicInsightsPanel'
import { RelicPreview } from 'lib/tabs/tabRelics/RelicPreview'
import { RelicsGrid } from 'lib/tabs/tabRelics/RelicsGrid'

export const TAB_WIDTH = 1460

export default function NewRelicsTab() {
  return (
    <Flex style={{ marginBottom: 100, width: TAB_WIDTH }}>
      {
        /*
      <RelicModal onOk={} open={} setOpen={} type='add'/>
      <RelicModal onOk={} open={} setOpen={} type='edit' selectedRelic={}/>
      */
      }
      <Flex vertical gap={10}>
        <RelicFilterBar />
        <RelicsGrid />
        <ControlsBar />
        <Flex gap={10}>
          {
            /*
          <RelicPreview
            relic={}
            setSelectedRelic={}
            setEditModalOpen={}
            score={}
          />
          */
          }
          <RelicInsightsPanel />
        </Flex>
      </Flex>
    </Flex>
  )
}
