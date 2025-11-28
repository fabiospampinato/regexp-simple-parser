
/* IMPORT */

import {describe, t} from 'fava';
import parse from '../dist/index.js';

/* HELPERS */

const assert = ( re, expected ) => {
  return t.deepEqual ( parse ( re ), expected );
};

/* MAIN */

describe ( 'RegExp Simple Parser', () => {

  /* NODES */

  describe ( 'alternative', it => {

    it ( 'supports alternative', () => {

      assert ( /abc/, {
        type: 'alternative',
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          },
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'b'.codePointAt ( 0 )
          },
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'c'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /a(b|c)d/, {
        type: 'alternative',
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          },
          {
            type: 'group',
            subtype: 'capturing',
            children: [
              {
                type: 'disjunction',
                children: [
                  {
                    type: 'value',
                    subtype: 'symbol',
                    codePoint: 'b'.codePointAt ( 0 )
                  },
                  {
                    type: 'value',
                    subtype: 'symbol',
                    codePoint: 'c'.codePointAt ( 0 )
                  }
                ]
              }
            ]
          },
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'd'.codePointAt ( 0 )
          }
        ]
      });

    });

  });

  describe ( 'anchor', it => {

    it ( 'supports start anchor', () => {

      assert ( /^/, {
        type: 'anchor',
        subtype: 'start'
      });

      assert ( /^^/, {
        type: 'alternative',
        children: [
          {
            type: 'anchor',
            subtype: 'start'
          },
          {
            type: 'anchor',
            subtype: 'start'
          },
        ]
      });

    });

    it ( 'supports end anchor', () => {

      assert ( /$/, {
        type: 'anchor',
        subtype: 'end'
      });

      assert ( /$$/, {
        type: 'alternative',
        children: [
          {
            type: 'anchor',
            subtype: 'end'
          },
          {
            type: 'anchor',
            subtype: 'end'
          },
        ]
      });

    });

    it ( 'supports boundary anchor', () => {

      assert ( /\b/, {
        type: 'anchor',
        subtype: 'boundary'
      });

    });

    it ( 'supports non-boundary anchor', () => {

      assert ( /\B/, {
        type: 'anchor',
        subtype: 'non-boundary'
      });

    });

  });

  describe ( 'character class, union', it => {

    it ( 'supports empty class', () => {

      assert ( /[]/, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: []
      });

      assert ( /[^]/, {
        type: 'character-class',
        subtype: 'union',
        negative: true,
        children: []
      });

    });

    it ( 'supports \\b in and out', () => {

      assert ( /\b[\b]/, {
        type: 'alternative',
        children: [
          {
            type: 'anchor',
            subtype: 'boundary'
          },
          {
            type: 'character-class',
            subtype: 'union',
            negative: false,
            children: [
              {
                type: 'value',
                subtype: 'single-escape',
                codePoint: '\b'.codePointAt ( 0 )
              }
            ]
          }
        ]
      });

    });

    it ( 'supports indefinite nesting', () => {

      assert ( /[[[a]]]/v, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'character-class',
            subtype: 'union',
            negative: false,
            children: [
              {
                type: 'character-class',
                subtype: 'union',
                negative: false,
                children: [
                  {
                    type: 'value',
                    subtype: 'symbol',
                    codePoint: 97
                  }
                ]
              }
            ]
          }
        ]
      });

    });

    /* RANGE */

    it ( 'supports range', () => {

      assert ( /[a-z]/, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'character-class-range',
            fromCodePoint: 'a'.codePointAt ( 0 ),
            toCodePoint: 'z'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /[0-9]/, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'character-class-range',
            fromCodePoint: '0'.codePointAt ( 0 ),
            toCodePoint: '9'.codePointAt ( 0 )
          }
        ]
      });

    });

    /* SUBSTRING */

    it ( 'supports substring', () => {

      assert ( /[\q{}]/v, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'disjunction',
            children: []
          }
        ]
      });

      assert ( /[\q{a}]/v, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'disjunction',
            children: [
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'a'.codePointAt ( 0 )
              }
            ]
          }
        ]
      });

      assert ( /[\q{a|b}]/v, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'disjunction',
            children: [
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'a'.codePointAt ( 0 )
              },
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'b'.codePointAt ( 0 )
              }
            ]
          }
        ]
      });

    });

    it ( 'supports substring, with unescaped value', () => {

      const CHARS = [...'^$.*+?|'];

      for ( const char of CHARS ) {

        const re = new RegExp ( `[\\q{${char}}]`, 'v' );

        assert ( re, {
          type: 'character-class',
          subtype: 'union',
          negative: false,
          children: [
            {
              type: 'disjunction',
              children: [
                {
                  type: 'value',
                  subtype: 'symbol',
                  codePoint: char.codePointAt ( 0 )
                }
              ]
            }
          ]
        });

      }

    });

    it ( 'supports substring, with control escape value', () => {

      const ALPHABET = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'];

      for ( let i = 0; i < ALPHABET.length; i++ ) {

        const char = ALPHABET[i];
        const re = new RegExp ( `[\\q{\\c${char}}]`, 'v' );

        assert ( re, {
          type: 'character-class',
          subtype: 'union',
          negative: false,
          children: [
            {
              type: 'disjunction',
              children: [
                {
                  type: 'value',
                  subtype: 'control-escape',
                  codePoint: ( i % 26 ) + 1
                }
              ]
            }
          ]
        });

      }

    });

    it ( 'supports substring, with escape value', () => {

      assert ( /[\q{\\}]/v, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'disjunction',
            children: [
              {
                type: 'value',
                subtype: 'escape',
                codePoint: '\\'.codePointAt ( 0 )
              }
            ]
          }
        ]
      });

    });

    it ( 'supports substring, with unescaped value', () => {

      const CHARS = [...'^$.*+?|'];

      for ( const char of CHARS ) {

        const re = new RegExp ( `[\\q{${char}}]`, 'v' );

        assert ( re, {
          type: 'character-class',
          subtype: 'union',
          negative: false,
          children: [
            {
              type: 'disjunction',
              children: [
                {
                  type: 'value',
                  subtype: 'symbol',
                  codePoint: char.codePointAt ( 0 )
                }
              ]
            }
          ]
        });

      }

    });

    it ( 'supports substring, with hexadecimal escape value', () => {

      assert ( /[\q{\x61}]/v, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'disjunction',
            children: [
              {
                type: 'value',
                subtype: 'hexadecimal-escape',
                codePoint: 'a'.codePointAt ( 0 )
              }
            ]
          }
        ]
      });

    });

    it ( 'supports substring, with null escape value', () => {

      assert ( /[\q{\0}]/v, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'disjunction',
            children: [
              {
                type: 'value',
                subtype: 'null-escape',
                codePoint: 0
              }
            ]
          }
        ]
      });

    });

    it ( 'supports substring, with single escape value', () => {

      const CHAR_MAP = { b: '\b', f: '\f', n: '\n', r: '\r', v: '\v', t: '\t' };

      for ( const [char, value] of Object.entries ( CHAR_MAP ) ) {

        const re = new RegExp ( `[\\q{\\${char}}]`, 'v' );

        assert ( re, {
          type: 'character-class',
          subtype: 'union',
          negative: false,
          children: [
            {
              type: 'disjunction',
              children: [
                {
                  type: 'value',
                  subtype: 'single-escape',
                  codePoint: value.codePointAt ( 0 )
                }
              ]
            }
          ]
        });

      }

    });

    it ( 'supports substring, with symbol value', () => {

      assert ( /[\q{a}]/v, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'disjunction',
            children: [
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'a'.codePointAt ( 0 )
              }
            ]
          }
        ]
      });

    });

    it ( 'supports substring, with unicode escape value', () => {

      assert ( /[\q{\u3042}]/v, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'disjunction',
            children: [
              {
                type: 'value',
                subtype: 'unicode-escape',
                codePoint: '\u3042'.codePointAt ( 0 )
              }
            ]
          }
        ]
      });

      assert ( /[\q{\u{1F600}}]/v, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'disjunction',
            children: [
              {
                type: 'value',
                subtype: 'unicode-escape',
                codePoint: '\u{1F600}'.codePointAt ( 0 )
              }
            ]
          }
        ]
      });

    });

    /* CHARACTER CLASS ESCAPE */

    it ( 'supports character class escape', () => {

      const CHAR_ARR = ['d', 'D', 's', 'S', 'w', 'W'];

      for ( const char of CHAR_ARR ) {

        const re = new RegExp ( `[\\${char}]` );

        assert ( re, {
          type: 'character-class',
          subtype: 'union',
          negative: false,
          children: [
            {
              type: 'character-class-escape',
              value: char
            }
          ]
        });

      }

    });

    /* PROPERTY */

    it ( 'supports property', () => {

      assert ( /[\p{Letter}]/u, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'property',
            negative: false,
            name: 'Letter'
          }
        ]
      });

      assert ( /[\P{Letter}]/u, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'property',
            negative: true,
            name: 'Letter'
          }
        ]
      });

      assert ( /[\P{General_Category=Letter}]/u, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'property',
            negative: true,
            name: 'General_Category=Letter'
          }
        ]
      });

    });

    /* VALUE */

    it ( 'supports control escape value', () => {

      const ALPHABET = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'];

      for ( let i = 0; i < ALPHABET.length; i++ ) {

        const char = ALPHABET[i];
        const re = new RegExp ( `[\\c${char}]` );

        assert ( re, {
          type: 'character-class',
          subtype: 'union',
          negative: false,
          children: [
            {
              type: 'value',
              subtype: 'control-escape',
              codePoint: ( i % 26 ) + 1
            }
          ]
        });

      }

    });

    it ( 'supports escape value', () => {

      assert ( /[\a]/, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'value',
            subtype: 'escape',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /[\\]/, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'value',
            subtype: 'escape',
            codePoint: '\\'.codePointAt ( 0 )
          }
        ]
      });

    });

    it ( 'supports unescaped value', () => {

      const CHARS = [...'^$.*+?(){}|['];

      for ( const char of CHARS ) {

        const re = new RegExp ( `[a${char}]` );

        assert ( re, {
          type: 'character-class',
          subtype: 'union',
          negative: false,
          children: [
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: 'a'.codePointAt ( 0 )
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: char.codePointAt ( 0 )
            }
          ]
        });

      }

    });

    it ( 'supports hexadecimal escape value', () => {

      assert ( /[\x61]/, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'value',
            subtype: 'hexadecimal-escape',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

    });

    it ( 'supports null escape value', () => {

      assert ( /[\0]/, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'value',
            subtype: 'null-escape',
            codePoint: 0
          }
        ]
      });

    });

    it ( 'supports octal escape value', () => {

      assert ( /[\065]/, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'value',
            subtype: 'octal-escape',
            codePoint: '5'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /[\65]/, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'value',
            subtype: 'octal-escape',
            codePoint: '5'.codePointAt ( 0 )
          }
        ]
      });

    });

    it ( 'supports single escape value', () => {

      const CHAR_MAP = { b: '\b', f: '\f', n: '\n', r: '\r', v: '\v', t: '\t' };

      for ( const [char, value] of Object.entries ( CHAR_MAP ) ) {

        const re = new RegExp ( `[\\${char}]` );

        assert ( re, {
          type: 'character-class',
          subtype: 'union',
          negative: false,
          children: [
            {
              type: 'value',
              subtype: 'single-escape',
              codePoint: value.codePointAt ( 0 )
            }
          ]
        });

      }

    });

    it ( 'supports symbol value', () => {

      assert ( /[a]/, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

    });

    it ( 'supports unicode escape value', () => {

      assert ( /[\u3042]/, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'value',
            subtype: 'unicode-escape',
            codePoint: '\u3042'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /[\u{1F600}]/u, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'value',
            subtype: 'unicode-escape',
            codePoint: '\u{1F600}'.codePointAt ( 0 )
          }
        ]
      });

    });

  });

  describe ( 'character class, intersection', it => { //TODO: Maybe test more cases here

    it ( 'basic', () => {

      assert ( /[[a]&&[b]]/v, {
        type: 'character-class',
        subtype: 'intersection',
        negative: false,
        children: [
          {
            type: 'character-class',
            subtype: 'union',
            negative: false,
            children: [
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'a'.codePointAt ( 0 )
              }
            ]
          },
          {
            type: 'character-class',
            subtype: 'union',
            negative: false,
            children: [
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'b'.codePointAt ( 0 )
              }
            ]
          }
        ]
      });

    });

    it ( 'supports indefinite nesting', () => {

      assert ( /[[[a]&&[b]]&&[[c]&&[d]]]/v, {
        type: 'character-class',
        subtype: 'intersection',
        negative: false,
        children: [
          {
            type: 'character-class',
            subtype: 'intersection',
            negative: false,
            children: [
              {
                type: 'character-class',
                subtype: 'union',
                negative: false,
                children: [
                  {
                    type: 'value',
                    subtype: 'symbol',
                    codePoint: 97
                  }
                ]
              },
              {
                type: 'character-class',
                subtype: 'union',
                negative: false,
                children: [
                  {
                    type: 'value',
                    subtype: 'symbol',
                    codePoint: 98
                  }
                ]
              }
            ]
          },
          {
            type: 'character-class',
            subtype: 'intersection',
            negative: false,
            children: [
              {
                type: 'character-class',
                subtype: 'union',
                negative: false,
                children: [
                  {
                    type: 'value',
                    subtype: 'symbol',
                    codePoint: 99
                  }
                ]
              },
              {
                type: 'character-class',
                subtype: 'union',
                negative: false,
                children: [
                  {
                    type: 'value',
                    subtype: 'symbol',
                    codePoint: 100
                  }
                ]
              }
            ]
          }
        ]
      });

    });

  });

  describe ( 'character class, subtraction', it => { //TODO: Maybe test more cases here

    it ( 'basic', () => {

      assert ( /[[a]--[b]]/v, {
        type: 'character-class',
        subtype: 'subtraction',
        negative: false,
        children: [
          {
            type: 'character-class',
            subtype: 'union',
            negative: false,
            children: [
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'a'.codePointAt ( 0 )
              }
            ]
          },
          {
            type: 'character-class',
            subtype: 'union',
            negative: false,
            children: [
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'b'.codePointAt ( 0 )
              }
            ]
          }
        ]
      });

    });

    it ( 'supports indefinite nesting', () => {

      assert ( /[[[a]--[b]]--[[c]--[d]]]/v, {
        type: 'character-class',
        subtype: 'subtraction',
        negative: false,
        children: [
          {
            type: 'character-class',
            subtype: 'subtraction',
            negative: false,
            children: [
              {
                type: 'character-class',
                subtype: 'union',
                negative: false,
                children: [
                  {
                    type: 'value',
                    subtype: 'symbol',
                    codePoint: 97
                  }
                ]
              },
              {
                type: 'character-class',
                subtype: 'union',
                negative: false,
                children: [
                  {
                    type: 'value',
                    subtype: 'symbol',
                    codePoint: 98
                  }
                ]
              }
            ]
          },
          {
            type: 'character-class',
            subtype: 'subtraction',
            negative: false,
            children: [
              {
                type: 'character-class',
                subtype: 'union',
                negative: false,
                children: [
                  {
                    type: 'value',
                    subtype: 'symbol',
                    codePoint: 99
                  }
                ]
              },
              {
                type: 'character-class',
                subtype: 'union',
                negative: false,
                children: [
                  {
                    type: 'value',
                    subtype: 'symbol',
                    codePoint: 100
                  }
                ]
              }
            ]
          }
        ]
      });

    });

  });

  describe ( 'character class escape', it => {

    it ( 'supports character class escape', () => {

      const CHAR_ARR = ['d', 'D', 's', 'S', 'w', 'W'];

      for ( const char of CHAR_ARR ) {

        const re = new RegExp ( `\\${char}` );

        assert ( re, {
          type: 'character-class-escape',
          value: char
        });

      }

    });

  });

  describe ( 'disjunction', it => {

    it ( 'supports disjunction', () => {

      assert ( /a|b/, {
        type: 'disjunction',
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          },
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'b'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /a|(b|c)|d/, {
        type: 'disjunction',
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          },
          {
            type: 'group',
            subtype: 'capturing',
            children: [
              {
                type: 'disjunction',
                children: [
                  {
                    type: 'value',
                    subtype: 'symbol',
                    codePoint: 'b'.codePointAt ( 0 )
                  },
                  {
                    type: 'value',
                    subtype: 'symbol',
                    codePoint: 'c'.codePointAt ( 0 )
                  }
                ]
              }
            ]
          },
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'd'.codePointAt ( 0 )
          }
        ]
      });

    });

    it ( 'suports partial disjuctions', () => {

      assert ( /a|/, {
        type: 'value',
        subtype: 'symbol',
        codePoint: 'a'.codePointAt ( 0 )
      });

      assert ( /|a/, {
        type: 'value',
        subtype: 'symbol',
        codePoint: 'a'.codePointAt ( 0 )
      });

      assert ( /|||a|||/, {
        type: 'value',
        subtype: 'symbol',
        codePoint: 'a'.codePointAt ( 0 )
      });

      assert ( /|/, { // A bit weird, but semantically the same
        type: 'group',
        subtype: 'non-capturing',
        children: []
      });

      assert ( /|||/, { // A bit weird, but semantically the same
        type: 'group',
        subtype: 'non-capturing',
        children: []
      });

    });

    it ( 'supports indefinite nesting', () => {

      assert ( /a|(b|(c|d)|e)|f/, {
        type: 'disjunction',
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 97
          },
          {
            type: 'group',
            subtype: 'capturing',
            children: [
              {
                type: 'disjunction',
                children: [
                  {
                    type: 'value',
                    subtype: 'symbol',
                    codePoint: 98
                  },
                  {
                    type: 'group',
                    subtype: 'capturing',
                    children: [
                      {
                        type: 'disjunction',
                        children: [
                          {
                            type: 'value',
                            subtype: 'symbol',
                            codePoint: 99
                          },
                          {
                            type: 'value',
                            subtype: 'symbol',
                            codePoint: 100
                          }
                        ]
                      }
                    ]
                  },
                  {
                    type: 'value',
                    subtype: 'symbol',
                    codePoint: 101
                   }
                ]
              }
            ]
          },
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 102
          }
        ]
      });

    });

  });

  describe ( 'dot', it => {

    it ( 'supports dot', () => {

      assert ( /./, {
        type: 'dot'
      });

    });

  });

  describe ( 'group', it => {

    it ( 'supports capturing group', () => {

      assert ( /()/, {
        type: 'group',
        subtype: 'capturing',
        children: []
      });

      assert ( /(())/, {
        type: 'group',
        subtype: 'capturing',
        children: [
          {
            type: 'group',
            subtype: 'capturing',
            children: []
          }
        ]
      });

      assert ( /(a)/, {
        type: 'group',
        subtype: 'capturing',
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /(a|b)/, {
        type: 'group',
        subtype: 'capturing',
        children: [
          {
            type: 'disjunction',
            children: [
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'a'.codePointAt ( 0 )
              },
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'b'.codePointAt ( 0 )
              }
            ]
          }
        ]
      });

    });

    it ( 'supports named capturing group', () => {;

      assert ( /(?<Foo>)/, {
        type: 'group',
        subtype: 'capturing',
        name: 'Foo',
        children: []
      });

      assert ( /(?<Foo>(?<Bar>))/, {
        type: 'group',
        subtype: 'capturing',
        name: 'Foo',
        children: [
          {
            type: 'group',
            subtype: 'capturing',
            name: 'Bar',
            children: []
          }
        ]
      });

      assert ( /(?<Foo>a)/, {
        type: 'group',
        subtype: 'capturing',
        name: 'Foo',
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /(?<Foo>a|b)/, {
        type: 'group',
        subtype: 'capturing',
        name: 'Foo',
        children: [
          {
            type: 'disjunction',
            children: [
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'a'.codePointAt ( 0 )
              },
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'b'.codePointAt ( 0 )
              }
            ]
          }
        ]
      });

    });

    it ( 'supports non-capturing group', () => {

      assert ( /(?:)/, {
        type: 'group',
        subtype: 'non-capturing',
        children: []
      });

      assert ( /(?:(?:))/, {
        type: 'group',
        subtype: 'non-capturing',
        children: [
          {
            type: 'group',
            subtype: 'non-capturing',
            children: []
          }
        ]
      });

      assert ( /(?:a)/, {
        type: 'group',
        subtype: 'non-capturing',
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /(?:a|b)/, {
        type: 'group',
        subtype: 'non-capturing',
        children: [
          {
            type: 'disjunction',
            children: [
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'a'.codePointAt ( 0 )
              },
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'b'.codePointAt ( 0 )
              }
            ]
          }
        ]
      });

    });

    it ( 'supports modifier non-capturing group', () => {

      /* ENABLED */

      assert ( /(?ims:)/, {
        type: 'group',
        subtype: 'non-capturing',
        flags: {
          enabled: 'ims',
          disabled: undefined
        },
        children: []
      });

      assert ( /(?ims:a)/, {
        type: 'group',
        subtype: 'non-capturing',
        flags: {
          enabled: 'ims',
          disabled: undefined
        },
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /(?ims:a|b)/, {
        type: 'group',
        subtype: 'non-capturing',
        flags: {
          enabled: 'ims',
          disabled: undefined
        },
        children: [
          {
            type: 'disjunction',
            children: [
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'a'.codePointAt ( 0 )
              },
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'b'.codePointAt ( 0 )
              }
            ]
          }
        ]
      });

      assert ( /(?ims:(?ims:))/, {
        type: 'group',
        subtype: 'non-capturing',
        flags: {
          enabled: 'ims',
          disabled: undefined
        },
        children: [
          {
            type: 'group',
            subtype: 'non-capturing',
            flags: {
              enabled: 'ims',
              disabled: undefined
            },
            children: []
          }
        ]
      });

      /* DISABLED */

      assert ( /(?-ims:)/, {
        type: 'group',
        subtype: 'non-capturing',
        flags: {
          enabled: undefined,
          disabled: 'ims'
        },
        children: []
      });

      assert ( /(?-ims:a)/, {
        type: 'group',
        subtype: 'non-capturing',
        flags: {
          enabled: undefined,
          disabled: 'ims'
        },
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /(?-ims:a|b)/, {
        type: 'group',
        subtype: 'non-capturing',
        flags: {
          enabled: undefined,
          disabled: 'ims'
        },
        children: [
          {
            type: 'disjunction',
            children: [
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'a'.codePointAt ( 0 )
              },
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'b'.codePointAt ( 0 )
              }
            ]
          }
        ]
      });

      assert ( /(?-ims:(?-ims:))/, {
        type: 'group',
        subtype: 'non-capturing',
        flags: {
          enabled: undefined,
          disabled: 'ims'
        },
        children: [
          {
            type: 'group',
            subtype: 'non-capturing',
            flags: {
              enabled: undefined,
              disabled: 'ims'
            },
            children: []
          }
        ]
      });

      /* ENABLED & DISABLED */

      assert ( /(?i-ms:)/, {
        type: 'group',
        subtype: 'non-capturing',
        flags: {
          enabled: 'i',
          disabled: 'ms'
        },
        children: []
      });

      assert ( /(?i-ms:a)/, {
        type: 'group',
        subtype: 'non-capturing',
        flags: {
          enabled: 'i',
          disabled: 'ms'
        },
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /(?i-ms:a|b)/, {
        type: 'group',
        subtype: 'non-capturing',
        flags: {
          enabled: 'i',
          disabled: 'ms'
        },
        children: [
          {
            type: 'disjunction',
            children: [
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'a'.codePointAt ( 0 )
              },
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'b'.codePointAt ( 0 )
              }
            ]
          }
        ]
      });

      assert ( /(?i-ms:(?i-ms:))/, {
        type: 'group',
        subtype: 'non-capturing',
        flags: {
          enabled: 'i',
          disabled: 'ms'
        },
        children: [
          {
            type: 'group',
            subtype: 'non-capturing',
            flags: {
              enabled: 'i',
              disabled: 'ms'
            },
            children: []
          }
        ]
      });

    });

    it ( 'supports lookahead group', () => {

      assert ( /(?=)/, {
        type: 'group',
        subtype: 'lookahead',
        children: []
      });

      assert ( /(?=(?=))/, {
        type: 'group',
        subtype: 'lookahead',
        children: [
          {
            type: 'group',
            subtype: 'lookahead',
            children: []
          }
        ]
      });

      assert ( /(?=a)/, {
        type: 'group',
        subtype: 'lookahead',
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /(?=a|b)/, {
        type: 'group',
        subtype: 'lookahead',
        children: [
          {
            type: 'disjunction',
            children: [
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'a'.codePointAt ( 0 )
              },
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'b'.codePointAt ( 0 )
              }
            ]
          }
        ]
      });

    });

    it ( 'supports lookbehind group', () => {

      assert ( /(?<=)/, {
        type: 'group',
        subtype: 'lookbehind',
        children: []
      });

      assert ( /(?<=(?<=))/, {
        type: 'group',
        subtype: 'lookbehind',
        children: [
          {
            type: 'group',
            subtype: 'lookbehind',
            children: []
          }
        ]
      });

      assert ( /(?<=a)/, {
        type: 'group',
        subtype: 'lookbehind',
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /(?<=a|b)/, {
        type: 'group',
        subtype: 'lookbehind',
        children: [
          {
            type: 'disjunction',
            children: [
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'a'.codePointAt ( 0 )
              },
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'b'.codePointAt ( 0 )
              }
            ]
          }
        ]
      });

    });

    it ( 'supports negative lookahead group', () => {

      assert ( /(?!)/, {
        type: 'group',
        subtype: 'negative-lookahead',
        children: []
      });

      assert ( /(?!(?!))/, {
        type: 'group',
        subtype: 'negative-lookahead',
        children: [
          {
            type: 'group',
            subtype: 'negative-lookahead',
            children: []
          }
        ]
      });

      assert ( /(?!a)/, {
        type: 'group',
        subtype: 'negative-lookahead',
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /(?!a|b)/, {
        type: 'group',
        subtype: 'negative-lookahead',
        children: [
          {
            type: 'disjunction',
            children: [
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'a'.codePointAt ( 0 )
              },
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'b'.codePointAt ( 0 )
              }
            ]
          }
        ]
      });

    });

    it ( 'supports negative lookbehind group', () => {

      assert ( /(?<!)/, {
        type: 'group',
        subtype: 'negative-lookbehind',
        children: []
      });

      assert ( /(?<!(?<!))/, {
        type: 'group',
        subtype: 'negative-lookbehind',
        children: [
          {
            type: 'group',
            subtype: 'negative-lookbehind',
            children: []
          }
        ]
      });

      assert ( /(?<!a)/, {
        type: 'group',
        subtype: 'negative-lookbehind',
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /(?<!a|b)/, {
        type: 'group',
        subtype: 'negative-lookbehind',
        children: [
          {
            type: 'disjunction',
            children: [
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'a'.codePointAt ( 0 )
              },
              {
                type: 'value',
                subtype: 'symbol',
                codePoint: 'b'.codePointAt ( 0 )
              }
            ]
          }
        ]
      });

    });

  });

  describe ( 'property', it => {

    it ( 'supports property', () => {

      assert ( /\p{Letter}/u, {
        type: 'property',
        negative: false,
        name: 'Letter'
      });

      assert ( /\P{Letter}/u, {
        type: 'property',
        negative: true,
        name: 'Letter'
      });

      assert ( /\P{General_Category=Letter}/u, {
        type: 'property',
        negative: true,
        name: 'General_Category=Letter'
      });

    });

  });

  describe ( 'quantifier', it => {

    it ( 'supports optional quantifier', () => {

      assert ( /a?/, {
        type: 'quantifier',
        subtype: 'optional',
        greedy: true,
        min: 0,
        max: 1,
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /a??/, {
        type: 'quantifier',
        subtype: 'optional',
        greedy: false,
        min: 0,
        max: 1,
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

    });

    it ( 'supports plus quantifier', () => {

      assert ( /a+/, {
        type: 'quantifier',
        subtype: 'plus',
        greedy: true,
        min: 1,
        max: Infinity,
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /a+?/, {
        type: 'quantifier',
        subtype: 'plus',
        greedy: false,
        min: 1,
        max: Infinity,
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

    });

    it ( 'supports star quantifier', () => {

      assert ( /a*/, {
        type: 'quantifier',
        subtype: 'star',
        greedy: true,
        min: 0,
        max: Infinity,
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /a*?/, {
        type: 'quantifier',
        subtype: 'star',
        greedy: false,
        min: 0,
        max: Infinity,
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

    });

    it ( 'supports range quantifier', () => {

      /* EXACT */

      assert ( /a{3}/, {
        type: 'quantifier',
        subtype: 'range',
        greedy: true,
        min: 3,
        max: 3,
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /a{3}?/, {
        type: 'quantifier',
        subtype: 'range',
        greedy: false,
        min: 3,
        max: 3,
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

      /* MIN */

      assert ( /a{2,}/, {
        type: 'quantifier',
        subtype: 'range',
        greedy: true,
        min: 2,
        max: Infinity,
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /a{2,}?/, {
        type: 'quantifier',
        subtype: 'range',
        greedy: false,
        min: 2,
        max: Infinity,
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

      /* MIN & MAX */

      assert ( /a{2,5}/, {
        type: 'quantifier',
        subtype: 'range',
        greedy: true,
        min: 2,
        max: 5,
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /a{2,5}?/, {
        type: 'quantifier',
        subtype: 'range',
        greedy: false,
        min: 2,
        max: 5,
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 'a'.codePointAt ( 0 )
          }
        ]
      });

    });

  });

  describe ( 'reference', it => {

    it ( 'supports index reference', () => {

      assert ( /()\1/, {
        type: 'alternative',
        children: [
          {
            type: 'group',
            subtype: 'capturing',
            children: []
          },
          {
            type: 'reference',
            subtype: 'index',
            value: 1
          }
        ]
      });

    });

    it ( 'supports name reference', () => {

      assert ( /\k<Foo>/, {
        type: 'reference',
        subtype: 'name',
        value: 'Foo'
      });

    });

  });

  describe ( 'value', it => {

    it ( 'supports control escape', () => {

      const ALPHABET = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'];

      for ( let i = 0; i < ALPHABET.length; i++ ) {

        const char = ALPHABET[i];
        const re = new RegExp ( `\\c${char}` );

        assert ( re, {
          type: 'value',
          subtype: 'control-escape',
          codePoint: ( i % 26 ) + 1
        });

      }

    });

    it ( 'supports escape', () => {

      assert ( /\a/, {
        type: 'value',
        subtype: 'escape',
        codePoint: 'a'.codePointAt ( 0 )
      });

      assert ( /\\/, {
        type: 'value',
        subtype: 'escape',
        codePoint: '\\'.codePointAt ( 0 )
      });

    });

    it ( 'supports hexadecimal escape', () => {

      assert ( /\x61/, {
        type: 'value',
        subtype: 'hexadecimal-escape',
        codePoint: 'a'.codePointAt ( 0 )
      });

    });

    it ( 'supports null escape', () => {

      assert ( /\0/, {
        type: 'value',
        subtype: 'null-escape',
        codePoint: 0
      });

    });

    it ( 'supports octal escape', () => {

      assert ( /\065/, {
        type: 'value',
        subtype: 'octal-escape',
        codePoint: '5'.codePointAt ( 0 )
      });

      assert ( /\65/, {
        type: 'value',
        subtype: 'octal-escape',
        codePoint: '5'.codePointAt ( 0 )
      });

    });

    it ( 'supports octal escape, max digits length', () => {

      assert ( /\0333/, {
        type: 'alternative',
        children: [
          {
            type: 'value',
            subtype: 'octal-escape',
            codePoint: parseInt ( '33', 8 )
          },
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: '3'.codePointAt ( 0 )
          }
        ]
      });

      assert ( /\3333/, {
        type: 'alternative',
        children: [
          {
            type: 'value',
            subtype: 'octal-escape',
            codePoint: parseInt ( '333', 8 )
          },
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: '3'.codePointAt ( 0 )
          }
        ]
      });

    });

    it ( 'supports single escape', () => {

      const CHAR_MAP = { f: '\f', n: '\n', r: '\r', v: '\v', t: '\t' };

      for ( const [char, value] of Object.entries ( CHAR_MAP ) ) {

        const re = new RegExp ( `\\${char}` );

        assert ( re, {
          type: 'value',
          subtype: 'single-escape',
          codePoint: value.codePointAt ( 0 )
        });

      }

    });

    it ( 'supports symbol', () => {

      assert ( /a/, {
        type: 'value',
        subtype: 'symbol',
        codePoint: 'a'.codePointAt ( 0 )
      });

    });

    it ( 'supports unicode escape', () => {

      assert ( /\u3042/, {
        type: 'value',
        subtype: 'unicode-escape',
        codePoint: '\u3042'.codePointAt ( 0 )
      });

      assert ( /\u{1F600}/u, {
        type: 'value',
        subtype: 'unicode-escape',
        codePoint: '\u{1F600}'.codePointAt ( 0 )
      });

    });

  });

  /* EXTRAS */

  describe ( 'flags', it => {

    describe ( 'without u and v flags', () => {

      it ( 'does not support property', () => {

        assert ( /\p{Letter}/, {
          type: 'alternative',
          children: [
            {
              type: 'value',
              subtype: 'escape',
              codePoint: 'p'.codePointAt ( 0 )
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: '{'.codePointAt ( 0 )
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: 'L'.codePointAt ( 0 )
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: 'e'.codePointAt ( 0 )
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: 't'.codePointAt ( 0 )
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: 't'.codePointAt ( 0 )
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: 'e'.codePointAt ( 0 )
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: 'r'.codePointAt ( 0 )
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: '}'.codePointAt ( 0 )
            }
          ]
        });

      });

      it ( 'does not support unicode code point escape value', () => {

        assert ( /\u{1F600}/, {
          type: 'alternative',
          children: [
            {
              type: 'value',
              subtype: 'escape',
              codePoint: 'u'.codePointAt ( 0 )
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: '{'.codePointAt ( 0 )
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: '1'.codePointAt ( 0 )
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: 'F'.codePointAt ( 0 )
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: '6'.codePointAt ( 0 )
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: '0'.codePointAt ( 0 )
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: '0'.codePointAt ( 0 )
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: '}'.codePointAt ( 0 )
            }
          ]
        });

      });

    });

    describe ( 'without v flag', () => {

      it ( 'does not support nested classes', () => {

        assert ( /[[a]]/, {
          type: 'alternative',
          children: [
            {
              type: 'character-class',
              subtype: 'union',
              negative: false,
              children: [
                {
                  type: 'value',
                  subtype: 'symbol',
                  codePoint: '['.codePointAt ( 0 )
                },
                {
                  type: 'value',
                  subtype: 'symbol',
                  codePoint: 'a'.codePointAt ( 0 )
                }
              ]
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: ']'.codePointAt ( 0 )
            }
          ]
        });

      });

      it ( 'does not support character class intersection', () => {

        assert ( /[a&&b]/, {
          type: 'character-class',
          subtype: 'union',
          negative: false,
          children: [
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: 'a'.codePointAt ( 0 )
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: '&'.codePointAt ( 0 )
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: '&'.codePointAt ( 0 )
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: 'b'.codePointAt ( 0 )
            }
          ]
        });

      });

      it.skip ( 'does not support character class subtraction', () => {

        // assert ( /[a--b]/, { // Invalid regex anyway...
        //   type: 'character-class',
        //   subtype: 'union',
        //   negative: false,
        //   children: [
        //     {
        //       type: 'value',
        //       subtype: 'symbol',
        //       codePoint: 'a'.codePointAt ( 0 )
        //     },
        //     {
        //       type: 'value',
        //       subtype: 'symbol',
        //       codePoint: '&'.codePointAt ( 0 )
        //     },
        //     {
        //       type: 'value',
        //       subtype: 'symbol',
        //       codePoint: '&'.codePointAt ( 0 )
        //     },
        //     {
        //       type: 'value',
        //       subtype: 'symbol',
        //       codePoint: 'b'.codePointAt ( 0 )
        //     }
        //   ]
        // });

      });

      it ( 'does not support class substring', () => {

        assert ( /[\q{a}]/, {
          type: 'character-class',
          subtype: 'union',
          negative: false,
          children: [
            {
              type: 'value',
              subtype: 'escape',
              codePoint: 'q'.codePointAt ( 0 )
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: '{'.codePointAt ( 0 )
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: 'a'.codePointAt ( 0 )
            },
            {
              type: 'value',
              subtype: 'symbol',
              codePoint: '}'.codePointAt ( 0 )
            }
          ]
        });

      });

    });

    describe ( 'with u flag', () => {

      it.skip ( 'does not support octal escape', () => {

        // assert ( /\065/u, { // Invalid regex anyway...
        //   type: 'alternative',
        //   children: [
        //     {
        //       type: 'value',
        //       subtype: 'escape',
        //       codePoint: '0'.codePointAt ( 0 )
        //     },
        //     {
        //       type: 'value',
        //       subtype: 'symbol',
        //       codePoint: '6'.codePointAt ( 0 )
        //     },
        //     {
        //       type: 'value',
        //       subtype: 'symbol',
        //       codePoint: '5'.codePointAt ( 0 )
        //     }
        //   ]
        // });

      });

    });

    describe ( 'with v flag', () => {

      it.skip ( 'does not support octal escape', () => {

        // assert ( /\065/v, { // Invalid regex anyway...
        //   type: 'alternative',
        //   children: [
        //     {
        //       type: 'value',
        //       subtype: 'escape',
        //       codePoint: '0'.codePointAt ( 0 )
        //     },
        //     {
        //       type: 'value',
        //       subtype: 'symbol',
        //       codePoint: '6'.codePointAt ( 0 )
        //     },
        //     {
        //       type: 'value',
        //       subtype: 'symbol',
        //       codePoint: '5'.codePointAt ( 0 )
        //     }
        //   ]
        // });

      });

    });

  });

  describe ( 'ambiguity between octals and backreferences', it => {

    it ( 'supports a backreference when it makes sense', () => {

      assert ( /()()()\3/, {
        type: 'alternative',
        children: [
          {
            type: 'group',
            subtype: 'capturing',
            children: []
          },
          {
            type: 'group',
            subtype: 'capturing',
            children: []
          },
          {
            type: 'group',
            subtype: 'capturing',
            children: []
          },
          {
            type: 'reference',
            subtype: 'index',
            value: 3
          }
        ]
      });

      assert ( /()()()()\3/, {
        type: 'alternative',
        children: [
          {
            type: 'group',
            subtype: 'capturing',
            children: []
          },
          {
            type: 'group',
            subtype: 'capturing',
            children: []
          },
          {
            type: 'group',
            subtype: 'capturing',
            children: []
          },
          {
            type: 'group',
            subtype: 'capturing',
            children: []
          },
          {
            type: 'reference',
            subtype: 'index',
            value: 3
          }
        ]
      });

    });

    it ( 'supports an octal when it makes sense', () => {

      assert ( /\3/, {
        type: 'value',
        subtype: 'octal-escape',
        codePoint: 3
      });

      assert ( /()\3/, {
        type: 'alternative',
        children: [
          {
            type: 'group',
            subtype: 'capturing',
            children: []
          },
          {
            type: 'value',
            subtype: 'octal-escape',
            codePoint: 3
          }
        ]
      });

      assert ( /()()\3/, {
        type: 'alternative',
        children: [
          {
            type: 'group',
            subtype: 'capturing',
            children: []
          },
          {
            type: 'group',
            subtype: 'capturing',
            children: []
          },
          {
            type: 'value',
            subtype: 'octal-escape',
            codePoint: 3
          }
        ]
      });

    });

  });

  describe ( 'unicode matching', it => {

    it ( 'supports unicode symbols', () => {

      assert ( /😃/, {
        type: 'alternative',
        children: [
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 55357
          },
          {
            type: 'value',
            subtype: 'symbol',
            codePoint: 56835
          }
        ]
      });

      assert ( /😃/u, {
        type: 'value',
        subtype: 'symbol',
        codePoint: 128515
      });

    });

    it ( 'supports unicode character class ranges', () => {

      assert ( /[😃-😅]/u, {
        type: 'character-class',
        subtype: 'union',
        negative: false,
        children: [
          {
            type: 'character-class-range',
            fromCodePoint: 128515,
            toCodePoint: 128517
          }
        ]
      });

    });

  });

});
