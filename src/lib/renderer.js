import {Flex, Image, Tag,} from 'antd';

export const Renderer = {
  floor: (x) => {
    if (x == undefined || x.value == undefined) return '';
    return Math.floor(x.value)
  },

  x100Tenths: (x) => {
    if (x == undefined || x.value == undefined) return '';
    return (x.value * 100).toFixed(1)
  },

  ornamentSet: (x) => {
    if (x == undefined || x.value == undefined) return '';
    let build = OptimizerTabController.calculateRelicsFromId(x.data.id)
    let { ornamentSets } = Utils.relicsToSetArrays(Object.values(build).map(x => DB.getRelicById(x)));
    let setImages = []
  
    for (let i = 0; i < ornamentSets.length; i++) {
      while (ornamentSets[i] > 1) {
        let setName = Object.entries(Constants.OrnamentSetToIndex).find(x => x[1] == i)[0]
        setImages[2] = Assets.getSetImage(setName, Constants.Parts.PlanarSphere)
  
        ornamentSets[i] -= 2
      }
    }
  
    return (
      <Flex justify='center' style={{marginTop: -1}}>
        <SetDisplay asset={setImages[2]} />
      </Flex>
    )
  },

  relicSet : (x) => {
    if (x == undefined || x.value == undefined) return '';
    let build = OptimizerTabController.calculateRelicsFromId(x.data.id)
    let { relicSets } = Utils.relicsToSetArrays(Object.values(build).map(x => DB.getRelicById(x)));
    let setImages = []
  
    for (let i = 0; i < relicSets.length; i++) {
      while (relicSets[i] > 1) {
        let setName = Object.entries(Constants.RelicSetToIndex).find(x => x[1] == i)[0]
        let assetValue = Assets.getSetImage(setName, Constants.Parts.Head)
        setImages.push(assetValue)
  
        relicSets[i] -= 2
      }
    }
  
    return (
      <Flex justify='center' style={{marginTop: -1}}>
        <SetDisplay asset={setImages[0]} />
        <SetDisplay asset={setImages[1]} />
      </Flex>
    )
  },

  anySet: (x) => {
    if (x == undefined || x.value == undefined) return '';
    let part = x.data.part
  
    let src = Assets.getSetImage(x.data.set, part)
    return (
      <Flex justify='center' title={x.data.set} style={{marginTop: -1}}>
        <SetDisplay asset={src} />
      </Flex>
    )
  },

  characterIcon: (x) => {
    if (x == undefined || x.value == undefined) return '';
    let equippedBy = x.data.equippedBy
    if (!equippedBy) return ''

    let src = Assets.getCharacterAvatarById(equippedBy)
    return (
      <Flex justify='center' style={{ marginTop: -1 }}>
        <SetDisplay asset={src} />
      </Flex>
    )
  },

  readableStat: (x) => {
    if (x == undefined || x.value == undefined) return '';
    return Constants.StatsToReadable[x.value]
  },

  readablePart: (x) => {
    if (x == undefined || x.value == undefined) return '';
    return Constants.PartsToReadable[x.value]
  },

  hideZeroes: (x) => {
    return x.value == 0 ? "" : x.value
  },

  mainValueRenderer: (x) => {
    let part = x.data.part
    if (part == Constants.Parts.Hands || part == Constants.Parts.Head) {
      return x.value == 0 ? "" : Math.floor(x.value)
    }
    return x.value == 0 ? "" : Utils.truncate10ths(x.value)
  },

  hideZeroesX100Tenths: (x) => {
    return x.value == 0 ? "" : Renderer.x100Tenths(x)
  },

  scoreRenderer: (x) => {
    return Math.round(x.value)
  },
}

function SetDisplay(props) {
  if (props.asset) {
    return (
      <Image src={props.asset} width={32} preview={false}>
      </Image>
    )
  } else {
    return ''
  }
}

// For displaying stats from selectors, unused
function statTagRenderer(props) {
  const { label, value, closable, onClose } = props;
  const onPreventMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{display: 'flex', flexDirection: 'row', paddingInline: '3px', marginInlineEnd: '4px'}}
    >
      <Flex>
        <img src={Assets.getStatIcon(value)} style={{width: 22, height: 22}}></img>
      </Flex>
    </Tag>
  );
}