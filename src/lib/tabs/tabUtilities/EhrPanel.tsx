import {
  Flex,
  Paper,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useEhrTuningStore } from 'lib/stores/ehrTuningStore'
import {
  calculateApplicationRate,
  calculateRequiredEhr,
} from 'lib/tabs/tabUtilities/ehrCalculations'
import { EhrPanelContent } from 'lib/tabs/tabUtilities/EhrPanelContent'
import { useTranslation } from 'react-i18next'

export function EhrPanel() {
  const { t } = useTranslation('modals', { keyPrefix: 'QuickUtils.EHR' })

  const form = useForm({
    initialValues: useEhrTuningStore.getState(),
    onValuesChange(updated) {
      useEhrTuningStore.setState(updated)
    },
  })

  const values = form.getValues()
  const applicationRate = calculateApplicationRate(values)
  const requiredEhr = calculateRequiredEhr(values)

  return (
    <Flex direction="column" gap={16} style={{ alignSelf: 'center' }}>
      <Paper withBorder p={20}>
        <form>
          <EhrPanelContent
            form={form}
            applicationRate={applicationRate}
            requiredEhr={requiredEhr}
            t={t}
          />
        </form>
      </Paper>
    </Flex>
  )
}
