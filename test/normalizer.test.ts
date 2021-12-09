import {assert,expect} from 'chai';

import normalizer from './../api/normalizer';

const fixtures: any[] = require('./fixtures/normalizer-shema-list.json');

describe('> data normalizer', () => {

  fixtures.forEach(fixture => {

    it(`should normalize for: ${fixture.providerName} from ${fixture.result.fen}`, () => {
      const genericData = normalizer(fixture);
      assert.isObject(genericData);
      assert.isString(genericData.provider);
      assert.isString(genericData.fen);
      assert.isString(genericData.type);
      assert.isArray(genericData.moves);
    });
  });

});