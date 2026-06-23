import {
  type MouseEvent,
  useMemo,
} from 'react'
import classes from './SelectCardGrid.module.css'

const rarityClass: Record<number, string> = {
  5: classes.rarity5Card,
  4: classes.rarity4Card,
  3: classes.rarity3Card,
}

export function SelectCardGrid<TId extends string>({
  options,
  onSelect,
  getImageSrc,
  cardImageHeight,
  imageWidth,
  imageXOffset,
  imageYOffset,
  textRows = 1,
  excludedIds,
}: {
  options: Array<{ id: TId, label: string, rarity: number }>,
  onSelect: (id: TId) => void,
  getImageSrc: (id: TId) => string,
  cardImageHeight: string,
  imageWidth?: string,
  imageXOffset?: string,
  imageYOffset?: string,
  textRows?: 1 | 2,
  excludedIds?: Set<TId>,
}) {
  const sortedOptions = useMemo(
    () => [...options].sort((a: { rarity: number }, b: { rarity: number }) => b.rarity - a.rarity),
    [options],
  )

  // Stable base classNames — only recomputed when sort order changes, not on every toggle
  const baseClassNames = useMemo(
    () => sortedOptions.map((o) => `${classes.card} ${rarityClass[o.rarity] ?? ''}`),
    [sortedOptions],
  )

  const textOverlayStyle = useMemo(() => ({ height: 18 * textRows }), [textRows])
  const textInnerStyle = useMemo(() => ({
    WebkitLineClamp: textRows,
    maxHeight: 18 * textRows,
    wordBreak: textRows > 1 ? 'break-word' as const : undefined,
  }), [textRows])

  // Event delegation: single handler on the grid, read data-id from clicked card
  const handleGridMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>('[data-id]')
    if (card?.dataset.id) {
      onSelect(card.dataset.id as TId)
    }
  }

  return (
    <div
      className={classes.cardGrid}
      style={{
        '--card-image-height': cardImageHeight,
        '--card-image-width': imageWidth ?? '150px',
        '--card-image-x-offset': imageXOffset ?? '-13%',
        '--card-image-y-offset': imageYOffset ?? '10%',
      } as React.CSSProperties}
      onMouseDown={handleGridMouseDown}
    >
      {sortedOptions.map((option, i) => (
        <div
          key={option.id}
          className={`${baseClassNames[i]} ${excludedIds?.has(option.id) ? classes.cardExcluded : ''}`}
          data-id={option.id}
        >
          <img
            className={classes.cardImage}
            src={getImageSrc(option.id)}
            alt={option.label}
            loading='lazy'
          />
          <div className={classes.textOverlay} style={textOverlayStyle}>
            <div className={classes.textInner} style={textInnerStyle}>
              {option.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
