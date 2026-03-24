/**
 * Vanilla JS cell renderers for AG Grid.
 *
 * AG Grid treats arrow functions as React framework components (wrapping each in
 * CellComp → Suspense → createElement). Classes with a `getGui` prototype bypass
 * React entirely, letting AG Grid manage the DOM directly. This eliminates React
 * mount/unmount overhead on every scroll-driven row virtualization cycle.
 */
import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community'
import { Constants } from 'lib/constants/constants'
import type { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import type { ScoredRelic } from 'lib/relics/scoreRelics'
import { Assets } from 'lib/rendering/assets'
import { GRADE_COLORS } from 'lib/rendering/renderer'
import {
  OrnamentSetCount,
  RelicSetCount,
  SetsOrnamentsNames,
  SetsRelicsNames,
} from 'lib/sets/setConfigRegistry'
import type { Relic } from 'types/relic'

// ── Precomputed image URL tables ──

const relicIndexToImage = SetsRelicsNames.map((name) => Assets.getSetImage(name, Constants.Parts.Head))
const ornamentIndexToImage = SetsOrnamentsNames.map((name) => Assets.getSetImage(name, Constants.Parts.PlanarSphere))

// Pre-warm browser image cache so synchronous decode is near-instant
for (const url of relicIndexToImage) { new Image().src = url }
for (const url of ornamentIndexToImage) { new Image().src = url }

// ── DOM helpers ──

const CELL_CENTER_CSS = 'display:flex;justify-content:center;margin-top:-1px'

function createImg(src: string, width = 32): HTMLImageElement {
  const img = document.createElement('img')
  img.src = src
  img.width = width
  img.decoding = 'sync'
  return img
}

function centeredDiv(): HTMLDivElement {
  const div = document.createElement('div')
  div.style.cssText = CELL_CENTER_CSS
  return div
}

// ── Grade icon SVG templates ──

/* Simple filled circle (default grade indicator) */
function circleSvg(color: string): string {
  return `<svg width="14" height="14" viewBox="0 0 14 14" style="display:inline-block;vertical-align:middle"><circle cx="7" cy="7" r="7" fill="${color}"/></svg>`
}

/* Ringed circle (4-liner indicator) */
function ringedCircleSvg(color: string): string {
  return `<svg viewBox="64 64 896 896" width="20" height="20" fill="${color}"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 100c192.5 0 348 155.5 348 348s-155.5 348-348 348S164 704.5 164 512 319.5 164 512 164z" fill-rule="evenodd"/><path d="M512 240C362.2 240 240 362.2 240 512s122.2 272 272 272 272-122.2 272-272S661.8 240 512 240z" fill-rule="evenodd"/></svg>`
}

/* Ringed circle with checkmark (verified 4-liner) */
function ringedCircleCheckSvg(color: string): string {
  return `<svg viewBox="64 64 896 896" width="20" height="20" fill="${color}"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 100c192.5 0 348 155.5 348 348s-155.5 348-348 348S164 704.5 164 512 319.5 164 512 164z" fill-rule="evenodd"/><path d="M512 240C362.2 240 240 362.2 240 512s122.2 272 272 272 272-122.2 272-272S661.8 240 512 240zm193.5 125.7l-210.6 292a31.8 31.8 0 01-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z" fill-rule="evenodd"/></svg>`
}

/* Filled circle with checkmark (verified relic — tabler IconCircleCheckFilled) */
function checkedCircleSvg(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${color}" style="display:block"><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z"/></svg>`
}

// Pre-parsed SVG template cache — avoids innerHTML parsing per cell.
// Key: "grade:is4Liner:verified", value: pre-parsed <span> with SVG children.
const gradeTemplateCache = new Map<string, HTMLElement>()

function getGradeNode(relic: Relic): HTMLElement {
  const is4Liner = relic.initialRolls === 4
  const key = `${relic.grade}:${is4Liner ? 1 : 0}:${relic.verified ? 1 : 0}`
  let template = gradeTemplateCache.get(key)
  if (!template) {
    const rawColor = GRADE_COLORS[relic.grade] ?? ''
    const color = rawColor || 'transparent'

    let svg: string
    if (is4Liner && relic.verified) svg = ringedCircleCheckSvg(color)
    else if (is4Liner) svg = ringedCircleSvg(color)
    else if (relic.verified) svg = checkedCircleSvg(rawColor)
    else svg = circleSvg(color)

    const span = document.createElement('span')
    span.innerHTML = svg
    template = span
    gradeTemplateCache.set(key, template)
  }
  return template.cloneNode(true) as HTMLElement
}

// ── Optimizer grid renderers ──

export class RelicSetCellRenderer implements ICellRendererComp {
  private eGui!: HTMLElement

  init(params: ICellRendererParams<OptimizerDisplayDataStatSim, number>) {
    if (params.value == null || isNaN(params.value)) {
      this.eGui = document.createElement('span')
      return
    }

    const i = params.value
    const count = RelicSetCount
    const s1 = i % count
    const s2 = ((i - s1) / count) % count
    const s3 = ((i - s2 * count - s1) / (count * count)) % count
    const s4 = ((i - s3 * count * count - s2 * count - s1) / (count * count * count)) % count

    // Detect 2-piece set pairs from 4 slot indices
    let url1: string | undefined
    let url2: string | undefined
    if (s1 === s2 && s2 === s3 && s3 === s4) {
      // 4-of-a-kind: show same set icon twice (matches 4-piece visual)
      url1 = relicIndexToImage[s1]
      url2 = relicIndexToImage[s1]
    } else {
      if (s1 === s2 || s1 === s3 || s1 === s4) url1 = relicIndexToImage[s1]
      if (s3 === s4 && s3 !== s1) url2 = relicIndexToImage[s3]
      else if (s2 === s3 && s2 !== s1) url2 = relicIndexToImage[s2]
      else if (s2 === s4 && s2 !== s1) url2 = relicIndexToImage[s2]
    }

    // Stable ordering
    if (url1 && url2 && url1 > url2) { const tmp = url1; url1 = url2; url2 = tmp }

    const div = centeredDiv()
    if (url1) div.appendChild(createImg(url1))
    if (url2) div.appendChild(createImg(url2))
    this.eGui = div
  }

  getGui() { return this.eGui }
  refresh() { return false }
}

export class OrnamentSetCellRenderer implements ICellRendererComp {
  private eGui!: HTMLElement

  init(params: ICellRendererParams<OptimizerDisplayDataStatSim, number>) {
    if (params.value == null) {
      this.eGui = document.createElement('span')
      return
    }

    const i = params.value
    const s1 = i % OrnamentSetCount
    const s2 = ((i - s1) / OrnamentSetCount) % OrnamentSetCount

    if (s1 !== s2 || !ornamentIndexToImage[s1]) {
      this.eGui = document.createElement('span')
      return
    }

    const div = centeredDiv()
    div.appendChild(createImg(ornamentIndexToImage[s1]))
    this.eGui = div
  }

  getGui() { return this.eGui }
  refresh() { return false }
}

// ── Relics grid renderers ──

export class AnySetCellRenderer implements ICellRendererComp {
  private eGui!: HTMLElement

  init(params: ICellRendererParams<ScoredRelic>) {
    const data = params.data
    if (!data) {
      this.eGui = document.createElement('span')
      return
    }

    const div = centeredDiv()
    div.title = data.set
    div.appendChild(createImg(Assets.getSetImage(data.set, data.part)))
    this.eGui = div
  }

  getGui() { return this.eGui }
  refresh() { return false }
}

export class CharacterIconCellRenderer implements ICellRendererComp {
  private eGui!: HTMLElement

  init(params: ICellRendererParams<ScoredRelic>) {
    const equippedBy = params.data?.equippedBy
    if (!equippedBy) {
      this.eGui = document.createElement('span')
      return
    }

    const div = centeredDiv()
    div.appendChild(createImg(Assets.getCharacterAvatarById(equippedBy)))
    this.eGui = div
  }

  getGui() { return this.eGui }
  refresh() { return false }
}

export class GradeCellRenderer implements ICellRendererComp {
  private eGui!: HTMLElement

  init(params: ICellRendererParams<Relic>) {
    const relic = params.data
    if (!relic) {
      this.eGui = document.createElement('span')
      return
    }

    this.eGui = getGradeNode(relic)
  }

  getGui() { return this.eGui }
  refresh() { return false }
}
