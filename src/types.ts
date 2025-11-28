
/* MAIN - BASE */

type NodeBase = {
  type: string,
  subtype?: string
};

/* MAIN - ALTERNATIVE */

type NodeAlternative = NodeBase & {
  type: 'alternative',
  children: NodeAlternable[]
};

/* MAIN - ANCHOR */

type NodeAnchorBase = NodeBase & {
  type: 'anchor',
  subtype: 'start' | 'end' | 'boundary' | 'non-boundary'
};

type NodeAnchorStart = NodeAnchorBase & {
  subtype: 'start'
};

type NodeAnchorEnd = NodeAnchorBase & {
  subtype: 'end'
};

type NodeAnchorBoundary = NodeAnchorBase & {
  subtype: 'boundary'
};

type NodeAnchorNonBoundary = NodeAnchorBase & {
  subtype: 'non-boundary'
};

type NodeAnchor = (
  NodeAnchorStart |
  NodeAnchorEnd |
  NodeAnchorBoundary |
  NodeAnchorNonBoundary
);

/* MAIN - CHARACTER CLASS */

type NodeCharacterClassBase = NodeBase & {
  type: 'character-class',
  subtype: 'intersection' | 'subtraction' | 'union',
  negative: boolean
};

type NodeCharacterClassIntersection = NodeCharacterClassBase & {
  subtype: 'intersection',
  children: [NodeCharacterClassChild, NodeCharacterClassChild]
};

type NodeCharacterClassSubtraction = NodeCharacterClassBase & {
  subtype: 'subtraction',
  children: [NodeCharacterClassChild, NodeCharacterClassChild]
};

type NodeCharacterClassUnion = NodeCharacterClassBase & {
  subtype: 'union',
  children: NodeCharacterClassChild[]
};

type NodeCharacterClass = (
  NodeCharacterClassIntersection |
  NodeCharacterClassSubtraction |
  NodeCharacterClassUnion
);

/* MAIN - CHARACTER CLASS - INTERNALS */

type NodeCharacterClassDisjuction = NodeBase & {
  type: 'disjunction',
  children: NodeCharacterClassDisjuctionChild[]
};

type NodeCharacterClassDisjuctionChild = (
  NodeCharacterClassEscape |
  NodeProperty |
  NodeValue
);

type NodeCharacterClassChild = (
  NodeCharacterClass |
  NodeCharacterClassDisjuction |
  NodeCharacterClassEscape |
  NodeCharacterClassRange |
  NodeProperty |
  NodeValue
);

type NodeCharacterClassRange = NodeBase & {
  type: 'character-class-range',
  fromCodePoint: number,
  toCodePoint: number
};

/* MAIN - CHARACTER CLASS ESCAPE */

type NodeCharacterClassEscape = NodeBase & {
  type: 'character-class-escape',
  value: 'd' | 'D' | 's' | 'S' | 'w' | 'W'
};

/* MAIN - DISJUCTION */

type NodeDisjuction = NodeBase & {
  type: 'disjunction',
  children: Node[]
};

/* MAIN - DOT */

type NodeDot = NodeBase & {
  type: 'dot'
};

/* MAIN - GROUP */

type NodeGroupBase = NodeBase & {
  type: 'group',
  subtype: 'capturing' | 'non-capturing' | 'lookahead' | 'lookbehind' | 'negative-lookahead' | 'negative-lookbehind',
  children: [Node] | []
};

type NodeGroupCapturing = NodeGroupBase & {
  subtype: 'capturing'
  name?: string
};

type NodeGroupNonCapturing = NodeGroupBase & {
  subtype: 'non-capturing'
  flags?: {
    enabled: string,
    disabled: string
  }
};

type NodeGroupLookahead = NodeGroupBase & {
  subtype: 'lookahead'
};

type NodeGroupLookbehind = NodeGroupBase & {
  subtype: 'lookbehind'
};

type NodeGroupNegativeLookahead = NodeGroupBase & {
  subtype: 'negative-lookahead'
};

type NodeGroupNegativeLookbehind = NodeGroupBase & {
  subtype: 'negative-lookbehind'
};

type NodeGroup = (
  NodeGroupCapturing |
  NodeGroupNonCapturing |
  NodeGroupLookahead |
  NodeGroupLookbehind |
  NodeGroupNegativeLookahead |
  NodeGroupNegativeLookbehind
);

/* MAIN - PROPERTY */

type NodeProperty = NodeBase & {
  type: 'property',
  negative: boolean,
  name: string
};

/* MAIN - QUANTIFIER */

type NodeQuantifierBase = NodeBase & {
  type: 'quantifier',
  subtype: 'optional' | 'plus' | 'star' | 'range',
  greedy: boolean,
  min: number,
  max: number,
  children: [NodeQuantifiable]
};

type NodeQuantifierOptional = NodeQuantifierBase & {
  subtype: 'optional'
};

type NodeQuantifierPlus = NodeQuantifierBase & {
  subtype: 'plus'
};

type NodeQuantifierStar = NodeQuantifierBase & {
  subtype: 'star'
};

type NodeQuantifierRange = NodeQuantifierBase & {
  subtype: 'range'
};

type NodeQuantifier = (
  NodeQuantifierOptional |
  NodeQuantifierPlus |
  NodeQuantifierStar |
  NodeQuantifierRange
);

/* MAIN - REFERENCE */

type NodeReferenceBase = NodeBase & {
  type: 'reference',
  subtype: 'index' | 'name'
};

type NodeReferenceIndex = NodeReferenceBase & {
  subtype: 'index',
  value: number
};

type NodeReferenceName = NodeReferenceBase & {
  subtype: 'name',
  value: string
};

type NodeReference = (
  NodeReferenceIndex |
  NodeReferenceName
);

/* MAIN - VALUE */

type NodeValueBase = NodeBase & {
  type: 'value',
  subtype: 'control-escape' | 'escape' | 'hexadecimal-escape' | 'null-escape' | 'octal-escape' | 'single-escape' | 'symbol' | 'unicode-escape',
  codePoint: number
};

type NodeValueControlEscape = NodeValueBase & {
  subtype: 'control-escape'
};

type NodeValueEscape = NodeValueBase & {
  subtype: 'escape'
};

type NodeValueHexadecimalEscape = NodeValueBase & {
  subtype: 'hexadecimal-escape'
};

type NodeValueNullEscape = NodeValueBase & {
  subtype: 'null-escape'
};

type NodeValueOctalEscape = NodeValueBase & {
  subtype: 'octal-escape'
};

type NodeValueSingleEscape = NodeValueBase & {
  subtype: 'single-escape'
};

type NodeValueSymbol = NodeValueBase & {
  subtype: 'symbol'
};

type NodeValueUnicodeEscape = NodeValueBase & {
  subtype: 'unicode-escape'
};

type NodeValue = (
  NodeValueControlEscape |
  NodeValueEscape |
  NodeValueHexadecimalEscape |
  NodeValueNullEscape |
  NodeValueOctalEscape |
  NodeValueSingleEscape |
  NodeValueSymbol |
  NodeValueUnicodeEscape
);

/* MAIN */

type NodePrimitive = (
  NodeAnchor |
  NodeCharacterClassEscape |
  NodeCharacterClass |
  NodeDot |
  NodeProperty |
  NodeReference |
  NodeValue
);

type NodeQuantifiable = (
  NodeGroup |
  NodePrimitive
);

type NodeAlternable = (
  NodeQuantifier |
  NodeQuantifiable
);

type Node = (
  NodePrimitive |
  NodeQuantifiable |
  NodeAlternable |
  NodeAlternative |
  NodeDisjuction
);

/* EXPORT */

export type {NodePrimitive, NodeQuantifiable, NodeAlternable, Node};
export type {NodeAlternative};
export type {NodeAnchor, NodeAnchorStart, NodeAnchorEnd, NodeAnchorBoundary, NodeAnchorNonBoundary};
export type {NodeCharacterClass, NodeCharacterClassIntersection, NodeCharacterClassSubtraction, NodeCharacterClassUnion};
export type {NodeCharacterClassDisjuction, NodeCharacterClassDisjuctionChild, NodeCharacterClassChild};
export type {NodeCharacterClassEscape, NodeCharacterClassRange};
export type {NodeDisjuction};
export type {NodeDot};
export type {NodeGroup, NodeGroupCapturing, NodeGroupNonCapturing, NodeGroupLookahead, NodeGroupLookbehind, NodeGroupNegativeLookahead, NodeGroupNegativeLookbehind};
export type {NodeProperty};
export type {NodeQuantifier, NodeQuantifierOptional, NodeQuantifierPlus, NodeQuantifierStar, NodeQuantifierRange};
export type {NodeReference, NodeReferenceIndex, NodeReferenceName};
export type {NodeValue, NodeValueControlEscape, NodeValueEscape, NodeValueHexadecimalEscape, NodeValueNullEscape, NodeValueOctalEscape, NodeValueSingleEscape, NodeValueSymbol, NodeValueUnicodeEscape};
