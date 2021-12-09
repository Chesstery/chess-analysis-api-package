import { assert, expect } from 'chai';
import { PROVIDERS } from '../api/manager-providers';
import { chessAnalysisApi } from './../index';
const fenList: string[] = require('./fixtures/fen-list.json');

describe('> provider lichess cloud eval', () => {
  fenList.forEach((fen: string) => {
    it(`request with only stockfish providers`, (done: Mocha.Done) => {
      chessAnalysisApi
        .getAnalysis({
          fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
          depth: 2,
          multipv: 2,
          excludes: [PROVIDERS.LICHESS_CLOUD_EVAL, PROVIDERS.LICHESS_BOOK],
        })
        .then((output) => {
          assert.isObject(output);
          expect(output).to.has.property('provider');
          expect(output.provider).to.equal('stockfish');
          done();
        })
        .catch((error) => {
          done(error);
        });
    });

    it(`request with only stockfish and lichess eval providers`, (done: Mocha.Done) => {
      chessAnalysisApi
        .getAnalysis({
          fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
          depth: 2,
          multipv: 2,
          excludes: [PROVIDERS.LICHESS_BOOK],
        })
        .then((output) => {
          assert.isObject(output);
          expect(output).to.has.property('provider');
          expect(output.provider).to.match(/^(stockfish|lichess)$/);
          expect(output).to.has.property('type');
          expect(output.type).to.equal('eval');
          done();
        })
        .catch((error) => {
          done(error);
        });
    });
  });
});
