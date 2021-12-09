Forked from [chess-analysis-api](https://www.npmjs.com/package/chess-analysis-api) and modified. Fix minification bug after webpack bundling (check this for further information: [MDN: Function.name](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name), change import/require statements on Worker (web-worker), Chess constructor)

> chess engine that consume [lichess API](https://lichess.org/api) and [wasm of stockfish](https://www.npmjs.com/package/stockfish) for purpose a chess engine with hight level interface.


### installation

`npm install chess-analysis-api`

or with *yarn*

`yarn add chess-analysis-api`

### Usage

## ES6 Syntax

```js

import {chessAnalysisApi} from 'chess-analysis-api';

chessAnalysisApi.getAnalysis({

  // <https://en.wikipedia.org/wiki/Notation_Forsyth-Edwards>
  fen: "r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",

  // calcul depth default=7
  depth: 12,

  // number options move should calcul
  multipv: 2
})
.then((result) => {

  console.log(result);
  // ...
})
.catch(error => {

  console.error(error);
  throw new Error(error.message);

  // ...
});

```

### How this work

this package consume multiple providers:

- [lichess API opening](https://lichess.org/api#tag/Opening-Explorer)

- [lichess API cloud eval](https://lichess.org/api#operation/apiCloudEval)

- [WASM stockfish](https://www.npmjs.com/package/stockfish)

And with a *manager*, the package calls for the best providers according to the FEN position,
for sample if the FEN position indicates **less than 10 moves** played, the *manager* will call the provider of the *openings*.
But if the FEN position indicates **more than 35 moves** already played the *manager* will not report the opening providers,
nor the cloud assessment providers *(because the cloud assessment providers only give results from their cache)*
and call directly the stockfish provider.


### Advanced options

chess-analysis-api use 3 providers for **Lichess API opening** and **Lichess API cloud** not use parameter **depth** that represent calcul power of
chess engine if you want full control of calcul power engine, you should exclude **Lichess Provider** and use only **Stockfish** provider.

Exemple:

```js

import {chessAnalysisApi, PROVIDERS} from 'chess-analysis-api';


chessAnalysisApi.getAnalysis({

  // <https://en.wikipedia.org/wiki/Notation_Forsyth-Edwards>
  fen: "r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",

  // calcul depth default=7
  depth: 12,

  // number options move should calcul
  multipv: 2,

  // excludes provider.s
  excludes: [
    PROVIDERS.LICHESS_BOOK,
    PROVIDERS.LICHESS_CLOUD_EVAL
  ]
})
.then((result) => {

  console.log(result);
  // ...
})
.catch(error => {

  console.error(error);
  throw new Error(error.message);

  // ...
});

```

### typing result

See below result format as response of `getAnalysis: (...arg) => Promise<AnalysisOutputType>`:

```ts
export type AnalysisOutputProviderType = "lichess" | "stockfish";

export type AnalysisOutputActionType = "opening" | "eval";

export type AnalysisOutputLineScoreType = "cp" | "mate";
export type AnalysisOutputLineScore = {
  type: AnalysisOutputLineScoreType;
  value: number;
};

export type AnalysisOutputLineType = {

  // computer eval in centi-pawn view by white player
  score?: AnalysisOutputLineScore;

  // next moves (main line of computer)
  uci: string | string[];
};

export type AnalysisOutputType = {
  provider: AnalysisOutputProviderType;
  type: AnalysisOutputActionType;

  fen: string;

  // power calcul only for stockfish provider
  depth?: number;

  // number of lines
  multipv?: number;

  // opening data only for lichess opening provider
  opening?: {
    eco: string; // opening FIDE code
    name: string; // opening full name
  } | null,

  moves: AnalysisOutputLineType[];
};
```

for the reason node.js don't work with webworkers to pass all the test checkout to the 'all-test-passed' branch, which differ only in require/import statements for stockfish (and its data parsing) and Chess constructor
