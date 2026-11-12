import { Alert } from '@mantine/core'
import {
  type EnrichedWarpRequest,
  PlannerMode,
  WarpTargetKind,
  type WarpTargetResult,
} from 'lib/tabs/tabWarp/warpCalculatorTypes'
import { getSkinBanner } from 'lib/tabs/tabWarp/warpSkinBanners'
import { localeNumberComma } from 'lib/utils/i18nUtils'

// Invites only cost jade, so passes and starlight in the warp total can't buy skin draws.
export function SkinJadeWarning({ targetResults, request, plannerMode, mt }: {
  targetResults: WarpTargetResult[],
  request: EnrichedWarpRequest,
  plannerMode: PlannerMode,
  mt?: number,
}) {
  const skinResult = targetResults.find((result) => result.kind === WarpTargetKind.SKIN)
  if (!skinResult) return null

  const banner = getSkinBanner(skinResult.target.skin.bannerId)
  const lastDraw = Object.values(skinResult.milestoneResults).at(-1)
  if (!banner || !lastDraw || request.totalJade >= lastDraw.jades) return null

  const goal = lastDraw.draw === banner.draws.length ? 'Guaranteeing the skin' : `Reaching Draw ${lastDraw.draw}`
  // Simple mode always plans the skin first; Multi-Target mode can reorder it after other goals.
  const orderHint = plannerMode === PlannerMode.SIMPLE
    ? 'Use Multi-Target mode to plan the skin after other goals.'
    : 'Drag the skin below other goals to plan it last.'

  return (
    <Alert variant='light' color='red' mt={mt}>
      <div>{`${goal} requires at least ${localeNumberComma(lastDraw.jades)} Jade. Passes and Starlight can't be used for the skin.`}</div>
      <div>{`Missing the skin also lowers the odds of later goals. ${orderHint}`}</div>
    </Alert>
  )
}
