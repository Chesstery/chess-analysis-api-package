import {assert, expect} from 'chai';
import {parseLineInfo, StockfishEntry} from './../api/providers/stockfish-eval';
const fixtures: string[] = require('./fixtures/stockfish-line-info.json');

describe('> stockfish parse line info', () => {


  fixtures.forEach((fixture: string) => {

    it(`should parse line info: "${fixture.slice(0, 20) + "..."}"`, () => {

      const entry: StockfishEntry = parseLineInfo(fixture);

      assert.isObject(entry);

      expect(entry).has.own.property('moves');
      expect(entry).has.own.property('depth');
      expect(entry).has.own.property('multipv');
      expect(entry).has.own.property('score');

      assert.isObject(entry.score);
      expect(entry.score).has.own.property('type');
      expect(entry.score).has.own.property('value');

      assert.isNotNaN(entry.depth);
      assert.isFinite(entry.depth);
      assert.isNotNaN(entry.multipv);
      assert.isFinite(entry.multipv);
      assert.isArray(entry.moves);
    });

  });

});