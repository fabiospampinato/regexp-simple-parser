
/* MAIN */

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

/* EXPORT */

export {memoizeByString, toCodePoint, toInt};
