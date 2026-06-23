import { useForm } from '@mantine/form'
import { useEhrTuningStore } from 'lib/stores/ehrTuningStore'
import { CalculatorPanel } from 'lib/tabs/tabCalculators/CalculatorPanel'
import {
  calculateApplicationRate,
  calculateRequiredEhr,
} from 'lib/tabs/tabCalculators/ehrCalculations'
import { EhrPanelContent } from 'lib/tabs/tabCalculators/EhrPanelContent'
import { useTranslation } from 'react-i18next'

export function EhrPanel() {
  const { t } = useTranslation('modals', { keyPrefix: 'Calculators.EHR' })

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
    <CalculatorPanel>
      <EhrPanelContent
        form={form}
        applicationRate={applicationRate}
        requiredEhr={requiredEhr}
        t={t}
      />
    </CalculatorPanel>
  )
}
