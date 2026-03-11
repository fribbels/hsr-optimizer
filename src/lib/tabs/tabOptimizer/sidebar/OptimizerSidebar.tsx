import { Flex } from '@mantine/core'
import { useScrollLockState } from 'lib/rendering/scrollController'
import { defaultPadding } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { BuildsSection } from 'lib/tabs/tabOptimizer/sidebar/BuildsSection'
import { OptimizerControlsSection } from 'lib/tabs/tabOptimizer/sidebar/OptimizerControlsSection'
import { PermutationsSection } from 'lib/tabs/tabOptimizer/sidebar/PermutationsSection'
import { ResultsSection } from 'lib/tabs/tabOptimizer/sidebar/ResultsSection'

const SCROLLBAR_WIDTH = 5 // px
const RESERVED_SPACE = 2 // px

export function OptimizerSidebar(props: { isFullSize: boolean }) {

  const { offset, isLocked } = useScrollLockState()
  const totalSideOffset = SCROLLBAR_WIDTH + RESERVED_SPACE
  const shadow = 'rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.15) 0px 0px 0px 1px inset'
  return (
    <Flex direction="column" style={{ overflow: 'clip' }}>
      <Flex
        justify={props.isFullSize ? 'center' : 'space-evenly'}
        style={props.isFullSize
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
            backgroundColor: 'var(--bg-sidebar)',
            boxShadow: shadow,
            borderRadius: 5,
            padding: defaultPadding,
            zIndex: 3, /* prevent overlap with optimizer grid - ag-grid pinned top row has z-index 2 */
          }}
      >
        <Flex
          style={props.isFullSize
            ? {
              borderRadius: 5,
              backgroundColor: 'var(--mantine-color-dark-7)',
              padding: defaultPadding,
              height: 'fit-content',
              width: 233,
              boxShadow: shadow,
              gap: defaultPadding,
            }
            : undefined}
        >
          <Flex direction={props.isFullSize ? 'column' : 'row'} gap={props.isFullSize ? 5 : 20}>
            <PermutationsSection isFullSize={props.isFullSize} />
            <OptimizerControlsSection isFullSize={props.isFullSize} />
            <ResultsSection isFullSize={props.isFullSize} />
            <BuildsSection isFullSize={props.isFullSize} />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}
