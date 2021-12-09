export type AnalysisOutputProviderType = 'lichess' | 'stockfish';

export type AnalysisOutputActionType = 'opening' | 'eval';

export type AnalysisOutputLineScoreType = 'cp' | 'mate';
export type AnalysisOutputLineScore = {
  type: AnalysisOutputLineScoreType;
  value: number;
};

export type AnalysisOutputLineType = {
  score?: AnalysisOutputLineScore;
  uci: string | string[];
};

export type AnalysisOutputType = {
  provider: AnalysisOutputProviderType;
  type: AnalysisOutputActionType;

  fen: string;

  depth?: number;
  multipv?: number;

  opening?: {
    eco: string;
    name: string;
  } | null;

  moves: AnalysisOutputLineType[];

  bestMove?: { from: string; to: string; promotion: string | undefined };
};

export default function normalizeEval(analysis: any): AnalysisOutputType {
  const analysisOutput: AnalysisOutputType = {
    fen: analysis.result.fen || analysis.fen,
    provider: 'lichess',
    moves: [],
    type: 'eval',
    depth: -Infinity,
    multipv: -Infinity,
  };

  if (analysis.providerName.startsWith('lichess')) {
    analysisOutput.provider = 'lichess';

    if (analysis.providerName == 'lichessOpening') {
      analysisOutput.type = 'opening';
      analysisOutput.opening = analysis.result.opening;
      analysisOutput.moves = analysis.result.moves.map(
        (move: { uci: string } & any) => ({
          uci: move.uci,
        })
      );
    } else {
      analysisOutput.type = 'eval';
      analysisOutput.moves = analysis.result.pvs.map(
        (line: {
          moves: string;
          cp?: number;
          mate?: number;
        }): {
          uci: string[];
          score: {
            type: AnalysisOutputLineScoreType;
            value: number;
          };
        } => {
          const moveBack: {
            uci: string[];
            score: {
              type: AnalysisOutputLineScoreType;
              value: number;
            };
          } = {
            score: {
              type: 'cp',
              value: Infinity,
            },
            uci: line.moves.split(' '),
          };

          if (line.cp) {
            moveBack.score.type = 'cp';
            moveBack.score.value = line.cp;
          } else {
            moveBack.score.type = 'mate';
            moveBack.score.value = line.mate as number;
          }
          return moveBack;
        }
      );
    }
  } else {
    analysisOutput.provider = 'stockfish';
    analysisOutput.type = 'eval';
    analysisOutput.moves = analysis.result.lines.map(
      (line: {
        depth: number;
        multipv: number;
        score: {
          type: AnalysisOutputLineScoreType;
          value: number;
        };
        moves: string[];
      }) => ({
        uci: line.moves,
        score: line.score,
      })
    );
  }

  const result = analysis.result;

  analysisOutput.depth = result.depth || null;
  analysisOutput.multipv =
    result.multipv || result.pvs?.length || result.moves.length;
  analysisOutput.bestMove = result.bestMove;

  return analysisOutput;
}
