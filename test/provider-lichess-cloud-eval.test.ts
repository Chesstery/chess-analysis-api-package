// "error": "Not found"
import {lichessCloudEval} from './../api/providers/lichess-cloud-eval';
const fenList: string[] = require('./fixtures/fen-list.json');

describe('> provider lichess cloud eval', () => {

  fenList.forEach((fen: string) => {

    it(`request cloud eval moves for: ${fen}`, (done: Mocha.Done) => {
      lichessCloudEval({fen})
      .then((result: any) => {
        if(result.pvs instanceof Array) {
          done();
        } else {
          done(result);
        }
      })
      .catch((error: any) => {
        if("Not found" == error.error) {
          done();
        } else {
          done(error);
        }
      });
    });

  });

});