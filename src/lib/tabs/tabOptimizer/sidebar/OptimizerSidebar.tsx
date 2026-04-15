import { Flex } from '@mantine/core'
import { defaultPadding } from 'lib/constants/constantsUi'
import { useScrollLockState } from 'lib/layout/scrollController'
import { BuildsSection } from 'lib/tabs/tabOptimizer/sidebar/BuildsSection'
import { OptimizerControlsSection } from 'lib/tabs/tabOptimizer/sidebar/OptimizerControlsSection'
import { PermutationsSection } from 'lib/tabs/tabOptimizer/sidebar/PermutationsSection'
import { ResultsSection } from 'lib/tabs/tabOptimizer/sidebar/ResultsSection'

const SCROLLBAR_WIDTH = 5 // px
const RESERVED_SPACE = 2 // px

export function OptimizerSidebar({ isFullSize }: { isFullSize: boolean }) {
  const { offset, isLocked } = useScrollLockState()
  const totalSideOffset = SCROLLBAR_WIDTH + RESERVED_SPACE
  return (
    <Flex direction='column' style={{ overflow: 'clip' }}>
      <Flex
        justify={isFullSize ? 'center' : 'space-evenly'}
        style={isFullSize
          ? {
            position: isLocked ? 'relative' : 'sticky',
            top: isLocked ? offset + 195 : 253,
            transform: 'translateY(-50%)',
            paddingLeft: 10,
            height: 150,
          }
          : {
            height: 121,
            overflow: 'clip',
            position: 'fixed',
            width: `calc(100% - ${2 * totalSideOffset}px)`,
            bottom: `${totalSideOffset}px`,
            left: `${totalSideOffset}px`,
            backgroundColor: 'var(--layer-2)',
            boxShadow: 'var(--shadow-card)',
            borderRadius: 6,
            padding: defaultPadding,
            zIndex: 3, /* prevent overlap with optimizer grid - ag-grid pinned top row has z-index 2 */
          }}
      >
        <Flex
          style={isFullSize
            ? {
              borderRadius: 6,
              backgroundColor: 'var(--layer-2)',
              padding: defaultPadding,
              height: 'fit-content',
              width: 233,
              boxShadow: 'var(--shadow-card)',
              gap: defaultPadding,
            }
            : undefined}
        >
          <Flex direction={isFullSize ? 'column' : 'row'} gap={isFullSize ? 5 : 20}>
            <PermutationsSection isFullSize={isFullSize} />
            <OptimizerControlsSection isFullSize={isFullSize} />
            <ResultsSection isFullSize={isFullSize} />
            <BuildsSection isFullSize={isFullSize} />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}
