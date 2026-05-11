import {
  Divider,
  Flex,
  NumberInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { HeaderText } from 'lib/ui/HeaderText'
import { localeNumber_00 } from 'lib/utils/i18nUtils'
import { useTranslation } from 'react-i18next'

interface EhrCalcForm {
  effectRes: number
  debuffRes: number
  effectHitRate: number
  baseChance: number
  attempts: number
  desiredHitRate: number
}

const initialValues: EhrCalcForm = {
  effectRes: 40,
  debuffRes: 0,
  baseChance: 100,
  attempts: 1,
  effectHitRate: 100,
  desiredHitRate: 100,
}

const sharedInputProps: NumberInput.Props = {
  stepHoldDelay: 300,
  stepHoldInterval: 50,
  suffix: '%',
}

export function EhrPanel() {
  const { t } = useTranslation('modals', { keyPrefix: 'QuickUtils.EHR' })
  const form = useForm<EhrCalcForm>({ initialValues })
  const { effectHitRate, effectRes, debuffRes, baseChance, attempts, desiredHitRate } = form.getValues()

  const hitRate = (baseChance / 100)
    * (1 + effectHitRate / 100)
    * (1 - effectRes / 100)
    * (1 - debuffRes / 100)
  const trueHitRate = 100 * (1 - Math.pow(Math.max(0, 1 - hitRate), attempts))

  const canComputeRequired = baseChance > 0 && effectRes < 100 && debuffRes < 100
  const requiredHitRate = canComputeRequired
    ? 100 * (
      (1 - Math.pow(1 - desiredHitRate / 100, 1 / attempts))
        / (1 - debuffRes / 100)
        / (1 - effectRes / 100)
        / (baseChance / 100)
      - 1
    )
    : NaN

  return (
    <form style={{ marginTop: 16, alignSelf: 'center' }}>
      <Flex gap={24}>
        <Flex gap={8} direction='column'>
          <div>
            <HeaderText>{t('Input.EffectRes')}</HeaderText>
            <NumberInput
              key={form.key('effectRes')}
              {...form.getInputProps('effectRes')}
              {...sharedInputProps}
            />
          </div>
          <div>
            <HeaderText>{t('Input.DebuffRes')}</HeaderText>
            <NumberInput
              key={form.key('debuffRes')}
              {...form.getInputProps('debuffRes')}
              {...sharedInputProps}
            />
          </div>
          <div>
            <HeaderText>{t('Input.BaseChance')}</HeaderText>
            <NumberInput
              key={form.key('baseChance')}
              {...form.getInputProps('baseChance')}
              {...sharedInputProps}
              min={0}
            />
          </div>
          <div>
            <HeaderText>{t('Input.Attempts')}</HeaderText>
            <NumberInput
              allowNegative={false}
              min={1}
              key={form.key('attempts')}
              {...form.getInputProps('attempts')}
            />
          </div>
        </Flex>
        <Divider orientation='vertical' />
        <Flex gap={8} direction='column'>
          <div>
            <HeaderText>{t('Input.HitRate')}</HeaderText>
            <NumberInput
              allowNegative={false}
              min={0}
              key={form.key('effectHitRate')}
              {...form.getInputProps('effectHitRate')}
              {...sharedInputProps}
            />
          </div>
          <div>
            <HeaderText>{t('Output.ApplicationRate')}</HeaderText>
            <span>{localeNumber_00(trueHitRate)}%</span>
          </div>
          <Divider />
          <div>
            <HeaderText>{t('Input.DesiredHitRate')}</HeaderText>
            <NumberInput
              allowNegative={false}
              min={0}
              max={100}
              key={form.key('desiredHitRate')}
              {...form.getInputProps('desiredHitRate')}
              {...sharedInputProps}
            />
          </div>
          <div>
            <HeaderText>{t('Output.RequiredHitRate')}</HeaderText>
            <span>{Number.isFinite(requiredHitRate) ? `${localeNumber_00(requiredHitRate)}%` : '-'}</span>
          </div>
        </Flex>
      </Flex>
    </form>
  )
}
