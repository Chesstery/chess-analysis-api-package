import {assert, expect} from 'chai';
import {lichessOpening} from './../api/providers/lichess-opening';
const fenList: string[] = require('./fixtures/fen-list.json');

describe('> provider lichess opening', () => {

  fenList.forEach((fen: string) => {

    it(`request opening moves for: ${fen}`, (done: Mocha.Done) => {
      lichessOpening({fen})
      .then((result: any) => {

        if(result.moves instanceof Array) {
          if(typeof result.fen === "string") {
            done();
          }
        } else {
          done(result);
        }
      })
      .catch((error: any) => {
        if(fen === error.fen && "not opening move find or FEN invalid" == error.message) {
          done();
        }

      });
    });

  });

});