import chroma from 'chroma-js'
import { calculateApplicationRate } from 'lib/tabs/tabCalculators/ehrCalculations'
import type { EhrVizProps } from 'lib/tabs/tabCalculators/EhrPanelContent'
import { precisionRound } from 'lib/utils/mathUtils'
import { memo } from 'react'

const EHR_STEP = 5
const RES_STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80]
const CELL_W = 65
const CELL_H = 24
const LABEL_W = 36
const RES_LABEL_H = 16
const GUIDE_COLOR = 'rgba(255,255,255,0.35)'
const COL_GUIDE = {
  backgroundImage: `linear-gradient(${GUIDE_COLOR},${GUIDE_COLOR}),linear-gradient(${GUIDE_COLOR},${GUIDE_COLOR})`,
  backgroundSize: '1px 100%',
  backgroundPosition: 'left,right',
  backgroundRepeat: 'no-repeat',
} as const
const ROW_GUIDE = {
  backgroundImage: `linear-gradient(${GUIDE_COLOR},${GUIDE_COLOR}),linear-gradient(${GUIDE_COLOR},${GUIDE_COLOR})`,
  backgroundSize: '100% 1px',
  backgroundPosition: 'top,bottom',
  backgroundRepeat: 'no-repeat',
} as const

const BRIGHTEN = 0.75

const BAND_100 = { bg: 'rgba(50,205,165,0.32)', text: chroma('#58cca0').brighten(BRIGHTEN).hex() }
const BAND_80 = { bg: 'rgba(65,195,160,0.24)', text: chroma('#5bbf9a').brighten(BRIGHTEN).hex() }
const BAND_60 = { bg: 'rgba(130,190,120,0.18)', text: chroma('#8dba78').brighten(BRIGHTEN).hex() }
const BAND_40 = { bg: 'rgba(200,170,90,0.15)', text: chroma('#c4a85e').brighten(BRIGHTEN).hex() }
const BAND_20 = { bg: 'rgba(215,130,85,0.13)', text: chroma('#c88a5a').brighten(BRIGHTEN).hex() }
const BAND_1 = { bg: 'rgba(210,105,90,0.10)', text: chroma('#c07060').brighten(BRIGHTEN).hex() }
const BAND_0 = { bg: 'rgba(195,85,80,0.07)', text: chroma('#a85850').brighten(BRIGHTEN).hex() }

function getBand(r: number) {
  const v = Math.min(100, Math.max(0, r))
  if (v >= 100) return BAND_100
  if (v >= 80) return BAND_80
  if (v >= 60) return BAND_60
  if (v >= 40) return BAND_40
  if (v >= 20) return BAND_20
  if (v > 0) return BAND_1
  return BAND_0
}

function GridCell({ rate, isSelectedCol }: { rate: number, isSelectedCol: boolean }) {
  const band = getBand(rate)

  return (
    <div
      style={{
        width: CELL_W,
        height: CELL_H,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: band.bg,
        ...(isSelectedCol ? COL_GUIDE : undefined),
      }}
    >
      <span
        style={{
          fontSize: 12,
          lineHeight: 1,
          fontFamily: 'var(--font-showcase)',
          fontVariantNumeric: 'tabular-nums',
          color: band.text,
          fontWeight: 400,
        }}
      >
        {rate}%
      </span>
    </div>
  )
}

function GridRow({ ehr, snappedEhr, nearestRes, currentColor, baseChance, debuffRes, attempts }: {
  ehr: number,
  snappedEhr: number,
  nearestRes: number,
  currentColor: string,
  baseChance: number,
  debuffRes: number,
  attempts: number,
}) {
  const isCurrentRow = ehr === snappedEhr
  const isMajor = ehr % 10 === 0

  return (
    <div
      style={{
        display: 'flex',
        gap: 0,
        position: 'relative',
        zIndex: isCurrentRow ? 1 : 0,
        ...(isCurrentRow ? ROW_GUIDE : undefined),
      }}
    >
      {isCurrentRow && (
        <span
          style={{
            position: 'absolute',
            right: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            paddingRight: 4,
            fontSize: 11,
            fontFamily: 'var(--font-showcase)',
            color: 'rgba(255,255,255,0.5)',
            whiteSpace: 'nowrap',
          }}
        >
          EHR
        </span>
      )}
      <div
        style={{
          width: LABEL_W,
          height: CELL_H,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: 6,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontFamily: 'var(--font-showcase)',
            fontVariantNumeric: 'tabular-nums',
            color: isCurrentRow ? currentColor : isMajor ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.40)',
            fontWeight: 400,
          }}
        >
          {ehr}%
        </span>
      </div>
      {RES_STEPS.map((res) => {
        const rawRate = Math.min(100, Math.max(0, calculateApplicationRate({ baseChance, effectHitRate: ehr, effectRes: res, debuffRes, attempts })))
        const rate = Math.round(precisionRound(rawRate))

        return <GridCell key={res} rate={rate} isSelectedCol={res === nearestRes} />
      })}
    </div>
  )
}

function GridHeaderRow({ nearestRes, currentColor }: { nearestRes: number, currentColor: string }) {
  return (
    <div style={{ display: 'flex', gap: 0 }}>
      <div style={{ width: LABEL_W }} />
      {RES_STEPS.map((res) => {
        const isSelected = res === nearestRes
        return (
          <div
            key={res}
            style={{
              width: CELL_W,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: 4,
              position: 'relative',
              ...(isSelected ? COL_GUIDE : undefined),
            }}
          >
            {isSelected && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  paddingBottom: 2,
                  fontSize: 11,
                  fontFamily: 'var(--font-showcase)',
                  color: 'rgba(255,255,255,0.5)',
                  whiteSpace: 'nowrap',
                }}
              >
                RES
              </span>
            )}
            <span
              style={{ fontSize: 12, fontFamily: 'var(--font-showcase)', fontWeight: 400, color: isSelected ? currentColor : 'rgba(255,255,255,0.65)' }}
            >
              {res}%
            </span>
          </div>
        )
      })}
    </div>
  )
}

export const EhrGrid = memo(function EhrGrid({ baseChance, effectHitRate, effectRes, debuffRes, attempts, windowHalf }: EhrVizProps) {
  const snappedEhr = Math.floor(effectHitRate / EHR_STEP) * EHR_STEP
  const windowMin = Math.max(0, snappedEhr - windowHalf)
  const windowMax = snappedEhr + windowHalf

  const ehrSteps: number[] = []
  for (let e = windowMax; e >= windowMin; e -= EHR_STEP) {
    ehrSteps.push(e)
  }

  const nearestRes = RES_STEPS.reduce((p, c) => Math.abs(c - effectRes) < Math.abs(p - effectRes) ? c : p)

  const currentRate = Math.round(
    precisionRound(Math.min(100, Math.max(0, calculateApplicationRate({ baseChance, effectHitRate: snappedEhr, effectRes: nearestRes, debuffRes, attempts })))),
  )
  const currentColor = getBand(currentRate).text

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, transform: `translateX(-${LABEL_W / 2}px)`, paddingTop: RES_LABEL_H }}
    >
      <GridHeaderRow nearestRes={nearestRes} currentColor={currentColor} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {ehrSteps.map((ehr) => (
          <GridRow
            key={ehr}
            ehr={ehr}
            snappedEhr={snappedEhr}
            nearestRes={nearestRes}
            currentColor={currentColor}
            baseChance={baseChance}
            debuffRes={debuffRes}
            attempts={attempts}
          />
        ))}
      </div>
    </div>
  )
})
