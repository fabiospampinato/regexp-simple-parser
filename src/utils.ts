
/* IMPORT */

import type {Node} from './types';

/* MAIN */

const countNodes = ( node: Node, type: string, subtype?: string | undefined ): number => {

  let count = 0;

  traverseNode ( node, node => {

    if ( node.type === type && node.subtype === subtype ) {

      count += 1;

    }

  });

  return count;

};

const memoizeByString = <T> ( fn: ( arg: string ) => T ): ( arg: string ) => T => {

  const cache: Partial<Record<string, T>> = {};

  return ( arg: string ): T => {

    return cache[arg] ??= fn ( arg );

  };

};

const toCodePoint = ( value: string ): number => {

  return value.codePointAt ( 0 ) ?? -1;

};

const toInt = ( value: string, base?: number ): number => {

  return parseInt ( value, base );

};

const traverseNode = ( node: Node, fn: ( node: Node ) => void ): void => {

  fn ( node );

  if ( 'children' in node ) {

    node.children.forEach ( child => traverseNode ( child, fn ) );

  }

};

/* EXPORT */

export {countNodes, memoizeByString, toCodePoint, toInt, traverseNode};
