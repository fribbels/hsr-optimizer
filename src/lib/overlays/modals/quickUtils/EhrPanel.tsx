import {
  Divider,
  Flex,
  NumberInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import type { SharedProps } from 'lib/overlays/modals/quickUtils/common'
import { HeaderText } from 'lib/ui/HeaderText'
import { localeNumber_00 } from 'lib/utils/i18nUtils'

interface EhrCalcForm {
  effectRes: number
  debuffRes: number
  effectHitRate: number
  baseChance: number
  attempts: number
  desiredHitRate: number
}

const initialValues = {
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

export function EhrPanel({ t }: SharedProps) {
  const form = useForm<EhrCalcForm>({ initialValues })
  const { effectHitRate, effectRes, debuffRes, baseChance, attempts, desiredHitRate } = form.getValues()

  const hitRate = (baseChance / 100)
    * (1 + effectHitRate / 100)
    * (1 - effectRes / 100)
    * (1 - debuffRes / 100)
  const trueHitRate = 100 * (1 - Math.pow(Math.max(0, 1 - hitRate), attempts))

  const requiredHitRate = 100 * (
    (1 - Math.pow(1 - desiredHitRate / 100, 1 / attempts))
      / (1 - debuffRes / 100)
      / (1 - effectRes / 100)
      / (baseChance / 100)
    - 1
  )

  return (
    <form style={{ marginTop: 16, alignSelf: 'center' }}>
      <Flex gap={24}>
        <Flex gap={8} direction='column'>
          <div>
            <HeaderText>{t('EHR.Input.EffectRes')}</HeaderText>
            <NumberInput
              key={form.key('effectRes')}
              {...form.getInputProps('effectRes')}
              {...sharedInputProps}
            />
          </div>
          <div>
            <HeaderText>{t('EHR.Input.DebuffRes')}</HeaderText>
            <NumberInput
              key={form.key('debuffRes')}
              {...form.getInputProps('debuffRes')}
              {...sharedInputProps}
            />
          </div>
          <div>
            <HeaderText>{t('EHR.Input.BaseChance')}</HeaderText>
            <NumberInput
              key={form.key('baseChance')}
              {...form.getInputProps('baseChance')}
              {...sharedInputProps}
            />
          </div>
          <div>
            <HeaderText>{t('EHR.Input.Attempts')}</HeaderText>
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
            <HeaderText>{t('EHR.Input.HitRate')}</HeaderText>
            <NumberInput
              allowNegative={false}
              min={1}
              key={form.key('effectHitRate')}
              {...form.getInputProps('effectHitRate')}
              {...sharedInputProps}
            />
          </div>
          <div>
            <HeaderText>{t('EHR.Output.ApplicationRate')}</HeaderText>
            <span>{localeNumber_00(trueHitRate)}%</span>
          </div>
          <Divider />
          <div>
            <HeaderText>{t('EHR.Input.DesiredHitRate')}</HeaderText>
            <NumberInput
              allowNegative={false}
              min={0}
              key={form.key('desiredHitRate')}
              {...form.getInputProps('desiredHitRate')}
              {...sharedInputProps}
            />
          </div>
          <div>
            <HeaderText>{t('EHR.Output.RequiredHitRate')}</HeaderText>
            <span>{localeNumber_00(requiredHitRate)}%</span>
          </div>
        </Flex>
      </Flex>
    </form>
  )
}
