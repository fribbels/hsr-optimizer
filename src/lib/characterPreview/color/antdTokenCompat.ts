// ---------------------------------------------------------------------------
// Pure OKLCH replacement for Ant Design's dark algorithm colorPrimaryActive.
//
// The main branch fed seed colors through antd's darkAlgorithm to get
// `colorPrimaryActive` before passing to showcaseCardBackgroundColor().
// Analysis of 87 handpicked seeds showed the transformation is linear in OKLCH:
//   outL = 0.704 * inL + 0.044
//   outC = 0.70 * inC
//   outH = inH  (unchanged)
//
// Max error vs actual antd output: L ±0.003, C ±0.002, H ±1° (hue error
// only on near-white inputs where chroma ~0 makes hue meaningless).
// ---------------------------------------------------------------------------

import chroma from 'chroma-js'

export function deriveAntdColorPrimaryActive(seedColor: string): string {
  const [l, c, h] = chroma(seedColor).oklch()
  return chroma.oklch(
    0.704 * l + 0.044,
    0.70 * c,
    h,
  ).hex()
}
