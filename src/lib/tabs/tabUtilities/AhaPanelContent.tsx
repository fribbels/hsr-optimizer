import { Divider, NumberInput } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import { Stats } from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import {
  AHA_BASE_SPEED,
  speedToContributionMultiplier,
} from 'lib/tabs/tabUtilities/ahaCalculations'
import { ComboboxNumberInput, type ComboboxNumberGroup } from 'lib/ui/ComboboxNumberInput'
import { HeaderText } from 'lib/ui/HeaderText'
import { localeNumber_000 } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import classes from './AhaPanelContent.module.css'

const TEAMMATE_KEYS = ['teammate0', 'teammate1', 'teammate2', 'teammate3'] as const
const RANK_COLORS = ['#dba96a', '#b96ccc', '#58b0dc', '#58cca0']
const BASE_COLOR = '#667181'
const LOW_SPEED_THRESHOLD = 90

type AhaFormValues = {
  teammate0: number | ''
  teammate1: number | ''
  teammate2: number | ''
  teammate3: number | ''
  desiredAha: number | ''
}

type AhaForm = UseFormReturnType<AhaFormValues>
type TeammateKey = (typeof TEAMMATE_KEYS)[number]

interface TeammateRow {
  key: TeammateKey
  slot: number
  speed: number | ''
  rank: number | null
  contribution: number | null
  startOffset: number | null
  color: string
}

export interface AhaPanelContentProps {
  form: AhaForm
  ahaSpeed: number
  speeds: number[]
  teammateSpeed: number | null
  desiredValue: number | undefined
  spdOptions: ComboboxNumberGroup[]
  onDesiredChange: (value: number | undefined) => void
  t: (key: string) => string
}

const spdIconSection = <img src={Assets.getStatIcon(Stats.SPD)} alt='' style={{ height: 24 }} />

const sharedInputProps: NumberInput.Props = {
  allowNegative: false,
  hideControls: true,
  leftSection: spdIconSection,
  min: 0,
  stepHoldDelay: 300,
  stepHoldInterval: 50,
}

export function AhaPanelContent(props: AhaPanelContentProps) {
  const rows = buildTeammateRows(props.form.getValues())

  return (
    <div className={classes.panelCompact}>
      <PanelSection title='Aha Speed Calculator'>
        <IntegratedRows form={props.form} rows={rows} ahaSpeed={props.ahaSpeed} />
        <FormulaSummary rows={rows} ahaSpeed={props.ahaSpeed} />
      </PanelSection>
      <Divider />
      <PanelSection title='Target Speed Solver'>
        <ReverseSolve {...props} />
      </PanelSection>
    </div>
  )
}

const ROW_HEIGHT = 36
const ROW_GAP = 3
const ROW_STEP = ROW_HEIGHT + ROW_GAP

function IntegratedRows({ form, rows, ahaSpeed }: {
  form: AhaForm
  rows: TeammateRow[]
  ahaSpeed: number
}) {
  const visualPositions = getVisualPositions(rows)

  return (
    <div className={classes.integratedRows}>
      <BaseIntegratedRow ahaSpeed={ahaSpeed} />
      {rows.map((row, domIndex) => {
        const visualPos = visualPositions[domIndex]
        const offset = (visualPos - domIndex) * ROW_STEP
        return (
          <IntegratedRow
            key={row.key}
            form={form}
            row={row}
            ahaSpeed={ahaSpeed}
            label={`Teammate ${visualPos + 1}`}
            style={{ transform: offset ? `translateY(${offset}px)` : undefined }}
          />
        )
      })}
    </div>
  )
}

function getVisualPositions(rows: TeammateRow[]): number[] {
  const filledCount = rows.filter((r) => r.rank != null).length
  let emptyIdx = 0
  return rows.map((row) => {
    if (row.rank != null) return row.rank
    return filledCount + emptyIdx++
  })
}

function BaseIntegratedRow({ ahaSpeed }: { ahaSpeed: number }) {
  return (
    <div className={`${classes.integratedRow} ${classes.baseRow}`}>
      <div className={classes.rowSource}>Base</div>
      <div className={classes.rowInputPlaceholder} />
      <div className={classes.rowTrack}>
        <div
          className={classes.rowSegment}
          style={{
            left: '0%',
            width: `${(AHA_BASE_SPEED / ahaSpeed) * 100}%`,
            background: BASE_COLOR,
          }}
        />
      </div>
      <div className={classes.rowMeta}>+ {localeNumber_000(AHA_BASE_SPEED)}</div>
    </div>
  )
}

function IntegratedRow({ form, row, ahaSpeed, label, style }: {
  form: AhaForm
  row: TeammateRow
  ahaSpeed: number
  label: string
  style?: React.CSSProperties
}) {
  const hasContribution = row.contribution != null && row.startOffset != null
  const startOffset = row.startOffset ?? 0
  const contribution = row.contribution ?? 0
  const leftPct = hasContribution ? (startOffset / ahaSpeed) * 100 : 0
  const widthPct = hasContribution ? (contribution / ahaSpeed) * 100 : 0
  const contributionLabel = row.contribution == null ? '' : `+ ${localeNumber_000(row.contribution)}`

  return (
    <div className={`${classes.integratedRow} ${row.rank == null ? classes.emptyRow : ''}`} style={style}>
      <div className={classes.rowSource}>
        <span>{label}</span>
      </div>
      <NumberInput
        key={form.key(row.key)}
        {...form.getInputProps(row.key)}
        {...sharedInputProps}
        className={classes.rowInput}
      />
      <div className={classes.rowTrack}>
        {hasContribution && (
          <div
            className={classes.rowSegment}
            style={{
              left: `${leftPct}%`,
              width: `${widthPct}%`,
              background: row.color,
            }}
          />
        )}
      </div>
      <div className={classes.rowMeta}>
        <span>{contributionLabel}</span>
      </div>
    </div>
  )
}

function PanelSection({ title, children }: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className={classes.section}>
      <div className={classes.sectionTitle}>{title}</div>
      {children}
    </section>
  )
}

const RANK_COUNT = 4

function FormulaSummary({ rows, ahaSpeed }: {
  rows: TeammateRow[]
  ahaSpeed: number
}) {
  const byRank: (TeammateRow | null)[] = Array.from({ length: RANK_COUNT }, () => null)
  for (const row of rows) {
    if (row.rank != null) byRank[row.rank] = row
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
      <math display='block' className={classes.formula} style={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.72)' }}>
        <mtext style={{ fontFamily: 'var(--font-ui)' }}>Aha Speed</mtext>
        <mo style={{ padding: '0 5px' }}>=</mo>
        <mn>{AHA_BASE_SPEED}</mn>
        {byRank.map((row, rank) => {
          const denom = getDenominator(rank)
          return (
            <mrow key={rank}>
              <mo style={{ padding: '0 10px' }}>+</mo>
              <mo>(</mo>
              <mfrac>
                {row != null && typeof row.speed === 'number'
                  ? <mn style={{ color: row.color }}>{localeNumber_000(row.speed)}</mn>
                  : <msub style={{ color: '#8b8b8b' }}><mi>T</mi><mn>{rank + 1}</mn></msub>}
                <mn>{denom}</mn>
              </mfrac>
              <mo>)</mo>
            </mrow>
          )
        })}
        <mo style={{ padding: '0 5px' }}>=</mo>
        <mrow>
          <mn style={{ fontSize: 26, fontWeight: 750, color: 'rgba(255, 255, 255, 0.92)' }}>
            {localeNumber_000(ahaSpeed)}
          </mn>
          <mtext style={{ fontSize: 22, fontFamily: 'var(--font-ui)', color: 'rgba(255, 255, 255, 0.5)', paddingLeft: 12 }}>SPD</mtext>
        </mrow>
      </math>
    </div>
  )
}

function ReverseSolve(props: AhaPanelContentProps) {
  const {
    speeds,
    teammateSpeed,
    desiredValue,
    spdOptions,
    onDesiredChange,
    t,
  } = props
  const allSlotsFilled = speeds.length >= 4
  const displaySpeed = teammateSpeed !== null && Math.abs(teammateSpeed) < 0.0005 ? 0 : teammateSpeed

  return (
    <div className={classes.reverse}>
      <div className={classes.reverseInput}>
        <HeaderText>{t('Input.DesiredAha')}</HeaderText>
        <ComboboxNumberInput
          value={desiredValue}
          onChange={onDesiredChange}
          options={spdOptions}
          min={0}
        />
      </div>
      <div className={classes.reverseOutput} style={{ opacity: allSlotsFilled ? undefined : teammateSpeed !== null ? undefined : 0.3 }}>
        <HeaderText>
          {allSlotsFilled ? 'No slots open' : t(`Output.Teammate${speeds.length as 0 | 1 | 2 | 3}`)}
        </HeaderText>
        <span style={{ color: getSpeedColour(displaySpeed) }}>
          {displaySpeed !== null ? localeNumber_000(displaySpeed) : ''}
        </span>
      </div>
    </div>
  )
}

function buildTeammateRows(values: AhaFormValues): TeammateRow[] {
  const speedRows = TEAMMATE_KEYS
    .map((key, slot) => ({ key, slot, speed: values[key] }))
    .filter((row): row is { key: TeammateKey; slot: number; speed: number } => row.speed !== '')
    .sort((a, b) => {
      if (b.speed !== a.speed) return b.speed - a.speed
      return a.slot - b.slot
    })

  let cumulative = AHA_BASE_SPEED
  const rankedRows = new Map<TeammateKey, Pick<TeammateRow, 'rank' | 'contribution' | 'startOffset' | 'color'>>()

  speedRows.forEach((row, rank) => {
    const contribution = row.speed * speedToContributionMultiplier(rank)
    rankedRows.set(row.key, {
      rank,
      contribution,
      startOffset: cumulative,
      color: RANK_COLORS[rank] ?? RANK_COLORS[3],
    })
    cumulative += contribution
  })

  return TEAMMATE_KEYS.map((key, slot) => {
    const ranked = rankedRows.get(key)
    return {
      key,
      slot,
      speed: values[key],
      rank: ranked?.rank ?? null,
      contribution: ranked?.contribution ?? null,
      startOffset: ranked?.startOffset ?? null,
      color: ranked?.color ?? BASE_COLOR,
    }
  })
}

function getDenominator(rank: number) {
  return Math.round(1 / speedToContributionMultiplier(rank))
}

function getSpeedColour(speed: number | null) {
  if (speed == null) return undefined
  const rounded = precisionRound(speed)
  if (rounded < 0) return 'red'
  if (rounded > 0 && rounded < LOW_SPEED_THRESHOLD) return 'orange'
  return undefined
}
