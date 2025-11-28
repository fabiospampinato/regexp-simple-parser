
/* IMPORT */

import {parse} from 'grammex';
import {FALLBACK_NODE} from './constants';
import getGrammar from './grammar';
import type {Node} from './types';

/* MAIN */

const _parse = ( re: RegExp ): Node => {

  return parse ( re.source, getGrammar ( re.flags ) )[0] ?? FALLBACK_NODE;

};

/* EXPORT */

export default _parse;
export type * from './types';
