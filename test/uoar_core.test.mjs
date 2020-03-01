import chai from 'chai';
const expect = chai.expect;

import { UOARNumber, NumberTypes } from '../src/uoar1/uoar_core.mjs';

describe('UOAR Core', function() {

  describe('UOARNumber', function() {

    describe('toSigned', function() {
      it('signed positive number', function() {
        let number = new UOARNumber("+", "10", "5", 10, NumberTypes.SIGNED);
        expect(number.toSigned()).to.equal("+10.5");
      });
    });

  });

});