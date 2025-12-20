
/* IMPORT */

import {parse} from 'grammex';
import {FALLBACK_NODE} from './constants';
import getGrammar from './grammar';
import type {Node} from './types';

/* MAIN */

const _parse = ( re: RegExp ): Node => {

  const grammar = getGrammar ( re.flags );
  const node = parse ( re.source, grammar )[0];

  return node ?? FALLBACK_NODE;

};

/* EXPORT */

export default _parse;
export type * from './types';
