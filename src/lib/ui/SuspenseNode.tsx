import {
  Skeleton,
  type SkeletonProps,
} from '@mantine/core'
import {
  memo,
  type ReactNode,
  Suspense,
  use,
} from 'react'
import { DeferCreate } from './DeferredRender'

interface CommonProps extends SkeletonProps {
  skeletonClassName?: string
  textSpanClassName?: string
  fallback?: ReactNode
  disableDefer?: boolean
}
interface SimpleProps extends CommonProps {
  promise: Promise<ReactNode>
  selector?: never
}
interface ComplexProps<T = any> extends CommonProps {
  promise: Promise<T>
  selector(arg: NoInfer<T>): ReactNode
}
type Props = SimpleProps | ComplexProps
export const SuspenseNode = memo(function SuspenseText(props: Props) {
  if (props.disableDefer) {
    return (
      <Suspense fallback={props.fallback ?? <SuspenseTextPending {...props} />}>
        <SuspenseTextReady {...props} />
      </Suspense>
    )
  }
  return (
    <DeferCreate>
      <Suspense fallback={props.fallback ?? <SuspenseTextPending {...props} />}>
        <SuspenseTextReady {...props} />
      </Suspense>
    </DeferCreate>
  )
})

function SuspenseTextPending(props: Props) {
  const { promise, selector, skeletonClassName, fallback, ...skeletonProps } = props
  // for some reason the skeleton doesn't render unless dummy text is inserted as a child
  return <Skeleton {...skeletonProps} className={skeletonClassName}>foo</Skeleton>
}

function SuspenseTextReady(props: Props) {
  const node = props.selector ? props.selector(use(props.promise)) : use(props.promise)
  if (props.textSpanClassName) return <span className={props.textSpanClassName}>{node}</span>
  return node
}
