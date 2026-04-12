import {
  Skeleton,
  type SkeletonProps,
} from '@mantine/core'
import { usePromise } from 'hooks/usePromise'
import {
  memo,
  type ReactNode,
} from 'react'

interface BaseProps {
  textSpanClassName?: string
  fallback?: ReactNode
}
interface SimpleProps extends BaseProps, SkeletonProps {
  promise: Promise<ReactNode>
  selector?: never
}
interface ComplexProps<T = any> extends BaseProps, SkeletonProps {
  promise: Promise<T>
  selector(arg: T): ReactNode
}
type Props = SimpleProps | ComplexProps

export const SuspenseNode = memo(function SuspenseNode(props: Props) {
  const { promise, selector, textSpanClassName, fallback, ...skeletonProps } = props
  const output = usePromise(promise)

  if (output === null) {
    if (fallback !== undefined) return fallback
    return <Skeleton {...skeletonProps}>foo</Skeleton>
  }

  const node = selector ? selector(output) : (output as ReactNode)
  return textSpanClassName ? <span className={textSpanClassName}>{node}</span> : node
})
