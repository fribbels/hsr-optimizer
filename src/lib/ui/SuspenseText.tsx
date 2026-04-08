import {
  type MantineRadius,
  Skeleton,
} from '@mantine/core'
import {
  type CSSProperties,
  memo,
  type ReactNode,
  Suspense,
  use,
} from 'react'
import { DeferCreate } from './DeferredRender'

interface SkeletonProps {
  animate?: boolean
  cicrle?: boolean
  height?: string | number
  raidus?: MantineRadius | number
  visible?: boolean
  width?: CSSProperties['width']
}
interface CommonProps extends SkeletonProps {
  skeletonClassName?: string
  textSpanClassName?: string
}
interface SimpleProps extends CommonProps {
  nodePromise: Promise<ReactNode>
  promise?: never
  selector?: never
}
interface ComplexProps<T = any> extends CommonProps {
  nodePromise?: never
  promise: Promise<T>
  selector(arg: NoInfer<T>): ReactNode
}
type Props = SimpleProps | ComplexProps
export const SuspenseText = memo(function SuspenseText(props: Props) {
  return (
    <DeferCreate>
      <Suspense fallback={<SuspenseTextPending {...props} />}>
        <SuspenseTextReady {...props} />
      </Suspense>
    </DeferCreate>
  )
})

function SuspenseTextPending(props: Props) {
  const { promise, nodePromise, selector, skeletonClassName, textSpanClassName, ...skeletonProps } = props
  // for some reason the skeleton doesn't render unless dummy text is inserted as a child
  return <Skeleton {...skeletonProps} className={skeletonClassName}>foo</Skeleton>
}

function SuspenseTextReady(props: Props) {
  const text = props.nodePromise ? use(props.nodePromise) : props.selector(use(props.promise))
  return <span className={props.textSpanClassName}>{text}</span>
}
