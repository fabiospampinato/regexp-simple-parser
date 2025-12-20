# RegExp Simple Parser

A simple and modern RegExp parser.

No validations are performed, a valid RegExp object must be provided, so validation is delegated to the engine.

The AST produced is not a "concrete" AST, but you could reconstruct a RegExp equivalent to the original from it, plus the flags.

All features up to ES2025 are supported.

## Install

```sh
npm install regexp-simple-parser
```

## Usage

```ts
import parse from 'regexp-simple-parser';
import type {Node} from 'regexp-simple-parser';

// Let's parse a RegExp

const AST: Node = parse ( /^(a|b|c)$/ );
// {
//   type: 'alternative',
//   children: [
//     {
//       type: 'anchor',
//       subtype: 'start'
//     },
//     {
//       type: 'group',
//       subtype: 'capturing',
//       children: [
//         {
//           type: 'disjunction',
//           children: [
//             {
//               type: 'value',
//               subtype: 'symbol',
//               codePoint: 97
//             },
//             {
//               type: 'value',
//               subtype: 'symbol',
//               codePoint: 98
//             },
//             {
//               type: 'value',
//               subtype: 'symbol',
//               codePoint: 99
//             }
//           ]
//         }
//       ]
//     },
//     {
//       type: 'anchor',
//       subtype: 'end'
//     }
//   ]
// }
```

## License

MIT © Fabio Spampinato
