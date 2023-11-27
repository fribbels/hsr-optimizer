import { Divider, Flex, Image, Typography } from "antd";
import RelicPreview from "./RelicPreview";
import styled from "styled-components";

const { Text } = Typography;

const StatText = styled(Text)`
  font-family: Segoe UI,Frutiger,Frutiger Linotype,Dejavu Sans,Helvetica Neue,Arial,sans-serif;
  font-size: 17px;
  font-weight: 400;
`


export function CharacterPreview(props) {
  let character = props.character
  let selectedCharacter = character

  let defaultGap = 8;

  let parentH = 280 * 3 + defaultGap * 2;
  let parentW = 150 + 200 + defaultGap;
  let innerW = 1024;

  let middleColumnWidth = 240;
  let lcParentH = 280;
  let lcParentW = 230;
  let lcInnerW = 240;
  let lcInnerH = 1260 / 902 * lcInnerW;

  if (!character) return (
    <Flex style={{ display: 'flex', height: parentH }} gap={defaultGap}>
      <div style={{ width: parentW, height: `${parentH}px`, overflow: 'hidden', outline: '2px solid #243356', height: '100%', borderRadius: '10px' }}>
      </div>

      <Flex gap={defaultGap}>
        <Flex vertical gap={defaultGap} align='center' style={{ outline: '2px solid #243356', width: '100%', height: '100%', borderRadius: '10px' }}>
          <Flex vertical style={{ width: middleColumnWidth, height: 280 * 2 + defaultGap }} justify='space-between'>
            <Flex></Flex>
          </Flex>
        </Flex>

        <Flex vertical gap={defaultGap}>
          <RelicPreview />
          <RelicPreview />
          <RelicPreview />
        </Flex>

        <Flex vertical gap={defaultGap}>
          <RelicPreview />
          <RelicPreview />
          <RelicPreview />
        </Flex>
      </Flex>
    </Flex>
  )
  let finalStats = StatCalculator.calculate(selectedCharacter);

  console.log({ finalStats })
  console.log({ selectedCharacter })

  let lightConeId = selectedCharacter.form.lightCone
  let lightConeLevel = selectedCharacter.form.lightConeLevel
  let lightConeSuperimposition = selectedCharacter.form.lightConeSuperimposition
  let lightConeMetadata = DB.getMetadata().lightCones[lightConeId]
  let lightConeName = lightConeMetadata.name
  let lightConeSrc = Assets.getLightConePortrait(lightConeMetadata)

  let characterId = selectedCharacter.form.characterId
  let characterLevel = selectedCharacter.form.characterLevel
  let characterEidolon = selectedCharacter.form.characterEidolon
  let characterMetadata = DB.getMetadata().characters[characterId]
  let characterName = characterMetadata.displayName
  let characterPath = characterMetadata.path
  let characterElement = characterMetadata.element

  console.log('Level ' + characterLevel + ' E' + characterEidolon)
  console.log('Level ' + lightConeLevel + ' S' + lightConeSuperimposition)

  let elementToDmgValueMapping = {
    Physical: Constants.Stats.Physical_DMG,
    Fire: Constants.Stats.Fire_DMG,
    Ice: Constants.Stats.Ice_DMG,
    Thunder: Constants.Stats.Lightning_DMG,
    Wind: Constants.Stats.Wind_DMG,
    Quantum: Constants.Stats.Quantum_DMG,
    Imaginary: Constants.Stats.Imaginary_DMG,
  }
  let elementalDmgValue = elementToDmgValueMapping[characterElement]
  // let cv = character.cv

  console.log({
    lightConeMetadata,
    characterMetadata
  })
  function isFlat(stat) {
    return
  }
  function StatRow(props) {
    let stat = props.stat
    let readableStat = stat.replace('DMG Boost', 'DMG')
    let value = finalStats[stat]

    if (stat == 'CV') {
      value = value.toFixed(1)
    } else if (Utils.isFlat(stat)) {
      value = Math.floor(value)
    } else {
      value = (value * 100).toFixed(1)
    }

    if (!finalStats) return console.log('No final stats');
    let iconSize = 25
    return (
      <Flex justify='space-between'>
        <img src={Assets.getStatIcon(stat)} style={{ width: iconSize, height: iconSize, marginRight: 3 }}></img>
        <StatText>{readableStat}</StatText>
        <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed />
        <StatText>{`${value}${Utils.isFlat(stat) || stat == 'CV' ? '' : '%'}`}</StatText>
      </Flex>
    )
  }

  function Rarity() {
    let children = []
    for (let i = 0; i < characterMetadata.rarity; i++) {
      children.push(
        <img src={Assets.getStar()} key={i} style={{ width: 20, height: 20 }}></img>
      )
    }
    return (
      <Flex gap={0} align='center'>
        {children}
      </Flex>
    )
  }

  return (
    <Flex style={{ display: selectedCharacter ? 'flex' : 'none', height: parentH }} gap={defaultGap}>
      <div style={{ width: `${parentW}px`, height: `${parentH}px`, overflow: 'hidden', borderRadius: '10px' }}>
        <Image
          preview={false}
          width={innerW}
          src={Assets.getCharacterPortraitById(selectedCharacter.id)}
          // style={{transform: `translate(${(innerW - parentW)/2/innerW * -100}%, ${(innerW - parentH)/2/innerW * -100}%)`}}
          style={{
            transform: `translate(${((innerW - parentW) / 2 / innerW * -100) - (characterMetadata.imageCenter.x - innerW) / innerW / 2 * 100}%, 
                                  ${((innerW - parentH) / 2 / innerW * -100) - (characterMetadata.imageCenter.y - innerW) / innerW / 2 * 100}%)`
          }}
        />
      </div>

      <Flex gap={defaultGap}>
        <Flex vertical gap={defaultGap} align='center'>
          <Flex vertical style={{ width: middleColumnWidth, height: 280 * 2 + defaultGap }} justify='space-between'>
            <Flex vertical gap={defaultGap}>
              <Flex justify='space-between' style={{ height: 50 }}>
                <Image
                  preview={false}
                  width={50}
                  src={Assets.getElement(characterElement)}
                />
                <Rarity />
                <Image
                  preview={false}
                  width={50}
                  src={Assets.getPathFromClass(characterPath)}
                />
              </Flex>
              <Flex vertical>
                <StatText style={{ fontSize: 24, fontWeight: 400, textAlign: 'center' }}>
                  {characterName}
                </StatText>
                <StatText style={{ fontSize: 18, fontWeight: 400, textAlign: 'center' }}>
                  {`Lv${characterLevel} E${characterEidolon}`}
                </StatText>
              </Flex>
            </Flex>
            <Flex vertical style={{ width: middleColumnWidth, paddingLeft: 8, paddingRight: 12 }} gap={5}>
              <StatRow stat={Constants.Stats.HP} />
              <StatRow stat={Constants.Stats.ATK} />
              <StatRow stat={Constants.Stats.DEF} />
              <StatRow stat={Constants.Stats.SPD} />
              <StatRow stat={Constants.Stats.CR} />
              <StatRow stat={Constants.Stats.CD} />
              <StatRow stat={Constants.Stats.EHR} />
              <StatRow stat={Constants.Stats.RES} />
              <StatRow stat={Constants.Stats.BE} />
              <StatRow stat={elementalDmgValue} />
              <StatRow stat={'CV'} />
            </Flex>
            <Flex vertical>
              <StatText style={{ fontSize: 18, fontWeight: 400, textAlign: 'center' }} ellipsis={true}>
                {lightConeName}
              </StatText>
              <StatText style={{ fontSize: 18, fontWeight: 400, textAlign: 'center' }}>
                {`Lv${lightConeLevel} S${lightConeSuperimposition}`}
              </StatText>
            </Flex>
          </Flex>
          <div style={{ width: `${lcParentW}px`, height: `${lcParentH}px`, overflow: 'hidden', borderRadius: '10px' }}>
            <img
              src={lightConeSrc}
              style={{ width: lcInnerW, transform: `translate(${(lcInnerW - lcParentW) / 2 / lcInnerW * -100}%, ${(lcInnerH - lcParentH) / 2 / lcInnerH * -100}%)` }}
            />
          </div>
        </Flex>

        <Flex vertical gap={defaultGap}>
          <RelicPreview relic={selectedCharacter.equipped?.Head} source={props.source}/>
          <RelicPreview relic={selectedCharacter.equipped?.Body} source={props.source} />
          <RelicPreview relic={selectedCharacter.equipped?.PlanarSphere} source={props.source} />
        </Flex>

        <Flex vertical gap={defaultGap}>
          <RelicPreview relic={selectedCharacter.equipped?.Hands} source={props.source} />
          <RelicPreview relic={selectedCharacter.equipped?.Feet} source={props.source} />
          <RelicPreview relic={selectedCharacter.equipped?.LinkRope} source={props.source} />
        </Flex>
      </Flex>
    </Flex>
  )
}