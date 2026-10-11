import { TFunction } from 'i18next'
import { renderPill } from 'lib/characterPreview/buffsAnalysis/buffUtils'
import { ElementTag } from 'lib/optimization/engine/config/tag'
import { arrayIncludes } from 'lib/utils/arrayUtils'

export namespace ElementSelect {
  export const tagValues = [
    ElementTag.Physical,
    ElementTag.Fire,
    ElementTag.Ice,
    ElementTag.Lightning,
    ElementTag.Wind,
    ElementTag.Quantum,
    ElementTag.Imaginary,
  ] as const
  export type TagType = typeof tagValues[number]
  export function isValidTag(tag: unknown): tag is TagType {
    return arrayIncludes(tagValues, tag)
  }
}

const ELEMENT_TAG_COLORS: Record<ElementTag, string> = {
  [ElementTag.None]: '#8c8c8c',
  [ElementTag.Physical]: '#bebebe',
  [ElementTag.Fire]: '#ea7866',
  [ElementTag.Ice]: '#5ec7db',
  [ElementTag.Lightning]: '#eb77ea',
  [ElementTag.Wind]: '#62d3a2',
  [ElementTag.Quantum]: '#9c96f4',
  [ElementTag.Imaginary]: '#e8d85d',
}

export function renderElementTagPill(tag: ElementTag, t: TFunction<'optimizerTab', 'ExpandedDataPanel.DamageTags'>, active?: boolean) {
  const label = ElementTag[tag].toUpperCase()
  const colour = ELEMENT_TAG_COLORS[tag]
  return renderPill(ElementTag[tag], colour, label, { active })
}
