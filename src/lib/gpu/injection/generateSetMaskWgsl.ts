import {
  getSetRegistryCardinality,
  type SetRegistryCardinality,
} from 'lib/gpu/injection/setIndexMap'
import {
  MAX_ORNAMENT_SET_COUNT,
  MAX_RELIC_SET_COUNT,
} from 'lib/sets/setConfigRegistry'

const SET_MASK_WORD_BITS = 32

type OuterMaskRefresh = {
  head: string,
  hands: string,
  body: string,
  feet: string,
}

export type GeneratedSetMaskWgsl = {
  relicWordCount: number,
  ornamentWordCount: number,
  declarations: string,
  outerMaskDeclarations: string,
  setMatchConstruction: string,
  outerMaskRefresh: OuterMaskRefresh,
}

export type SetMaskLocation = {
  wordIndex: number,
  bitIndex: number,
}

export function getSetMaskLocation(setIndex: number, setCount: number): SetMaskLocation | undefined {
  if (!Number.isInteger(setIndex) || setIndex < 0 || setIndex >= setCount) {
    return undefined
  }

  return {
    wordIndex: Math.floor(setIndex / SET_MASK_WORD_BITS),
    bitIndex: setIndex % SET_MASK_WORD_BITS,
  }
}

export function assertSetMaskCardinality(cardinality: SetRegistryCardinality): void {
  if (!Number.isInteger(cardinality.relicSetCount) || cardinality.relicSetCount <= 0) {
    throw new Error(`Invalid relic set cardinality: ${cardinality.relicSetCount}`)
  }
  if (cardinality.relicSetCount > MAX_RELIC_SET_COUNT) {
    throw new Error(
      `Relic set cardinality ${cardinality.relicSetCount} exceeds the flattened filter array-length limit ${MAX_RELIC_SET_COUNT}`,
    )
  }
  if (!Number.isInteger(cardinality.ornamentSetCount) || cardinality.ornamentSetCount <= 0) {
    throw new Error(`Invalid ornament set cardinality: ${cardinality.ornamentSetCount}`)
  }
  if (cardinality.ornamentSetCount > MAX_ORNAMENT_SET_COUNT) {
    throw new Error(
      `Ornament set cardinality ${cardinality.ornamentSetCount} exceeds the flattened filter array-length limit ${MAX_ORNAMENT_SET_COUNT}`,
    )
  }
}

function wordField(base: string, wordIndex: number): string {
  return wordIndex === 0 ? base : `${base}Word${wordIndex}`
}

function oneHot(setId: string, wordIndex: number, wordCount: number): string {
  if (wordCount === 1) {
    return `1u << ${setId}`
  }

  return `select(0u, 1u << (${setId} & 31u), (${setId} >> 5u) == ${wordIndex}u)`
}

function generateFields(base: string, wordCount: number, comment: string): string[] {
  return Array.from(
    { length: wordCount },
    (_, wordIndex) => `  ${wordField(base, wordIndex)}: u32,${wordIndex === 0 ? ` // ${comment}` : ''}`,
  )
}

function generateAccessor(name: string, fieldBase: string, wordCount: number): string {
  if (wordCount === 1) {
    return `fn ${name}(s: SetMatches, setId: u32) -> bool {
  return ((s.${fieldBase} >> setId) & 1u) == 1u;
}`
  }

  const matches = Array.from(
    { length: wordCount },
    (_, wordIndex) => `((word == ${wordIndex}u) & ((s.${wordField(fieldBase, wordIndex)} & bit) != 0u))`,
  )

  return `fn ${name}(s: SetMatches, setId: u32) -> bool {
  let word = setId >> 5u;
  let bit = 1u << (setId & 31u);
  return ${matches.join('\n      | ')};
}`
}

function maskVariable(slot: string, wordIndex: number): string {
  return wordField(`mask${slot}`, wordIndex)
}

function generateOuterMaskLines(
  keyword: 'var' | '',
  slot: string,
  setId: string,
  wordCount: number,
  indentation: string,
): string {
  return Array.from(
    { length: wordCount },
    (_, wordIndex) => {
      const prefix = keyword ? `${keyword} ` : ''
      return `${indentation}${prefix}${maskVariable(slot, wordIndex)} = ${oneHot(setId, wordIndex, wordCount)};`
    },
  ).join('\n')
}

function relicPairExpression(wordIndex: number): string {
  const h = maskVariable('H', wordIndex)
  const g = maskVariable('G', wordIndex)
  const b = maskVariable('B', wordIndex)
  const f = maskVariable('F', wordIndex)

  return `(${h} & ${g}) | (${h} & ${b}) | (${h} & ${f})\n`
    + `                         | (${g} & ${b}) | (${g} & ${f}) | (${b} & ${f})`
}

export function generateSetMaskWgsl(
  cardinality: SetRegistryCardinality = getSetRegistryCardinality(),
): GeneratedSetMaskWgsl {
  assertSetMaskCardinality(cardinality)

  const relicWordCount = Math.ceil(cardinality.relicSetCount / SET_MASK_WORD_BITS)
  const ornamentWordCount = Math.ceil(cardinality.ornamentSetCount / SET_MASK_WORD_BITS)

  const fields = [
    ...generateFields('relicMatch2', relicWordCount, 'bit N set = relic set N has >= 2 pieces'),
    ...generateFields('relicMatch4', relicWordCount, 'bit N set = relic set N has 4 pieces'),
    ...generateFields('ornamentMatch2', ornamentWordCount, 'bit N set = ornament set N has 2 pieces'),
  ]

  const declarations = `// Generated capacity-safe set masks: relicWords=${relicWordCount}, ornamentWords=${ornamentWordCount}
struct SetMatches {
${fields.join('\n')}
}

// Boolean set accessors. Multi-word forms gate on the selected word, so out-of-range words are false.
${generateAccessor('relic2p', 'relicMatch2', relicWordCount)}
${generateAccessor('relic4p', 'relicMatch4', relicWordCount)}
${generateAccessor('ornament2p', 'ornamentMatch2', ornamentWordCount)}`

  const outerMaskDeclarations = `  // Generated persistent outer relic one-hot masks: relicWords=${relicWordCount}
${generateOuterMaskLines('var', 'H', 'setH', relicWordCount, '  ')}
${generateOuterMaskLines('var', 'G', 'setG', relicWordCount, '  ')}
${generateOuterMaskLines('var', 'B', 'setB', relicWordCount, '  ')}
${generateOuterMaskLines('var', 'F', 'setF', relicWordCount, '  ')}`

  const relicAssignments: string[] = []
  for (let wordIndex = 0; wordIndex < relicWordCount; wordIndex++) {
    const h = maskVariable('H', wordIndex)
    const g = maskVariable('G', wordIndex)
    const b = maskVariable('B', wordIndex)
    const f = maskVariable('F', wordIndex)
    relicAssignments.push(
      `    sets.${wordField('relicMatch2', wordIndex)} = ${relicPairExpression(wordIndex)};`,
      `    sets.${wordField('relicMatch4', wordIndex)} = ${h} & ${g} & ${b} & ${f};`,
    )
  }

  const ornamentAssignments = Array.from(
    { length: ornamentWordCount },
    (_, wordIndex) => `    sets.${wordField('ornamentMatch2', wordIndex)} = (${oneHot('setP', wordIndex, ornamentWordCount)}) & (${oneHot('setL', wordIndex, ornamentWordCount)});`,
  )

  const setMatchConstruction = `    // Generated post-filter set mask construction
    var sets = SetMatches();
${relicAssignments.join('\n')}
${ornamentAssignments.join('\n')}`

  return {
    relicWordCount,
    ornamentWordCount,
    declarations,
    outerMaskDeclarations,
    setMatchConstruction,
    outerMaskRefresh: {
      head: generateOuterMaskLines('', 'H', 'setH', relicWordCount, '                '),
      hands: generateOuterMaskLines('', 'G', 'setG', relicWordCount, '              '),
      body: generateOuterMaskLines('', 'B', 'setB', relicWordCount, '            '),
      feet: generateOuterMaskLines('', 'F', 'setF', relicWordCount, '          '),
    },
  }
}
