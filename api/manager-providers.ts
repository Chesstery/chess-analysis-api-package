import { lichessOpening } from './providers/lichess-opening';
import { lichessCloudEval } from './providers/lichess-cloud-eval';
import { stockfishEval } from './providers/stockfish-eval';
import { ChessInstance } from 'chess.js';
import {
  DEFAULT_DEPTH,
  MIN_DEPTH,
  MAX_DEPTH,
  DEFAULT_MULTI_PV,
  MIN_MULTI_PV,
  MAX_MULTI_PV,
} from './constants';

//@ts-ignore
const Chess = require('chess.js');

export enum PROVIDERS {
  LICHESS_BOOK = 'lichessOpening',
  LICHESS_CLOUD = 'lichessCloudEval',
  STOCKFISH = 'stockfishEval',
}

type ParamsProviderFunction = {
  fen: string;
  multiPv?: number;
  depth?: number;
};

type ProviderFunction = (params: ParamsProviderFunction) => Promise<any>;

function clamp(value: number, min: number, max: number) {
  if (value > max) {
    return max;
  } else if (value < min) {
    return min;
  }

  return value;
}

function getProviderByName(providerName: PROVIDERS) {
  console.log(providerName);
  switch (providerName) {
    case PROVIDERS.LICHESS_CLOUD:
      return lichessCloudEval;
    case PROVIDERS.LICHESS_BOOK:
      return lichessOpening;
    case PROVIDERS.STOCKFISH:
      return stockfishEval;
  }
}

function getResult(
  providers: ProviderFunction[],
  params: ParamsProviderFunction,
  namesOfProviders: string[],

  originalResolve?: (data: any) => void,
  originalReject?: (reason: any) => void
) {
  const currentProvider = providers[0];
  const currentProviderName = namesOfProviders[0];

  //@ts-ignore
  return new Promise(
    (resolve: (data: any) => void, reject: (reason: any) => void): void => {
      const workerCallback: {
        resolve: (data: any) => void;
        reject: (reason: any) => void;
      } = {
        resolve: originalResolve || resolve,
        reject: originalReject || reject,
      };

      currentProvider(params)
        .then((result: any) => {
          workerCallback.resolve({
            result,
            providerName: currentProviderName, // provider function name
          });
        })
        .catch((error) => {
          if (providers.length > 1) {
            providers.shift();
            namesOfProviders.shift();
            getResult(
              providers,
              params,
              namesOfProviders,

              workerCallback.resolve,
              workerCallback.reject
            );
          } else {
            workerCallback.reject({
              errorLastProvider: error,
              message: 'all providers not available',
            });
          }
        });
    }
  );
}

export default function getAnalysis(params: {
  fen: string;
  multipv?: number;
  depth?: number;
  excludes?: PROVIDERS[];
}): Promise<any> {
  // fix optionals params
  params.multipv = clamp(
    params.multipv || DEFAULT_MULTI_PV,
    MIN_MULTI_PV,
    MAX_MULTI_PV
  );
  params.depth = clamp(params.depth || DEFAULT_DEPTH, MIN_DEPTH, MAX_DEPTH);

  const chessReferee: ChessInstance = new Chess(params.fen);

  const isValidFen: boolean = chessReferee.validate_fen(params.fen).valid;

  if (!isValidFen) {
    throw new Error(`FEN is not valid, analysis has been aborted`);
  }

  if (chessReferee.game_over()) {
    throw new Error(`FEN position is already resolve`);
  }

  const countPlayedMoves: number = parseInt(
    params.fen.split(' ').pop() as string
  );

  let providersOrder: ProviderFunction[] = [];
  let namesOfProviders: PROVIDERS[] = [];

  if (countPlayedMoves < 15) {
    // [lichessOpening, lichessCloudEval, stockfishEval]
    providersOrder = [lichessOpening, lichessCloudEval, stockfishEval];
    namesOfProviders = [
      PROVIDERS.LICHESS_BOOK,
      PROVIDERS.LICHESS_CLOUD,
      PROVIDERS.STOCKFISH,
    ];
  } else if (countPlayedMoves < 35) {
    // [lichessCloudEval, stockfishEval]
    providersOrder = [lichessCloudEval, stockfishEval];
    namesOfProviders = [PROVIDERS.LICHESS_CLOUD, PROVIDERS.STOCKFISH];
  } else {
    // stockfishEval
    providersOrder = [stockfishEval];
    namesOfProviders = [PROVIDERS.STOCKFISH];
  }

  if (params.excludes) {
    namesOfProviders = namesOfProviders.filter(
      (provider) => !params.excludes!.includes(provider)
    );
    providersOrder = namesOfProviders.map((providerName) =>
      getProviderByName(providerName)
    );
  }

  return getResult(providersOrder, params, namesOfProviders);
}
