import chai from 'chai';
const expect = chai.expect;

import { UOARNumber, NumberTypes } from '../../src/uoar1/uoar_core.mjs';
import { ShiftTypes, isGreater, getAbsoluteValue, add, complement, shift, addToLowestPoint } from '../../src/uoar1/uoar_arithmetic.mjs';

describe('UOAR Arithmetic', function() {

  describe('isGreater', function() {

    it('different bases', function() {
      let number1 = new UOARNumber("-", "10", "50", 10, NumberTypes.SIGNED);
      let number2 = new UOARNumber("-", "10", "A0", 16, NumberTypes.SIGNED);
      expect(isGreater(number1, number2, true, false)).to.be.null;
    });

    it('different types', function() {
      let number1 = new UOARNumber("9", "10", "50", 10, NumberTypes.OC);
      let number2 = new UOARNumber("9", "20", "60", 10, NumberTypes.TC);
      expect(isGreater(number1, number2, true, false)).to.be.null;
    });

    it('not standardized', function() {
      let number1 = new UOARNumber("0", "2B", "C3", 16, NumberTypes.TC);
      let number2 = new UOARNumber("0", "010", "A1", 16, NumberTypes.TC);
      expect(isGreater(number1, number2, false, false)).to.be.true;
      expect(isGreater(number2, number1, false, false)).to.be.false;
    });

    it('different signs', function() {
      let number1 = new UOARNumber("0", "10", "A1", 16, NumberTypes.TC);
      let number2 = new UOARNumber("F", "2B", "C3", 16, NumberTypes.TC);
      expect(isGreater(number1, number2, true, false)).to.be.true;
      expect(isGreater(number2, number1, true, false)).to.be.false;
    });

    it('different whole lengths', function() {
      let number1 = new UOARNumber("F", "42B", "C3", 16, NumberTypes.TC);
      let number2 = new UOARNumber("F", "10", "A1", 16, NumberTypes.TC);
      expect(isGreater(number1, number2, true, false)).to.be.true;
      expect(isGreater(number2, number1, true, false)).to.be.false;
    });

    it('negative numbers', function() {
      let number1 = new UOARNumber("F", "10", "A1", 16, NumberTypes.TC);
      let number2 = new UOARNumber("F", "1B", "C3", 16, NumberTypes.TC);
      expect(isGreater(number1, number2, true, false)).to.be.true;
      expect(isGreater(number2, number1, true, false)).to.be.false;
    });

    it('by whole', function() {
      let number1 = new UOARNumber("0", "1B", "A1", 16, NumberTypes.TC);
      let number2 = new UOARNumber("0", "10", "C3", 16, NumberTypes.TC);
      expect(isGreater(number1, number2, true, false)).to.be.true;
      expect(isGreater(number2, number1, true, false)).to.be.false;
    });

    it('by fraction', function() {
      let number1 = new UOARNumber("0", "10", "C3", 16, NumberTypes.TC);
      let number2 = new UOARNumber("0", "10", "A1", 16, NumberTypes.TC);
      expect(isGreater(number1, number2, true, false)).to.be.true;
      expect(isGreater(number2, number1, true, false)).to.be.false;
    });

    it('by fraction length', function() {
      let number1 = new UOARNumber("0", "10", "A1C", 16, NumberTypes.TC);
      let number2 = new UOARNumber("0", "10", "A1", 16, NumberTypes.TC);
      expect(isGreater(number1, number2, true, false)).to.be.true;
      expect(isGreater(number2, number1, true, false)).to.be.false;
    });

  });

  describe('getAbsoluteValue', function() {

    it('unsigned', function() {
      let number = new UOARNumber("", "10", "50", 10, NumberTypes.UNSIGNED);
      expect(getAbsoluteValue(number)).to.deep.equal(number);
    });

    it('signed positive', function() {
      let number = new UOARNumber("+", "10", "50", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("+", "10", "50", 10, NumberTypes.SIGNED);
      expect(getAbsoluteValue(number)).to.deep.equal(res);
    });

    it('signed negative', function() {
      let number = new UOARNumber("-", "10", "50", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("+", "10", "50", 10, NumberTypes.SIGNED);
      expect(getAbsoluteValue(number)).to.deep.equal(res);
    });

    it('SMR positive', function() {
      let number = new UOARNumber("0", "10", "50", 10, NumberTypes.SMR);
      let res = new UOARNumber("0", "10", "50", 10, NumberTypes.SMR);
      expect(getAbsoluteValue(number)).to.deep.equal(res);
    });

    it('SMR negative', function() {
      let number = new UOARNumber("9", "10", "50", 10, NumberTypes.SMR);
      let res = new UOARNumber("0", "10", "50", 10, NumberTypes.SMR);
      expect(getAbsoluteValue(number)).to.deep.equal(res);
    });

    it('OC positive', function() {
      let number = new UOARNumber("0", "10", "50", 10, NumberTypes.OC);
      let res = new UOARNumber("0", "10", "50", 10, NumberTypes.OC);
      expect(getAbsoluteValue(number)).to.deep.equal(res);
    });

    it('OC negative', function() {
      let number = new UOARNumber("9", "10", "50", 10, NumberTypes.OC);
      let res = new UOARNumber("0", "89", "49", 10, NumberTypes.OC);
      expect(getAbsoluteValue(number)).to.deep.equal(res);
    });

    it('TC positive', function() {
      let number = new UOARNumber("0", "10", "50", 10, NumberTypes.TC);
      let res = new UOARNumber("0", "10", "50", 10, NumberTypes.TC);
      expect(getAbsoluteValue(number)).to.deep.equal(res);
    });

    it('TC negative', function() {
      let number = new UOARNumber("9", "10", "50", 10, NumberTypes.TC);
      let res = new UOARNumber("0", "89", "50", 10, NumberTypes.TC);
      expect(getAbsoluteValue(number)).to.deep.equal(res);
    });

  });

  describe('add', function() {

    it('invalid operand', function() {
      let number1 = new UOARNumber("+", "10", "50", 10, NumberTypes.SIGNED);
      let number2 = new UOARNumber("+", "10", "A0", 10, NumberTypes.SIGNED);
      expect(add(number1, number2, true, false)).to.be.null;
    });

    it('different bases', function() {
      let number1 = new UOARNumber("+", "10", "50", 10, NumberTypes.SIGNED);
      let number2 = new UOARNumber("+", "10", "A0", 16, NumberTypes.SIGNED);
      expect(add(number1, number2, true, false)).to.be.null;
    });

    it('different types', function() {
      let number1 = new UOARNumber("9", "10", "50", 10, NumberTypes.OC);
      let number2 = new UOARNumber("9", "20", "60", 10, NumberTypes.TC);
      expect(add(number1, number2, true, false)).to.be.null;
    });

    it('unsigned', function() {
      let number1 = new UOARNumber("", "10", "5", 10, NumberTypes.UNSIGNED);
      let number2 = new UOARNumber("", "20", "6", 10, NumberTypes.UNSIGNED);
      let res = new UOARNumber("", "31", "1", 10, NumberTypes.UNSIGNED);
      expect(add(number1, number2, true, false)).to.deep.equal(res);
    });

    it('signed both positive', function() {
      let number1 = new UOARNumber("+", "10", "5", 10, NumberTypes.SIGNED);
      let number2 = new UOARNumber("+", "20", "6", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("+", "31", "1", 10, NumberTypes.SIGNED);
      expect(add(number1, number2, true, false)).to.deep.equal(res);
    });

    it('signed both negative', function() {
      let number1 = new UOARNumber("-", "10", "5", 10, NumberTypes.SIGNED);
      let number2 = new UOARNumber("-", "20", "6", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("-", "31", "1", 10, NumberTypes.SIGNED);
      expect(add(number1, number2, true, false)).to.deep.equal(res);
    });

    it('signed different signs', function() {
      let number1 = new UOARNumber("-", "10", "5", 10, NumberTypes.SIGNED);
      let number2 = new UOARNumber("+", "20", "6", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("+", "10", "1", 10, NumberTypes.SIGNED);
      expect(add(number1, number2, true, false)).to.deep.equal(res);
    });

    it('SMR both positive', function() {
      let number1 = new UOARNumber("0", "10", "5", 10, NumberTypes.SMR);
      let number2 = new UOARNumber("0", "20", "6", 10, NumberTypes.SMR);
      let res = new UOARNumber("0", "31", "1", 10, NumberTypes.SMR);
      expect(add(number1, number2, true, false)).to.deep.equal(res);
    });

    it('SMR both negative', function() {
      let number1 = new UOARNumber("9", "10", "5", 10, NumberTypes.SMR);
      let number2 = new UOARNumber("9", "20", "6", 10, NumberTypes.SMR);
      let res = new UOARNumber("9", "31", "1", 10, NumberTypes.SMR);
      expect(add(number1, number2, true, false)).to.deep.equal(res);
    });

    it('SMR different signs', function() {
      let number1 = new UOARNumber("9", "10", "5", 10, NumberTypes.SMR);
      let number2 = new UOARNumber("0", "20", "6", 10, NumberTypes.SMR);
      let res = new UOARNumber("0", "10", "1", 10, NumberTypes.SMR);
      expect(add(number1, number2, true, false)).to.deep.equal(res);
    });

    it('OC both positive', function() {
      let number1 = new UOARNumber("0", "10", "5", 10, NumberTypes.OC);
      let number2 = new UOARNumber("0", "20", "6", 10, NumberTypes.OC);
      let res = new UOARNumber("0", "31", "1", 10, NumberTypes.OC);
      expect(add(number1, number2, true, false)).to.deep.equal(res);
    });

    it('OC both negative', function() {
      let number1 = new UOARNumber("9", "50", "5", 10, NumberTypes.OC);
      let number2 = new UOARNumber("9", "70", "6", 10, NumberTypes.OC);
      let res = new UOARNumber("9", "21", "2", 10, NumberTypes.OC);
      expect(add(number1, number2, true, false)).to.deep.equal(res);
    });

    it('OC different signs', function() {
      let number1 = new UOARNumber("9", "10", "5", 10, NumberTypes.OC);
      let number2 = new UOARNumber("0", "20", "6", 10, NumberTypes.OC);
      let res = new UOARNumber("9", "31", "1", 10, NumberTypes.OC);
      expect(add(number1, number2, true, false)).to.deep.equal(res);
    });

    it('TC both positive', function() {
      let number1 = new UOARNumber("0", "10", "5", 10, NumberTypes.TC);
      let number2 = new UOARNumber("0", "20", "6", 10, NumberTypes.TC);
      let res = new UOARNumber("0", "31", "1", 10, NumberTypes.TC);
      expect(add(number1, number2, true, false)).to.deep.equal(res);
    });

    it('TC both negative', function() {
      let number1 = new UOARNumber("9", "50", "5", 10, NumberTypes.TC);
      let number2 = new UOARNumber("9", "70", "6", 10, NumberTypes.TC);
      let res = new UOARNumber("9", "21", "1", 10, NumberTypes.TC);
      expect(add(number1, number2, true, false)).to.deep.equal(res);
    });

    it('TC different signs', function() {
      let number1 = new UOARNumber("9", "10", "5", 10, NumberTypes.TC);
      let number2 = new UOARNumber("0", "20", "6", 10, NumberTypes.TC);
      let res = new UOARNumber("9", "31", "1", 10, NumberTypes.TC);
      expect(add(number1, number2, true, false)).to.deep.equal(res);
    });

    it('different lengths', function() {
      let number1 = new UOARNumber("+", "84", "54", 10, NumberTypes.SIGNED);
      let number2 = new UOARNumber("+", "530", "6", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("+", "615", "14", 10, NumberTypes.SIGNED);
      expect(add(number1, number2, true, false)).to.deep.equal(res);
    });

    it('overflow', function() {
      let number1 = new UOARNumber("+", "84", "54", 10, NumberTypes.SIGNED);
      let number2 = new UOARNumber("+", "30", "6", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("+", "115", "14", 10, NumberTypes.SIGNED);
      expect(add(number1, number2, true, false)).to.deep.equal(res);
    });

  });

  describe('complement', function() {

    it('invalid operand', function() {
      let number = new UOARNumber("+", "10", "A0", 10, NumberTypes.SIGNED);
      expect(complement(number, true, false)).to.be.null;
    });

    it('unsigned', function() {
      let number = new UOARNumber("", "10", "5", 10, NumberTypes.UNSIGNED);
      expect(complement(number, true, false)).to.be.null;
    });

    it('signed positive', function() {
      let number = new UOARNumber("+", "10", "5", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("-", "10", "5", 10, NumberTypes.SIGNED);
      expect(complement(number, true, false)).to.deep.equal(res);
    });

    it('signed negative', function() {
      let number = new UOARNumber("-", "10", "5", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("+", "10", "5", 10, NumberTypes.SIGNED);
      expect(complement(number, true, false)).to.deep.equal(res);
    });

    it('SMR positive', function() {
      let number = new UOARNumber("0", "10", "5", 10, NumberTypes.SMR);
      let res = new UOARNumber("9", "10", "5", 10, NumberTypes.SMR);
      expect(complement(number, true, false)).to.deep.equal(res);
    });

    it('SMR negative', function() {
      let number = new UOARNumber("9", "10", "5", 10, NumberTypes.SMR);
      let res = new UOARNumber("0", "10", "5", 10, NumberTypes.SMR);
      expect(complement(number, true, false)).to.deep.equal(res);
    });

    it('OC positive', function() {
      let number = new UOARNumber("0", "10", "5", 10, NumberTypes.OC);
      let res = new UOARNumber("9", "89", "4", 10, NumberTypes.OC);
      expect(complement(number, true, false)).to.deep.equal(res);
    });

    it('OC negative', function() {
      let number = new UOARNumber("9", "10", "5", 10, NumberTypes.OC);
      let res = new UOARNumber("0", "89", "4", 10, NumberTypes.OC);
      expect(complement(number, true, false)).to.deep.equal(res);
    });

    it('TC positive', function() {
      let number = new UOARNumber("0", "10", "5", 10, NumberTypes.TC);
      let res = new UOARNumber("9", "89", "5", 10, NumberTypes.TC);
      expect(complement(number, true, false)).to.deep.equal(res);
    });

    it('TC negative', function() {
      let number = new UOARNumber("9", "10", "5", 10, NumberTypes.TC);
      let res = new UOARNumber("0", "89", "5", 10, NumberTypes.TC);
      expect(complement(number, true, false)).to.deep.equal(res);
    });

  });

  describe('shift', function() {

    it('right arithmetic positive', function() {
      let numbers = [
        new UOARNumber("0", "10", "11", 2, NumberTypes.TC),
        new UOARNumber("1", "10", "01", 2, NumberTypes.TC)
      ];
      let res = [
        new UOARNumber("0", "00", "10", 2, NumberTypes.TC),
        new UOARNumber("1", "11", "10", 2, NumberTypes.TC)
      ]
      expect(shift(numbers, 2, ShiftTypes.RIGHT_A, false)).to.be.true;
      expect(numbers).to.deep.equal(res);
    });

    it('right arithmetic negative', function() {
      let numbers = [
        new UOARNumber("1", "10", "11", 2, NumberTypes.TC),
        new UOARNumber("1", "10", "01", 2, NumberTypes.TC)
      ];
      let res = [
        new UOARNumber("1", "11", "10", 2, NumberTypes.TC),
        new UOARNumber("1", "11", "10", 2, NumberTypes.TC)
      ]
      expect(shift(numbers, 2, ShiftTypes.RIGHT_A, false)).to.be.true;
      expect(numbers).to.deep.equal(res);
    });

    it('right logical', function() {
      let numbers = [
        new UOARNumber("1", "10", "11", 2, NumberTypes.TC),
        new UOARNumber("1", "10", "01", 2, NumberTypes.TC)
      ];
      let res = [
        new UOARNumber("0", "01", "10", 2, NumberTypes.TC),
        new UOARNumber("1", "11", "10", 2, NumberTypes.TC)
      ]
      expect(shift(numbers, 2, ShiftTypes.RIGHT_L, false)).to.be.true;
      expect(numbers).to.deep.equal(res);
    });

    it('left', function() {
      let numbers = [
        new UOARNumber("1", "10", "11", 2, NumberTypes.TC),
        new UOARNumber("1", "10", "01", 2, NumberTypes.TC)
      ];
      let res = [
        new UOARNumber("0", "11", "11", 2, NumberTypes.TC),
        new UOARNumber("0", "01", "00", 2, NumberTypes.TC)
      ]
      expect(shift(numbers, 2, ShiftTypes.LEFT, false)).to.be.true;
      expect(numbers).to.deep.equal(res);
    });

    it('signed number', function() {
      let numbers = [
        new UOARNumber("+", "10", "11", 2, NumberTypes.SIGNED),
        new UOARNumber("-", "10", "01", 2, NumberTypes.SIGNED)
      ];
      expect(shift(numbers, 2, ShiftTypes.LEFT, false)).to.be.false;
      expect(numbers).to.deep.equal(numbers);
    });

    it('invalid number', function() {
      let numbers = [
        new UOARNumber("0", "20", "11", 2, NumberTypes.TC),
        new UOARNumber("1", "10", "01", 2, NumberTypes.TC)
      ];
      expect(shift(numbers, 2, ShiftTypes.LEFT, false)).to.be.false;
      expect(numbers).to.deep.equal(numbers);
    });

  });

  describe('addToLowestPoint', function() {

    it('add to fraction', function() {
      let number = new UOARNumber("+", "10", "56", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("+", "10", "61", 10, NumberTypes.SIGNED);
      expect(addToLowestPoint(number, 5, false)).to.deep.equal(res);
    });

    it('add to whole', function() {
      let number = new UOARNumber("+", "16", "", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("+", "21", "", 10, NumberTypes.SIGNED);
      expect(addToLowestPoint(number, 5, false)).to.deep.equal(res);
    });

    it('carry to whole', function() {
      let number = new UOARNumber("+", "10", "6", 10, NumberTypes.SIGNED);
      let res = new UOARNumber("+", "11", "1", 10, NumberTypes.SIGNED);
      expect(addToLowestPoint(number, 5, false)).to.deep.equal(res);
    });

    it('overflow unsigned/signed/SMR', function() {
      let number_unsigned = new UOARNumber("", "9", "6", 10, NumberTypes.UNSIGNED);
      let res_unsigned = new UOARNumber("", "10", "1", 10, NumberTypes.UNSIGNED);
      expect(addToLowestPoint(number_unsigned, 5, false)).to.deep.equal(res_unsigned);
      let number_signed = new UOARNumber("+", "9", "6", 10, NumberTypes.SIGNED);
      let res_signed = new UOARNumber("+", "10", "1", 10, NumberTypes.SIGNED);
      expect(addToLowestPoint(number_signed, 5, false)).to.deep.equal(res_signed);
      let number_smr = new UOARNumber("0", "9", "6", 10, NumberTypes.SMR);
      let res_smr = new UOARNumber("0", "10", "1", 10, NumberTypes.SMR);
      expect(addToLowestPoint(number_smr, 5, false)).to.deep.equal(res_smr);
    });

    it('overflow OC/TC', function() {
      let number_oc = new UOARNumber("9", "9", "6", 10, NumberTypes.OC);
      let res_oc = new UOARNumber("0", "0", "1", 10, NumberTypes.OC);
      expect(addToLowestPoint(number_oc, 5, false)).to.deep.equal(res_oc);
      let number_tc = new UOARNumber("9", "9", "6", 10, NumberTypes.TC);
      let res_tc = new UOARNumber("0", "0", "1", 10, NumberTypes.TC);
      expect(addToLowestPoint(number_tc, 5, false)).to.deep.equal(res_tc);
    });

  });

});