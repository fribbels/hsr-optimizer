import { Badge } from '@mantine/core'
import { useIsNewFeature, useIsNewGroup } from 'lib/stores/newFeatureStore'

export function NewFeatureBadge({ featureKey, groupKey, className }: {
  featureKey?: string,
  groupKey?: string,
  className?: string,
}) {
  const isNewExact = useIsNewFeature(featureKey ?? '')
  const isNewGroup = useIsNewGroup(groupKey ?? '')

  const isNew = featureKey ? isNewExact : isNewGroup
  if (!isNew) return null

  return (
    <Badge size='xs' color='blue' variant='filled' className={className}>
      New
    </Badge>
  )
}
