import { PATTERN_UCI_MOVE } from './../constants';

export type StockfishScoreType = 'cp' | 'mate'; // centipawn eval or checkmate find

export interface StockfishEntry {
  depth: number;
  multipv: number;
  score: {
    type: StockfishScoreType;
    value: number;
  };
  moves: string[]; // array UCI move
}

export interface StockfishEval {
  lines: StockfishEntry[];
  depth: number;
  multipv: number;
  fen: string;
  bestMove: { from: string; to: string };
}

/** @see /test/stockfish-parse-line-info.test.ts */
export function parseLineInfo(data: string): StockfishEntry {
  const dataArray: string[] = data.trim().split(' ');

  const entry: StockfishEntry = {
    moves: [],
    depth: NaN,
    multipv: NaN,
    score: {
      type: 'mate',
      value: NaN,
    },
  };

  let isIntoMove = false;

  ['depth', 'multipv', 'score', 'pv'].forEach((marker: string) => {
    dataArray.forEach((sentence: string, index: number) => {
      sentence = sentence.trim();

      if (!isIntoMove) {
        if (sentence == marker) {
          if (marker === 'depth' || marker === 'multipv') {
            if (marker === 'depth') {
              entry.depth = parseFloat(dataArray[index + 1]);
            } else {
              entry.multipv = parseFloat(dataArray[index + 1].trim());
            }
          } else {
            if (marker === 'score') {
              entry.score = {
                type: dataArray[index + 1].trim() as StockfishScoreType,
                value: parseFloat(dataArray[index + 2]),
              };
            } else {
              // pv
              isIntoMove = true;
            }
          }
        }
      } else {
        if (PATTERN_UCI_MOVE.test(sentence)) {
          entry.moves.push(sentence);
        }
      }
    });
  });

  return entry;
}

export function getBestLines(entries: StockfishEntry[][]): StockfishEntry[] {
  const bestLines: StockfishEntry[] = [];

  entries.forEach((lines: StockfishEntry[]) => {
    bestLines.push(lines.pop() as StockfishEntry);
  });

  return bestLines;
}

export function stockfishEval(params: {
  fen: string;
  multipv?: number;
  depth?: number;
}): Promise<StockfishEval> {
  //@ts-ignore
  return new Promise<StockfishEval>(
    (
      resolve: (data: StockfishEval) => void,
      reject: (error: any) => void
    ): void => {
      const engine = new Worker('/stockfish.js');
      engine.postMessage('uci');

      const lines: StockfishEntry[][] = [];

      //@ts-ignore
      engine.onmessage = function ({ data }: { data: string }) {
        if (data === 'uciok') {
          engine.postMessage(`position fen ${params.fen}`);
          engine.postMessage(`setoption name multipv value ${params.multipv}`);
          engine.postMessage('isready');
        } else {
          if (data === 'readyok') {
            engine.postMessage(`go depth ${params.depth}`);
          } else if (data.startsWith('info')) {
            const entry: StockfishEntry = parseLineInfo(data);

            if (lines[entry.multipv - 1] instanceof Array) {
              lines[entry.multipv - 1].push(entry);
            } else {
              lines.push([]);
              lines[entry.multipv - 1].push(entry);
            }
          }
        }
        const checkPromotion = (move: string) => {
          const lastChar = move.slice(-1);
          return isNaN(lastChar as any);
        };

        const getMove = (bestMove: string) =>
          checkPromotion(bestMove)
            ? {
                from: bestMove.slice(0, 2),
                to: bestMove.slice(2, bestMove.length - 1),
                promotion: bestMove.slice(-1),
              }
            : {
                from: bestMove.slice(0, 2),
                to: bestMove.slice(2, bestMove.length),
              };

        if (data.startsWith('bestmove')) {
          engine.postMessage('quit');
          const bestMove = data.split(' ')[1];
          const move = getMove(bestMove);
          resolve({
            depth: params.depth || 1,
            multipv: params.multipv || 1,
            fen: params.fen,
            lines: getBestLines(lines),
            bestMove: move,
          });
        }
      };
    }
  );
}
