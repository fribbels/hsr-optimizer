// Global
export const iconSize = 22
export const defaultPadding = 11

// CharacterPreview — 5:4 1100×880, scaled 1650×1320
export const defaultGap = 8
export const relicCardW = 207
export const relicCardH = 288
export const middleColumnWidth = 240
export const parentH = relicCardH * 3 + defaultGap * 2
export const parentW = relicCardW * 2 + defaultGap // portrait width (symmetric with relics)
export const cardTotalW = parentW + defaultGap + middleColumnWidth + defaultGap + parentW

export const innerW = 1024
export const lcParentW = middleColumnWidth
export const lcParentH = relicCardH
export const lcInnerW = 260
export const lcInnerH = 1260 / 904 * lcInnerW

export const newLcMargin = 8
export const newLcHeight = 150
export const simScoreInnerW = 950
