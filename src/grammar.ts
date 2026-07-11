
/* IMPORT */

import {match, and, lazy, optional, or, star} from 'grammex';
import {FALLBACK_NODE, SINGLE_ESCAPE_CHAR_MAP} from './constants';
import {memoizeByString, toCodePoint, toInt} from './utils';

import type {ExplicitRule} from 'grammex';
import type {NodeAlternative} from './types';
import type {NodeAnchor, NodeAnchorStart, NodeAnchorEnd, NodeAnchorBoundary, NodeAnchorNonBoundary} from './types';
import type {NodeCharacterClass, NodeCharacterClassIntersection, NodeCharacterClassSubtraction, NodeCharacterClassUnion} from './types';
import type {NodeCharacterClassDisjuction, NodeCharacterClassDisjuctionChild, NodeCharacterClassChild} from './types';
import type {NodeCharacterClassString, NodeCharacterClassStringChild} from './types';
import type {NodeCharacterClassEscape, NodeCharacterClassRange} from './types';
import type {NodeDisjuction} from './types';
import type {NodeDot} from './types';
import type {NodeGroup, NodeGroupCapturing, NodeGroupNonCapturing, NodeGroupLookahead, NodeGroupLookbehind, NodeGroupNegativeLookahead, NodeGroupNegativeLookbehind} from './types';
import type {NodeProperty} from './types';
import type {NodeQuantifier, NodeQuantifierOptional, NodeQuantifierPlus, NodeQuantifierStar, NodeQuantifierRange} from './types';
import type {NodeReference, NodeReferenceIndex, NodeReferenceName} from './types';
import type {NodeValue} from './types';
import type {NodePrimitive, NodeQuantifiable, NodeAlternable, Node} from './types';

/* MAIN */

//URL: https://tc39.es/ecma262/#sec-patterns

const getGrammar = memoizeByString ( ( flags: string ) => {

  /* FLAGS */

  const v = flags.includes ( 'v' );
  const u = flags.includes ( 'u' ) || v;

  /* UNSUPPORTED */

  const Unsupported = match ( /^(?!)$/ );

  /* PRIMITIVE */

  const AnchorStart = match<NodeAnchorStart>( '^', () => ({ type: 'anchor', subtype: 'start' }) );
  const AnchorEnd = match<NodeAnchorEnd>( '$', () => ({ type: 'anchor', subtype: 'end' }) );
  const AnchorBoundary = match<NodeAnchorBoundary>( /\\b/, () => ({ type: 'anchor', subtype: 'boundary' }) );
  const AnchorNonBoundary = match<NodeAnchorNonBoundary>( /\\B/, () => ({ type: 'anchor', subtype: 'non-boundary' }) );
  const Anchor = or<NodeAnchor>([ AnchorStart, AnchorEnd, AnchorBoundary, AnchorNonBoundary ]);

  const CharacterClassEscape = match<NodeCharacterClassEscape>( /\\([dDsSwW])/, ( _, $1 ) => ({ type: 'character-class-escape', value: $1 as NodeCharacterClassEscape['value'] }) ); //TSC

  const CharacterClassStringValueSymbol = match<NodeValue>( u ? /[^\|\\\]\}]/u : /[^\|\\\]\}]/, _ => ({ type: 'value', codePoint: toCodePoint ( _ ) }) );
  const CharacterClassStringChild = lazy<NodeCharacterClassStringChild>( () => or<NodeCharacterClassStringChild>([ CharacterClassEscape, Property, Value, CharacterClassStringValueSymbol ]) );
  const CharacterClassString = star ( CharacterClassStringChild, _ => ( _.length <= 1 ) ? ( _[0] ?? { type: 'character-class-string', children: [] } ) : ({ type: 'character-class-string', children: _ }) );
  const CharacterClassDisjuction = v ? and<NodeCharacterClassDisjuctionChild, NodeCharacterClassDisjuction>( ['\\q{', optional<NodeCharacterClassDisjuctionChild>( and ([ CharacterClassString, star<NodeCharacterClassDisjuctionChild>( and ([ '|', CharacterClassString ]) ) ]) ), '}'], _ => ({ type: 'character-class-disjunction', children: ( _.length === 1 && _[0].type === 'character-class-string' && !_[0].children.length  ? [] : _ ) }) ) : Unsupported;

  const CharacterClassValueSymbol = match<NodeValue>( u ? /[^\\\]]/u : /[^\\\]]/, _ => ({ type: 'value', codePoint: toCodePoint ( _ ) }) );
  const CharacterClassRangeChild = lazy<NodeValue> ( () => or<NodeValue>([ Value, CharacterClassValueSymbol ]) );
  const CharacterClassRange = and<NodeValue, NodeCharacterClassRange>( [CharacterClassRangeChild, '-', CharacterClassRangeChild], ([ $1, $2 ]) => ({ type: 'character-class-range', fromCodePoint: $1.codePoint, toCodePoint: $2.codePoint }) );

  const CharacterClassNegation = match<boolean> ( /\^?/, _ => !!_ );

  const CharacterClassChild = lazy<NodeCharacterClassChild>( () => or<NodeCharacterClassChild>([ CharacterClassNested, CharacterClassDisjuction, CharacterClassEscape, CharacterClassRange, Property, Value, CharacterClassValueSymbol ]) );
  const CharacterClassIntersection = v ? and<NodeCharacterClassChild, NodeCharacterClassIntersection>( ['[', CharacterClassNegation, CharacterClassChild, '&&', CharacterClassChild, ']'], ([ $1, $2, $3 ]) => ({ type: 'character-class', subtype: 'intersection', negative: $1, children: [$2, $3] }) ) : Unsupported;
  const CharacterClassSubtraction = v ? and<NodeCharacterClassChild, NodeCharacterClassSubtraction>( ['[', CharacterClassNegation, CharacterClassChild, '--', CharacterClassChild, ']'], ([ $1, $2, $3 ]) => ({ type: 'character-class', subtype: 'subtraction', negative: $1, children: [$2, $3] }) ) : Unsupported;
  const CharacterClassUnion = and<NodeCharacterClassChild, NodeCharacterClassUnion>( ['[', CharacterClassNegation, star<NodeCharacterClassChild>( CharacterClassChild ), ']'], ([ $1, ...$$ ]) => ({ type: 'character-class', subtype: 'union', negative: $1, children: $$ }) );
  const CharacterClass = or<NodeCharacterClass>([ CharacterClassIntersection, CharacterClassSubtraction, CharacterClassUnion ]);
  const CharacterClassNested = v ? CharacterClass : Unsupported;

  const Dot = match<NodeDot>( '.', () => ({ type: 'dot' }) );

  const Property = u ? match<NodeProperty>( /\\([pP])\{([^}]+)\}/, ( _, $1, $2 ) => ({ type: 'property', negative: $1 === 'P', name: $2 }) ) : Unsupported;

  const ReferenceIndex = match<NodeReferenceIndex>( /\\([1-9][0-9]*)/, ( _, $1 ) => ({ type: 'reference', subtype: 'index', value: toInt ( $1 ) }) );
  const ReferenceName = match<NodeReferenceName>( /\\k<([^>]+)>/, ( _, $1 ) => ({ type: 'reference', subtype: 'name', value: $1 }) );
  const Reference = or<NodeReference>([ ReferenceIndex, ReferenceName ]);

  const ValueAmbiguousOctalEscape: ExplicitRule<Node> = !u ? ( state => { // This is ugly, can we write it better?
    const re = /\\([1-7][0-7]{0,2})/y;
    re.lastIndex = state.index;
    const match = re.exec ( state.input );
    if ( !match ) return false;
    const referenceIndexMax = state.output.filter ( node => node.type === 'group' && node.subtype === 'capturing' ).length;
    const referenceIndex = toInt ( match[1] );
    if ( referenceIndex <= referenceIndexMax ) return false;
    const codePoint = toInt ( match[1], 8 );
    state.output.push ({ type: 'value', codePoint });
    state.index += match[0].length;
    return true;
  }) : Unsupported;

  const ValueControlEscape = match<NodeValue>( /\\c([a-zA-Z])/, ( _, $1 ) => ({ type: 'value', codePoint: toCodePoint ( $1.toUpperCase () ) - 64 }) );
  const ValueHexadecimalEscape = match<NodeValue>( /\\x([0-9a-fA-F]{2})/, ( _, $1 ) => ({ type: 'value', codePoint: toInt ( $1, 16 ) }) );
  const ValueOctalEscape = !u ? match<NodeValue>( /\\0([1-7][0-7]?)/, ( _, $1 ) => ({ type: 'value', codePoint: toInt ( $1, 8 ) }) ) : Unsupported;
  const ValueNullEscape = match<NodeValue>( /\\0/, () => ({ type: 'value', codePoint: 0 }) );
  const ValueSingleEscape = match<NodeValue>( /\\([bfnrtv])/, ( _, $1 ) => ({ type: 'value', codePoint: toCodePoint ( SINGLE_ESCAPE_CHAR_MAP[$1] ) }) );
  const ValueUnicodeEscape = match<NodeValue>( /\\u([0-9a-fA-F]{4})/, ( _, $1 ) => ({ type: 'value', codePoint: toInt ( $1, 16 ) }) );
  const ValueUnicodeCodePointEscape = u ? match<NodeValue>( /\\u\{([0-9a-fA-F]+)\}/, ( _, $1 ) => ({ type: 'value', codePoint: toInt ( $1, 16 ) }) ) : Unsupported;
  const ValueEscape = match<NodeValue>( /\\(.)/, ( _, $1 ) => ({ type: 'value', codePoint: toCodePoint ( $1 ) }) );
  const ValueSymbolStrict = match<NodeValue>( u ? /[^^$.*+?(){}|\\\[\]]/u : /[^^$.*+?(){}|\\\[\]]/, _ => ({ type: 'value', codePoint: toCodePoint ( _ ) }) );
  const ValueSymbolPermissive = match<NodeValue>( u ? /[^()|\\\[]/u : /[^()|\\\[]/, _ => ({ type: 'value', codePoint: toCodePoint ( _ ) }) ); //TODO: Have a much closer look at this, which feels sketchy //TODO: Try to have fewer ValueSymbol rules
  const Value = or<NodeValue>([ ValueControlEscape, ValueHexadecimalEscape, ValueAmbiguousOctalEscape, ValueOctalEscape, ValueNullEscape, ValueSingleEscape, ValueUnicodeEscape, ValueUnicodeCodePointEscape, ValueEscape, ValueSymbolStrict ]);

  const Primitive = or<NodePrimitive>([ Anchor, CharacterClassEscape, CharacterClass, Dot, Property, ValueAmbiguousOctalEscape, Reference, Value ]);

  /* GROUP */

  const GroupFlags = match<NonNullable<NodeGroupNonCapturing['flags']>>( /([a-z]+)(?:-([a-z]+))?|-([a-z]+)/, ( _, $1, $2, $3 ) => ({ enabled: $1 ?? '', disabled: $2 ?? $3 ?? '' }) );
  const GroupName = match<NonNullable<NodeGroupCapturing['name']>>( /[$_\p{ID_Start}][$\p{ID_Continue}]*/u, _ => _ );

  const Groupable = lazy<Node>( () => Disjuction );
  const GroupLookahead = and<Node, NodeGroupLookahead>( ['(?=', Groupable, ')'], ([ $1 ]) => ({ type: 'group', subtype: 'lookahead', children: $1 ? [$1] : [] }) );
  const GroupLookbehind = and<Node, NodeGroupLookbehind>( ['(?<=', Groupable, ')'], ([ $1 ]) => ({ type: 'group', subtype: 'lookbehind', children: $1 ? [$1] : [] }) );
  const GroupNegativeLookahead = and<Node, NodeGroupNegativeLookahead>( ['(?!', Groupable, ')'], ([ $1 ]) => ({ type: 'group', subtype: 'negative-lookahead', children: $1 ? [$1] : [] }) );
  const GroupNegativeLookbehind = and<Node, NodeGroupNegativeLookbehind>( ['(?<!', Groupable, ')'], ([ $1 ]) => ({ type: 'group', subtype: 'negative-lookbehind', children: $1 ? [$1] : [] }) );
  const GroupNonCapturingWithFlags = and<Node, NodeGroupNonCapturing>( ['(?', GroupFlags, ':', Groupable, ')'], ([ $1, $2 ]) => ({ type: 'group', subtype: 'non-capturing', flags: $1, children: $2 ? [$2] : [] }) );
  const GroupNonCapturing = and<Node, NodeGroupNonCapturing>( ['(?:', Groupable, ')'], ([ $1 ]) => ({ type: 'group', subtype: 'non-capturing', children: $1 ? [$1] : [] }) );
  const GroupCapturingWithName = and<Node, NodeGroupCapturing>( ['(?<', GroupName, '>', Groupable, ')'], ([ $1, $2 ]) => ({ type: 'group', subtype: 'capturing', name: $1, children: $2 ? [$2] : [] }) );
  const GroupCapturing = and<Node, NodeGroupCapturing>( ['(', Groupable, ')'], ([ $1 ]) => ({ type: 'group', subtype: 'capturing', children: $1 ? [$1] : [] }) );
  const Group = or<NodeGroup>([ GroupLookahead, GroupLookbehind, GroupNegativeLookahead, GroupNegativeLookbehind, GroupNonCapturingWithFlags, GroupNonCapturing, GroupCapturingWithName, GroupCapturing ]);

  /* QUANTIFIER */

  const QuantifierGreedy = match<boolean>( /\??/, _ => !_ );

  const Quantifiable = or<NodeQuantifiable>([ Group, Primitive, ValueSymbolPermissive ]);
  const QuantifierOptional = and<NodeQuantifiable, NodeQuantifierOptional>( [Quantifiable, '?', QuantifierGreedy], ([ $1, $2 ]) => ({ type: 'quantifier', subtype: 'optional', greedy: $2, min: 0, max: 1, children: [$1] }) );
  const QuantifierPlus = and<NodeQuantifiable, NodeQuantifierPlus>( [Quantifiable, '+', QuantifierGreedy], ([ $1, $2 ]) => ({ type: 'quantifier', subtype: 'plus', greedy: $2, min: 1, max: Infinity, children: [$1] }) );
  const QuantifierStar = and<NodeQuantifiable, NodeQuantifierStar>( [Quantifiable, '*', QuantifierGreedy], ([ $1, $2 ]) => ({ type: 'quantifier', subtype: 'star', greedy: $2, min: 0, max: Infinity, children: [$1] }) );
  const QuantifierRangeBraces = match<NodeQuantifierRange>( /\{([0-9]+)(?:(,)([0-9]+)?)?\}(\?)?/, ( _, $1, $2, $3, $4 ) => ({ type: 'quantifier', subtype: 'range', greedy: !$4, min: toInt ( $1 ), max: $2 ? $3 ? toInt ( $3 ) : Infinity : toInt ( $1 ), children: [FALLBACK_NODE] }) );
  const QuantifierRange = and<any, NodeQuantifierRange>( [Quantifiable, QuantifierRangeBraces], ([ $1, $2 ]) => ({ ...$2, children: [$1] }) ); //TSC
  const Quantifier = or<NodeQuantifier>([ QuantifierOptional, QuantifierPlus, QuantifierStar, QuantifierRange ]);

  /* DISJUCTION */

  const Alternable = or<NodeAlternable>([ Quantifier, Quantifiable ]);
  const Alternative = star<NodeAlternable, NodeAlternative | Node>( Alternable, _ => ( _.length <= 1 ) ? ( _[0] ?? { type: 'alternative', children: [] } ) : ({ type: 'alternative', children: _ }) );
  const Disjuction = and<NodeAlternative, NodeDisjuction | Node>( [Alternative, star ( and ([ '|', Alternative ]) )], _ => ( _.length <= 1 ) ? ( ( _[0]?.type === 'alternative' && !_[0].children.length ) ? undefined : _[0] ) : ({ type: 'disjunction', children: _ }) );

  return Disjuction;

});

/* EXPORT */

export default getGrammar;
