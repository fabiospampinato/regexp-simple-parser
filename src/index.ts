
/* IMPORT */

import {parse} from 'grammex';
import {FALLBACK_NODE} from './constants';
import getGrammar from './grammar';
import {countNodes} from './utils';
import type {Node} from './types';

/* MAIN */

const _parse = ( re: RegExp ): Node => {

  const grammar = getGrammar ( re.flags );

  const nodeWithoutIndexReferences = parse ( re.source, grammar )[0] ?? FALLBACK_NODE;
  const hasIndexReferences = /\\([1-9][0-9]*)/.test ( re.source );

  if ( !hasIndexReferences ) return nodeWithoutIndexReferences;

  const capturingGroupsCount = countNodes ( nodeWithoutIndexReferences, 'group', 'capturing' );
  const nodeWithIndexReferences = parse ( re.source, grammar, { capturingGroupsCount } )[0] ?? FALLBACK_NODE;

  return nodeWithIndexReferences;

};

/* EXPORT */

export default _parse;
export type * from './types';
