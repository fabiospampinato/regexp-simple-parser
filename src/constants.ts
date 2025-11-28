
/* IMPORT */

import type {NodeGroupNonCapturing} from './types';

/* MAIN */

const FALLBACK_NODE: NodeGroupNonCapturing = {
  type: 'group',
  subtype: 'non-capturing',
  children: []
};

const SINGLE_ESCAPE_CHAR_MAP: Record<string, string> = {
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  v: '\v',
  t: '\t'
};

/* EXPORT */

export {FALLBACK_NODE, SINGLE_ESCAPE_CHAR_MAP};
