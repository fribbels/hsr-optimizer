import { Divider, NumberInput } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import type { EhrTuningForm } from 'lib/stores/ehrTuningStore'
import { EhrGridWarmCoolSpaced } from 'lib/tabs/tabUtilities/ehrViz/EhrGridWarmCoolSpaced'
import { HeaderText } from 'lib/ui/HeaderText'
import { localeNumber_00 } from 'lib/utils/i18nUtils'
import classes from './EhrPanelContent.module.css'

export interface EhrVizProps {
  baseChance: number
  effectHitRate: number
  effectRes: number
  debuffRes: number
  attempts: number
  applicationRate: number
}

export interface EhrPanelContentProps {
  form: UseFormReturnType<EhrTuningForm>
  applicationRate: number
  requiredEhr: number
  t: (key: string) => string
}

type EhrForm = UseFormReturnType<EhrTuningForm>

const EhrGrid = EhrGridWarmCoolSpaced

const sharedInputProps: NumberInput.Props = {
  stepHoldDelay: 300,
  stepHoldInterval: 50,
  suffix: '%',
}

export function EhrPanelContent({ form, applicationRate, requiredEhr, t }: EhrPanelContentProps) {
  const values = form.getValues()

  const vizProps: EhrVizProps = {
    baseChance: values.baseChance,
    effectHitRate: values.effectHitRate,
    effectRes: values.effectRes,
    debuffRes: values.debuffRes,
    attempts: values.attempts,
    applicationRate,
  }

  return (
    <div className={classes.panelCompact}>
      <PanelSection title="Debuff Application Calculator">
        <ScenarioInputs form={form} t={t} />
        <EhrInputRow form={form} applicationRate={applicationRate} t={t} />
        <EhrGrid {...vizProps} />
        <FormulaDisplay values={values} applicationRate={applicationRate} />
      </PanelSection>
      <Divider />
      <PanelSection title="Required EHR Solver">
        <ReverseSolve form={form} requiredEhr={requiredEhr} t={t} />
      </PanelSection>
    </div>
  )
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={classes.section}>
      <div className={classes.sectionTitle}>{title}</div>
      {children}
    </section>
  )
}

function ScenarioInputs({ form, t }: { form: EhrForm; t: (key: string) => string }) {
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
      <ScenarioField label={t('Input.EffectRes')} field="effectRes" form={form} />
      <ScenarioField label={t('Input.DebuffRes')} field="debuffRes" form={form} />
      <ScenarioField label={t('Input.BaseChance')} field="baseChance" form={form} />
      <ScenarioField label={t('Input.Attempts')} field="attempts" form={form} noSuffix />
    </div>
  )
}

function ScenarioField({ label, field, form, noSuffix }: {
  label: string
  field: keyof EhrTuningForm
  form: EhrForm
  noSuffix?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-ui)' }}>{label}</span>
      <NumberInput
        key={form.key(field)}
        {...form.getInputProps(field)}
        stepHoldDelay={300}
        stepHoldInterval={50}
        suffix={noSuffix ? undefined : '%'}
        allowNegative={noSuffix ? false : undefined}
        min={noSuffix ? 1 : 0}
        hideControls
        w={85}
      />
    </div>
  )
}

function EhrInputRow({ form, applicationRate, t }: {
  form: EhrForm
  applicationRate: number
  t: (key: string) => string
}) {
  const clampedRate = Math.min(100, Math.max(0, applicationRate))

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', padding: '4px 0' }}>
      <HeaderText>{t('Input.HitRate')}</HeaderText>
      <NumberInput
        key={form.key('effectHitRate')}
        {...form.getInputProps('effectHitRate')}
        {...sharedInputProps}
        allowNegative={false}
        min={0}
        hideControls
        w={100}
      />
      <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>→</span>
      <span style={{
        fontSize: 20,
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        fontVariantNumeric: 'tabular-nums',
        color: clampedRate >= 80 ? '#58cca0' : clampedRate >= 50 ? '#dba96a' : '#dc6868',
      }}>
        {localeNumber_00(clampedRate)}%
      </span>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-ui)' }}>app rate</span>
    </div>
  )
}


function FormulaDisplay({ values, applicationRate }: { values: EhrTuningForm; applicationRate: number }) {
  const { baseChance, effectHitRate, effectRes, debuffRes, attempts } = values
  const perAttempt = (baseChance / 100) * (1 + effectHitRate / 100) * (1 - effectRes / 100) * (1 - debuffRes / 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '4px 0' }}>
      <math display="block" style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.72)' }}>
        <mtext style={{ fontFamily: 'var(--font-ui)' }}>Hit Rate</mtext>
        <mo style={{ padding: '0 5px' }}>=</mo>
        <mfrac>
          <mn style={{ color: '#667181' }}>{localeNumber_00(baseChance)}</mn>
          <mn>100</mn>
        </mfrac>
        <mo style={{ padding: '0 4px' }}>×</mo>
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
        <mo style={{ padding: '0 4px' }}>×</mo>
        <mrow>
          <mo>(</mo>
          <mn>1</mn>
          <mo>-</mo>
          <mfrac>
            <mn style={{ color: '#dc6868' }}>{localeNumber_00(effectRes)}</mn>
            <mn>100</mn>
          </mfrac>
          <mo>)</mo>
        </mrow>
        <mo style={{ padding: '0 4px' }}>×</mo>
        <mrow>
          <mo>(</mo>
          <mn>1</mn>
          <mo>-</mo>
          <mfrac>
            <mn style={{ color: '#dba96a' }}>{localeNumber_00(debuffRes)}</mn>
            <mn>100</mn>
          </mfrac>
          <mo>)</mo>
        </mrow>
        <mo style={{ padding: '0 5px' }}>=</mo>
        <mn style={{ fontSize: 20, fontWeight: 700, color: 'rgba(255, 255, 255, 0.88)' }}>
          {localeNumber_00(perAttempt * 100)}%
        </mn>
      </math>
      {attempts > 1 && (
        <math display="block" style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.72)' }}>
          <mtext style={{ fontFamily: 'var(--font-ui)' }}>App Rate</mtext>
          <mo style={{ padding: '0 5px' }}>=</mo>
          <mn>100</mn>
          <mo style={{ padding: '0 4px' }}>×</mo>
          <mrow>
            <mo>(</mo>
            <mn>1</mn>
            <mo>-</mo>
            <msup>
              <mrow>
                <mo>(</mo>
                <mn>1</mn>
                <mo>-</mo>
                <mn>{localeNumber_00(Math.min(1, Math.max(0, perAttempt)))}</mn>
                <mo>)</mo>
              </mrow>
              <mn>{attempts}</mn>
            </msup>
            <mo>)</mo>
          </mrow>
          <mo style={{ padding: '0 5px' }}>=</mo>
          <mn style={{ fontSize: 20, fontWeight: 700, color: 'rgba(255, 255, 255, 0.88)' }}>
            {localeNumber_00(applicationRate)}%
          </mn>
        </math>
      )}
    </div>
  )
}

function ReverseSolve({ form, requiredEhr, t }: {
  form: EhrForm
  requiredEhr: number
  t: (key: string) => string
}) {
  const isComputable = Number.isFinite(requiredEhr)

  return (
    <div className={classes.reverse}>
      <div className={classes.reverseInput}>
        <HeaderText>{t('Input.DesiredHitRate')}</HeaderText>
        <NumberInput
          key={form.key('desiredHitRate')}
          {...form.getInputProps('desiredHitRate')}
          {...sharedInputProps}
          allowNegative={false}
          min={0}
          max={100}
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
