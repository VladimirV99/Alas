import chai from 'chai';
const expect = chai.expect;

import { UOARNumber, NumberTypes } from '../../../src/uoar1/uoar_core.mjs';
import { 
  multiplyUnsigned, multiplyBooth, multiplyModifiedBooth, divideUnsigned, divideSigned
} from '../../../src/uoar1/arithmetic/arithmetic.mjs';

describe('Arithmetic', function() {

  describe('multiplyUnsigned', function() {

    it('empty input', function() {
      let operand1 = "70";
      let operand2 = "51";
      expect(multiplyUnsigned(operand1, "", false)).to.be.null;
      expect(multiplyUnsigned("", operand2, false)).to.be.null;
    });

    it('invalid input', function() {
      let operand1 = "70";
      let operand2 = "A1";
      expect(multiplyUnsigned(operand1, operand2, false)).to.be.null;
    });

    it('negative input', function() {
      let operand1 = "70";
      let operand2 = "-51";
      expect(multiplyUnsigned(operand1, operand2, false)).to.be.null;
    });

    it('example 1', function() {
      let operand1 = "70";
      let operand2 = "51";
      let res = new UOARNumber("", "3570", "", 10, NumberTypes.UNSIGNED);
      expect(multiplyUnsigned(operand1, operand2, false)).to.deep.equal(res);
    });

    it('example 2', function() {
      let operand1 = "91";
      let operand2 = "22";
      let res = new UOARNumber("", "2002", "", 10, NumberTypes.UNSIGNED);
      expect(multiplyUnsigned(operand1, operand2, false)).to.deep.equal(res);
    });

  });

  describe('multiplyBooth', function() {

    it('empty input', function() {
      let operand1 = "-91";
      let operand2 = "22";
      expect(multiplyBooth(operand1, "", false)).to.be.null;
      expect(multiplyBooth("", operand2, false)).to.be.null;
    });

    it('invalid input', function() {
      let operand1 = "-A1";
      let operand2 = "22";
      expect(multiplyUnsigned(operand1, operand2, false)).to.be.null;
    });

    it('example 1', function() {
      let operand1 = "-91";
      let operand2 = "22";
      let res = new UOARNumber("-", "2002", "", 10, NumberTypes.SIGNED);
      expect(multiplyBooth(operand1, operand2, false)).to.deep.equal(res);
    });

    it('example 2', function() {
      let operand1 = "-28";
      let operand2 = "111";
      let res = new UOARNumber("-", "3108", "", 10, NumberTypes.SIGNED);
      expect(multiplyBooth(operand1, operand2, false)).to.deep.equal(res);
    });

  });

  describe('multiplyModifiedBooth', function() {

    it('empty input', function() {
      let operand1 = "-91";
      let operand2 = "22";
      expect(multiplyModifiedBooth(operand1, "", false)).to.be.null;
      expect(multiplyModifiedBooth("", operand2, false)).to.be.null;
    });

    it('invalid input', function() {
      let operand1 = "-A1";
      let operand2 = "22";
      expect(multiplyModifiedBooth(operand1, operand2, false)).to.be.null;
    });

    it('example 1', function() {
      let operand1 = "-91";
      let operand2 = "22";
      let res = new UOARNumber("-", "2002", "", 10, NumberTypes.SIGNED);
      expect(multiplyModifiedBooth(operand1, operand2, false)).to.deep.equal(res);
    });

    it('example 2', function() {
      let operand1 = "-28";
      let operand2 = "111";
      let res = new UOARNumber("-", "3108", "", 10, NumberTypes.SIGNED);
      expect(multiplyModifiedBooth(operand1, operand2, false)).to.deep.equal(res);
    });

  });

  describe('divideUnsigned', function() {

    it('empty input', function() {
      let operand1 = "131";
      let operand2 = "12";
      expect(divideUnsigned(operand1, "", false)).to.be.null;
      expect(divideUnsigned("", operand2, false)).to.be.null;
    });

    it('invalid input', function() {
      let operand1 = "1A1";
      let operand2 = "12";
      expect(divideUnsigned(operand1, operand2, false)).to.be.null;
    });

    it('negative input', function() {
      let operand1 = "131";
      let operand2 = "-12";
      expect(divideUnsigned(operand1, operand2, false)).to.be.null;
    });

    it('example 1', function() {
      let operand1 = "131";
      let operand2 = "12";
      let res = {
        quotient: new UOARNumber("", "10", "", 10, NumberTypes.UNSIGNED),
        remainder: new UOARNumber("", "11", "", 10, NumberTypes.UNSIGNED)
      };
      expect(divideUnsigned(operand1, operand2, false)).to.deep.equal(res);
    });

    it('example 2', function() {
      let operand1 = "103";
      let operand2 = "7";
      let res = {
        quotient: new UOARNumber("", "14", "", 10, NumberTypes.UNSIGNED),
        remainder: new UOARNumber("", "5", "", 10, NumberTypes.UNSIGNED)
      };
      expect(divideUnsigned(operand1, operand2, false)).to.deep.equal(res);
    });

  });

  describe('divideSigned', function() {

    it('empty input', function() {
      let operand1 = "131";
      let operand2 = "12";
      expect(divideSigned(operand1, "", false)).to.be.null;
      expect(divideSigned("", operand2, false)).to.be.null;
    });

    it('invalid input', function() {
      let operand1 = "1A1";
      let operand2 = "12";
      expect(divideSigned(operand1, operand2, false)).to.be.null;
    });

    it('example 1', function() {
      let operand1 = "-131";
      let operand2 = "12";
      let res = {
        quotient: new UOARNumber("-", "10", "", 10, NumberTypes.SIGNED),
        remainder: new UOARNumber("-", "11", "", 10, NumberTypes.SIGNED)
      };
      expect(divideSigned(operand1, operand2, false)).to.deep.equal(res);
    });

    it('example 2', function() {
      let operand1 = "-123";
      let operand2 = "-4";
      let res = {
        quotient: new UOARNumber("+", "30", "", 10, NumberTypes.SIGNED),
        remainder: new UOARNumber("-", "3", "", 10, NumberTypes.SIGNED)
      };
      expect(divideSigned(operand1, operand2, false)).to.deep.equal(res);
    });

  });

});