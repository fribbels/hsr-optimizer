import { Divider, NumberInput, Select } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import type { TFunction } from 'i18next'
import { EHR_TUNING_DEFAULTS, type EhrTuningForm } from 'lib/stores/ehrTuningStore'
import { calculatePerAttemptRate } from 'lib/tabs/tabUtilities/ehrCalculations'
import { EhrGrid } from 'lib/tabs/tabUtilities/ehrViz/EhrGrid'
import { HeaderText } from 'lib/ui/HeaderText'
import { PanelSection } from 'lib/ui/PanelSection'
import { localeNumber_00 } from 'lib/utils/i18nUtils'
import { useMemo, useState } from 'react'
import sharedClasses from './CalculatorPanel.module.css'
import localClasses from './EhrPanelContent.module.css'

const classes = { ...sharedClasses, ...localClasses }

export interface EhrVizProps {
  baseChance: number
  effectHitRate: number
  effectRes: number
  debuffRes: number
  attempts: number
  windowHalf: number
}

export interface EhrPanelContentProps {
  form: UseFormReturnType<EhrTuningForm>
  applicationRate: number
  requiredEhr: number
  t: TFunction<'modals', 'QuickUtils.EHR'>
}

type EhrForm = UseFormReturnType<EhrTuningForm>


const inputProps: NumberInput.Props = {
  stepHoldDelay: 300,
  stepHoldInterval: 50,
  suffix: '%',
  hideControls: true,
  w: '100%',
}

const EFFECT_RES_OPTIONS = [
  { value: '0', label: '0%' },
  { value: '10', label: '10%' },
  { value: '20', label: '20%' },
  { value: '30', label: '30%' },
  { value: '40', label: '40%' },
  { value: '50', label: '50%' },
  { value: '60', label: '60%' },
  { value: '70', label: '70%' },
  { value: '80', label: '80%' },
]

const DEBUFF_RES_OPTIONS = [
  { value: '0', label: '0%' },
  { value: '25', label: '25%' },
  { value: '50', label: '50%' },
  { value: '75', label: '75%' },
  { value: '100', label: '100%' },
]

const RANGE_OPTIONS = Array.from({ length: 10 }, (_, i) => {
  const v = (i + 1) * 10
  return { value: String(v), label: `± ${v}%` }
})

export function EhrPanelContent({ form, applicationRate, requiredEhr, t }: EhrPanelContentProps) {
  const [windowHalf, setWindowHalf] = useState(50)
  const values = form.getValues()
  const clampedRate = Math.min(100, Math.max(0, applicationRate))

  const vizProps: EhrVizProps = useMemo(() => ({
    baseChance: values.baseChance,
    effectHitRate: values.effectHitRate,
    effectRes: values.effectRes,
    debuffRes: values.debuffRes,
    attempts: values.attempts,
    windowHalf,
  }), [values.baseChance, values.effectHitRate, values.effectRes, values.debuffRes, values.attempts, windowHalf])

  return (
    <div className={classes.panelCompact}>
      <PanelSection title="Debuff Application Calculator">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
            <InputField label={t('Input.HitRate')} field="effectHitRate" form={form} />
            <InputField label={t('Input.BaseChance')} field="baseChance" form={form} />
            <InputField label={t('Input.Attempts')} field="attempts" form={form} noSuffix />
          </div>

          <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
            <SelectField
              label={t('Input.EffectRes')}
              data={EFFECT_RES_OPTIONS}
              value={String(values.effectRes)}
              onChange={(v) => form.setFieldValue('effectRes', Number(v))}
            />
            <SelectField
              label={t('Input.DebuffRes')}
              data={DEBUFF_RES_OPTIONS}
              value={String(values.debuffRes)}
              onChange={(v) => form.setFieldValue('debuffRes', Number(v))}
            />
            <SelectField
              label="Chart range"
              data={RANGE_OPTIONS}
              value={String(windowHalf)}
              onChange={(v) => setWindowHalf(Number(v))}
            />
          </div>
        </div>

        <FormulaDisplay
          values={values}
          clampedRate={clampedRate}
        />

        <EhrGrid {...vizProps} />
      </PanelSection>
      <Divider />
      <PanelSection title="Target EHR Solver">
        <ReverseSolve form={form} requiredEhr={requiredEhr} t={t} />
      </PanelSection>
    </div>
  )
}

function resetIfEmpty(form: EhrForm, field: keyof EhrTuningForm) {
  const v = form.getValues()[field] as number | ''
  if (v === '' || v == null) {
    form.setFieldValue(field, EHR_TUNING_DEFAULTS[field])
  }
}

function InputField({ label, field, form, noSuffix }: {
  label: string
  field: keyof EhrTuningForm
  form: EhrForm
  noSuffix?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 150 }}>
      <HeaderText>{label}</HeaderText>
      <NumberInput
        key={form.key(field)}
        {...form.getInputProps(field)}
        {...inputProps}
        suffix={noSuffix ? undefined : '%'}
        allowNegative={noSuffix ? false : undefined}
        min={noSuffix ? 1 : 0}
        onBlur={() => resetIfEmpty(form, field)}
      />
    </div>
  )
}

function SelectField({ label, data, value, onChange }: {
  label: string
  data: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 150 }}>
      <HeaderText>{label}</HeaderText>
      <Select
        data={data}
        value={value}
        onChange={(v) => { if (v) onChange(v) }}
        w="100%"
        size="xs"
        allowDeselect={false}
        maxDropdownHeight={400}
      />
    </div>
  )
}

const LABEL_STYLE: React.CSSProperties = { fontSize: 12, fontFamily: 'var(--font-ui)', color: 'rgba(255,255,255,0.4)' }

function FormulaDisplay({ values, clampedRate }: {
  values: EhrTuningForm
  clampedRate: number
}) {
  const { baseChance, effectHitRate, effectRes, debuffRes, attempts } = values
  const perAttemptPct = Math.min(100, Math.max(0, calculatePerAttemptRate(values) * 100))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, padding: '4px 0' }}>
      <math display="block" className={classes.formula}>
        <munder>
          <mrow>
            <mo>(</mo>
            <mfrac>
              <mn style={{ color: '#667181' }}>{localeNumber_00(baseChance)}</mn>
              <mn>100</mn>
            </mfrac>
            <mo>)</mo>
          </mrow>
          <mtext style={LABEL_STYLE}>Base chance</mtext>
        </munder>
        <mo style={{ padding: '0 5px' }}>×</mo>
        <munder>
          <mrow>
            <mo>(</mo>
            <mn>1</mn>
            <mo>+</mo>
            <mfrac>
              <mn style={{ color: '#58cca0' }}>{localeNumber_00(effectHitRate)}</mn>
              <mn>100</mn>
            </mfrac>
            <mo>)</mo>
          </mrow>
          <mtext style={LABEL_STYLE}>EHR multi</mtext>
        </munder>
        <mo style={{ padding: '0 5px' }}>×</mo>
        <munder>
          <mrow>
            <mo>(</mo>
            <mn>1</mn>
            <mo>−</mo>
            <mfrac>
              <mn style={{ color: '#dc6868' }}>{localeNumber_00(effectRes)}</mn>
              <mn>100</mn>
            </mfrac>
            <mo>)</mo>
          </mrow>
          <mtext style={LABEL_STYLE}>Eff RES multi</mtext>
        </munder>
        <mo style={{ padding: '0 5px' }}>×</mo>
        <munder>
          <mrow>
            <mo>(</mo>
            <mn>1</mn>
            <mo>−</mo>
            <mfrac>
              <mn style={{ color: '#dba96a' }}>{localeNumber_00(debuffRes)}</mn>
              <mn>100</mn>
            </mfrac>
            <mo>)</mo>
          </mrow>
          <mtext style={LABEL_STYLE}>Debuff RES multi</mtext>
        </munder>
        <mo style={{ padding: '0 5px' }}>=</mo>
      </math>

      <math display="block" className={classes.formula}>
        {attempts > 1 && (
          <>
            <munder>
              <mrow>
                <mn style={{ fontSize: 22, fontWeight: 750, color: 'rgba(255, 255, 255, 0.92)' }}>
                  {localeNumber_00(perAttemptPct)}%
                </mn>
                <mtext style={{ fontSize: 22, fontFamily: 'var(--font-ui)', color: 'rgba(255, 255, 255, 0.5)', paddingLeft: 12, transform: 'translateY(-1px)' }}>chance</mtext>
              </mrow>
              <mtext style={LABEL_STYLE}>Per attempt</mtext>
            </munder>
            <mo style={{ padding: '0 10px' }}>=</mo>
          </>
        )}
        <munder>
          <mrow>
            <mn style={{
              fontSize: 26,
              fontWeight: 750,
              fontVariantNumeric: 'tabular-nums',
              color: clampedRate >= 80 ? '#58cca0' : clampedRate >= 50 ? '#dba96a' : '#dc6868',
            }}>
              {localeNumber_00(clampedRate)}%
            </mn>
            <mtext style={{ fontSize: 22, fontFamily: 'var(--font-ui)', color: 'rgba(255, 255, 255, 0.5)', paddingLeft: 12, transform: 'translateY(-1px)' }}>chance</mtext>
          </mrow>
          <mtext style={LABEL_STYLE}>{attempts > 1 ? `Over ${attempts} attempts` : 'Per attempt'}</mtext>
        </munder>
      </math>
    </div>
  )
}

function ReverseSolve({ form, requiredEhr, t }: {
  form: EhrForm
  requiredEhr: number
  t: TFunction<'modals', 'QuickUtils.EHR'>
}) {
  const isComputable = Number.isFinite(requiredEhr)

  return (
    <div className={classes.reverse}>
      <div className={classes.reverseInput}>
        <HeaderText>{t('Input.DesiredHitRate')}</HeaderText>
        <NumberInput
          key={form.key('desiredHitRate')}
          {...form.getInputProps('desiredHitRate')}
          {...inputProps}
          allowNegative={false}
          min={0}
          max={100}
          onBlur={() => resetIfEmpty(form, 'desiredHitRate')}
        />
      </div>
      <div className={classes.reverseOutput} style={{ opacity: isComputable ? undefined : 0.3 }}>
        <HeaderText>{t('Output.RequiredHitRate')}</HeaderText>
        <span>
          {isComputable ? `${localeNumber_00(requiredEhr)}%` : ''}
        </span>
      </div>
    </div>
  )
}
