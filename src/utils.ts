
/* MAIN */

const memoize = <T, U> ( fn: ( arg: T ) => U ): ( arg: T ) => U => {

  const cache = new Map<T, U> ();

  return ( arg: T ): U => {

    const cached = cache.get ( arg );

    if ( cached !== undefined ) return cached;

    const result = fn ( arg );

    cache.set ( arg, result );

    return result;

  };

};

const toCodePoint = ( value: string ): number => {

  return value.codePointAt ( 0 ) ?? -1;

};

const toInt = ( value: string, base?: number ): number => {

  return parseInt ( value, base );

};

/* EXPORT */

export {memoize, toCodePoint, toInt};
