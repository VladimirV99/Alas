import chai from 'chai';
const expect = chai.expect;

import {
  IEEE754Formats, IEEE754Number, BINARY32_SPECIAL_VALUES
} from '../../src/uoar1/ieee754_core.mjs';
import {
  addIEEE754, subtractIEEE754, multiplyIEEE754, divideIEEE754
} from '../../src/uoar1/ieee754_arithmetic.mjs';

let pos_zero = "0 00000000 00000000000000000000000";
let neg_zero = "1 00000000 00000000000000000000000";
let pos_inf = "0 11111111 00000000000000000000000";
let neg_inf = "1 11111111 00000000000000000000000";
let qnan = "0 11111111 01000000000000000000000";
let snan = "0 11111111 11000000000000000000000";

describe('IEEE754 Arithmetic', function() {
  
  describe('addIEEE754', function() {

    it('invalid operand', function() {
      let operand1 = "";
      let operand2 = "";
      expect(addIEEE754(operand1, operand2, false)).to.be.null;
    });

    it('same signs', function() {
      let operand1 = "1 01110100 11001000000000000000000";
      let operand2 = "1 01110100 01011100000000000000000";
      let res = new IEEE754Number("1", "01110101", "10010010000000000000000", IEEE754Formats.BINARY32);
      expect(addIEEE754(operand1, operand2, false)).to.deep.equal(res);
    });

    it('different signs', function() {
      let operand1 = "0 10000010 10111101010000000000000";
      let operand2 = "1 10000101 10111100100000000000000";
      let res = new IEEE754Number("1", "10000101", "10000100110110000000000", IEEE754Formats.BINARY32);
      expect(addIEEE754(operand1, operand2, false)).to.deep.equal(res);
    });

    it('positive infinity', function() {
      let operand = "0 10000010 10111101010000000000000";
      expect(addIEEE754(operand, pos_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_INF);
    });

    it('negative infinity', function() {
      let operand = "1 10000101 10111100100000000000000";
      expect(addIEEE754(operand, neg_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_INF);
    });

    it('qnan', function() {
      let operand = "0 10000010 10111101010000000000000";
      expect(addIEEE754(operand, qnan, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
      expect(addIEEE754(operand, snan, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
      expect(addIEEE754(pos_inf, neg_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
      expect(addIEEE754(neg_inf, pos_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
    });

  });

  describe('subtractIEEE754', function() {

    it('invalid operand', function() {
      let operand1 = "";
      let operand2 = "";
      expect(subtractIEEE754(operand1, operand2, false)).to.be.null;
    });

    it('same signs', function() {
      let operand1 = "0 10000110 10101100000000000000000";
      let operand2 = "0 10000010 01110000000000000000000";
      let res = new IEEE754Number("0", "10000110", "10010101000000000000000", IEEE754Formats.BINARY32);
      expect(subtractIEEE754(operand1, operand2, false)).to.deep.equal(res);
    });

    it('different signs', function() {
      let operand1 = "1 10000110 10111101010000000000000";
      let operand2 = "0 10000101 10111100100000000000000";
      let res = new IEEE754Number("1", "10000111", "01001101110000000000000", IEEE754Formats.BINARY32);
      expect(subtractIEEE754(operand1, operand2, false)).to.deep.equal(res);
    });

    it('positive infinity', function() {
      let operand = "0 10000010 10111101010000000000000";
      expect(subtractIEEE754(operand, neg_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_INF);
      expect(subtractIEEE754(pos_inf, operand, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_INF);
    });

    it('negative infinity', function() {
      let operand = "1 10000101 10111100100000000000000";
      expect(subtractIEEE754(operand, pos_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_INF);
      expect(subtractIEEE754(neg_inf, operand, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_INF);
    });

    it('qnan', function() {
      let operand = "0 10000010 10111101010000000000000";
      expect(subtractIEEE754(operand, qnan, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
      expect(subtractIEEE754(operand, snan, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
      expect(subtractIEEE754(pos_inf, pos_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
      expect(subtractIEEE754(neg_inf, neg_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
    });

  });

  describe('multiplyIEEE754', function() {

    it('invalid operand', function() {
      let operand1 = "";
      let operand2 = "";
      expect(multiplyIEEE754(operand1, operand2, false)).to.be.null;
    });

    it('valid', function() {
      let operand1 = "1 10000101 01010100000000000000000";
      let operand2 = "0 10000011 10110000000000000000000";
      let res = new IEEE754Number("1", "10001010", "00011110111000000000000", IEEE754Formats.BINARY32);
      expect(multiplyIEEE754(operand1, operand2, false)).to.deep.equal(res);
    });

    it('positive infinity', function() {
      let pos_number = "0 10000011 10110000000000000000000";
      let neg_number = "1 10000101 01010100000000000000000";
      expect(multiplyIEEE754(neg_number, neg_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_INF);
      expect(multiplyIEEE754(pos_inf, pos_number, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_INF);
      expect(multiplyIEEE754(pos_inf, pos_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_INF);
      expect(multiplyIEEE754(neg_inf, neg_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_INF);
    });

    it('negative infinity', function() {
      let pos_number = "0 10000011 10110000000000000000000";
      let neg_number = "1 10000101 01010100000000000000000";
      expect(multiplyIEEE754(neg_number, pos_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_INF);
      expect(multiplyIEEE754(neg_inf, pos_number, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_INF);
      expect(multiplyIEEE754(pos_inf, neg_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_INF);
      expect(multiplyIEEE754(neg_inf, pos_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_INF);
    });

    it('positive zero', function() {
      let pos_number = "0 10000011 10110000000000000000000";
      let neg_number = "1 10000101 01010100000000000000000";
      expect(multiplyIEEE754(pos_zero, pos_number, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_ZERO);
      expect(multiplyIEEE754(neg_zero, neg_number, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_ZERO);
    });

    it('negative zero', function() {
      let pos_number = "0 10000011 10110000000000000000000";
      let neg_number = "1 10000101 01010100000000000000000";
      expect(multiplyIEEE754(pos_zero, neg_number, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_ZERO);
      expect(multiplyIEEE754(neg_zero, pos_number, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_ZERO);
    });

    it('qnan', function() {
      let operand = "0 10000011 10110000000000000000000";
      expect(multiplyIEEE754(operand, qnan, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
      expect(multiplyIEEE754(operand, snan, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
      expect(multiplyIEEE754(qnan, operand, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
      expect(multiplyIEEE754(snan, operand, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
      expect(multiplyIEEE754(pos_zero, neg_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
      expect(multiplyIEEE754(pos_inf, neg_zero, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
    });

  });

  describe('divideIEEE754', function() {

    it('invalid operand', function() {
      let operand1 = "";
      let operand2 = "";
      expect(divideIEEE754(operand1, operand2, false)).to.be.null;
    });

    it('valid', function() {
      let operand1 = "0 11010011 00001001000000000000000";
      let operand2 = "1 10101111 01000000000000000000000";
      let res = new IEEE754Number("1", "10100010", "10101000000000000000000", IEEE754Formats.BINARY32);
      expect(divideIEEE754(operand1, operand2, false)).to.deep.equal(res);
    });

    it('positive infinity', function() {
      let pos_number = "0 10000011 10110000000000000000000";
      let neg_number = "1 10000101 01010100000000000000000";
      expect(divideIEEE754(pos_inf, pos_number, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_INF);
      expect(divideIEEE754(neg_inf, neg_number, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_INF);
      expect(divideIEEE754(pos_number, pos_zero, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_INF);
      expect(divideIEEE754(neg_number, neg_zero, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_INF);
    });

    it('negative infinity', function() {
      let pos_number = "0 10000011 10110000000000000000000";
      let neg_number = "1 10000101 01010100000000000000000";
      expect(divideIEEE754(neg_inf, pos_number, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_INF);
      expect(divideIEEE754(pos_inf, neg_number, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_INF);
      expect(divideIEEE754(pos_number, neg_zero, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_INF);
      expect(divideIEEE754(neg_number, pos_zero, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_INF);
    });

    it('positive zero', function() {
      let pos_number = "0 10000011 10110000000000000000000";
      let neg_number = "1 10000101 01010100000000000000000";
      expect(divideIEEE754(pos_zero, pos_number, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_ZERO);
      expect(divideIEEE754(neg_zero, neg_number, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_ZERO);
      expect(divideIEEE754(pos_number, pos_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_ZERO);
      expect(divideIEEE754(neg_number, neg_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_ZERO);
      expect(divideIEEE754(pos_zero, pos_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_ZERO);
      expect(divideIEEE754(neg_zero, neg_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.POS_ZERO);
    });

    it('negative zero', function() {
      let pos_number = "0 10000011 10110000000000000000000";
      let neg_number = "1 10000101 01010100000000000000000";
      expect(divideIEEE754(pos_zero, neg_number, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_ZERO);
      expect(divideIEEE754(neg_zero, pos_number, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_ZERO);
      expect(divideIEEE754(pos_number, neg_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_ZERO);
      expect(divideIEEE754(neg_number, pos_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_ZERO);
      expect(divideIEEE754(pos_zero, neg_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_ZERO);
      expect(divideIEEE754(neg_zero, pos_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.NEG_ZERO);
    });

    it('qnan', function() {
      let operand = "0 10000011 10110000000000000000000";
      expect(divideIEEE754(operand, qnan, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
      expect(divideIEEE754(operand, snan, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
      expect(divideIEEE754(qnan, operand, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
      expect(divideIEEE754(snan, operand, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
      expect(divideIEEE754(pos_zero, neg_zero, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
      expect(divideIEEE754(neg_zero, pos_zero, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
      expect(divideIEEE754(pos_inf, neg_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
      expect(divideIEEE754(neg_inf, pos_inf, false)).to.deep.equal(BINARY32_SPECIAL_VALUES.QNAN);
    });

  });

});