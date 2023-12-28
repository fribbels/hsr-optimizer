export const RelicFilters = {
  applyRankFilter: (request, relics) => {
    if (!request.rankFilter) return relics;

    let characters = DB.getCharacters()
    let characterId = request.characterId;
    let higherRankedRelics = {}
    for (let i = 0; i < characters.length; i++) {
      let rankedCharacter = characters[i]
      if (rankedCharacter.id == characterId) {
        break
      }

      Object.values(rankedCharacter.equipped)
        .filter(x => x != null && x != undefined)
        .map(x => higherRankedRelics[x] = true)
    }

    return relics = relics.filter(x => !higherRankedRelics[x.id])
  },

  
  applyMainFilter: (request, relics) => {
    let out = []
    out.push(...relics.filter(x => x.part == Constants.Parts.Head))
    out.push(...relics.filter(x => x.part == Constants.Parts.Hands))
    out.push(...relics.filter(x => x.part == Constants.Parts.Body).filter(x => request.mainBody.length == 0 || request.mainBody.includes(x.main.stat)))
    out.push(...relics.filter(x => x.part == Constants.Parts.Feet).filter(x => request.mainFeet.length == 0 || request.mainFeet.includes(x.main.stat)))
    out.push(...relics.filter(x => x.part == Constants.Parts.PlanarSphere).filter(x => request.mainPlanarSphere.length == 0 || request.mainPlanarSphere.includes(x.main.stat)))
    out.push(...relics.filter(x => x.part == Constants.Parts.LinkRope).filter(x => request.mainLinkRope.length == 0 || request.mainLinkRope.includes(x.main.stat)))
  
    return out;
  },

  applyEnhanceFilter: (request, relics) => {
    return relics.filter(x => x.enhance >= request.enhance);
  },

  applyGradeFilter: (request, relics) => {
    return relics.filter(x => x.grade ? x.grade >= request.grade : true);
  },

  applySetFilter: (request, relics) => {
    function relicFilter(request, relics) {
      if (!request.relicSets || request.relicSets.length == 0) {
        return relics
      }
      let allowedSets = Utils.arrayOfZeroes(Object.values(Constants.SetsRelics).length)

      for (let relicSet of request.relicSets) {
        if (relicSet[0] == '4 Piece') {
          if (relicSet.length == 1) {
            allowedSets = Utils.arrayOfValue(Object.values(Constants.SetsRelics).length, 1)
          }
          if (relicSet.length == 2) {
            let index = Constants.RelicSetToIndex[relicSet[1]]
            allowedSets[index] = 1
          }
        }
        if (relicSet[0] == '2 Piece') {
          if (relicSet.length == 1) {
            allowedSets = Utils.arrayOfValue(Object.values(Constants.SetsRelics).length, 1)
          }
          if (relicSet.length == 2) {
            allowedSets = Utils.arrayOfValue(Object.values(Constants.SetsRelics).length, 1)
          }
          if (relicSet.length == 3) {
            if (relicSet[2] == 'Any') {
              allowedSets = Utils.arrayOfValue(Object.values(Constants.SetsRelics).length, 1)
            }
            let index1 = Constants.RelicSetToIndex[relicSet[1]]
            allowedSets[index1] = 1

            let index2 = Constants.RelicSetToIndex[relicSet[2]]
            allowedSets[index2] = 1
          }
        }
      }

      return relics.filter(relic => {
        if (
          relic.part == Constants.Parts.Head || 
          relic.part == Constants.Parts.Hands || 
          relic.part == Constants.Parts.Body || 
          relic.part == Constants.Parts.Feet) {
          if (allowedSets[Constants.RelicSetToIndex[relic.set]] != 1) {
            return false
          } else {
            return true
          }
        } else {
          return true
        }
      })
    }

    function ornamentFilter(request, relics) {
      if (!request.ornamentSets || request.ornamentSets.length == 0) {
        return relics
      }
      let allowedSets = Utils.arrayOfZeroes(Object.values(Constants.SetsOrnaments).length)

      for (let ornamentSet of request.ornamentSets) {
        let index = Constants.OrnamentSetToIndex[ornamentSet]
        allowedSets[index] = 1
      }

      return relics.filter(relic => {
        if (
          relic.part == Constants.Parts.PlanarSphere || 
          relic.part == Constants.Parts.LinkRope) {
          if (allowedSets[Constants.OrnamentSetToIndex[relic.set]] != 1) {
            return false
          } else {
            return true
          }
        } else {
          return true
        }
      })
    }

    return ornamentFilter(request, relicFilter(request, relics))
  },

  applyCurrentFilter: (request, relics) => {
    if (!request.keepCurrentRelics) return relics;

    let character = DB.getCharacterById(request.characterId)
    if (!character) {
      return relics
    }

    function matchingRelic(part) {
      let match = character.equipped[part] ? relics[part].find(x => x.id == character.equipped[part]) : undefined
      return match ? [match] : relics[part]
    }
    
    return {
      Head: matchingRelic(Constants.Parts.Head),
      Hands: matchingRelic(Constants.Parts.Hands),
      Body: matchingRelic(Constants.Parts.Body),
      Feet: matchingRelic(Constants.Parts.Feet),
      PlanarSphere: matchingRelic(Constants.Parts.PlanarSphere),
      LinkRope: matchingRelic(Constants.Parts.LinkRope)
    }
    // let matchingHead = character.equipped.Head ? relics.Head.find(x => x.id == character.equipped.Head.id) : undefined
    // let matchingHands = character.equipped.Hands ? relics.Hands.find(x => x.id == character.equipped.Hands.id) : undefined
    // let matchingBody = relics.Body.find(x => x.id == character.equipped.Body.id)
    // let matchingFeet = relics.Feet.find(x => x.id == character.equipped.Feet.id)
    // let matchingPlanarSphere = relics.PlanarSphere.find(x => x.id == character.equipped.PlanarSphere.id)
    // let matchingLinkRope = relics.LinkRope.find(x => x.id == character.equipped.LinkRope.id)

    // return {
    //   Head: matchingHead ? [matchingHead] : relics.Head,
    //   Hands: matchingHands ? [matchingHands] : relics.Hands,
    //   Body: matchingBody ? [matchingBody] : relics.Body,
    //   Feet: matchingFeet ? [matchingFeet] : relics.Feet,
    //   PlanarSphere: matchingPlanarSphere ? [matchingPlanarSphere] : relics.PlanarSphere,
    //   LinkRope: matchingLinkRope ? [matchingLinkRope] : relics.LinkRope
    // }
  },
  
  splitRelicsByPart: (relics) => {
    return {
      Head: relics.filter(x => x.part == Constants.Parts.Head),
      Hands: relics.filter(x => x.part == Constants.Parts.Hands),
      Body: relics.filter(x => x.part == Constants.Parts.Body),
      Feet: relics.filter(x => x.part == Constants.Parts.Feet),
      PlanarSphere: relics.filter(x => x.part == Constants.Parts.PlanarSphere),
      LinkRope: relics.filter(x => x.part == Constants.Parts.LinkRope)
    }
  }
}