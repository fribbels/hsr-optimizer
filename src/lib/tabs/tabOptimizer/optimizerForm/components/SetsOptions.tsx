import { Flex } from 'antd'
import i18next from 'i18next'
import {
  Constants,
  RelicSetFilterOptions,
  setToId,
  UnreleasedSets,
} from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import { ReactElement } from 'types/components'

type OptionsWithChildren = {
  value: string,
  label: ReactElement | string,
  children: Options[],
}

type Options = {
  value: string,
  label: ReactElement | string,
  children?: Options[],
}

// This should be memoised with either the t function or resolved language as a dependency
const GenerateSetsOptions = () => {
  const t = i18next.getFixedT(null, 'optimizerTab', 'RelicSetSelector')
  const tGameData = i18next.getFixedT(null, 'gameData', 'RelicSets')
  const result: OptionsWithChildren[] = [
    // Example: aaaa
    {
      value: RelicSetFilterOptions.relic4Piece,
      label: t('4pcLabel'),
      children: [],
    },
    // Example: aabb
    {
      value: RelicSetFilterOptions.relic2Plus2Piece,
      label: t('2+2pcLabel'),
      children: [],
    },
    // Example: aabc
    {
      value: RelicSetFilterOptions.relic2PlusAny,
      label: t('2pcLabel'),
      children: [],
    },
  ]

  const tier2Children = Object.entries(Constants.SetsRelics)
    .filter((x) => !UnreleasedSets[x[1]])
    .map((set) => ({ value: set[1], label: set[1] }))

  const GenerateLabel = (value: string, parens: string, label: string): JSX.Element => {
    const imageSrc = value == 'Any' ? Assets.getBlank() : Assets.getSetImage(value, Constants.Parts.Head)
    return (
      <Flex gap={5} align='center'>
        <img src={imageSrc} style={{ width: 26, height: 26 }}></img>
        <div style={{ display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', width: 250, whiteSpace: 'nowrap' }}>
          {parens + label}
        </div>
      </Flex>
    )
  }

  for (const set of Object.entries(Constants.SetsRelics).filter((x) => !UnreleasedSets[x[1]])) {
    result[0].children.push({
      value: set[1],
      label: GenerateLabel(set[1], '(4) ', tGameData(`${setToId[set[1]]}.Name`)),
    })

    result[1].children.push({
      value: set[1],
      label: GenerateLabel(set[1], '(2) ', tGameData(`${setToId[set[1]]}.Name`)),
      children: tier2Children.map((x) => {
        return {
          value: x.value,
          label: GenerateLabel(x.value, '(2) ', tGameData(`${setToId[x.label]}.Name`)),
        }
      }),
    })

    result[2].children.push({
      value: set[1],
      label: GenerateLabel(set[1], '(2) ', tGameData(`${setToId[set[1]]}.Name`)),
    })
  }

  return result
}

// This should be memoised with either the t function or resolved language as a dependency
export const GenerateBasicSetsOptions = (): { value: string, label: JSX.Element }[] => {
  const tGameData = i18next.getFixedT(null, 'gameData', 'RelicSets')
  return Object.values(Constants.SetsRelics)
    .filter((x) => !UnreleasedSets[x])
    .map((x) => {
      return {
        value: x,
        label: (
          <Flex gap={5} align='center'>
            <img src={Assets.getSetImage(x, Constants.Parts.Head)} style={{ width: 21, height: 21 }}></img>
            <div style={{ display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', width: 250, whiteSpace: 'nowrap' }}>
              {tGameData(`${setToId[x]}.Name`)}
            </div>
          </Flex>
        ),
      }
    })
}

export default GenerateSetsOptions
