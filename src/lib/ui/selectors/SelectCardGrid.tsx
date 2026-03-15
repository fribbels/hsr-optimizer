import { Utils } from 'lib/utils/utils'
import { MouseEvent, useMemo } from 'react'
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
  options: Array<{ id: TId; label: string; rarity: number }>
  onSelect: (id: TId) => void
  getImageSrc: (id: TId) => string
  cardImageHeight: string
  imageWidth?: string
  imageXOffset?: string
  imageYOffset?: string
  textRows?: 1 | 2
  excludedIds?: Set<TId>
}) {
  const sortedOptions = useMemo(
    () => [...options].sort(Utils.sortRarityDesc),
    [options],
  )

  // Pre-compute className per card (avoids string concat in render loop)
  const cardClassNames = useMemo(() => {
    return sortedOptions.map((option) => {
      const isExcluded = excludedIds?.has(option.id)
      return `${classes.card} ${rarityClass[option.rarity] ?? ''} ${isExcluded ? classes.cardExcluded : ''}`
    })
  }, [sortedOptions, excludedIds])

  // Static text style — same for all cards, computed once
  const textOverlayStyle = useMemo(() => ({ height: 18 * textRows }), [textRows])
  const textInnerStyle = useMemo(() => ({ WebkitLineClamp: textRows, maxHeight: 18 * textRows }), [textRows])

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
        '--card-image-width': imageWidth ?? '135px',
        '--card-image-x-offset': imageXOffset ?? '-13%',
        '--card-image-y-offset': imageYOffset ?? '-6%',
      } as React.CSSProperties}
      onMouseDown={handleGridMouseDown}
    >
      {sortedOptions.map((option, i) => (
        <div key={option.id} className={cardClassNames[i]} data-id={option.id}>
          <img
            className={classes.cardImage}
            src={getImageSrc(option.id)}
            alt={option.label}
            loading="lazy"
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
