import { getPreviewRelics } from 'lib/characterPreview/characterPreviewController'
import React from 'react'
import { Character } from 'types/character'

export enum CharacterPreviewSource {
  CHARACTER_TAB,
  SHOWCASE_TAB,
  BUILDS_MODAL,
}

export function CharacterShowcase(props: {
  source: CharacterPreviewSource
  character: Character
  setOriginalCharacterModalOpen: (open: boolean) => void
  setOriginalCharacterModalInitialCharacter: (character: Character) => void
  setCharacterModalAdd: (add: boolean) => void
}) {
  const {
    source,
    character,
    setOriginalCharacterModalOpen,
    setOriginalCharacterModalInitialCharacter,
    setCharacterModalAdd,
  } = props

  if (1 == 1) {
    props.source = CharacterPreviewSource.CHARACTER_TAB
  }

  const relicsById = window.store((s) => s.relicsById)

  const { scoringResults, displayRelics } = getPreviewRelics(source, character, relicsById)

  return (
    <div className='character-preview-container'>
      {props.source == CharacterPreviewSource.CHARACTER_TAB && <CharacterScorerDisplay character={props.character}/>}
      {props.source == CharacterPreviewSource.SHOWCASE_TAB && <CharacterDefaultDisplay character={props.character}/>}
      {props.source == CharacterPreviewSource.BUILDS_MODAL && <CharacterBuildsDisplay character={props.character}/>}
    </div>
  )
}

function CharacterScorerDisplay() {
  // Scorer-specific content
  return (
    <div>

    </div>
  )
}

function CharacterDefaultDisplay() {
  // Scorer-specific content
  return <div>{/* Components and logic specific to the scorer display */}</div>
}

function CharacterBuildsDisplay() {
  // Scorer-specific content
  return <div>{/* Components and logic specific to the scorer display */}</div>
}
