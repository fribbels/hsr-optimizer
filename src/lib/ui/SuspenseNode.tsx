import {
  Skeleton,
  type SkeletonProps,
} from '@mantine/core'
import {
  memo,
  type ReactNode,
  Suspense,
  use,
  useEffect,
  useState,
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
  init?: never
  callback?: never
  selector?: never
}
interface ComplexProps<T = any, A = any> extends CommonProps {
  promise: Promise<T>
  init?: (arg: T) => A
  selector(arg: A): ReactNode
  callback?: (arg: A) => void
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

function SuspenseSkeleton(props: SkeletonProps & { skeletonClassName?: string }) {
  const { skeletonClassName, ...rest } = props
  return <Skeleton {...rest} className={skeletonClassName}>foo</Skeleton>
}

function SuspenseTextPending(props: Props) {
  const { promise, selector, textSpanClassName, disableDefer, fallback, init, callback, ...skeletonProps } = props
  // for some reason the skeleton doesn't render unless dummy text is inserted as a child
  return <SuspenseSkeleton {...skeletonProps} />
}

function SuspenseTextReady(props: Props) {
  const { promise, selector, textSpanClassName, init, callback } = props
  const res = use(promise)
  const initRes = init ? init(res) : res
  const node = selector ? selector(initRes) : initRes
  useEffect(() => callback?.(initRes), [callback, initRes])
  if (textSpanClassName) return <span className={textSpanClassName}>{node}</span>
  return node
}
