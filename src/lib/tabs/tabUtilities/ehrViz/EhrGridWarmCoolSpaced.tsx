import chroma from 'chroma-js'
import { calculateApplicationRate } from 'lib/tabs/tabUtilities/ehrCalculations'
import type { EhrVizProps } from 'lib/tabs/tabUtilities/EhrPanelContent'

const EHR_STEP = 5
const RES_STEPS = [0, 10, 20, 30, 40, 50, 60]
const CELL_W = 65
const CELL_H = 24

const BRIGHTEN = 0.5

const BAND_100 = { bg: 'rgba(50,205,165,0.32)',  text: chroma('#58cca0').brighten(BRIGHTEN).hex() }
const BAND_80  = { bg: 'rgba(65,195,160,0.24)',  text: chroma('#5bbf9a').brighten(BRIGHTEN).hex() }
const BAND_60  = { bg: 'rgba(130,190,120,0.18)', text: chroma('#8dba78').brighten(BRIGHTEN).hex() }
const BAND_40  = { bg: 'rgba(200,170,90,0.15)',  text: chroma('#c4a85e').brighten(BRIGHTEN).hex() }
const BAND_20  = { bg: 'rgba(215,130,85,0.13)',  text: chroma('#c88a5a').brighten(BRIGHTEN).hex() }
const BAND_1   = { bg: 'rgba(210,105,90,0.10)',  text: chroma('#c07060').brighten(BRIGHTEN).hex() }
const BAND_0   = { bg: 'rgba(195,85,80,0.07)',   text: chroma('#a85850').brighten(BRIGHTEN).hex() }

function getBand(r: number) {
  const v = Math.min(100, Math.max(0, r))
  if (v >= 99.9) return BAND_100
  if (v >= 80) return BAND_80
  if (v >= 60) return BAND_60
  if (v >= 40) return BAND_40
  if (v >= 20) return BAND_20
  if (v > 0.1) return BAND_1
  return BAND_0
}

export function EhrGridWarmCoolSpaced({ baseChance, effectHitRate, effectRes, debuffRes, attempts, windowHalf }: EhrVizProps) {
  const snappedEhr = Math.round(effectHitRate / EHR_STEP) * EHR_STEP
  const windowMin = Math.max(0, snappedEhr - windowHalf)
  const windowMax = windowMin + windowHalf * 2

  const ehrSteps: number[] = []
  for (let e = windowMax; e >= windowMin; e -= EHR_STEP) ehrSteps.push(e)

  const nearestEhr = ehrSteps.reduce((p, c) => Math.abs(c - effectHitRate) < Math.abs(p - effectHitRate) ? c : p)
  const nearestRes = RES_STEPS.reduce((p, c) => Math.abs(c - effectRes) < Math.abs(p - effectRes) ? c : p)

  const currentRate = Math.min(100, Math.max(0, calculateApplicationRate({ baseChance, effectHitRate: nearestEhr, effectRes: nearestRes, debuffRes, attempts })))
  const currentColor = getBand(currentRate).text

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, transform: 'translateX(-24px)' }}>
      <div style={{ display: 'flex', gap: 0, paddingBottom: 3 }}>
        <div style={{ width: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 1 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: "'Maven Pro', sans-serif" }}>EHR \ RES</span>
        </div>
        {RES_STEPS.map((res) => (
          <div key={res} style={{ width: CELL_W, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 1 }}>
            <span style={{ fontSize: 12, fontFamily: "'Maven Pro', sans-serif", fontWeight: 400, color: res === nearestRes ? currentColor : 'rgba(255,255,255,0.4)' }}>
              {res}%
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {ehrSteps.map((ehr) => {
          const isCurrentRow = ehr === nearestEhr
          const isMajor = ehr % 10 === 0

          return (
            <div key={ehr} style={{
              display: 'flex', gap: 0,
              boxShadow: isCurrentRow ? 'inset 0 1px 0 rgba(255,255,255,0.20), inset 0 -1px 0 rgba(255,255,255,0.20)' : undefined,
              position: 'relative',
              zIndex: isCurrentRow ? 1 : 0,
            }}>
              <div style={{
                width: 48, height: CELL_H,
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6,
              }}>
                <span style={{
                  fontSize: 12, fontFamily: "'Maven Pro', sans-serif", fontVariantNumeric: 'tabular-nums',
                  color: isCurrentRow ? currentColor : isMajor ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.20)',
                  fontWeight: 400,
                }}>
                  {ehr}%
                </span>
              </div>
              {RES_STEPS.map((res) => {
                const rate = Math.min(100, Math.max(0, calculateApplicationRate({ baseChance, effectHitRate: ehr, effectRes: res, debuffRes, attempts })))
                const isSelectedCol = res === nearestRes
                const band = getBand(rate)

                return (
                  <div key={res} style={{
                    width: CELL_W, height: CELL_H,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: band.bg,
                    boxShadow: isSelectedCol ? 'inset 1px 0 0 rgba(255,255,255,0.20), inset -1px 0 0 rgba(255,255,255,0.20)' : undefined,
                  }}>
                    <span style={{
                      fontSize: 12, fontFamily: "'Maven Pro', sans-serif", fontVariantNumeric: 'tabular-nums',
                      color: band.text, fontWeight: 400,
                    }}>
                      {Math.round(rate)}%
                    </span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
